/**
 * Amadeus Self-Service API helpers — server-side only.
 *
 * Required env vars (set on Vercel):
 *   AMADEUS_API_KEY     — from your Amadeus for Developers app
 *   AMADEUS_API_SECRET
 * Optional:
 *   AMADEUS_HOSTNAME    — defaults to "https://test.api.amadeus.com"
 *                         flip to "https://api.amadeus.com" for live prices
 *
 * Get credentials at https://developers.amadeus.com (free, no card needed).
 * Test endpoint returns realistic sample data; production needs activation.
 */

const BASE = process.env.AMADEUS_HOSTNAME ?? "https://test.api.amadeus.com";

let cachedToken: { value: string; expiresAt: number } | null = null;

export class AmadeusNotConfigured extends Error {
  constructor() {
    super("AMADEUS_API_KEY / AMADEUS_API_SECRET not set");
    this.name = "AmadeusNotConfigured";
  }
}

async function getAccessToken(): Promise<string> {
  const key = process.env.AMADEUS_API_KEY;
  const secret = process.env.AMADEUS_API_SECRET;
  if (!key || !secret) throw new AmadeusNotConfigured();

  if (cachedToken && cachedToken.expiresAt - Date.now() > 60_000) {
    return cachedToken.value;
  }

  const res = await fetch(`${BASE}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: key,
      client_secret: secret,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Amadeus auth ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
  };
  return json.access_token;
}

export type FlightOfferSummary = {
  airline: string;       // 2-letter carrier code
  number: string;        // flight number
  origin: string;
  destination: string;
  departureDate: string; // YYYY-MM-DD
  price: number;         // total, in currency
  currency: string;
  stops: number;
  deepLink: string;      // Google Flights URL for the route
};

type AmadeusOffer = {
  itineraries: Array<{
    segments: Array<{
      carrierCode: string;
      number: string;
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string };
    }>;
  }>;
  price: { total: string; currency: string };
};

export async function cheapestOfferForDate(params: {
  origin: string;
  destination: string;
  date: string;       // YYYY-MM-DD
  currency?: string;
}): Promise<FlightOfferSummary | null> {
  const token = await getAccessToken();
  const url = new URL(`${BASE}/v2/shopping/flight-offers`);
  url.searchParams.set("originLocationCode", params.origin);
  url.searchParams.set("destinationLocationCode", params.destination);
  url.searchParams.set("departureDate", params.date);
  url.searchParams.set("adults", "1");
  url.searchParams.set("currencyCode", params.currency ?? "USD");
  url.searchParams.set("max", "5");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    // Cache for an hour at the network layer.
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Amadeus offers ${res.status}: ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as { data?: AmadeusOffer[] };
  const offers = json.data ?? [];
  if (offers.length === 0) return null;

  // Pick the cheapest, but prefer fewer stops on ties.
  const sorted = [...offers].sort((a, b) => {
    const pa = parseFloat(a.price.total);
    const pb = parseFloat(b.price.total);
    if (pa !== pb) return pa - pb;
    return a.itineraries[0].segments.length - b.itineraries[0].segments.length;
  });
  const best = sorted[0];
  const outboundSegs = best.itineraries[0].segments;
  const firstSeg = outboundSegs[0];

  return {
    airline: firstSeg.carrierCode,
    number: firstSeg.number,
    origin: firstSeg.departure.iataCode,
    destination: outboundSegs[outboundSegs.length - 1].arrival.iataCode,
    departureDate: params.date,
    price: parseFloat(best.price.total),
    currency: best.price.currency,
    stops: outboundSegs.length - 1,
    deepLink: buildGoogleFlightsLink(
      params.origin,
      params.destination,
      params.date
    ),
  };
}

function buildGoogleFlightsLink(
  origin: string,
  destination: string,
  date: string
): string {
  // Opens Google Flights with the route pre-populated.
  return `https://www.google.com/travel/flights?q=Flights%20from%20${origin}%20to%20${destination}%20on%20${date}`;
}
