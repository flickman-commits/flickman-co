import { NextResponse, type NextRequest } from "next/server";
import { seedPrepRows } from "../../../../../lib/digest/run";

/**
 * GET /api/digest/meetings/seed — write today's meetings into Notion as empty
 * prep rows.
 *
 * The prep agent runs in a cloud environment whose egress can't reach this
 * domain, so it can't fetch the meeting list over HTTP. It can reach Notion, so
 * the report pushes the list there and the agent works rows that already exist.
 * Nothing crosses the blocked path, and the title — the join key — is written
 * by the report rather than invented by the agent.
 *
 * Scheduled by the cron in vercel.json, hours ahead of the 7am send so there is
 * time for the agent to research each row.
 *
 * Auth is CRON_SECRET only. This writes to Notion, so it does not accept
 * MEETINGS_READ_TOKEN — that token exists to sit in plain text inside a
 * scheduler prompt, and nothing that can create rows in your workspace belongs
 * there.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    console.error("[digest] CRON_SECRET not set; refusing to seed");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const authed =
    req.headers.get("authorization") === `Bearer ${secret}` ||
    req.nextUrl.searchParams.get("key") === secret;
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const run = await seedPrepRows();
    return NextResponse.json({
      ok: run.seed.status === "ok",
      date: run.date,
      meetings: run.meetings.length,
      created: run.seed.created,
      existing: run.seed.existing,
      seedStatus: run.seed.status,
      reason: run.seed.reason,
      diagnostics: {
        calendars: run.calendars,
        filteredOut: run.filtered,
        filterMode: run.filterMode,
      },
    });
  } catch (err) {
    console.error("[digest] seed failed:", err);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
