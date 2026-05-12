import { NextResponse, type NextRequest } from "next/server";
import { apps } from "../apps/registry";

/**
 * Gate private apps behind a password cookie.
 *
 * For each app with `private: true` in the registry, we require a cookie
 * named `fm_app_<slug>=1`. If missing, we redirect to /apps/unlock/<slug>.
 *
 * Password is stored on Vercel as `APP_PW_<SLUG_UPPER>` and checked by the
 * /api/apps/unlock route, which sets the cookie on success.
 */

const privateSlugs = new Set(apps.filter((a) => a.private).map((a) => a.slug));

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const match = pathname.match(/^\/apps\/([^/]+)(?:\/.*)?$/);
  if (!match) return NextResponse.next();

  const slug = match[1];
  // Don't gate the unlock route itself.
  if (slug === "unlock") return NextResponse.next();
  if (!privateSlugs.has(slug)) return NextResponse.next();

  const cookie = req.cookies.get(`fm_app_${slug}`);
  if (cookie?.value === "1") return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/apps/unlock/${slug}`;
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/apps/:slug*"],
};
