import { NextResponse, type NextRequest } from "next/server";
import { buildDigest, runAndSend } from "../../../lib/digest/run";

/**
 * GET /api/digest — build and email the daily report.
 *
 * This is a transport wrapper and nothing more: auth, parse params, hand off to
 * buildDigest/runAndSend, shape a response. All the actual work lives in
 * lib/digest, which has no idea HTTP exists — so the same report runs from the
 * CLI (`npm run digest`), a laptop cron, or any other scheduler.
 *
 * Triggered by the Vercel cron in vercel.json, which sends
 * `Authorization: Bearer $CRON_SECRET`. For manual runs, pass `?key=$CRON_SECRET`.
 *
 * Query params (all optional):
 *   preview=1   render the report in the browser instead of sending it
 *   hours=48    widen the lookback window for this run
 *
 * Env: see lib/digest/{llm,google,email}.ts for the full list.
 *   CRON_SECRET  required — without it the route refuses to run
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * HTTP header values are Latin-1, so any character above U+00FF throws when the
 * response is constructed — turning a diagnostic into a 500. Diagnostics carry
 * arbitrary upstream error text, so they get scrubbed rather than trusted.
 */
function headerSafe(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
}

function authorized(req: NextRequest, secret: string): boolean {
  if (req.headers.get("authorization") === `Bearer ${secret}`) return true;
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
  const hours = Number(params.get("hours")) || undefined;

  try {
    if (params.get("preview") === "1") {
      const result = await buildDigest({ hours });
      return new NextResponse(result.html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          // Readable with `curl -I`: which path produced the page, what it cost,
          // and whether the calendar was actually reachable.
          "X-Digest-Curation": result.curation.degraded ? "fallback" : "ai",
          "X-Digest-Model": headerSafe(result.curation.model),
          "X-Digest-Cost-Usd": result.curation.costUsd.toFixed(6),
          "X-Digest-Location": headerSafe(
            `${result.location.place} (${result.location.source}, ${result.location.eventsSeen} events)` +
              (result.location.reason ? `: ${result.location.reason}` : "")
          ),
          "X-Digest-Financials": result.financialsLoaded ? "loaded" : "absent",
          "X-Digest-Detail": headerSafe(JSON.stringify(result.curation.sections)),
        },
      });
    }

    const result = await runAndSend({ hours });
    return NextResponse.json({
      ok: true,
      sent: result.sent,
      count: result.storyCount,
      scanned: result.scanned,
      failed: result.failedFeeds,
      curation: result.curation,
      location: result.location,
      financialsLoaded: result.financialsLoaded,
    });
  } catch (err) {
    console.error("[digest] run failed:", err);
    return NextResponse.json({ error: "Digest failed" }, { status: 500 });
  }
}
