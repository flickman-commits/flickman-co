import Anthropic from "@anthropic-ai/sdk";
import type { Story } from "./fetch";
import type { SectionId } from "./sources";

export interface CuratedStory {
  title: string;
  url: string;
  source: string;
  /** One or two sentences of what happened and why it matters. */
  summary: string;
}

/**
 * Whether a section's summaries were actually written by Claude or fell back to
 * raw feed blurbs. Without this the degraded path is invisible: the digest still
 * arrives every morning, just with scraped text instead of summaries, and
 * nothing says so. `reason` carries the API error when there is one.
 */
export interface CurationResult {
  stories: CuratedStory[];
  mode: "ai" | "fallback" | "empty";
  reason?: string;
  usage: TokenUsage;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export const ZERO_USAGE: TokenUsage = { inputTokens: 0, outputTokens: 0 };

/** The model doing the curating. Pricing below is tied to it — change both together. */
const MODEL = "claude-haiku-4-5";

/** USD per million tokens for MODEL. Update whenever MODEL changes. */
const PRICING = { inputPerMTok: 1, outputPerMTok: 5 };

export const CURATION_MODEL = MODEL;

export function addUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
  };
}

/** What this run cost, in USD. */
export function usageCost(usage: TokenUsage): number {
  return (
    (usage.inputTokens / 1_000_000) * PRICING.inputPerMTok +
    (usage.outputTokens / 1_000_000) * PRICING.outputPerMTok
  );
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

/**
 * Read and sanity-check the API key.
 *
 * Pasting a key from a doc or email can bring along wrapping quotes and, worse,
 * typographic ones — `"` becomes `“…”`. The SDK puts the key straight into the
 * `x-api-key` header, and headers are Latin-1, so a curly quote throws a
 * ByteString conversion error that names a string index and nothing else. That
 * is a genuinely hard error to trace back to "your key has smart quotes in it",
 * so trim the usual paste artifacts and name the problem when one is left.
 *
 * Never returns or logs the key itself.
 */
function readApiKey():
  | { ok: true; key: string }
  | { ok: false; reason: string } {
  const raw = process.env.ANTHROPIC_API_KEY;
  if (!raw || !raw.trim()) return { ok: false, reason: "ANTHROPIC_API_KEY not set" };

  const key = raw.trim().replace(/^["'“”‘’]+|["'“”‘’]+$/g, "");
  if (!key) return { ok: false, reason: "ANTHROPIC_API_KEY is only quote characters" };

  if (key !== raw) {
    console.warn(
      "[digest] ANTHROPIC_API_KEY had surrounding whitespace or quotes; using the trimmed value. Re-save it as raw text."
    );
  }

  // A real key is one unbroken run of printable ASCII. Anything outside that
  // can't go in a header, and in practice means extra text came along with it.
  const chars = [...key];
  const at = chars.findIndex((c) => c.charCodeAt(0) < 0x21 || c.charCodeAt(0) > 0x7e);
  if (at !== -1) {
    const code = chars[at].charCodeAt(0);
    const name =
      code === 0x20
        ? "a space"
        : code === 0x0a || code === 0x0d
          ? "a line break"
          : code === 0x201c || code === 0x201d
            ? "a curly quote"
            : `U+${code.toString(16).toUpperCase().padStart(4, "0")}`;
    // Length and offset describe the shape of the value, never its contents —
    // and they're what actually identifies "you pasted more than the key".
    return {
      ok: false,
      reason:
        `ANTHROPIC_API_KEY doesn't look like a bare key: ${chars.length} characters, ` +
        `with ${name} at index ${at}${
          key.startsWith("sk-ant-") ? "" : ", and it doesn't start with 'sk-ant-'"
        }. A key is a single unbroken token of about 108 characters. ` +
        "Re-add just the key, with no surrounding text or line breaks.",
    };
  }

  return { ok: true, key };
}

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
 * Ask Claude to choose and summarize the top stories for one section.
 *
 * Falls back to the most recent stories with their raw feed summaries if the API
 * key is missing or the call fails — a digest with unpolished summaries beats no
 * digest at all.
 */
export async function curateSection(
  section: SectionId,
  stories: Story[],
  limit: number
): Promise<CurationResult> {
  if (stories.length === 0) return { stories: [], mode: "empty", usage: ZERO_USAGE };

  const apiKey = readApiKey();
  if (!apiKey.ok) {
    return {
      stories: fallback(stories, limit),
      mode: "fallback",
      reason: apiKey.reason,
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
    // Pass the sanitized key rather than letting the SDK re-read the raw env var.
    const client = new Anthropic({ apiKey: apiKey.key });
    const response = await client.messages.create({
      // Selecting and summarizing from text already supplied in the prompt is
      // well within Haiku's range, and output tokens dominate the cost of this
      // job. Note Haiku 4.5 rejects `output_config.effort` and doesn't take
      // adaptive thinking — if you move this back to claude-opus-5, that's when
      // effort becomes available again.
      model: MODEL,
      max_tokens: 4000,
      output_config: { format: { type: "json_schema", schema: PICK_SCHEMA } },
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content.find((b) => b.type === "text")?.text;
    if (!text) throw new Error("no text block in response");

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
      // Cache fields are zero here (nothing sets cache_control), but count them
      // so the figure can't silently undercount if that ever changes.
      usage: {
        inputTokens:
          response.usage.input_tokens +
          (response.usage.cache_read_input_tokens ?? 0) +
          (response.usage.cache_creation_input_tokens ?? 0),
        outputTokens: response.usage.output_tokens,
      },
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
