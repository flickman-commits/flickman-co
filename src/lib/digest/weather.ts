/**
 * Today's forecast from the National Weather Service.
 *
 * NWS is free, needs no API key, and has no rate limit worth worrying about at
 * one call a day. It does require a User-Agent identifying the caller —
 * requests without one are rejected.
 *
 * The documented entry point is /points/{lat},{lon}, which returns the URL of
 * the gridpoint forecast. That mapping is stable for a fixed coordinate, so the
 * resolved URL is hardcoded here and the lookup call skipped. To move the
 * location, re-resolve it:
 *   curl -A "flickman-digest" https://api.weather.gov/points/<lat>,<lon>
 * and take `.properties.forecast`. (OKX/33,43 is the West Village.)
 */

const FORECAST_URL = "https://api.weather.gov/gridpoints/OKX/33,43/forecast";
const USER_AGENT = "flickman-digest/1.0 (matt@flickmanmedia.com)";

export interface Weather {
  /** Daytime high, °F. */
  high: number;
  /** Overnight low, °F. */
  low: number;
  /** e.g. "Chance Showers And Thunderstorms" */
  summary: string;
  /** Chance of precipitation, 0-100, or null when NWS omits it. */
  precipChance: number | null;
}

interface NwsPeriod {
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  probabilityOfPrecipitation?: { value: number | null } | null;
}

/**
 * Returns null on any failure. The digest is a newspaper, not a weather app —
 * a missing forecast should drop the panel, never block the send.
 */
export async function getWeather(): Promise<Weather | null> {
  try {
    const res = await fetch(FORECAST_URL, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/geo+json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`NWS ${res.status}`);

    const json = (await res.json()) as { properties?: { periods?: NwsPeriod[] } };
    const periods = json.properties?.periods ?? [];
    if (periods.length === 0) throw new Error("no forecast periods");

    // Running in the morning, periods[0] is the daytime block and [1] is the
    // night. Running after dark it's the reverse, so pick by flag rather than
    // by position and the panel stays correct either way.
    const day = periods.find((p) => p.isDaytime);
    const night = periods.find((p) => !p.isDaytime);
    const lead = day ?? periods[0];

    if (lead.temperatureUnit !== "F") {
      // The gridpoint is a US one, so this shouldn't happen; bail rather than
      // print a Celsius number under an F label.
      throw new Error(`unexpected unit ${lead.temperatureUnit}`);
    }

    return {
      high: (day ?? lead).temperature,
      low: (night ?? lead).temperature,
      summary: lead.shortForecast,
      precipChance: lead.probabilityOfPrecipitation?.value ?? null,
    };
  } catch (err) {
    console.error("[digest] weather fetch failed:", err);
    return null;
  }
}
