import type { Story } from "./fetch";
import type { SectionId } from "./sources";
import {
  ZERO_USAGE,
  getProvider,
  type LlmProvider,
  type TokenUsage,
} from "./llm";

export { ZERO_USAGE, addUsage, type TokenUsage } from "./llm";

export interface CuratedStory {
  title: string;
  url: string;
  source: string;
  /** One or two sentences of what happened and why it matters. */
  summary: string;
}

/**
 * Whether a section's summaries were actually written by a model or fell back
 * to raw feed blurbs. Without this the degraded path is invisible: the digest
 * still arrives every morning, just with scraped text instead of summaries, and
 * nothing says so. `reason` carries the error when there is one.
 */
export interface CurationResult {
  stories: CuratedStory[];
  mode: "ai" | "fallback" | "empty";
  reason?: string;
  usage: TokenUsage;
}

/**
 * Selection is by index into the candidate list, never by URL. The model picks
 * which stories make the cut and writes the prose; the link and headline come
 * from the feed, so a fabricated URL can't reach the inbox.
 */
const PICK_SCHEMA = {
  type: "object",
  properties: {
    picks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: {
            type: "integer",
            description: "The number shown next to the story in the candidate list.",
          },
          summary: {
            type: "string",
            description:
              "1-2 sentences, plain language, saying what happened and why it matters.",
          },
        },
        required: ["index", "summary"],
        additionalProperties: false,
      },
    },
  },
  required: ["picks"],
  additionalProperties: false,
} as const;

const SECTION_BRIEF: Record<SectionId, string> = {
  running:
    "The reader follows the running industry closely: marathons and road racing, " +
    "race organizations and their business, elite results that actually matter, " +
    "participation trends, and Running USA-type industry news. Skip generic " +
    "training tips, nutrition listicles, and gear-buying guides. The industry " +
    "feeds also carry job listings and conference promos — drop those.",
  gear:
    "The reader cares about running companies as businesses and about product: " +
    "brand news, earnings and strategy, launches, notable shoe reviews, athlete " +
    "and sponsorship deals. Skip fashion-only sneaker coverage and pure deal roundups.",
  nyc:
    "The reader lives in New York City. They want news that changes something " +
    "about living here: transit, housing, city government, crime and safety, " +
    "notable openings and closings, weather events, big local stories. Drop " +
    "anything that isn't actually about New York City even when a New York " +
    "outlet published it — these feeds carry national and out-of-state crime " +
    "stories. Skip celebrity gossip, sponsored and event-promo posts, and " +
    "national politics merely datelined New York.",
  westvillage:
    "The reader lives in the West Village. They want neighborhood-level news: " +
    "restaurants and bars opening or closing, construction and development, " +
    "street closures, local crime, landmark and preservation fights, events. " +
    "Only include a story if it is genuinely about the West Village, Greenwich " +
    "Village, Meatpacking, or Hudson Square. Neighborhood feeds syndicate " +
    "generic city-wide and statewide filler (lottery jackpots, statewide " +
    "weather, gas prices) — drop all of it. An empty section is the right " +
    "answer on a quiet day.",
};

const SYSTEM = `You are curating one section of a personal daily news digest for a single reader. \
You will get a numbered list of candidate stories pulled from RSS feeds in the last day.

Pick the stories genuinely worth this reader's attention and write a short summary of each. Rules:

- Quality over quantity. If only two stories are worth reading, return two. If none are, return none. \
Never pad the list to hit a number.
- Judge from the headline and summary you are given. Do not speculate about details that aren't there, \
and do not invent facts, numbers, or quotes.
- Each summary is 1-2 sentences of plain prose. Lead with what happened. No preamble, no "this article \
discusses", no marketing voice, no exclamation points.
- If several candidates cover the same event, pick the single best one and drop the rest.
- Order your picks most important first.`;

/** Candidate cap per section — keeps the prompt small and the call fast. */
const MAX_CANDIDATES = 30;

function fallback(stories: Story[], limit: number): CuratedStory[] {
  return stories.slice(0, limit).map((s) => ({
    title: s.title,
    url: s.url,
    source: s.source,
    // Already cleaned and clamped by the fetcher.
    summary: s.snippet,
  }));
}

/**
 * Choose and summarize the top stories for one section.
 *
 * Falls back to the most recent stories with their raw feed summaries when no
 * provider is configured or the call fails — a digest with unpolished summaries
 * beats no digest at all.
 */
export async function curateSection(
  section: SectionId,
  stories: Story[],
  limit: number,
  provider: LlmProvider | null
): Promise<CurationResult> {
  if (stories.length === 0) return { stories: [], mode: "empty", usage: ZERO_USAGE };

  const llm = provider;
  if (!llm) {
    return {
      stories: fallback(stories, limit),
      mode: "fallback",
      reason: "no LLM provider configured",
      usage: ZERO_USAGE,
    };
  }

  const candidates = stories.slice(0, MAX_CANDIDATES);
  const list = candidates
    .map(
      (s, i) =>
        `[${i}] ${s.title}\n    source: ${s.source}\n    summary: ${s.snippet || "(none)"}`
    )
    .join("\n\n");

  const prompt =
    `${SECTION_BRIEF[section]}\n\n` +
    `Return at most ${limit} stories.\n\n` +
    `Candidates:\n\n${list}`;

  try {
    const { text, usage } = await llm.complete({
      system: SYSTEM,
      prompt,
      schema: PICK_SCHEMA as unknown as Record<string, unknown>,
      schemaName: "section_picks",
      maxTokens: 4000,
    });

    const parsed = JSON.parse(text) as {
      picks: { index: number; summary: string }[];
    };

    const seen = new Set<number>();
    const curated: CuratedStory[] = [];
    for (const pick of parsed.picks) {
      const story = candidates[pick.index];
      if (!story || seen.has(pick.index)) continue;
      seen.add(pick.index);
      curated.push({
        title: story.title,
        url: story.url,
        source: story.source,
        summary: pick.summary.trim(),
      });
      if (curated.length >= limit) break;
    }
    return {
      stories: curated,
      mode: "ai",
      usage,
    };
  } catch (err) {
    console.error(`[digest] curation failed for "${section}":`, err);
    return {
      stories: fallback(stories, limit),
      mode: "fallback",
      // Surfaced in the API response, so keep it to the error's own text —
      // never echo the request or anything carrying the key.
      reason: err instanceof Error ? err.message.slice(0, 300) : String(err).slice(0, 300),
      // A failed call may still have been billed; without a response there is
      // no usage to read, so this undercounts rather than guesses.
      usage: ZERO_USAGE,
    };
  }
}
