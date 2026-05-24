/**
 * Curated city list — single source of truth for the onboarding city
 * dropdown. Each entry maps a city to its IANA timezone and lat/lng coords.
 *
 * If a user's city isn't here, they pick the nearest. Add more entries as
 * needed — the list is intentionally not exhaustive.
 */

export type CityEntry = {
  id: string;
  city: string;
  region: string; // e.g. "NY, USA"
  tz: string;
  coords: [number, number]; // [lat, lng]
};

export const CITIES: CityEntry[] = [
  // North America
  { id: "us-nyc", city: "New York", region: "NY, USA", tz: "America/New_York", coords: [40.71, -74.01] },
  { id: "us-bos", city: "Boston", region: "MA, USA", tz: "America/New_York", coords: [42.36, -71.06] },
  { id: "us-dc", city: "Washington", region: "DC, USA", tz: "America/New_York", coords: [38.9, -77.04] },
  { id: "us-mia", city: "Miami", region: "FL, USA", tz: "America/New_York", coords: [25.76, -80.19] },
  { id: "us-atl", city: "Atlanta", region: "GA, USA", tz: "America/New_York", coords: [33.75, -84.39] },
  { id: "us-chi", city: "Chicago", region: "IL, USA", tz: "America/Chicago", coords: [41.88, -87.63] },
  { id: "us-aus", city: "Austin", region: "TX, USA", tz: "America/Chicago", coords: [30.27, -97.74] },
  { id: "us-dal", city: "Dallas", region: "TX, USA", tz: "America/Chicago", coords: [32.78, -96.8] },
  { id: "us-hou", city: "Houston", region: "TX, USA", tz: "America/Chicago", coords: [29.76, -95.37] },
  { id: "us-msp", city: "Minneapolis", region: "MN, USA", tz: "America/Chicago", coords: [44.98, -93.27] },
  { id: "us-den", city: "Denver", region: "CO, USA", tz: "America/Denver", coords: [39.74, -104.99] },
  { id: "us-phx", city: "Phoenix", region: "AZ, USA", tz: "America/Phoenix", coords: [33.45, -112.07] },
  { id: "us-slc", city: "Salt Lake City", region: "UT, USA", tz: "America/Denver", coords: [40.76, -111.89] },
  { id: "us-la", city: "Los Angeles", region: "CA, USA", tz: "America/Los_Angeles", coords: [34.05, -118.24] },
  { id: "us-sf", city: "San Francisco", region: "CA, USA", tz: "America/Los_Angeles", coords: [37.77, -122.42] },
  { id: "us-sd", city: "San Diego", region: "CA, USA", tz: "America/Los_Angeles", coords: [32.72, -117.16] },
  { id: "us-sea", city: "Seattle", region: "WA, USA", tz: "America/Los_Angeles", coords: [47.61, -122.33] },
  { id: "us-pdx", city: "Portland", region: "OR, USA", tz: "America/Los_Angeles", coords: [45.52, -122.68] },
  { id: "us-las", city: "Las Vegas", region: "NV, USA", tz: "America/Los_Angeles", coords: [36.17, -115.14] },
  { id: "us-anc", city: "Anchorage", region: "AK, USA", tz: "America/Anchorage", coords: [61.22, -149.9] },
  { id: "us-hnl", city: "Honolulu", region: "HI, USA", tz: "America/Honolulu", coords: [21.31, -157.86] },
  { id: "ca-tor", city: "Toronto", region: "ON, Canada", tz: "America/Toronto", coords: [43.65, -79.38] },
  { id: "ca-mtl", city: "Montréal", region: "QC, Canada", tz: "America/Toronto", coords: [45.5, -73.57] },
  { id: "ca-yvr", city: "Vancouver", region: "BC, Canada", tz: "America/Vancouver", coords: [49.28, -123.12] },
  { id: "mx-mex", city: "Mexico City", region: "Mexico", tz: "America/Mexico_City", coords: [19.43, -99.13] },

  // South America
  { id: "br-sao", city: "São Paulo", region: "Brazil", tz: "America/Sao_Paulo", coords: [-23.55, -46.63] },
  { id: "br-rio", city: "Rio de Janeiro", region: "Brazil", tz: "America/Sao_Paulo", coords: [-22.91, -43.17] },
  { id: "ar-bue", city: "Buenos Aires", region: "Argentina", tz: "America/Argentina/Buenos_Aires", coords: [-34.6, -58.38] },
  { id: "co-bog", city: "Bogotá", region: "Colombia", tz: "America/Bogota", coords: [4.71, -74.07] },
  { id: "pe-lim", city: "Lima", region: "Peru", tz: "America/Lima", coords: [-12.05, -77.04] },
  { id: "cl-scl", city: "Santiago", region: "Chile", tz: "America/Santiago", coords: [-33.45, -70.67] },

  // Europe
  { id: "uk-lon", city: "London", region: "UK", tz: "Europe/London", coords: [51.51, -0.13] },
  { id: "uk-edi", city: "Edinburgh", region: "UK", tz: "Europe/London", coords: [55.95, -3.19] },
  { id: "ie-dub", city: "Dublin", region: "Ireland", tz: "Europe/Dublin", coords: [53.35, -6.26] },
  { id: "fr-par", city: "Paris", region: "France", tz: "Europe/Paris", coords: [48.85, 2.35] },
  { id: "es-mad", city: "Madrid", region: "Spain", tz: "Europe/Madrid", coords: [40.42, -3.7] },
  { id: "es-bcn", city: "Barcelona", region: "Spain", tz: "Europe/Madrid", coords: [41.39, 2.17] },
  { id: "pt-lis", city: "Lisbon", region: "Portugal", tz: "Europe/Lisbon", coords: [38.72, -9.14] },
  { id: "nl-ams", city: "Amsterdam", region: "Netherlands", tz: "Europe/Amsterdam", coords: [52.37, 4.9] },
  { id: "de-ber", city: "Berlin", region: "Germany", tz: "Europe/Berlin", coords: [52.52, 13.41] },
  { id: "de-muc", city: "Munich", region: "Germany", tz: "Europe/Berlin", coords: [48.14, 11.58] },
  { id: "ch-zrh", city: "Zurich", region: "Switzerland", tz: "Europe/Zurich", coords: [47.38, 8.54] },
  { id: "it-rom", city: "Rome", region: "Italy", tz: "Europe/Rome", coords: [41.9, 12.5] },
  { id: "it-mil", city: "Milan", region: "Italy", tz: "Europe/Rome", coords: [45.46, 9.19] },
  { id: "se-sto", city: "Stockholm", region: "Sweden", tz: "Europe/Stockholm", coords: [59.33, 18.07] },
  { id: "no-osl", city: "Oslo", region: "Norway", tz: "Europe/Oslo", coords: [59.91, 10.75] },
  { id: "dk-cph", city: "Copenhagen", region: "Denmark", tz: "Europe/Copenhagen", coords: [55.68, 12.57] },
  { id: "fi-hel", city: "Helsinki", region: "Finland", tz: "Europe/Helsinki", coords: [60.17, 24.94] },
  { id: "at-vie", city: "Vienna", region: "Austria", tz: "Europe/Vienna", coords: [48.21, 16.37] },
  { id: "cz-prg", city: "Prague", region: "Czechia", tz: "Europe/Prague", coords: [50.08, 14.44] },
  { id: "pl-waw", city: "Warsaw", region: "Poland", tz: "Europe/Warsaw", coords: [52.23, 21.01] },
  { id: "gr-ath", city: "Athens", region: "Greece", tz: "Europe/Athens", coords: [37.98, 23.73] },
  { id: "tr-ist", city: "Istanbul", region: "Türkiye", tz: "Europe/Istanbul", coords: [41.01, 28.98] },
  { id: "ru-mow", city: "Moscow", region: "Russia", tz: "Europe/Moscow", coords: [55.75, 37.62] },

  // Africa
  { id: "eg-cai", city: "Cairo", region: "Egypt", tz: "Africa/Cairo", coords: [30.04, 31.24] },
  { id: "ng-lag", city: "Lagos", region: "Nigeria", tz: "Africa/Lagos", coords: [6.45, 3.4] },
  { id: "za-jnb", city: "Johannesburg", region: "South Africa", tz: "Africa/Johannesburg", coords: [-26.2, 28.05] },
  { id: "za-cpt", city: "Cape Town", region: "South Africa", tz: "Africa/Johannesburg", coords: [-33.92, 18.42] },
  { id: "ke-nbo", city: "Nairobi", region: "Kenya", tz: "Africa/Nairobi", coords: [-1.29, 36.82] },

  // Middle East
  { id: "ae-dxb", city: "Dubai", region: "UAE", tz: "Asia/Dubai", coords: [25.2, 55.27] },
  { id: "il-tlv", city: "Tel Aviv", region: "Israel", tz: "Asia/Jerusalem", coords: [32.08, 34.78] },
  { id: "sa-ruh", city: "Riyadh", region: "Saudi Arabia", tz: "Asia/Riyadh", coords: [24.71, 46.68] },

  // Asia
  { id: "in-mum", city: "Mumbai", region: "India", tz: "Asia/Kolkata", coords: [19.08, 72.88] },
  { id: "in-del", city: "Delhi", region: "India", tz: "Asia/Kolkata", coords: [28.61, 77.21] },
  { id: "in-blr", city: "Bangalore", region: "India", tz: "Asia/Kolkata", coords: [12.97, 77.59] },
  { id: "pk-khi", city: "Karachi", region: "Pakistan", tz: "Asia/Karachi", coords: [24.86, 67.01] },
  { id: "th-bkk", city: "Bangkok", region: "Thailand", tz: "Asia/Bangkok", coords: [13.76, 100.5] },
  { id: "vn-sgn", city: "Ho Chi Minh City", region: "Vietnam", tz: "Asia/Ho_Chi_Minh", coords: [10.82, 106.63] },
  { id: "sg-sin", city: "Singapore", region: "Singapore", tz: "Asia/Singapore", coords: [1.35, 103.82] },
  { id: "id-jkt", city: "Jakarta", region: "Indonesia", tz: "Asia/Jakarta", coords: [-6.21, 106.85] },
  { id: "ph-mnl", city: "Manila", region: "Philippines", tz: "Asia/Manila", coords: [14.6, 120.98] },
  { id: "hk-hkg", city: "Hong Kong", region: "Hong Kong", tz: "Asia/Hong_Kong", coords: [22.32, 114.17] },
  { id: "tw-tpe", city: "Taipei", region: "Taiwan", tz: "Asia/Taipei", coords: [25.04, 121.56] },
  { id: "cn-sha", city: "Shanghai", region: "China", tz: "Asia/Shanghai", coords: [31.23, 121.47] },
  { id: "cn-bej", city: "Beijing", region: "China", tz: "Asia/Shanghai", coords: [39.9, 116.41] },
  { id: "kr-sel", city: "Seoul", region: "South Korea", tz: "Asia/Seoul", coords: [37.57, 126.98] },
  { id: "jp-tyo", city: "Tokyo", region: "Japan", tz: "Asia/Tokyo", coords: [35.68, 139.65] },
  { id: "jp-osa", city: "Osaka", region: "Japan", tz: "Asia/Tokyo", coords: [34.69, 135.5] },

  // Oceania
  { id: "au-syd", city: "Sydney", region: "Australia", tz: "Australia/Sydney", coords: [-33.87, 151.21] },
  { id: "au-mel", city: "Melbourne", region: "Australia", tz: "Australia/Melbourne", coords: [-37.81, 144.96] },
  { id: "au-bne", city: "Brisbane", region: "Australia", tz: "Australia/Brisbane", coords: [-27.47, 153.03] },
  { id: "au-per", city: "Perth", region: "Australia", tz: "Australia/Perth", coords: [-31.95, 115.86] },
  { id: "nz-akl", city: "Auckland", region: "New Zealand", tz: "Pacific/Auckland", coords: [-36.85, 174.76] },
];

/** Sort cities alphabetically by display name. */
export const CITIES_SORTED = [...CITIES].sort((a, b) => a.city.localeCompare(b.city));

const CITY_BY_ID = new Map(CITIES.map((c) => [c.id, c]));

export function resolveCity(id: string | undefined): CityEntry {
  if (id) {
    const hit = CITY_BY_ID.get(id);
    if (hit) return hit;
  }
  return CITIES.find((c) => c.id === "us-nyc") ?? CITIES[0];
}

/** Try to map a legacy IANA timezone string to a city id (for migration). */
export function findCityIdByTimezone(tz: string | undefined): string {
  if (!tz) return "us-nyc";
  const hit = CITIES.find((c) => c.tz === tz);
  return hit?.id ?? "us-nyc";
}
