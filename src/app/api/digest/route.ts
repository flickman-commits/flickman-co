import { NextResponse, type NextRequest } from "next/server";
import {
  diversifyBySource,
  fetchAllStories,
  storiesBySection,
} from "../../../lib/digest/fetch";
import {
  CURATION_MODEL,
  ZERO_USAGE,
  addUsage,
  curateSection,
  usageCost,
  type CuratedStory,
} from "../../../lib/digest/curate";
import {
  buildSections,
  formatToday,
  renderHtml,
  renderText,
  sendDigest,
} from "../../../lib/digest/email";
import { SECTIONS, type SectionId } from "../../../lib/digest/sources";
import { getWeather } from "../../../lib/digest/weather";
import { getYesterdaySales } from "../../../lib/shopify";

/**
 * GET /api/digest — build and email the daily digest.
 *
 * Triggered by the Vercel cron in vercel.json, which sends
 * `Authorization: Bearer $CRON_SECRET`. For manual runs, pass `?key=$CRON_SECRET`.
 *
 * Query params (all optional):
 *   preview=1   render the email in the browser instead of sending it
 *   hours=48    widen the lookback window for this run
 *
 * Env:
 *   CRON_SECRET        required — without it the route refuses to run
 *   ANTHROPIC_API_KEY  AI summaries; without it, falls back to feed blurbs
 *   RESEND_API_KEY     sending
 *   DIGEST_TO_EMAIL / DIGEST_FROM_EMAIL / DIGEST_HOURS   optional overrides
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** How many stories each section may contribute at most. */
const LIMITS: Record<SectionId, number> = {
  running: 5,
  gear: 4,
  nyc: 5,
  westvillage: 4,
};

/**
 * A day-and-a-bit, so a send that runs late or early can't leave a gap. The
 * small overlap means a late-evening story can appear two mornings running;
 * that's a better failure than silently dropping it.
 */
const DEFAULT_HOURS = 26;

function authorized(req: NextRequest, secret: string): boolean {
  const header = req.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  return req.nextUrl.searchParams.get("key") === secret;
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[digest] CRON_SECRET not set; refusing to run");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  if (!authorized(req, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const preview = params.get("preview") === "1";
  const hours =
    Number(params.get("hours")) ||
    Number(process.env.DIGEST_HOURS) ||
    DEFAULT_HOURS;

  try {
    // Feeds, forecast, and sales are independent — fetch them together so the
    // panel costs no extra wall-clock. Both panel sources resolve to null on
    // failure rather than throwing, so neither can take the digest down.
    const [{ stories, failed }, weather, sales] = await Promise.all([
      fetchAllStories(hours),
      getWeather(),
      getYesterdaySales(),
    ]);
    const panel = { weather, sales };
    const bySection = storiesBySection(stories);

    // Sections are independent, so curate them concurrently — the whole run has
    // to finish inside the function's 60s budget.
    const results = await Promise.all(
      SECTIONS.map(async (section) => ({
        id: section.id,
        ...(await curateSection(
          section.id,
          diversifyBySource(bySection[section.id]),
          LIMITS[section.id]
        )),
      }))
    );

    const curated: Record<string, CuratedStory[]> = {};
    for (const r of results) curated[r.id] = r.stories;

    // If every section that had candidates fell back, the summaries are scraped
    // feed text rather than written ones — worth knowing without reading logs.
    const attempted = results.filter((r) => r.mode !== "empty");
    const degraded =
      attempted.length > 0 && attempted.every((r) => r.mode === "fallback");
    const usage = results.reduce((acc, r) => addUsage(acc, r.usage), ZERO_USAGE);
    const cost = usageCost(usage);
    const curation = {
      degraded,
      model: CURATION_MODEL,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      costUsd: Number(cost.toFixed(6)),
      sections: Object.fromEntries(
        results.map((r) => [r.id, r.reason ? `${r.mode}: ${r.reason}` : r.mode])
      ),
    };
    if (degraded) {
      console.error("[digest] all sections degraded to feed blurbs:", curation.sections);
    }

    const sections = buildSections(curated);
    const dateLabel = formatToday();
    const run = { ...usage, cost, model: CURATION_MODEL, degraded };
    const html = renderHtml(sections, dateLabel, run, panel);
    const text = renderText(sections, dateLabel, run, panel);
    const count = sections.reduce((n, s) => n + s.stories.length, 0);

    if (preview) {
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          // Readable with `curl -I` — tells you which path produced the page
          // without having to judge the prose by eye.
          "X-Digest-Curation": degraded ? "fallback" : "ai",
          "X-Digest-Detail": JSON.stringify(curation.sections),
          "X-Digest-Cost-Usd": cost.toFixed(6),
        },
      });
    }

    // Nothing to say is not a reason to send an empty email.
    if (count === 0) {
      console.log("[digest] no stories in window; skipping send");
      return NextResponse.json({ ok: true, sent: false, count: 0, failed, curation });
    }

    await sendDigest({ subject: `Flickman Daily Report - ${dateLabel}`, html, text });
    console.log(`[digest] sent ${count} stories across ${sections.length} sections`);

    return NextResponse.json({
      ok: true,
      sent: true,
      count,
      scanned: stories.length,
      failed,
      curation,
      panel: {
        weather: weather ? `${weather.high}/${weather.low}F` : null,
        sales: sales ? `$${Math.round(sales.revenue)} / ${sales.orders} orders` : null,
      },
    });
  } catch (err) {
    console.error("[digest] run failed:", err);
    return NextResponse.json({ error: "Digest failed" }, { status: 500 });
  }
}
