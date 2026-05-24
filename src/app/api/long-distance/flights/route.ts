import { NextResponse, type NextRequest } from "next/server";
import {
  cheapestOfferForDate,
  AmadeusNotConfigured,
  type FlightOfferSummary,
} from "../../../../app/long-distance/lib/amadeus";

/**
 * GET /api/long-distance/flights?origin=JFK&destination=RNO
 *
 * Returns the cheapest available flight on each of the next four Friday
 * departures from origin → destination, sourced from Amadeus.
 *
 * If Amadeus isn't configured we respond 200 with `{ configured: false }`
 * so the UI can fall back to placeholder data without flagging an error.
 */
export const dynamic = "force-dynamic";

function nextFridays(count: number): string[] {
  const out: string[] = [];
  const d = new Date();
  // Days until Friday (5). If today is Friday, jump to next Friday.
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
        cheapestOfferForDate({ origin, destination, date }).catch((err) => {
          // Let an individual date fail without taking the whole request down.
          console.error(`[flights] ${origin}→${destination} ${date}:`, err);
          return null;
        })
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
    if (err instanceof AmadeusNotConfigured) {
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
