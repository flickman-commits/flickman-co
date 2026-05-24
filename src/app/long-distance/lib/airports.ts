/**
 * Curated airport list for the home-airport selectors.
 *
 * ~130 of the busiest passenger airports worldwide. If a user's airport
 * isn't here, they can pick the nearest. Add entries as needed.
 */

export type Airport = {
  iata: string;   // 3-letter IATA code
  name: string;   // short common name
  city: string;
  country: string;
};

export const AIRPORTS: Airport[] = [
  /* ── North America ── */
  // US East
  { iata: "JFK", name: "John F. Kennedy Intl",       city: "New York",      country: "USA" },
  { iata: "LGA", name: "LaGuardia",                  city: "New York",      country: "USA" },
  { iata: "EWR", name: "Newark Liberty Intl",        city: "Newark",        country: "USA" },
  { iata: "BOS", name: "Logan Intl",                 city: "Boston",        country: "USA" },
  { iata: "PHL", name: "Philadelphia Intl",          city: "Philadelphia",  country: "USA" },
  { iata: "DCA", name: "Reagan National",            city: "Washington",    country: "USA" },
  { iata: "IAD", name: "Dulles Intl",                city: "Washington",    country: "USA" },
  { iata: "BWI", name: "BWI Marshall",               city: "Baltimore",     country: "USA" },
  { iata: "PIT", name: "Pittsburgh Intl",            city: "Pittsburgh",    country: "USA" },
  { iata: "CLT", name: "Charlotte Douglas Intl",     city: "Charlotte",     country: "USA" },
  { iata: "RDU", name: "Raleigh-Durham Intl",        city: "Raleigh",       country: "USA" },
  { iata: "ATL", name: "Hartsfield-Jackson Intl",    city: "Atlanta",       country: "USA" },
  { iata: "MIA", name: "Miami Intl",                 city: "Miami",         country: "USA" },
  { iata: "FLL", name: "Fort Lauderdale-Hollywood",  city: "Fort Lauderdale", country: "USA" },
  { iata: "MCO", name: "Orlando Intl",               city: "Orlando",       country: "USA" },
  { iata: "TPA", name: "Tampa Intl",                 city: "Tampa",         country: "USA" },
  { iata: "BNA", name: "Nashville Intl",             city: "Nashville",     country: "USA" },
  { iata: "DTW", name: "Detroit Metro",              city: "Detroit",       country: "USA" },
  { iata: "CLE", name: "Cleveland Hopkins",          city: "Cleveland",     country: "USA" },
  { iata: "CMH", name: "John Glenn Columbus",        city: "Columbus",      country: "USA" },

  // US Central
  { iata: "ORD", name: "O'Hare Intl",                city: "Chicago",       country: "USA" },
  { iata: "MDW", name: "Midway Intl",                city: "Chicago",       country: "USA" },
  { iata: "MSP", name: "Minneapolis-St. Paul Intl",  city: "Minneapolis",   country: "USA" },
  { iata: "MKE", name: "Milwaukee Mitchell Intl",    city: "Milwaukee",     country: "USA" },
  { iata: "STL", name: "St. Louis Lambert Intl",     city: "St. Louis",     country: "USA" },
  { iata: "MCI", name: "Kansas City Intl",           city: "Kansas City",   country: "USA" },
  { iata: "DFW", name: "Dallas/Fort Worth Intl",     city: "Dallas",        country: "USA" },
  { iata: "DAL", name: "Dallas Love Field",          city: "Dallas",        country: "USA" },
  { iata: "IAH", name: "George Bush Intercontinental", city: "Houston",     country: "USA" },
  { iata: "HOU", name: "Houston Hobby",              city: "Houston",       country: "USA" },
  { iata: "AUS", name: "Austin-Bergstrom Intl",      city: "Austin",        country: "USA" },
  { iata: "SAT", name: "San Antonio Intl",           city: "San Antonio",   country: "USA" },
  { iata: "MSY", name: "Louis Armstrong Intl",       city: "New Orleans",   country: "USA" },
  { iata: "MEM", name: "Memphis Intl",               city: "Memphis",       country: "USA" },

  // US Mountain
  { iata: "DEN", name: "Denver Intl",                city: "Denver",        country: "USA" },
  { iata: "SLC", name: "Salt Lake City Intl",        city: "Salt Lake City", country: "USA" },
  { iata: "PHX", name: "Phoenix Sky Harbor",         city: "Phoenix",       country: "USA" },
  { iata: "TUS", name: "Tucson Intl",                city: "Tucson",        country: "USA" },
  { iata: "ABQ", name: "Albuquerque Intl Sunport",   city: "Albuquerque",   country: "USA" },
  { iata: "LAS", name: "Harry Reid Intl",            city: "Las Vegas",     country: "USA" },
  { iata: "RNO", name: "Reno-Tahoe Intl",            city: "Reno",          country: "USA" },

  // US West
  { iata: "LAX", name: "Los Angeles Intl",           city: "Los Angeles",   country: "USA" },
  { iata: "BUR", name: "Hollywood Burbank",          city: "Burbank",       country: "USA" },
  { iata: "ONT", name: "Ontario Intl",               city: "Ontario",       country: "USA" },
  { iata: "SAN", name: "San Diego Intl",             city: "San Diego",     country: "USA" },
  { iata: "SFO", name: "San Francisco Intl",         city: "San Francisco", country: "USA" },
  { iata: "OAK", name: "Oakland Intl",               city: "Oakland",       country: "USA" },
  { iata: "SJC", name: "Norman Y. Mineta San José",  city: "San Jose",      country: "USA" },
  { iata: "SMF", name: "Sacramento Intl",            city: "Sacramento",    country: "USA" },
  { iata: "SEA", name: "Seattle-Tacoma Intl",        city: "Seattle",       country: "USA" },
  { iata: "PDX", name: "Portland Intl",              city: "Portland",      country: "USA" },
  { iata: "ANC", name: "Ted Stevens Anchorage Intl", city: "Anchorage",     country: "USA" },
  { iata: "HNL", name: "Daniel K. Inouye Intl",      city: "Honolulu",      country: "USA" },
  { iata: "OGG", name: "Kahului",                    city: "Maui",          country: "USA" },

  // Canada
  { iata: "YYZ", name: "Toronto Pearson Intl",       city: "Toronto",       country: "Canada" },
  { iata: "YUL", name: "Montréal-Trudeau Intl",      city: "Montréal",      country: "Canada" },
  { iata: "YVR", name: "Vancouver Intl",             city: "Vancouver",     country: "Canada" },
  { iata: "YYC", name: "Calgary Intl",               city: "Calgary",       country: "Canada" },
  { iata: "YEG", name: "Edmonton Intl",              city: "Edmonton",      country: "Canada" },
  { iata: "YOW", name: "Ottawa Macdonald-Cartier",   city: "Ottawa",        country: "Canada" },

  // Mexico
  { iata: "MEX", name: "Mexico City Intl",           city: "Mexico City",   country: "Mexico" },
  { iata: "CUN", name: "Cancún Intl",                city: "Cancún",        country: "Mexico" },
  { iata: "GDL", name: "Guadalajara Intl",           city: "Guadalajara",   country: "Mexico" },

  /* ── South America ── */
  { iata: "GRU", name: "Guarulhos Intl",             city: "São Paulo",     country: "Brazil" },
  { iata: "GIG", name: "Galeão Intl",                city: "Rio de Janeiro", country: "Brazil" },
  { iata: "EZE", name: "Ministro Pistarini Intl",    city: "Buenos Aires",  country: "Argentina" },
  { iata: "SCL", name: "Arturo Merino Benítez Intl", city: "Santiago",      country: "Chile" },
  { iata: "LIM", name: "Jorge Chávez Intl",          city: "Lima",          country: "Peru" },
  { iata: "BOG", name: "El Dorado Intl",             city: "Bogotá",        country: "Colombia" },
  { iata: "UIO", name: "Mariscal Sucre Intl",        city: "Quito",         country: "Ecuador" },

  /* ── Europe ── */
  // UK / Ireland
  { iata: "LHR", name: "Heathrow",                   city: "London",        country: "UK" },
  { iata: "LGW", name: "Gatwick",                    city: "London",        country: "UK" },
  { iata: "STN", name: "Stansted",                   city: "London",        country: "UK" },
  { iata: "LCY", name: "London City",                city: "London",        country: "UK" },
  { iata: "LTN", name: "Luton",                      city: "London",        country: "UK" },
  { iata: "MAN", name: "Manchester",                 city: "Manchester",    country: "UK" },
  { iata: "EDI", name: "Edinburgh",                  city: "Edinburgh",     country: "UK" },
  { iata: "DUB", name: "Dublin",                     city: "Dublin",        country: "Ireland" },

  // France / Benelux
  { iata: "CDG", name: "Charles de Gaulle",          city: "Paris",         country: "France" },
  { iata: "ORY", name: "Orly",                       city: "Paris",         country: "France" },
  { iata: "NCE", name: "Côte d'Azur",                city: "Nice",          country: "France" },
  { iata: "AMS", name: "Schiphol",                   city: "Amsterdam",     country: "Netherlands" },
  { iata: "BRU", name: "Brussels",                   city: "Brussels",      country: "Belgium" },

  // Germany / Austria / Switzerland
  { iata: "FRA", name: "Frankfurt",                  city: "Frankfurt",     country: "Germany" },
  { iata: "MUC", name: "Munich",                     city: "Munich",        country: "Germany" },
  { iata: "BER", name: "Berlin Brandenburg",         city: "Berlin",        country: "Germany" },
  { iata: "DUS", name: "Düsseldorf",                 city: "Düsseldorf",    country: "Germany" },
  { iata: "HAM", name: "Hamburg",                    city: "Hamburg",       country: "Germany" },
  { iata: "VIE", name: "Vienna Intl",                city: "Vienna",        country: "Austria" },
  { iata: "ZRH", name: "Zürich",                     city: "Zürich",        country: "Switzerland" },
  { iata: "GVA", name: "Geneva",                     city: "Geneva",        country: "Switzerland" },

  // Iberia / Italy / Greece
  { iata: "MAD", name: "Adolfo Suárez Madrid-Barajas", city: "Madrid",      country: "Spain" },
  { iata: "BCN", name: "Josep Tarradellas Barcelona-El Prat", city: "Barcelona", country: "Spain" },
  { iata: "LIS", name: "Lisbon Humberto Delgado",    city: "Lisbon",        country: "Portugal" },
  { iata: "FCO", name: "Fiumicino",                  city: "Rome",          country: "Italy" },
  { iata: "MXP", name: "Malpensa",                   city: "Milan",         country: "Italy" },
  { iata: "VCE", name: "Venice Marco Polo",          city: "Venice",        country: "Italy" },
  { iata: "ATH", name: "Athens Eleftherios Venizelos", city: "Athens",      country: "Greece" },

  // Nordics
  { iata: "ARN", name: "Stockholm Arlanda",          city: "Stockholm",     country: "Sweden" },
  { iata: "CPH", name: "Copenhagen Kastrup",         city: "Copenhagen",    country: "Denmark" },
  { iata: "OSL", name: "Oslo Gardermoen",            city: "Oslo",          country: "Norway" },
  { iata: "HEL", name: "Helsinki Vantaa",            city: "Helsinki",      country: "Finland" },
  { iata: "KEF", name: "Keflavík Intl",              city: "Reykjavík",     country: "Iceland" },

  // Central / Eastern Europe
  { iata: "PRG", name: "Václav Havel Prague",        city: "Prague",        country: "Czechia" },
  { iata: "WAW", name: "Warsaw Chopin",              city: "Warsaw",        country: "Poland" },
  { iata: "BUD", name: "Budapest Ferenc Liszt",      city: "Budapest",      country: "Hungary" },
  { iata: "IST", name: "Istanbul",                   city: "Istanbul",      country: "Türkiye" },
  { iata: "SVO", name: "Sheremetyevo",               city: "Moscow",        country: "Russia" },

  /* ── Middle East ── */
  { iata: "DXB", name: "Dubai Intl",                 city: "Dubai",         country: "UAE" },
  { iata: "AUH", name: "Abu Dhabi Intl",             city: "Abu Dhabi",     country: "UAE" },
  { iata: "DOH", name: "Hamad Intl",                 city: "Doha",          country: "Qatar" },
  { iata: "TLV", name: "Ben Gurion",                 city: "Tel Aviv",      country: "Israel" },
  { iata: "RUH", name: "King Khalid Intl",           city: "Riyadh",        country: "Saudi Arabia" },
  { iata: "JED", name: "King Abdulaziz Intl",        city: "Jeddah",        country: "Saudi Arabia" },

  /* ── Africa ── */
  { iata: "CAI", name: "Cairo Intl",                 city: "Cairo",         country: "Egypt" },
  { iata: "JNB", name: "OR Tambo Intl",              city: "Johannesburg",  country: "South Africa" },
  { iata: "CPT", name: "Cape Town Intl",             city: "Cape Town",     country: "South Africa" },
  { iata: "NBO", name: "Jomo Kenyatta Intl",         city: "Nairobi",       country: "Kenya" },
  { iata: "LOS", name: "Murtala Muhammed Intl",      city: "Lagos",         country: "Nigeria" },
  { iata: "ADD", name: "Addis Ababa Bole Intl",      city: "Addis Ababa",   country: "Ethiopia" },
  { iata: "CMN", name: "Mohammed V Intl",            city: "Casablanca",    country: "Morocco" },

  /* ── Asia ── */
  // South / SE Asia
  { iata: "DEL", name: "Indira Gandhi Intl",         city: "Delhi",         country: "India" },
  { iata: "BOM", name: "Chhatrapati Shivaji Maharaj Intl", city: "Mumbai",  country: "India" },
  { iata: "BLR", name: "Kempegowda Intl",            city: "Bangalore",     country: "India" },
  { iata: "MAA", name: "Chennai Intl",               city: "Chennai",       country: "India" },
  { iata: "HYD", name: "Rajiv Gandhi Intl",          city: "Hyderabad",     country: "India" },
  { iata: "BKK", name: "Suvarnabhumi",               city: "Bangkok",       country: "Thailand" },
  { iata: "SIN", name: "Singapore Changi",           city: "Singapore",     country: "Singapore" },
  { iata: "KUL", name: "Kuala Lumpur Intl",          city: "Kuala Lumpur",  country: "Malaysia" },
  { iata: "CGK", name: "Soekarno-Hatta Intl",        city: "Jakarta",       country: "Indonesia" },
  { iata: "MNL", name: "Ninoy Aquino Intl",          city: "Manila",        country: "Philippines" },
  { iata: "SGN", name: "Tan Son Nhat Intl",          city: "Ho Chi Minh City", country: "Vietnam" },
  { iata: "HAN", name: "Noi Bai Intl",               city: "Hanoi",         country: "Vietnam" },

  // East Asia
  { iata: "HKG", name: "Hong Kong Intl",             city: "Hong Kong",     country: "Hong Kong" },
  { iata: "TPE", name: "Taoyuan Intl",               city: "Taipei",        country: "Taiwan" },
  { iata: "PVG", name: "Pudong Intl",                city: "Shanghai",      country: "China" },
  { iata: "PEK", name: "Beijing Capital Intl",       city: "Beijing",       country: "China" },
  { iata: "PKX", name: "Beijing Daxing Intl",        city: "Beijing",       country: "China" },
  { iata: "CAN", name: "Baiyun Intl",                city: "Guangzhou",     country: "China" },
  { iata: "SZX", name: "Shenzhen Bao'an Intl",       city: "Shenzhen",      country: "China" },
  { iata: "HND", name: "Haneda",                     city: "Tokyo",         country: "Japan" },
  { iata: "NRT", name: "Narita Intl",                city: "Tokyo",         country: "Japan" },
  { iata: "KIX", name: "Kansai Intl",                city: "Osaka",         country: "Japan" },
  { iata: "ICN", name: "Incheon Intl",               city: "Seoul",         country: "South Korea" },
  { iata: "GMP", name: "Gimpo Intl",                 city: "Seoul",         country: "South Korea" },

  /* ── Oceania ── */
  { iata: "SYD", name: "Kingsford Smith",            city: "Sydney",        country: "Australia" },
  { iata: "MEL", name: "Tullamarine",                city: "Melbourne",     country: "Australia" },
  { iata: "BNE", name: "Brisbane",                   city: "Brisbane",      country: "Australia" },
  { iata: "PER", name: "Perth",                      city: "Perth",         country: "Australia" },
  { iata: "AKL", name: "Auckland",                   city: "Auckland",      country: "New Zealand" },
  { iata: "CHC", name: "Christchurch Intl",          city: "Christchurch",  country: "New Zealand" },
];

const BY_IATA = new Map(AIRPORTS.map((a) => [a.iata, a]));

export function resolveAirport(iata: string | undefined | null): Airport | null {
  if (!iata) return null;
  return BY_IATA.get(iata.toUpperCase()) ?? null;
}

/** Filter airports against a search query — matches IATA, city, name, country. */
export function searchAirports(query: string, limit = 8): Airport[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return AIRPORTS.slice(0, limit);

  // Score: exact IATA = 100, IATA prefix = 80, city prefix = 60, city includes = 40,
  // name includes = 20, country includes = 10.
  type Scored = { a: Airport; score: number };
  const scored: Scored[] = [];
  for (const a of AIRPORTS) {
    const iata = a.iata.toLowerCase();
    const city = a.city.toLowerCase();
    const name = a.name.toLowerCase();
    const country = a.country.toLowerCase();
    let score = 0;
    if (iata === q) score = 100;
    else if (iata.startsWith(q)) score = 80;
    else if (city === q) score = 65;
    else if (city.startsWith(q)) score = 60;
    else if (city.includes(q)) score = 40;
    else if (name.includes(q)) score = 20;
    else if (country.includes(q)) score = 10;
    if (score > 0) scored.push({ a, score });
  }
  scored.sort((x, y) => y.score - x.score || x.a.city.localeCompare(y.a.city));
  return scored.slice(0, limit).map((s) => s.a);
}
