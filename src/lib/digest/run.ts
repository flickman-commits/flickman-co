import { diversifyBySource, fetchAllStories, storiesBySection } from "./fetch";
import { ZERO_USAGE, addUsage, curateSection, type CuratedStory } from "./curate";
import { getProvider } from "./llm";
import { buildSections, formatToday, renderHtml, renderText, sendDigest } from "./email";
import { SECTIONS, type SectionId } from "./sources";
import { getWeather } from "./weather";
import { getTodaysPlace } from "./location";
import { getFinancials } from "./financials";

/**
 * Builds the digest. Knows nothing about HTTP, Next.js, or Vercel.
 *
 * That separation is the point: the API route, a CLI run, a cron on a laptop,
 * or any other scheduler are all thin wrappers around this function. Moving
 * where the report runs should be a deployment decision, not a rewrite.
 */

/** How many stories each section may contribute at most. */
const LIMITS: Record<SectionId, number> = {
  running: 5,
  gear: 4,
  nyc: 5,
  westvillage: 4,
};

/**
 * A day-and-a-bit, so a run that fires late or early can't leave a gap. The
 * small overlap means a late-evening story can appear two mornings running;
 * that's a better failure than silently dropping it.
 */
const DEFAULT_HOURS = 26;

export interface DigestResult {
  subject: string;
  html: string;
  text: string;
  storyCount: number;
  /** Everything below is diagnostics — what ran, what degraded, what it cost. */
  scanned: number;
  failedFeeds: string[];
  curation: {
    degraded: boolean;
    model: string;
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    sections: Record<string, string>;
  };
  location: { place: string; source: string; eventsSeen: number; reason?: string };
  financialsLoaded: boolean;
}

export async function buildDigest(opts: { hours?: number } = {}): Promise<DigestResult> {
  const hours = opts.hours || Number(process.env.DIGEST_HOURS) || DEFAULT_HOURS;

  // Feeds, location/forecast, and the scoreboard are independent, so they run
  // together. Each resolves to null on failure rather than throwing, so no one
  // source can take the report down.
  const place = getTodaysPlace();
  const [{ stories, failed }, weather, financials] = await Promise.all([
    fetchAllStories(hours),
    place.then(getWeather),
    getFinancials(),
  ]);
  const resolvedPlace = await place;
  // meetings: null until the prep agent lands; the section renders a
  // placeholder so the slot is visible in the layout meanwhile.
  const panel = { weather, financials, meetings: null };
  const bySection = storiesBySection(stories);

  const providerResult = getProvider();
  if (!providerResult.ok) {
    console.error(`[digest] no LLM provider: ${providerResult.reason}`);
  }
  const provider = providerResult.ok ? providerResult.provider : null;

  // Sections are independent, so curate them concurrently — a hosted run has to
  // finish inside its function timeout.
  const results = await Promise.all(
    SECTIONS.map(async (section) => ({
      id: section.id,
      ...(await curateSection(
        section.id,
        diversifyBySource(bySection[section.id]),
        LIMITS[section.id],
        provider
      )),
    }))
  );

  const curated: Record<string, CuratedStory[]> = {};
  for (const r of results) curated[r.id] = r.stories;

  // If every section that had candidates fell back, the summaries are scraped
  // feed text rather than written ones — worth knowing without reading logs.
  const attempted = results.filter((r) => r.mode !== "empty");
  const degraded = attempted.length > 0 && attempted.every((r) => r.mode === "fallback");
  const usage = results.reduce((acc, r) => addUsage(acc, r.usage), ZERO_USAGE);
  const cost = provider ? provider.costUsd(usage) : 0;

  if (degraded) {
    console.error(
      "[digest] all sections degraded to feed blurbs:",
      results.map((r) => `${r.id}=${r.reason ?? r.mode}`).join(" ")
    );
  }

  const sections = buildSections(curated);
  const dateLabel = formatToday();
  const run = {
    ...usage,
    cost,
    model: provider?.model ?? "none",
    degraded,
  };

  return {
    subject: `Flickman Daily Report - ${dateLabel}`,
    html: renderHtml(sections, dateLabel, run, panel),
    text: renderText(sections, dateLabel, run, panel),
    storyCount: sections.reduce((n, s) => n + s.stories.length, 0),
    scanned: stories.length,
    failedFeeds: failed,
    curation: {
      degraded,
      model: run.model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      costUsd: Number(cost.toFixed(6)),
      sections: Object.fromEntries(
        results.map((r) => [r.id, r.reason ? `${r.mode}: ${r.reason}` : r.mode])
      ),
    },
    location: {
      place: resolvedPlace.label,
      source: resolvedPlace.source,
      eventsSeen: resolvedPlace.eventsSeen,
      reason: resolvedPlace.reason,
    },
    financialsLoaded: financials != null,
  };
}

/**
 * Build and send. Returns the same diagnostics plus whether it actually sent —
 * nothing to say is not a reason to send an empty report.
 */
export async function runAndSend(
  opts: { hours?: number } = {}
): Promise<DigestResult & { sent: boolean }> {
  const result = await buildDigest(opts);

  if (result.storyCount === 0) {
    console.log("[digest] no stories in window; skipping send");
    return { ...result, sent: false };
  }

  await sendDigest({
    subject: result.subject,
    html: result.html,
    text: result.text,
  });
  console.log(`[digest] sent ${result.storyCount} stories`);
  return { ...result, sent: true };
}
