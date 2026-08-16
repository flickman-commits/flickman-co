import type { CalendarRead } from "./calendar";

/**
 * Where you are today, so the forecast is for the right city.
 *
 * Reads today's calendar and looks for a location that implies you're somewhere
 * other than home. The guard that makes this safe is the distance check: a
 * meeting at "Chelsea Piers" geocodes a couple of miles away and is ignored,
 * while "Austin, TX" is 1,500 miles away and wins. Without that, every lunch
 * spot with a geocodable name would move your weather.
 *
 * Consumes the shared calendar read; see ./calendar for access requirements.
 *
 * Env:
 *   DIGEST_HOME_*  overrides for the home location
 */

/**
 * How the location was decided. Distinguishing these matters: "calendar read
 * fine, you're home" and "calendar unreachable, assumed home" produce the same
 * forecast, and without this you can't tell which happened — so a broken
 * calendar integration would look exactly like a normal day at home.
 */
export type PlaceSource =
  | "travel" // calendar put you somewhere far from home
  | "home" // calendar read fine; nothing far away
  | "unavailable" // calendar errored; fell back to home
  | "no-credential"; // no service account configured

export interface Place {
  /** Display name, e.g. "Austin" or "New York". */
  label: string;
  lat: number;
  lon: number;
  /** True when this came from the calendar rather than the home default. */
  travelling: boolean;
  source: PlaceSource;
  /** Calendar events considered; 0 when the calendar wasn't read. */
  eventsSeen: number;
  /** Why the calendar wasn't used, when it wasn't. Surfaced in diagnostics. */
  reason?: string;
}

function home(source: PlaceSource, eventsSeen = 0, reason?: string): Place {
  return {
    reason,
    label: process.env.DIGEST_HOME_LABEL ?? "New York",
    lat: Number(process.env.DIGEST_HOME_LAT ?? 40.7358),
    lon: Number(process.env.DIGEST_HOME_LON ?? -74.0036),
    travelling: false,
    source,
    eventsSeen,
  };
}

const HOME_LAT = Number(process.env.DIGEST_HOME_LAT ?? 40.7358);
const HOME_LON = Number(process.env.DIGEST_HOME_LON ?? -74.0036);

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

/**
 * Location candidates from today's events. All-day entries come first: "I am in
 * Austin this week" is far more often an all-day entry than a 30-minute meeting.
 */
function locationCandidates(read: CalendarRead): string[] {
  const allDay = read.events.filter((e) => e.start?.date);
  const timed = read.events.filter((e) => !e.start?.date);

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
 * Never throws and never returns null — an unreadable calendar just means you
 * get the home forecast, which is right far more often than it's wrong.
 */
export async function getTodaysPlace(read: CalendarRead): Promise<Place> {
  if (read.status === "no-credential") return home("no-credential");
  if (read.status === "unavailable") return home("unavailable", 0, read.reason);

  const candidates = locationCandidates(read);
  try {
    for (const candidate of candidates.slice(0, 5)) {
      const hit = await geocode(candidate);
      if (!hit) continue;
      const distance = milesBetween(HOME_LAT, HOME_LON, hit.latitude, hit.longitude);
      if (distance < TRAVEL_THRESHOLD_MILES) continue; // still around home
      return {
        label: hit.name,
        lat: hit.latitude,
        lon: hit.longitude,
        travelling: true,
        source: "travel",
        eventsSeen: read.events.length,
      };
    }
  } catch (err) {
    console.error("[digest] geocoding failed:", err);
  }
  return home("home", read.events.length);
}
