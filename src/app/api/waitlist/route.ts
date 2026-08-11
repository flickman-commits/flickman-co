import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "../../../lib/rate-limit";

/**
 * POST /api/waitlist
 *
 * Body: { email, source? }
 *
 * Validates the email and forwards it to a Formspree form endpoint, which
 * stores the submission and emails a notification. No database.
 *
 * Env: FORMSPREE_ENDPOINT — the form URL, e.g. https://formspree.io/f/xxxxxxxx
 * Server-only so the endpoint isn't exposed in the browser.
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
  const role = typeof obj.role === "string" ? obj.role.trim() : "";
  const wouldSubmitPL =
    typeof obj.wouldSubmitPL === "string" ? obj.wouldSubmitPL.trim() : "";
  const reason =
    typeof obj.reason === "string" ? obj.reason.trim().slice(0, 1000) : "";

  if (!EMAIL_RX.test(email) || email.length > 160) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const ROLES = [
    "Current business owner",
    "Looking to start or buy a business",
    "Not interested in business ownership",
  ];
  if (!ROLES.includes(role)) {
    return NextResponse.json(
      { error: "Please choose the option that best describes you." },
      { status: 400 }
    );
  }

  // The P&L question only applies to current business owners.
  const pl =
    role === "Current business owner" && ["Yes", "Maybe", "No"].includes(wouldSubmitPL)
      ? wouldSubmitPL
      : "";

  const endpoint = process.env.FORMSPREE_ENDPOINT;
  if (!endpoint) {
    console.error("[waitlist] FORMSPREE_ENDPOINT not set");
    return NextResponse.json(
      { error: "Waitlist is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        source,
        role,
        would_submit_pl: pl,
        reason,
        _subject: "New Topline waitlist signup",
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[waitlist] formspree rejected:", res.status, text.slice(0, 160));
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("[waitlist] formspree request failed:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
