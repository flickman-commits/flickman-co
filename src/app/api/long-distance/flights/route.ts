import { NextResponse, type NextRequest } from "next/server";
import {
  searchGoogleFlightsOnDate,
  SerpApiNotConfigured,
  type FlightOfferSummary,
} from "../../../../app/long-distance/lib/serpapi";

/**
 * GET /api/long-distance/flights?origin=JFK&destination=RNO
 *
 * Returns the cheapest available flight on each of the next four Friday
 * departures from origin → destination, sourced from SerpAPI's Google
 * Flights wrapper.
 *
 * Responds with `{ configured: false }` (200) when SERPAPI_KEY isn't set,
 * so the UI can fall back to placeholder data.
 */
export const dynamic = "force-dynamic";

function nextFridays(count: number): string[] {
  const out: string[] = [];
  const d = new Date();
  const today = d.getDay();
  const daysUntilFriday = ((5 - today + 7) % 7) || 7;
  d.setDate(d.getDate() + daysUntilFriday);
  for (let i = 0; i < count; i++) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 7);
  }
  return out;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const origin = (searchParams.get("origin") ?? "").toUpperCase();
  const destination = (searchParams.get("destination") ?? "").toUpperCase();

  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) {
    return NextResponse.json(
      { error: "origin and destination must be 3-letter IATA codes" },
      { status: 400 }
    );
  }
  if (origin === destination) {
    return NextResponse.json(
      { error: "origin and destination must differ" },
      { status: 400 }
    );
  }

  const dates = nextFridays(4);

  try {
    const offers = await Promise.all(
      dates.map((date) =>
        searchGoogleFlightsOnDate({ origin, destination, date }).catch(
          (err) => {
            // One date failing shouldn't kill the whole response.
            console.error(`[flights] ${origin}→${destination} ${date}:`, err);
            return null;
          }
        )
      )
    );

    const flights: FlightOfferSummary[] = offers.filter(
      (o): o is FlightOfferSummary => o !== null
    );

    return NextResponse.json({
      configured: true,
      origin,
      destination,
      flights,
    });
  } catch (err) {
    if (err instanceof SerpApiNotConfigured) {
      return NextResponse.json({ configured: false, flights: [] });
    }
    console.error("[flights] route failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Unknown error fetching flights",
      },
      { status: 500 }
    );
  }
}
