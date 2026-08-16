import type { Place } from "./location";

/**
 * Today's forecast for wherever you are.
 *
 * Open-Meteo rather than the National Weather Service: NWS is US-only, and the
 * whole point of the location layer is that you might be somewhere else. This
 * is free, needs no API key, and covers everywhere. It also means one provider
 * for both travel and home instead of branching on country.
 */

export interface Weather {
  /** Daytime high, °F. */
  high: number;
  /** Overnight low, °F. */
  low: number;
  summary: string;
  /** Chance of precipitation, 0-100, or null when unavailable. */
  precipChance: number | null;
  /** Where this forecast is for, e.g. "Austin". */
  place: string;
  /** True when the location came from your calendar rather than home. */
  travelling: boolean;
}

/** WMO weather interpretation codes, condensed to what a forecast line needs. */
const WMO: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Freezing fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy rain showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorms",
  96: "Thunderstorms with hail",
  99: "Thunderstorms with hail",
};

/**
 * Returns null on any failure — the digest is a newspaper, not a weather app,
 * so a missing forecast drops the strip rather than blocking the send.
 */
export async function getWeather(place: Place): Promise<Weather | null> {
  try {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      `?latitude=${place.lat}&longitude=${place.lon}` +
      "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code" +
      "&temperature_unit=fahrenheit&timezone=auto&forecast_days=1";

    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);

    const json = (await res.json()) as {
      daily?: {
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
        precipitation_probability_max?: (number | null)[];
        weather_code?: number[];
      };
    };
    const d = json.daily;
    const high = d?.temperature_2m_max?.[0];
    const low = d?.temperature_2m_min?.[0];
    if (high == null || low == null) throw new Error("no daily temperatures");

    const code = d?.weather_code?.[0];
    return {
      high: Math.round(high),
      low: Math.round(low),
      summary: (code != null && WMO[code]) || "—",
      precipChance: d?.precipitation_probability_max?.[0] ?? null,
      place: place.label,
      travelling: place.travelling,
    };
  } catch (err) {
    console.error("[digest] weather fetch failed:", err);
    return null;
  }
}
