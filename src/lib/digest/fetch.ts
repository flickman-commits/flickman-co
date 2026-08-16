import Parser from "rss-parser";
import {
  FEEDS,
  WEST_VILLAGE_TERMS,
  type Feed,
  type SectionId,
} from "./sources";

export interface Story {
  title: string;
  url: string;
  source: string;
  /** Feed-provided summary, stripped of HTML and clamped. May be empty. */
  snippet: string;
  publishedAt: number;
  section: SectionId;
}

// Several publishers (Blogspot-hosted feeds especially) return 403 to the
// default client string, so identify as an ordinary browser-ish agent.
const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; flickman-digest/1.0; +https://flickman.co)",
    Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
  },
});

/** Cheap HTML strip — feed summaries carry markup and entities we don't want. */
function toPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&rsquo;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Feed summaries arrive with syndication cruft glued on — WordPress appends
 * "The post X appeared first on Y", several feeds end in a "[ more › ]" link
 * stub, and photo credits lead the text. Left in, it wastes prompt space and
 * gives the model sentences that aren't about the story.
 */
function stripFeedBoilerplate(text: string): string {
  return text
    .replace(/\s*The post .*? appeared first on .*$/i, "")
    .replace(/\s*Continue reading.*$/i, "")
    .replace(/\s*\[\s*(more|…|\.\.\.)\s*[›>»]?\s*\]\s*$/i, "")
    .replace(/\s*(Read more|View Entire Post)\s*[›>»…]*\s*$/i, "")
    .trim();
}

/** Clamp to `max` characters without slicing a word in half. */
function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-—]+$/, "")}…`;
}

function matchesAny(haystack: string, terms: string[]): boolean {
  const lower = haystack.toLowerCase();
  return terms.some((t) => lower.includes(t));
}

/**
 * Two headlines about the same event from two outlets aren't duplicates, but the
 * same story syndicated across feeds is. Key on the URL when we can, and fall
 * back to a normalized title so near-identical reposts collapse too.
 */
function dedupeKey(story: Story): string {
  try {
    const u = new URL(story.url);
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}`;
  } catch {
    return story.title.toLowerCase().replace(/[^a-z0-9]+/g, "");
  }
}

async function fetchFeed(feed: Feed, cutoff: number): Promise<Story[]> {
  const parsed = await parser.parseURL(feed.url);
  const stories: Story[] = [];

  for (const item of parsed.items ?? []) {
    const title = toPlainText(item.title ?? "");
    const url = (item.link ?? "").trim();
    if (!title || !url) continue;

    // No date means we can't tell if it's from today, so leave it out rather
    // than risk resurfacing something from months ago.
    const publishedAt = item.isoDate
      ? Date.parse(item.isoDate)
      : item.pubDate
        ? Date.parse(item.pubDate)
        : NaN;
    if (!Number.isFinite(publishedAt) || publishedAt < cutoff) continue;

    const snippet = clamp(
      stripFeedBoilerplate(
        toPlainText(item.contentSnippet || item.summary || item.content || "")
      ),
      400
    );

    // Category tags carry the most reliable topic signal — several feeds ship
    // an empty description but tag the item precisely.
    //
    // rss-parser yields a plain string only when the <category> has no
    // attributes; with a domain attribute it yields {_: "Politics", $: {...}}.
    // Joining those throws "Cannot convert object to primitive value", which
    // killed NYT Metro and EV Grieve outright.
    const categories = (item.categories ?? [])
      .map((c) => (typeof c === "string" ? c : (c as { _?: string })?._ ?? ""))
      .filter(Boolean)
      .join(" ");
    const haystack = `${title} ${snippet} ${categories}`;

    if (feed.require && !matchesAny(haystack, feed.require)) continue;
    if (feed.exclude && matchesAny(haystack, feed.exclude)) continue;

    // A city-wide story about the neighborhood belongs in the neighborhood.
    const section: SectionId =
      feed.section === "nyc" && matchesAny(haystack, WEST_VILLAGE_TERMS)
        ? "westvillage"
        : feed.section;

    stories.push({ title, url, source: feed.name, snippet, publishedAt, section });
  }

  return stories;
}

export interface FetchResult {
  stories: Story[];
  /** Feeds that failed, so the digest can say so instead of quietly shrinking. */
  failed: string[];
}

/**
 * Pull every feed concurrently and return the stories published since `cutoff`,
 * newest first, deduped. One slow or broken feed can't hold up or break the rest.
 */
export async function fetchAllStories(hoursBack: number): Promise<FetchResult> {
  const cutoff = Date.now() - hoursBack * 60 * 60 * 1000;

  const results = await Promise.allSettled(FEEDS.map((f) => fetchFeed(f, cutoff)));

  const seen = new Set<string>();
  const stories: Story[] = [];
  const failed: string[] = [];

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[digest] feed failed: ${FEEDS[i].name}`, result.reason);
      failed.push(FEEDS[i].name);
      return;
    }
    for (const story of result.value) {
      const key = dedupeKey(story);
      if (seen.has(key)) continue;
      seen.add(key);
      stories.push(story);
    }
  });

  stories.sort((a, b) => b.publishedAt - a.publishedAt);
  return { stories, failed };
}

export function storiesBySection(stories: Story[]): Record<SectionId, Story[]> {
  const bySection: Record<SectionId, Story[]> = {
    running: [],
    gear: [],
    nyc: [],
    westvillage: [],
  };
  for (const story of stories) bySection[story.section].push(story);
  return bySection;
}

/**
 * Interleave stories round-robin by source, keeping each source's own recency
 * order. Feeds publish at wildly different rates — the NY Post alone can post
 * 20 items to the city section overnight — so a straight recency sort hands the
 * curator a candidate list from one or two outlets. This makes the top of the
 * list span every source that published today.
 */
export function diversifyBySource(stories: Story[]): Story[] {
  const bySource = new Map<string, Story[]>();
  for (const story of stories) {
    const bucket = bySource.get(story.source);
    if (bucket) bucket.push(story);
    else bySource.set(story.source, [story]);
  }

  const queues = [...bySource.values()];
  const out: Story[] = [];
  for (let round = 0; out.length < stories.length; round++) {
    let placed = false;
    for (const queue of queues) {
      if (round < queue.length) {
        out.push(queue[round]);
        placed = true;
      }
    }
    if (!placed) break;
  }
  return out;
}
