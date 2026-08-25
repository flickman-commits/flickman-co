import { NextResponse, type NextRequest } from "next/server";
import { buildMeetingList } from "../../../../lib/digest/run";

/**
 * GET /api/digest/meetings — today's meetings, after every filter.
 *
 * Exists for the prep agent. It used to read the calendar itself and decide what
 * counted as a meeting, which gave two ways to drift from the report: its Google
 * connector only reached one of the two accounts, so it never saw the meetings
 * that actually had invitees; and titles it invented didn't match, so context
 * landed on nothing. Both disappear when the report hands it the list.
 *
 * The `title` of each entry is the join key — the agent must write it back to
 * Notion verbatim.
 *
 * Auth is the same CRON_SECRET as the report, via header or ?key=.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  const authed =
    req.headers.get("authorization") === `Bearer ${secret}` ||
    req.nextUrl.searchParams.get("key") === secret;
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await buildMeetingList();
    return NextResponse.json({
      date: list.date,
      count: list.meetings.length,
      meetings: list.meetings.map((m) => ({
        title: m.title,
        time: m.time,
        attendees: m.attendees ?? null,
      })),
      diagnostics: {
        calendars: list.calendars,
        filteredOut: list.filtered,
        filterMode: list.filterMode,
      },
    });
  } catch (err) {
    console.error("[digest] meeting list failed:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
