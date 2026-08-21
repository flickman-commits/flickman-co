import { CALENDAR_SCOPE, getGoogleToken } from "./google";

/**
 * One read of today's calendar, shared by everything that needs it.
 *
 * Both the location layer (which city's forecast) and the meetings section want
 * the same events, so this fetches once and hands the raw list to both rather
 * than making two identical API calls.
 *
 * Requires the calendar to be shared with the service account's client_email
 * (Calendar settings → Share with specific people → "See all event details")
 * and the Google Calendar API enabled on the project.
 *
 * Reads every calendar in DIGEST_CALENDAR_IDS. Matt keeps two Google accounts,
 * and the invited meetings live on the second one — reading only the first made
 * it look like he never gets invited to anything, which drove a whole wrong
 * conclusion about how to tell meetings from time blocks.
 *
 * Each calendar must be shared with the service account's client_email
 * separately; sharing one account grants nothing on the other.
 *
 * Env:
 *   DIGEST_CALENDAR_IDS  comma-separated calendar ids (emails) to read
 *   DIGEST_CALENDAR_ID   single-calendar fallback, kept for compatibility
 */

export interface CalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  status?: string;
  hangoutLink?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
  attendees?: {
    email?: string;
    displayName?: string;
    responseStatus?: string;
    self?: boolean;
    resource?: boolean;
    organizer?: boolean;
  }[];
}

export type CalendarStatus = "ok" | "unavailable" | "no-credential";

export interface CalendarRead {
  events: CalendarEvent[];
  status: CalendarStatus;
  /** Why it failed, when it did. Surfaced in diagnostics, never thrown. */
  reason?: string;
  /** Per-calendar outcome, e.g. "matt@x.com:5, matt@y.com:403". */
  perCalendar?: string;
}

/** Every calendar to read, in order. */
function calendarIds(): string[] {
  const raw =
    process.env.DIGEST_CALENDAR_IDS ??
    process.env.DIGEST_CALENDAR_ID ??
    process.env.DIGEST_TO_EMAIL ??
    process.env.BOOKING_NOTIFY_EMAIL ??
    "matt@flickmanmedia.com";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Never throws. A calendar that can't be read yields an empty list plus a
 * status saying so — callers degrade rather than failing the whole report, and
 * "unreachable" stays distinguishable from "nothing scheduled".
 */
async function readOne(
  calendarId: string,
  token: string,
  timeMin: string,
  timeMax: string
): Promise<CalendarEvent[]> {
  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events` +
    `?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}` +
    `&singleEvents=true&orderBy=startTime&maxResults=50`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(`${res.status}: ${(await res.text()).slice(0, 120)}`);
  }
  const json = (await res.json()) as { items?: CalendarEvent[] };
  return json.items ?? [];
}

/**
 * Never throws. Calendars are read independently: one that can't be reached
 * doesn't cost you the others, and `perCalendar` records what each did, so a
 * newly-added account that was never shared shows up as a 403 rather than
 * quietly contributing nothing.
 */
export async function getTodaysEvents(now = new Date()): Promise<CalendarRead> {
  const token = await getGoogleToken([CALENDAR_SCOPE]);
  if (!token) return { events: [], status: "no-credential" };

  // Generous either side of today in UTC terms so nothing near a boundary is
  // missed; callers narrow to the actual local day.
  const dayStart = new Date(now);
  dayStart.setUTCHours(0, 0, 0, 0);
  const timeMin = new Date(dayStart.getTime() - 12 * 3600_000).toISOString();
  const timeMax = new Date(dayStart.getTime() + 36 * 3600_000).toISOString();

  const ids = calendarIds();
  const settled = await Promise.allSettled(
    ids.map((id) => readOne(id, token, timeMin, timeMax))
  );

  const events: CalendarEvent[] = [];
  const notes: string[] = [];
  let anyOk = false;

  settled.forEach((r, i) => {
    if (r.status === "fulfilled") {
      anyOk = true;
      events.push(...r.value);
      notes.push(`${ids[i]}:${r.value.length}`);
    } else {
      const msg = r.reason instanceof Error ? r.reason.message : String(r.reason);
      console.error(`[digest] calendar ${ids[i]} failed:`, msg);
      notes.push(`${ids[i]}:ERR ${msg.slice(0, 60)}`);
    }
  });

  const perCalendar = notes.join(", ");
  if (!anyOk) {
    return { events: [], status: "unavailable", reason: perCalendar, perCalendar };
  }

  // The same meeting can appear on both accounts when he's invited on one and
  // holds time on the other; Google gives them the same id in that case.
  const seen = new Set<string>();
  const deduped = events.filter((e) => {
    const key = e.id ?? `${e.summary}|${e.start?.dateTime ?? e.start?.date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) =>
    (a.start?.dateTime ?? a.start?.date ?? "").localeCompare(
      b.start?.dateTime ?? b.start?.date ?? ""
    )
  );

  return { events: deduped, status: "ok", perCalendar };
}

/** The ET calendar date at an instant, as YYYY-MM-DD. */
export function easternDate(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}
