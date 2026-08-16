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
 * Env:
 *   DIGEST_CALENDAR_ID  calendar to read; defaults to the digest recipient
 */

export interface CalendarEvent {
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
}

/**
 * Never throws. A calendar that can't be read yields an empty list plus a
 * status saying so — callers degrade rather than failing the whole report, and
 * "unreachable" stays distinguishable from "nothing scheduled".
 */
export async function getTodaysEvents(now = new Date()): Promise<CalendarRead> {
  const token = await getGoogleToken([CALENDAR_SCOPE]);
  if (!token) return { events: [], status: "no-credential" };

  const calendarId =
    process.env.DIGEST_CALENDAR_ID ??
    process.env.DIGEST_TO_EMAIL ??
    process.env.BOOKING_NOTIFY_EMAIL ??
    "matt@flickmanmedia.com";

  // Generous either side of today in UTC terms so nothing near a boundary is
  // missed; callers narrow to the actual local day.
  const dayStart = new Date(now);
  dayStart.setUTCHours(0, 0, 0, 0);
  const timeMin = new Date(dayStart.getTime() - 12 * 3600_000).toISOString();
  const timeMax = new Date(dayStart.getTime() + 36 * 3600_000).toISOString();

  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events` +
    `?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}` +
    `&singleEvents=true&orderBy=startTime&maxResults=50`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      throw new Error(`Calendar ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
    const json = (await res.json()) as { items?: CalendarEvent[] };
    return { events: json.items ?? [], status: "ok" };
  } catch (err) {
    console.error("[digest] calendar read failed:", err);
    return {
      events: [],
      status: "unavailable",
      reason: err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200),
    };
  }
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
