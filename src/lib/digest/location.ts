import { CALENDAR_SCOPE, getGoogleToken } from "./google";

/**
 * Where you are today, so the forecast is for the right city.
 *
 * Reads today's calendar and looks for a location that implies you're somewhere
 * other than home. The guard that makes this safe is the distance check: a
 * meeting at "Chelsea Piers" geocodes a couple of miles away and is ignored,
 * while "Austin, TX" is 1,500 miles away and wins. Without that, every lunch
 * spot with a geocodable name would move your weather.
 *
 * Requires the calendar to be shared with the service account's client_email
 * (Google Calendar → Settings for that calendar → Share with specific people →
 * "See all event details"), and the Calendar API enabled on the project.
 *
 * Env:
 *   DIGEST_CALENDAR_ID  calendar to read; defaults to the digest recipient
 *   DIGEST_HOME_*       overrides for the home location
 */

export interface Place {
  /** Display name, e.g. "Austin" or "New York". */
  label: string;
  lat: number;
  lon: number;
  /** True when this came from the calendar rather than the home default. */
  travelling: boolean;
}

const HOME: Place = {
  label: process.env.DIGEST_HOME_LABEL ?? "New York",
  lat: Number(process.env.DIGEST_HOME_LAT ?? 40.7358),
  lon: Number(process.env.DIGEST_HOME_LON ?? -74.0036),
  travelling: false,
};

/** Below this, treat the calendar location as "still home". Miles. */
const TRAVEL_THRESHOLD_MILES = 75;

function milesBetween(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Video links, phone bridges and room names aren't places. */
function looksLikeAPlace(raw: string): boolean {
  const s = raw.trim();
  if (s.length < 3 || s.length > 120) return false;
  if (/^https?:\/\//i.test(s)) return false;
  if (/zoom\.us|meet\.google|teams\.microsoft|webex|hangout|phone|dial-in/i.test(s)) {
    return false;
  }
  // A bare room or desk name has no locality to geocode.
  if (/^(room|rm|conf|office|desk)\b/i.test(s)) return false;
  return true;
}

interface CalEvent {
  summary?: string;
  location?: string;
  start?: { date?: string; dateTime?: string };
}

/** Today's events in New York terms, all-day events first — trips are all-day. */
async function todaysLocations(now: Date): Promise<string[]> {
  const token = await getGoogleToken([CALENDAR_SCOPE]);
  if (!token) return [];

  const calendarId =
    process.env.DIGEST_CALENDAR_ID ??
    process.env.DIGEST_TO_EMAIL ??
    process.env.BOOKING_NOTIFY_EMAIL ??
    "matt@flickmanmedia.com";

  const dayStart = new Date(now);
  dayStart.setUTCHours(0, 0, 0, 0);
  const timeMin = new Date(dayStart.getTime() - 12 * 3600_000).toISOString();
  const timeMax = new Date(dayStart.getTime() + 36 * 3600_000).toISOString();

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
    throw new Error(`Calendar ${res.status}: ${(await res.text()).slice(0, 160)}`);
  }

  const json = (await res.json()) as { items?: CalEvent[] };
  const items = json.items ?? [];

  // An all-day event is far more likely to be "I am in Austin this week" than
  // a 30-minute meeting is, so those are considered first.
  const allDay = items.filter((e) => e.start?.date);
  const timed = items.filter((e) => !e.start?.date);

  const candidates: string[] = [];
  for (const event of [...allDay, ...timed]) {
    if (event.location && looksLikeAPlace(event.location)) candidates.push(event.location);
    // All-day events often carry the city in the title with no location set.
    else if (event.start?.date && event.summary && looksLikeAPlace(event.summary)) {
      candidates.push(event.summary);
    }
  }
  return candidates;
}

interface GeoHit {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country_code?: string;
}

/** Open-Meteo geocoding: free, no key, global. */
async function geocode(query: string): Promise<GeoHit | null> {
  // Street addresses don't geocode well here; the locality usually does, and
  // the locality is all we need for a forecast.
  const locality = query.split(",").slice(-2).join(",").trim() || query;
  const url =
    "https://geocoding-api.open-meteo.com/v1/search" +
    `?name=${encodeURIComponent(locality)}&count=1&language=en&format=json`;

  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { results?: GeoHit[] };
  return json.results?.[0] ?? null;
}

/**
 * Never throws and never returns null — an unreachable calendar just means you
 * get the home forecast, which is right far more often than it's wrong.
 */
export async function getTodaysPlace(now = new Date()): Promise<Place> {
  try {
    const candidates = await todaysLocations(now);
    for (const candidate of candidates.slice(0, 5)) {
      const hit = await geocode(candidate);
      if (!hit) continue;
      const distance = milesBetween(HOME.lat, HOME.lon, hit.latitude, hit.longitude);
      if (distance < TRAVEL_THRESHOLD_MILES) continue; // still around home
      return {
        label: hit.name,
        lat: hit.latitude,
        lon: hit.longitude,
        travelling: true,
      };
    }
  } catch (err) {
    console.error("[digest] location lookup failed:", err);
  }
  return HOME;
}
