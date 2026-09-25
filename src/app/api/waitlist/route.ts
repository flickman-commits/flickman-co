import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "../../../lib/rate-limit";

/**
 * POST /api/waitlist
 *
 * Body: { name, email, businessName, industry, revenue, source? }
 *
 * Money Dinners waitlist (the /topline page). Validates the fields and
 * forwards them to a Formspree form, which stores the submission and emails
 * a notification. Formspree adds a column per field automatically.
 *
 * Env: FORMSPREE_ENDPOINT — the form URL, e.g. https://formspree.io/f/xxxxxxxx
 * Server-only so the endpoint isn't exposed in the browser.
 */
export const dynamic = "force-dynamic";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Keep in sync with the options on src/app/topline/page.tsx.
const REVENUE_RANGES = [
  "Under $250k",
  "$250k to $500k",
  "$500k to $1M",
  "$1M to $5M",
  "Over $5M",
];

function str(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

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
  const email = str(obj.email, 200).toLowerCase();
  const name = str(obj.name, 100);
  const businessName = str(obj.businessName, 120);
  const industry = str(obj.industry, 80);
  const revenue = str(obj.revenue, 40);
  const source = str(obj.source, 80) || "money-dinners";

  if (!EMAIL_RX.test(email) || email.length > 160) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "Please add your name." }, { status: 400 });
  }
  if (!businessName) {
    return NextResponse.json({ error: "Please add your business name." }, { status: 400 });
  }
  if (!industry) {
    return NextResponse.json({ error: "Please pick what kind of business it is." }, { status: 400 });
  }
  if (!REVENUE_RANGES.includes(revenue)) {
    return NextResponse.json({ error: "Please pick a yearly revenue range." }, { status: 400 });
  }

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
        name,
        email,
        business_name: businessName,
        industry,
        yearly_revenue: revenue,
        source,
        _subject: `Money Dinners waitlist: ${businessName} (${revenue})`,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[waitlist] formspree rejected:", res.status, text.slice(0, 160));
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
    }
  } catch (err) {
    console.error("[waitlist] formspree request failed:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
