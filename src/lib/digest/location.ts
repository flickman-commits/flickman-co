import type { CalendarEvent, CalendarRead } from "./calendar";

/**
 * Where you are today, so the forecast is for the right city.
 *
 * Three signals, in order of trust:
 *
 *   1. An all-day event today with a far-away place — "Austin this week".
 *   2. The last flight you took. This is the one that usually decides it: a
 *      trip's flights are days in the past by the time the report asks, so
 *      today's calendar alone would have you at home for the whole trip.
 *   3. A timed event today with a far-away location.
 *
 * The guard that makes any of this safe is the distance check: a meeting at
 * "Chelsea Piers" geocodes a couple of miles away and is ignored, while
 * "Austin, TX" is 1,500 miles away and wins. Without that, every lunch spot
 * with a geocodable name would move your weather. It also handles the flight
 * home for free — "Flight to New York" geocodes to home, and you're home.
 *
 * Consumes the shared calendar reads; see ./calendar for access requirements.
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
  | "travel" // an event today put you somewhere far from home
  | "flight" // your last flight landed somewhere far from home
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
  // A short all-caps token is an abbreviation, not a place — and the geocoder
  // will cheerfully resolve one. "RUN" on the calendar is a workout; to
  // Open-Meteo it is Réunion's airport code, which put the forecast 9,000
  // miles away in Saint-Denis. Ambiguous two-letter cities ("LA") lose here
  // too, which is the right trade: guessing wrong moves your weather.
  if (s.length <= 5 && !/[a-z]/.test(s)) return false;
  return true;
}

/* ──────────────────────────────────────────────────────────────── */
/* Flights                                                           */
/* ──────────────────────────────────────────────────────────────── */

/**
 * Gmail files a booking as "Flight to San Diego (B6 189)". Other tools write
 * "Flight: AA 7043 from FLR to LHR". Both carry the destination in the title
 * and nowhere else — the event's `location` is the *departure* airport, which
 * is exactly the wrong thing to geocode. That is why flights are parsed here
 * rather than falling through the generic path below.
 */
const FLIGHT_TO = /^\s*flight to (.+?)\s*(?:\(|$)/i;
const FLIGHT_CODES = /\bfrom ([A-Z]{3}) to ([A-Z]{3})\b/;

/** Airports that show up as bare codes. Extend as needed; unknown codes skip. */
const IATA: Record<string, string> = {
  JFK: "New York", LGA: "New York", EWR: "Newark",
  LAX: "Los Angeles", SNA: "Santa Ana", SAN: "San Diego", SFO: "San Francisco",
  ORD: "Chicago", DEN: "Denver", DFW: "Dallas", IAH: "Houston", MIA: "Miami",
  ATL: "Atlanta", BOS: "Boston", SEA: "Seattle", PDX: "Portland", AUS: "Austin",
  LHR: "London", CDG: "Paris", FLR: "Florence", FCO: "Rome", AMS: "Amsterdam",
};

function isFlight(e: CalendarEvent): boolean {
  const s = e.summary ?? "";
  return FLIGHT_TO.test(s) || FLIGHT_CODES.test(s);
}

function flightDestination(e: CalendarEvent): string | null {
  const s = e.summary ?? "";
  const to = FLIGHT_TO.exec(s);
  if (to) return to[1].trim();
  const codes = FLIGHT_CODES.exec(s);
  if (codes) return IATA[codes[2]] ?? null;
  return null;
}

/**
 * The most recent flight that has already landed. A flight later today hasn't
 * moved you yet — at 7am you're still where you woke up.
 */
function lastLandedFlight(flights: CalendarRead, now: Date): CalendarEvent | null {
  return (
    flights.events
      .filter((e) => e.status !== "cancelled" && isFlight(e) && e.end?.dateTime)
      .filter((e) => new Date(e.end!.dateTime!).getTime() <= now.getTime())
      .sort((a, b) => b.end!.dateTime!.localeCompare(a.end!.dateTime!))[0] ?? null
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Today's events                                                    */
/* ──────────────────────────────────────────────────────────────── */

/**
 * Location candidates from today's events, all-day entries first: "I am in
 * Austin this week" is far more often an all-day entry than a 30-minute
 * meeting. Flights are excluded — their location is where you left from.
 */
function locationCandidates(events: CalendarEvent[]): string[] {
  const candidates: string[] = [];
  for (const event of events) {
    if (isFlight(event)) continue;
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
  /** GeoNames class: PPL* is a populated place, AIRP an airport, PRK a park. */
  feature_code?: string;
  population?: number;
}

/**
 * Only somewhere people live. Asking for "Orange County" returns Orange County
 * Airport in *Texas* as its top hit — right name, wrong thing, wrong coast. A
 * forecast is for a town, so anything that isn't one is not an answer.
 */
function isPopulatedPlace(hit: GeoHit): boolean {
  return (hit.feature_code ?? "").startsWith("PPL");
}

/**
 * The hit has to bear the name that was asked for. Geocoders would rather
 * return something than nothing, and the something can be unrelated — "RUN"
 * comes back as Saint-Denis. Requiring the names to overlap turns a confident
 * wrong answer into no answer, which falls through to home.
 */
function nameMatches(query: string, hit: GeoHit): boolean {
  const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const q = norm(query);
  const n = norm(hit.name);
  return q.length > 0 && n.length > 0 && (q.includes(n) || n.includes(q));
}

/** Open-Meteo geocoding: free, no key, global. */
async function geocode(query: string): Promise<GeoHit | null> {
  // Street addresses don't geocode well here; the locality usually does, and
  // the locality is all we need for a forecast.
  const locality = query.split(",").slice(-2).join(",").trim() || query;
  const url =
    "https://geocoding-api.open-meteo.com/v1/search" +
    // Several candidates rather than one: the top hit is often an airport or a
    // park, and the town we want is a row or two down.
    `?name=${encodeURIComponent(locality)}&count=5&language=en&format=json`;

  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { results?: GeoHit[] };
  const usable = (json.results ?? []).filter(
    (h) => isPopulatedPlace(h) && nameMatches(locality, h)
  );
  // Results arrive best-match first, so the first survivor is the answer.
  return usable[0] ?? null;
}

/**
 * Never throws and never returns null — an unreadable calendar just means you
 * get the home forecast, which is right far more often than it's wrong.
 */
export async function getTodaysPlace(
  read: CalendarRead,
  flights: CalendarRead = { events: [], status: "ok" },
  now = new Date()
): Promise<Place> {
  if (read.status === "no-credential") return home("no-credential");
  if (read.status === "unavailable") return home("unavailable", 0, read.reason);

  const allDay = read.events.filter((e) => e.start?.date);
  const timed = read.events.filter((e) => !e.start?.date);
  const flight = lastLandedFlight(flights, now);
  const flightDest = flight ? flightDestination(flight) : null;

  // Each candidate carries how it was found, so the diagnostic can say
  // "San Diego (flight: Flight to San Diego (B6 189), Sep 2)" rather than
  // just "San Diego" — and a wrong answer is traceable to the event.
  const candidates: { query: string; source: PlaceSource; why: string }[] = [
    ...locationCandidates(allDay).map((q) => ({ query: q, source: "travel" as const, why: q })),
    ...(flightDest
      ? [{ query: flightDest, source: "flight" as const, why: `${flight!.summary}, ${flightDay(flight!)}` }]
      : []),
    ...locationCandidates(timed).map((q) => ({ query: q, source: "travel" as const, why: q })),
  ];

  try {
    for (const c of candidates.slice(0, 6)) {
      const hit = await geocode(c.query);
      if (!hit) continue;
      const distance = milesBetween(HOME_LAT, HOME_LON, hit.latitude, hit.longitude);
      if (distance < TRAVEL_THRESHOLD_MILES) {
        // A flight home is the strongest possible "you're home": stop looking
        // at weaker signals that might drag you back out.
        if (c.source === "flight") break;
        continue;
      }
      return {
        label: hit.name,
        lat: hit.latitude,
        lon: hit.longitude,
        travelling: true,
        source: c.source,
        eventsSeen: read.events.length,
        reason: c.why,
      };
    }
  } catch (err) {
    console.error("[digest] geocoding failed:", err);
  }
  return home(
    "home",
    read.events.length,
    flight
      ? `last flight: ${flight.summary}, ${flightDay(flight)}`
      : `no flights in 30 days (read ${flights.perCalendar ?? flights.status}; ` +
        `${flights.events.length} events, ${flights.events.filter((e) => !e.summary).length} untitled)`
  );
}

function flightDay(e: CalendarEvent): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
  }).format(new Date(e.end!.dateTime!));
}
