/**
 * SerpAPI Google Flights — server-side only.
 *
 * Free, easy signup at https://serpapi.com (just email + password). The free
 * tier is 100 searches/month, which is plenty here thanks to the 1-hour
 * fetch cache below.
 *
 * Required env var (on Vercel):
 *   SERPAPI_KEY
 *
 * Docs: https://serpapi.com/google-flights-api
 */

const BASE = "https://serpapi.com/search.json";

export class SerpApiNotConfigured extends Error {
  constructor() {
    super("SERPAPI_KEY not set");
    this.name = "SerpApiNotConfigured";
  }
}

export type FlightOfferSummary = {
  airline: string;       // 2-letter carrier code or first word of airline name
  number: string;        // flight number digits
  origin: string;
  destination: string;
  departureDate: string; // YYYY-MM-DD
  price: number;         // in USD
  currency: string;
  stops: number;
  deepLink: string;      // Google Flights URL
  durationMinutes?: number;
};

type SerpFlightSegment = {
  departure_airport: { id: string };
  arrival_airport: { id: string };
  flight_number?: string;
  airline?: string;
  airline_logo?: string;
  duration?: number;
  travel_class?: string;
};

type SerpFlightResult = {
  flights: SerpFlightSegment[];
  layovers?: unknown[];
  total_duration?: number;
  price: number;
  type?: string;
  airline_logo?: string;
};

type SerpResponse = {
  best_flights?: SerpFlightResult[];
  other_flights?: SerpFlightResult[];
  error?: string;
};

export async function searchGoogleFlightsOnDate(params: {
  origin: string;
  destination: string;
  date: string; // YYYY-MM-DD
  currency?: string;
}): Promise<FlightOfferSummary | null> {
  const key = process.env.SERPAPI_KEY;
  if (!key) throw new SerpApiNotConfigured();

  const url = new URL(BASE);
  url.searchParams.set("engine", "google_flights");
  url.searchParams.set("departure_id", params.origin);
  url.searchParams.set("arrival_id", params.destination);
  url.searchParams.set("outbound_date", params.date);
  url.searchParams.set("type", "2"); // one-way
  url.searchParams.set("currency", params.currency ?? "USD");
  url.searchParams.set("hl", "en");
  url.searchParams.set("api_key", key);

  const res = await fetch(url, {
    // Cache identical queries for an hour at the network layer.
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SerpAPI ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as SerpResponse;
  if (json.error) {
    // SerpAPI returns 200 + an `error` string for things like rate limits.
    throw new Error(`SerpAPI: ${json.error}`);
  }

  const results = [...(json.best_flights ?? []), ...(json.other_flights ?? [])];
  if (results.length === 0) return null;

  // Sort cheapest first, prefer fewer stops on ties.
  const sorted = [...results].sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price;
    return a.flights.length - b.flights.length;
  });
  const best = sorted[0];
  const firstSeg = best.flights[0];
  const lastSeg = best.flights[best.flights.length - 1];

  // flight_number from SerpAPI looks like "DL 245" or sometimes "Delta 245".
  // Take the first token as the carrier display and the trailing number as
  // the flight number.
  const fn = firstSeg.flight_number ?? "";
  const match = fn.match(/^([A-Z0-9]{1,3})\s*(\d{1,5})$/i);
  const airline = match ? match[1].toUpperCase() : (firstSeg.airline ?? "").slice(0, 2).toUpperCase();
  const number = match ? match[2] : fn.replace(/^\D+/, "");

  return {
    airline,
    number,
    origin: firstSeg.departure_airport.id,
    destination: lastSeg.arrival_airport.id,
    departureDate: params.date,
    price: Math.round(best.price),
    currency: params.currency ?? "USD",
    stops: Math.max(0, best.flights.length - 1),
    durationMinutes: best.total_duration,
    deepLink: buildGoogleFlightsLink(params.origin, params.destination, params.date),
  };
}

function buildGoogleFlightsLink(
  origin: string,
  destination: string,
  date: string
): string {
  return `https://www.google.com/travel/flights?q=Flights%20from%20${origin}%20to%20${destination}%20on%20${date}`;
}
