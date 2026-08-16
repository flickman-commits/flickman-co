import { easternDate, type CalendarEvent, type CalendarRead } from "./calendar";
import type { Meeting } from "./email";
import { normalizeTitle, type PrepRead } from "./prep";

/**
 * Today's meetings, derived from the calendar read.
 *
 * This is the first half of meeting prep: what's on, when, and who's on it —
 * available from the calendar alone, so it needs no credentials beyond the
 * service account already in use. The second half (what you need to know
 * walking in: last conversation, who this person is) comes from sources Vercel
 * can't reach — Wispr Flow transcripts, Gmail threads, web lookups — and gets
 * layered into `context` by the prep agent later.
 *
 * Times render in the report's timezone (America/New_York) rather than each
 * event's own, so a day's meetings read as one consistent column.
 */

/** How many attendees to name before collapsing the rest into a count. */
const MAX_NAMED_ATTENDEES = 4;

function timeLabel(dateTime: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateTime));
}

/** "matt@flickmanmedia.com" → "Matt", when there's no display name to use. */
function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function attendeeList(event: CalendarEvent): string | undefined {
  const people = (event.attendees ?? []).filter(
    // Rooms aren't people, and you already know you're going.
    (a) => !a.resource && !a.self && (a.displayName || a.email)
  );
  if (people.length === 0) return undefined;

  const names = people.map((a) =>
    a.displayName?.trim() ? a.displayName.trim() : nameFromEmail(a.email ?? "")
  );
  const shown = names.slice(0, MAX_NAMED_ATTENDEES);
  const extra = names.length - shown.length;
  return extra > 0 ? `${shown.join(", ")} +${extra} more` : shown.join(", ");
}

/**
 * Returns null only when the calendar couldn't be read — an empty array means
 * a genuinely clear day, and those render differently.
 */
export function getTodaysMeetings(read: CalendarRead, now = new Date()): Meeting[] | null {
  if (read.status !== "ok") return null;

  const today = easternDate(now);

  const meetings = read.events
    .filter((e) => {
      if (e.status === "cancelled") return false;
      // All-day entries are trips, birthdays and holidays, not meetings — and
      // the location layer already uses them for travel.
      if (!e.start?.dateTime) return false;
      if (easternDate(new Date(e.start.dateTime)) !== today) return false;
      // Something you've declined isn't on your day.
      const self = (e.attendees ?? []).find((a) => a.self);
      if (self?.responseStatus === "declined") return false;
      return true;
    })
    .map<Meeting>((e) => ({
      time: timeLabel(e.start!.dateTime!),
      title: e.summary?.trim() || "(no title)",
      attendees: attendeeList(e),
    }));

  return meetings;
}

export interface PrepMerge {
  meetings: Meeting[];
  /** How many meetings got context attached, and how many prep rows went unused. */
  matched: number;
  unmatched: number;
}

/**
 * Attach prep context to the calendar's meetings, matching on normalized title.
 *
 * Unused prep rows are counted rather than ignored: if the agent starts writing
 * titles that don't match the calendar, every meeting silently loses its context
 * and the section still looks plausible. A non-zero `unmatched` is the signal
 * that something drifted.
 */
export function applyPrep(meetings: Meeting[], prep: PrepRead): PrepMerge {
  const used = new Set<string>();
  let matched = 0;

  const merged = meetings.map((m) => {
    const key = normalizeTitle(m.title);
    const hit = prep.byTitle.get(key);
    if (!hit) return m;
    used.add(key);
    matched++;
    return {
      ...m,
      // The calendar knows who was actually invited; prep only fills the gap.
      attendees: m.attendees ?? hit.attendees,
      context: hit.context,
    };
  });

  return { meetings: merged, matched, unmatched: prep.byTitle.size - used.size };
}
