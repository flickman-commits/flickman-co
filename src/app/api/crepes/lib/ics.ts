/**
 * Minimal .ics (iCalendar) generator for a confirmed Crepe Sundays booking.
 *
 * Uses TZID=America/New_York with an inline VTIMEZONE block so Apple Mail,
 * Google Calendar, and Outlook all render the time correctly without doing
 * UTC math on our end.
 */

const PRODID = "-//Crepe Sundays//Booking 1.0//EN";

/* DST rules for America/New_York. Modern calendars also know these but
   including them makes Outlook in particular reliable. */
const NY_VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  "TZID:America/New_York",
  "BEGIN:STANDARD",
  "DTSTART:19701101T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "TZOFFSETFROM:-0400",
  "TZOFFSETTO:-0500",
  "TZNAME:EST",
  "END:STANDARD",
  "BEGIN:DAYLIGHT",
  "DTSTART:19700308T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
  "TZOFFSETFROM:-0500",
  "TZOFFSETTO:-0400",
  "TZNAME:EDT",
  "END:DAYLIGHT",
  "END:VTIMEZONE",
].join("\r\n");

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function fmtLocal(dateISO: string, hour: number, minute: number): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  return `${y}${pad(m)}${pad(d)}T${pad(hour)}${pad(minute)}00`;
}

function fmtUtcNow(): string {
  const d = new Date();
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildBookingIcs(opts: {
  uid: string;
  dateISO: string; // Sunday's date
  guestName: string;
  guestEmail: string;
  party: 1 | 2;
  organizerName?: string;
  organizerEmail?: string;
  /** Optional override; otherwise reads CREPES_LOCATION env var. */
  location?: string;
}): string {
  const organizerName = opts.organizerName ?? "Matt & Nat";
  const organizerEmail =
    opts.organizerEmail ??
    process.env.BOOKING_NOTIFY_EMAIL ??
    "matt@flickmanmedia.com";
  const location =
    opts.location ?? process.env.CREPES_LOCATION ?? "West Village, New York";

  const start = fmtLocal(opts.dateISO, 11, 0);   // 11:00 AM ET
  const end = fmtLocal(opts.dateISO, 12, 30);    // 12:30 PM ET
  const description =
    `Crepe Sundays with Matt & Nat. Table for ${opts.party}. Come hungry.`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    NY_VTIMEZONE,
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `DTSTAMP:${fmtUtcNow()}`,
    `DTSTART;TZID=America/New_York:${start}`,
    `DTEND;TZID=America/New_York:${end}`,
    `SUMMARY:Crepe Sundays - ${escapeText(opts.guestName)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(location)}`,
    `ORGANIZER;CN=${escapeText(organizerName)}:mailto:${organizerEmail}`,
    `ATTENDEE;RSVP=FALSE;CN=${escapeText(organizerName)};PARTSTAT=ACCEPTED:mailto:${organizerEmail}`,
    `ATTENDEE;RSVP=FALSE;CN=Nat;PARTSTAT=ACCEPTED:mailto:${process.env.CREPES_NAT_EMAIL ?? "natalia.ohanesian@gmail.com"}`,
    `ATTENDEE;RSVP=TRUE;CN=${escapeText(opts.guestName)};PARTSTAT=ACCEPTED:mailto:${opts.guestEmail}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
