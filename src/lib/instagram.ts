/**
 * Live Instagram stats for the media kit, via the Instagram API with Instagram Login
 * (graph.instagram.com). No Facebook Page needed; the accounts must be Creator or Business.
 *
 * Env vars (server only, never exposed to the client):
 *   IG_TOKEN_FLICKMAN  long-lived token for @flickman
 *   IG_TOKEN_TOPLINE   long-lived token for @topline_________ (optional; adds followers)
 *
 * Tokens last 60 days. /api/cron/ig-refresh extends them weekly.
 * Every function returns null on any failure so the page can fall back to hard-coded numbers.
 */

const BASE = "https://graph.instagram.com/v23.0";
const REVALIDATE = 60 * 60 * 6; // refresh at most every 6 hours
const TIMEOUT_MS = 8000;
const DAY = 86400;

export type IgAccount = "flickman" | "topline";

function token(account: IgAccount): string | undefined {
  return account === "flickman" ? process.env.IG_TOKEN_FLICKMAN : process.env.IG_TOKEN_TOPLINE;
}

async function ig<T>(account: IgAccount, path: string, params: Record<string, string> = {}): Promise<T | null> {
  const t = token(account);
  if (!t) return null;
  const url = new URL(`${BASE}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("access_token", t);
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      // Log status and Meta's error message only; the URL carries the token.
      const body = await res.json().catch(() => ({}));
      console.error(`[instagram] ${path} → ${res.status}`, body?.error?.message ?? "");
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[instagram] ${path} failed`, err instanceof Error ? err.message : err);
    return null;
  }
}

type TotalValueResp = {
  data: {
    name: string;
    total_value?: { value?: number; breakdowns?: { results: { dimension_values: string[]; value: number }[] }[] };
  }[];
};

const now = () => Math.floor(Date.now() / 1000);

/** Sum of a metric over a window ending now. Meta caps each request at 30 days, so longer windows are split. */
async function totalOver(account: IgAccount, metric: string, days: number): Promise<number | null> {
  const end = now() - DAY; // insights lag up to ~48h; skip the partial current day
  const windows: [number, number][] = [];
  for (let d = 0; d < days; d += 30) {
    const until = end - d * DAY;
    const since = until - Math.min(30, days - d) * DAY;
    windows.push([since, until]);
  }
  const parts = await Promise.all(
    windows.map(([since, until]) =>
      ig<TotalValueResp>(account, "me/insights", {
        metric,
        period: "day",
        metric_type: "total_value",
        since: String(since),
        until: String(until),
      }),
    ),
  );
  if (parts.some((p) => !p)) return null;
  return parts.reduce((sum, p) => sum + (p!.data[0]?.total_value?.value ?? 0), 0);
}

/** Share of 30-day views from non-followers, 0–100. */
async function nonFollowerShare(account: IgAccount): Promise<number | null> {
  const until = now() - DAY;
  const r = await ig<TotalValueResp>(account, "me/insights", {
    metric: "views",
    period: "day",
    metric_type: "total_value",
    breakdown: "follow_type",
    since: String(until - 30 * DAY),
    until: String(until),
  });
  const results = r?.data[0]?.total_value?.breakdowns?.[0]?.results;
  if (!results?.length) return null;
  const total = results.reduce((s, x) => s + x.value, 0);
  const non = results.find((x) => x.dimension_values[0]?.toUpperCase() === "NON_FOLLOWER")?.value ?? 0;
  return total ? (non / total) * 100 : null;
}

/** Follower demographics for one breakdown, as [label, percent] sorted high to low. */
async function demographics(account: IgAccount, breakdown: "age" | "gender" | "country" | "city") {
  const r = await ig<TotalValueResp>(account, "me/insights", {
    metric: "follower_demographics",
    period: "lifetime",
    metric_type: "total_value",
    timeframe: "this_month",
    breakdown,
  });
  const results = r?.data[0]?.total_value?.breakdowns?.[0]?.results;
  if (!results?.length) return null;
  const total = results.reduce((s, x) => s + x.value, 0);
  return results
    .map((x) => [x.dimension_values[0], (x.value / total) * 100] as [string, number])
    .sort((a, b) => b[1] - a[1]);
}

async function followers(account: IgAccount): Promise<number | null> {
  const r = await ig<{ followers_count?: number }>(account, "me", { fields: "followers_count" });
  return r?.followers_count ?? null;
}

/** Views per Reel, keyed by shortcode, for the shortcodes asked for. Pages through recent media. */
async function reelViews(account: IgAccount, shortcodes: string[]): Promise<Record<string, number>> {
  const want = new Set(shortcodes);
  const ids: Record<string, string> = {};
  let after: string | undefined;
  for (let page = 0; page < 5 && Object.keys(ids).length < want.size; page++) {
    const r = await ig<{ data: { id: string; shortcode?: string }[]; paging?: { cursors?: { after?: string }; next?: string } }>(
      account,
      "me/media",
      { fields: "id,shortcode", limit: "50", ...(after ? { after } : {}) },
    );
    if (!r) break;
    for (const m of r.data) if (m.shortcode && want.has(m.shortcode)) ids[m.shortcode] = m.id;
    if (!r.paging?.next) break;
    after = r.paging.cursors?.after;
  }
  const out: Record<string, number> = {};
  await Promise.all(
    Object.entries(ids).map(async ([code, id]) => {
      const r = await ig<{ data: { name: string; values?: { value: number }[] }[] }>(account, `${id}/insights`, {
        metric: "views",
      });
      const v = r?.data[0]?.values?.[0]?.value;
      if (typeof v === "number") out[code] = v;
    }),
  );
  return out;
}

export type LiveStats = {
  followersTotal: number | null; // @flickman + @topline (if its token is set)
  views90: number | null; // Instagram only; Facebook crossposts aren't in this API
  reach30: number | null;
  accountsEngaged30: number | null;
  nonFollowerPct30: number | null;
  gender: { men: number; women: number } | null;
  age: [string, number][] | null;
  countries: [string, number][] | null;
  cities: [string, number][] | null;
  reelViews: Record<string, number>;
};

export async function getLiveStats(shortcodes: string[]): Promise<LiveStats | null> {
  if (!process.env.IG_TOKEN_FLICKMAN) return null;

  const [fFollowers, tFollowers, views90, reach30, engaged30, nonFollower, gender, age, countries, cities, flickReels, toplineReels] =
    await Promise.all([
      followers("flickman"),
      followers("topline"),
      totalOver("flickman", "views", 90),
      totalOver("flickman", "reach", 30),
      totalOver("flickman", "accounts_engaged", 30),
      nonFollowerShare("flickman"),
      demographics("flickman", "gender"),
      demographics("flickman", "age"),
      demographics("flickman", "country"),
      demographics("flickman", "city"),
      reelViews("flickman", shortcodes),
      reelViews("topline", shortcodes),
    ]);

  const men = gender?.find(([k]) => k === "M")?.[1];
  const women = gender?.find(([k]) => k === "F")?.[1];

  return {
    followersTotal: fFollowers === null ? null : fFollowers + (tFollowers ?? 0),
    views90,
    reach30,
    accountsEngaged30: engaged30,
    nonFollowerPct30: nonFollower,
    gender: men !== undefined && women !== undefined ? { men: (men / (men + women)) * 100, women: (women / (men + women)) * 100 } : null,
    age,
    countries,
    cities,
    // A collab Reel can live on either account; take whichever reports more.
    reelViews: Object.fromEntries(
      shortcodes
        .map((c) => [c, Math.max(flickReels[c] ?? 0, toplineReels[c] ?? 0)] as const)
        .filter(([, v]) => v > 0),
    ),
  };
}

/** 853412 → "853K", 8285917 → "8.3M". */
export function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return String(n);
}
