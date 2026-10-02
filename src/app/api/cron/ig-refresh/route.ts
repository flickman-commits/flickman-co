import { NextRequest, NextResponse } from "next/server";

/**
 * Weekly cron (see vercel.json) that extends the Instagram tokens in IG_TOKEN_FLICKMAN and
 * IG_TOKEN_TOPLINE. A long-lived token lasts 60 days from its last refresh, so running this
 * weekly keeps the media kit's live stats from expiring.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. For manual runs, pass `?key=$CRON_SECRET`.
 * If Meta ever returns a different token string, the route reports it; update the env var by hand.
 */

function authorized(req: NextRequest, secret: string) {
  if (req.headers.get("authorization") === `Bearer ${secret}`) return true;
  return req.nextUrl.searchParams.get("key") === secret;
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  if (!authorized(req, secret)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const results: Record<string, string> = {};
  for (const [name, token] of [
    ["flickman", process.env.IG_TOKEN_FLICKMAN],
    ["topline", process.env.IG_TOKEN_TOPLINE],
  ] as const) {
    if (!token) {
      results[name] = "no token set";
      continue;
    }
    try {
      const url = new URL("https://graph.instagram.com/refresh_access_token");
      url.searchParams.set("grant_type", "ig_refresh_token");
      url.searchParams.set("access_token", token);
      const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10000) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        results[name] = `error ${res.status}: ${body?.error?.message ?? "unknown"}`;
      } else {
        const days = Math.round((body.expires_in ?? 0) / 86400);
        results[name] =
          body.access_token && body.access_token !== token
            ? `refreshed, but Meta issued a new token: update IG_TOKEN_${name.toUpperCase()} (valid ${days} days)`
            : `refreshed, valid ${days} days`;
      }
    } catch (err) {
      results[name] = `failed: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  console.log("[ig-refresh]", results);
  return NextResponse.json(results);
}
