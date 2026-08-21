import { easternDate, type CalendarEvent, type CalendarRead } from "./calendar";
import type { Meeting } from "./email";
import { normalizeTitle, type PrepRead } from "./prep";
import type { LlmProvider } from "./llm";

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

/**
 * Matt's convention for a time that's been proposed but not agreed. These are
 * excluded before anything else looks at them — including the invitee fast path,
 * since a proposed meeting can already carry invitees. It's a deliberate
 * convention rather than a judgment call, so it belongs in code, not in a prompt.
 *
 * Matches (HOLD), [hold], ( Hold ) — bracketed only, so "household" and
 * "holding pattern" in a real title don't trip it.
 */
const HOLD_MARKER = /[([]\s*hold\s*[)\]]/i;

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
  return getTodaysMeetingsDetailed(read, now)?.meetings ?? null;
}

/** Same, plus a per-meeting flag for whether the event had real invitees. */
export function getTodaysMeetingsDetailed(
  read: CalendarRead,
  now = new Date()
): { meetings: Meeting[]; hadInvitees: boolean[] } | null {
  if (read.status !== "ok") return null;

  const today = easternDate(now);

  const meetings = read.events
    .filter((e) => {
      if (e.status === "cancelled") return false;
      // A proposed-but-unconfirmed time isn't on your day yet.
      if (HOLD_MARKER.test(e.summary ?? "")) return false;
      // All-day entries are trips, birthdays and holidays, not meetings — and
      // the location layer already uses them for travel.
      if (!e.start?.dateTime) return false;
      if (easternDate(new Date(e.start.dateTime)) !== today) return false;
      // Something you've declined isn't on your day.
      const self = (e.attendees ?? []).find((a) => a.self);
      if (self?.responseStatus === "declined") return false;
      return true;
    })
    .map((e) => ({
      meeting: {
        time: timeLabel(e.start!.dateTime!),
        title: e.summary?.trim() || "(no title)",
        attendees: attendeeList(e),
      } as Meeting,
      hadInvitees: (e.attendees ?? []).some((a) => !a.resource && !a.self),
    }));

  return {
    meetings: meetings.map((m) => m.meeting),
    hadInvitees: meetings.map((m) => m.hadInvitees),
  };
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

/* ──────────────────────────────────────────────────────────────── */
/* Telling meetings apart from time blocks                           */
/* ──────────────────────────────────────────────────────────────── */

const CLASSIFY_SCHEMA = {
  type: "object",
  properties: {
    decisions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer", description: "The number next to the entry." },
          isMeeting: {
            type: "boolean",
            description: "True if this is time with another person.",
          },
        },
        required: ["index", "isMeeting"],
        additionalProperties: false,
      },
    },
  },
  required: ["decisions"],
  additionalProperties: false,
} as const;

const CLASSIFY_SYSTEM = `Matt keeps one calendar for meetings, holds and his to-do list. His own rule:
he blocks time first to hold it, and once it becomes a real meeting he adds the other people as invitees.

Every entry you are given has NO invitees, because the ones that do have already been kept. So each of
these is a hold, a reminder, a task, or personal time — unless the title itself describes a conversation
happening at that time.

Mark isMeeting false for:
- Reminders to do something: "follow up with X", "email Y", "check in on Z". These are prompts to send a
  message, not time booked with someone. This is the single most common false positive.
- Task lists, often several items separated by slashes.
- Admin and errands: paying bills, ads, orders, uploads, edits, prep.
- Personal time: workouts, runs, meals, cleaning, travel, focus blocks.

Mark isMeeting true only when the title states a live conversation at that time — "call with X", "X/Y"
naming two people, an interview, a shoot with a crew, a scheduled intro.

A person's name alone is NOT enough: "follow up with Magnus" is a reminder, "call w/ Magnus" is a meeting.
The verb decides it, not the name.

When genuinely torn, answer true — a stray row costs a glance, a missing meeting costs its prep.`;

/**
 * Drop personal time blocks, keeping only entries that are time with someone.
 *
 * A regex would be the obvious approach and it doesn't survive contact with real
 * titles: "APEX + ALISON LEVINE EDITS" and "TURN OFF PHONE / AD REPORT / FULFILL
 * ORDERS" are both all-caps fragments with punctuation, and only one is a
 * meeting. This is judgment, so it goes to the model — one small call over a
 * handful of titles, which costs a fraction of a cent.
 *
 * Anything with a real invitee skips the model entirely and is always kept —
 * that's Matt's own rule (he adds people once a hold becomes a real meeting),
 * so it's a hard signal needing no judgment. The model only sees the leftovers,
 * which are holds and reminders far more often than meetings, and the prompt
 * says so.
 *
 * With no provider, or on any failure, every entry is kept — over-including
 * beats silently dropping the meeting you needed to prepare for.
 */
export async function keepRealMeetings(
  meetings: Meeting[],
  hadInvitees: boolean[],
  provider: LlmProvider | null
): Promise<{ meetings: Meeting[]; dropped: number; mode: "ai" | "kept-all" }> {
  const undecided = meetings
    .map((m, i) => ({ m, i }))
    .filter(({ i }) => !hadInvitees[i]);

  if (!provider || undecided.length === 0) {
    return { meetings, dropped: 0, mode: "kept-all" };
  }

  const list = undecided.map(({ m }, n) => `[${n}] ${m.time} — ${m.title}`).join("\n");

  try {
    const { text } = await provider.complete({
      system: CLASSIFY_SYSTEM,
      prompt: `Classify each calendar entry.\n\n${list}`,
      schema: CLASSIFY_SCHEMA as unknown as Record<string, unknown>,
      schemaName: "meeting_classification",
      maxTokens: 1000,
    });

    const parsed = JSON.parse(text) as {
      decisions: { index: number; isMeeting: boolean }[];
    };

    const rejected = new Set<number>();
    for (const d of parsed.decisions) {
      const entry = undecided[d.index];
      if (entry && !d.isMeeting) rejected.add(entry.i);
    }

    const kept = meetings.filter((_, i) => !rejected.has(i));
    return { meetings: kept, dropped: rejected.size, mode: "ai" };
  } catch (err) {
    console.error("[digest] meeting classification failed:", err);
    return { meetings, dropped: 0, mode: "kept-all" };
  }
}
