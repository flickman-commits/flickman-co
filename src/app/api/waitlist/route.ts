import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "../../../lib/rate-limit";

/**
 * POST /api/waitlist
 *
 * Body: { email, source? }
 *
 * Validates the email and forwards it to a Google Apps Script web app that
 * appends a row to a Google Sheet. No database — the Sheet is the store.
 *
 * Env: GOOGLE_SHEET_WEBHOOK_URL — the Apps Script web app URL (ends in /exec).
 * Server-only (not NEXT_PUBLIC) so the URL stays private.
 */
export const dynamic = "force-dynamic";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    prefix: "waitlist",
  });
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const obj = body as Record<string, unknown>;
  const email = (typeof obj.email === "string" ? obj.email : "").trim().toLowerCase();
  const source =
    typeof obj.source === "string" ? obj.source.trim().slice(0, 80) : "topline";

  if (!EMAIL_RX.test(email) || email.length > 160) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const webhook = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhook) {
    console.error("[waitlist] GOOGLE_SHEET_WEBHOOK_URL not set");
    return NextResponse.json(
      { error: "Waitlist is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        source,
        secret: process.env.GOOGLE_SHEET_SECRET ?? "",
      }),
      // Apps Script 302-redirects to its googleusercontent output; follow it.
      redirect: "follow",
    });
    // Apps Script always returns HTTP 200; the real outcome is in the JSON
    // body ({ ok: true } / { ok: false, error }). Verify the body, not status.
    const text = await res.text();
    let ok = false;
    try {
      ok = JSON.parse(text)?.ok === true;
    } catch {
      ok = false;
    }
    if (!res.ok || !ok) {
      console.error("[waitlist] sheet webhook rejected:", res.status, text.slice(0, 120));
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("[waitlist] sheet webhook failed:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
