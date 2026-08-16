/**
 * Feed sources for the daily digest.
 *
 * Every feed here was checked for a live, parseable RSS response. If one starts
 * 404ing the fetcher just skips it — a dead feed never breaks the digest — so
 * it's worth re-checking the list occasionally rather than trusting silence.
 *
 * These are the *resolved* URLs, after redirects. Eight of them used to point
 * at a 301: Village Preservation intermittently failed to parse through it, and
 * every redirect is an extra round trip inside the fetch timeout. Two feeds have
 * genuinely moved home — Footwear News is served from wwd.com now, and The City
 * from thecityreporter.nyc — and the two Blogspot feeds started returning 403
 * to direct requests, so they go via FeedBurner. When adding a feed, follow it
 * to its final URL first (`curl -sSLo /dev/null -w '%{url_effective}' <url>`).
 *
 * Two kinds of feed:
 *   - Dedicated: everything it publishes belongs in its section (LetsRun,
 *     Gothamist, West Village Patch).
 *   - Broad: publishes far more than we care about, so `require` narrows it to
 *     items whose title/summary mention at least one keyword (Footwear News is
 *     mostly fashion; we only want the running-shoe stories).
 */

export type SectionId = "running" | "gear" | "nyc" | "westvillage";

export interface Section {
  id: SectionId;
  title: string;
  blurb: string;
  /** Section accent, used for the label and each story's source dot. */
  accent: string;
  /** Text color that stays readable on `accent`. */
  accentInk: string;
}

export const SECTIONS: Section[] = [
  {
    id: "running",
    title: "Running & Racing",
    blurb: "Marathons, road racing, and the business of the running industry",
    accent: "#16A34A", // green
    accentInk: "#FFFFFF",
  },
  {
    id: "gear",
    title: "Shoes & Companies",
    blurb: "Brands, product launches, reviews, and industry moves",
    accent: "#D97706", // amber
    accentInk: "#2C2C2C",
  },
  {
    id: "nyc",
    title: "New York City",
    blurb: "What's actually happening in the city",
    accent: "#2563EB", // blue
    accentInk: "#2C2C2C",
  },
  {
    id: "westvillage",
    title: "West Village",
    blurb: "Your block, more or less",
    accent: "#7C3AED", // violet
    accentInk: "#FFFFFF",
  },
];

export interface Feed {
  /** Publication name, shown as the source line under each story. */
  name: string;
  url: string;
  section: SectionId;
  /**
   * If set, an item is kept only when it matches one of these (case-insensitive
   * substring). Matched against title, summary, AND the item's own <category>
   * tags — the tags are often the only precise signal, since several feeds ship
   * empty descriptions. Used to carve a narrow slice out of a broad feed.
   */
  require?: string[];
  /** Matched the same way; any hit drops the item even if `require` matched. */
  exclude?: string[];
}

/*
 * Matching a bare brand name does not mean a story is about running. Footwear
 * News is a footwear trade publication, so "nike" alone let through Air Force 1
 * college releases and a LeBron basketball shoe, and "sneaker" let through
 * cow-print New Balance 327s. Those then reach the curator looking like
 * legitimate brand news.
 *
 * So: require a term that establishes running specifically, and check it
 * against the item's own <category> tags as well as its text. WWD tags stories
 * precisely — "On vs. Nike: The New Race at Retail" carries no running word in
 * its title and an empty description, but is tagged `Nike Running / On Running
 * / Running`, while a StockX resale roundup is tagged `Air Jordan / Vans`.
 */
const RUNNING_TERMS = [
  "running",
  "runner",
  "marathon",
  "5k",
  "10k",
  "trail run",
  "ultramarathon",
  "ultrarunning",
  "track and field",
  "road race",
  "racing shoe",
  "race day",
  "vaporfly",
  "alphafly",
  "supershoe",
  "super shoe",
  "run club",
  "footrace",
  // Brands whose coverage is running essentially by definition. Deliberately
  // omits Nike/adidas/New Balance/Puma/Under Armour, whose footwear coverage is
  // mostly basketball and lifestyle — those need a running term alongside.
  "hoka",
  "asics",
  "saucony",
  "altra",
  "on holding",
  "tracksmith",
  "topo athletic",
  "norda",
];

/** Kills a story even when a running term matched — resale roundups tagged with
 *  a running brand are the common case. */
const NON_RUNNING_FOOTWEAR = [
  "air force 1",
  "air jordan",
  "lebron",
  "basketball",
  "nba",
  "wnba",
  "dunk",
  "air max",
  "slipper",
  "sandal",
  "loafer",
  "high heel",
  "cow print",
  "football",
  "soccer",
  "cleat",
  "skate",
  "clog",
];

export const FEEDS: Feed[] = [
  // ── Running & racing ────────────────────────────────────────────────────
  { name: "Running USA", url: "https://www.runningusa.org/feed/", section: "running" },
  { name: "LetsRun", url: "https://www.letsrun.com/feed/", section: "running" },
  { name: "World Athletics", url: "https://worldathletics.org/news/rss", section: "running" },
  { name: "Runner's World", url: "https://www.runnersworld.com/rss/all.xml/", section: "running" },
  { name: "Canadian Running", url: "https://runningmagazine.ca/feed/", section: "running" },
  { name: "Athletics Weekly", url: "https://athleticsweekly.com/feed/", section: "running" },
  { name: "Competitor", url: "https://competitor.com/feed/", section: "running" },

  // ── Shoes & the companies behind them ───────────────────────────────────
  { name: "Believe in the Run", url: "https://believeintherun.com/feed/", section: "gear" },
  {
    name: "Road Trail Run",
    url: "https://feeds.feedburner.com/RoadTrailRun",
    section: "gear",
  },
  {
    name: "Footwear News",
    url: "https://wwd.com/footwear-news/feed/",
    section: "gear",
    require: RUNNING_TERMS,
    exclude: NON_RUNNING_FOOTWEAR,
  },
  {
    name: "Sportico",
    url: "https://www.sportico.com/feed/",
    section: "gear",
    require: RUNNING_TERMS,
    exclude: NON_RUNNING_FOOTWEAR,
  },

  // ── New York City ───────────────────────────────────────────────────────
  { name: "Gothamist", url: "https://gothamist.com/feed", section: "nyc" },
  { name: "The City", url: "https://www.thecityreporter.nyc/feed/", section: "nyc" },
  { name: "amNewYork", url: "https://www.amny.com/feed/", section: "nyc" },
  {
    name: "NYT Metro",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml",
    section: "nyc",
  },
  { name: "NY Post Metro", url: "https://nypost.com/metro/feed/", section: "nyc" },
  { name: "6sqft", url: "https://www.6sqft.com/feed/", section: "nyc" },
  { name: "Eater NY", url: "https://ny.eater.com/rss/index.xml", section: "nyc" },

  // ── West Village ────────────────────────────────────────────────────────
  {
    name: "West Village Patch",
    url: "https://patch.com/feeds/new-york/west-village",
    section: "westvillage",
  },
  {
    name: "Village Preservation",
    url: "https://villagepreservation.org/feed/",
    section: "westvillage",
  },
  // Neighbors, not the neighborhood — only surfaced when they name it.
  {
    name: "Tribeca Citizen",
    url: "https://tribecacitizen.com/feed/",
    section: "westvillage",
    require: ["west village", "greenwich village", "hudson square", "meatpacking"],
  },
  {
    name: "EV Grieve",
    url: "https://feeds.feedburner.com/EvGrieve",
    section: "westvillage",
    require: ["west village", "greenwich village", "washington square"],
  },
];

/**
 * A story from any NYC feed that mentions one of these gets moved into the West
 * Village section. Without this the neighborhood section would be thin most
 * days — the local outlets are small, but the big NYC outlets cover the
 * neighborhood constantly.
 */
export const WEST_VILLAGE_TERMS = [
  "west village",
  "greenwich village",
  "meatpacking",
  "hudson square",
  "washington square",
  "bleecker street",
  "christopher street",
  "hudson street",
  "jane street",
  "perry street",
  "bedford street",
  "abingdon square",
  "little west 12th",
  "gansevoort",
  "sheridan square",
  "stonewall",
];
