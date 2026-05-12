import { NextResponse, type NextRequest } from "next/server";
import { getApp } from "../../../../../apps/registry";

/**
 * Check the submitted password against APP_PW_<SLUG_UPPER>.
 * On success, set an HTTP-only cookie that lasts 30 days and redirect to `next`.
 * On failure, redirect back to the unlock page with ?error=1.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const slug = String(form.get("slug") ?? "");
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? `/apps/${slug}`);

  const app = getApp(slug);
  if (!app || !app.private) {
    return NextResponse.redirect(new URL("/apps", req.url));
  }

  const envKey = `APP_PW_${slug.toUpperCase().replace(/-/g, "_")}`;
  const expected = process.env[envKey];

  if (!expected || password !== expected) {
    const url = new URL(`/apps/unlock/${slug}`, req.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 303 });
  }

  // Only redirect to internal paths.
  const safeNext = next.startsWith("/") ? next : `/apps/${slug}`;
  const res = NextResponse.redirect(new URL(safeNext, req.url), { status: 303 });
  res.cookies.set(`fm_app_${slug}`, "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
