/**
 * Browser-side geocoding using public, key-less APIs.
 *
 *   • Nominatim (OpenStreetMap)  — search a place string → list of candidates
 *     with display name + lat/lng. Usage policy:
 *       https://operations.osmfoundation.org/policies/nominatim/
 *     Effectively: provide a useful Referer/UA (browser does this), keep it
 *     to ~1 req/sec (we debounce), and display attribution (we do, in the
 *     dropdown footer).
 *
 *   • geotimezone.com — given lat/lng, returns the IANA timezone. Free, no key.
 *     We use this only on selection (one call per city pick).
 *
 * If either request fails we degrade gracefully — caller falls back to the
 * closest curated city's timezone.
 */

export type Place = {
  /** Display label, e.g. "South Lake Tahoe, California, United States". */
  label: string;
  /** Short label for compact rendering, e.g. "South Lake Tahoe". */
  short: string;
  lat: number;
  lng: number;
};

type NominatimItem = {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  type?: string;
  address?: Record<string, string | undefined>;
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function searchPlaces(
  query: string,
  signal?: AbortSignal
): Promise<Place[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    q: trimmed,
    format: "json",
    limit: "6",
    addressdetails: "1",
    "accept-language": "en",
  });

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);

  const items = (await res.json()) as NominatimItem[];

  return items
    .map<Place | null>((it) => {
      const lat = parseFloat(it.lat);
      const lng = parseFloat(it.lon);
      if (!isFinite(lat) || !isFinite(lng)) return null;
      const a = it.address ?? {};
      // Prefer the place's own name (so "Lake Tahoe" stays "Lake Tahoe" instead
      // of getting flattened to its county). Fall back to admin hierarchy.
      const placeName =
        it.name ||
        a.city ||
        a.town ||
        a.village ||
        a.hamlet ||
        a.suburb ||
        a.neighbourhood ||
        a.county ||
        a.state_district ||
        it.display_name.split(",")[0] ||
        "";
      const region = a.state || a.region || "";
      const country = a.country ?? "";
      const parts = [placeName, region, country].filter(
        (p, i, arr) => !!p && arr.indexOf(p) === i
      );
      const label = parts.length > 0 ? parts.join(", ") : it.display_name;
      return { label, short: placeName || label, lat, lng };
    })
    .filter((p): p is Place => p !== null);
}

/**
 * Resolve an IANA timezone for a lat/lng. Returns null on failure.
 * Caller should fall back to a curated city tz in that case.
 */
export async function lookupTimezone(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.geotimezone.com/public/timezone?latitude=${lat}&longitude=${lng}`,
      { signal }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { iana_timezone?: string };
    return json.iana_timezone ?? null;
  } catch {
    return null;
  }
}
