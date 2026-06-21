import { NextResponse, type NextRequest } from "next/server";
import { signBookingToken, type BookingPayload } from "../lib/token";
import { sendBookingRequestToMatt } from "../lib/emails";
import { rateLimit } from "../../../../lib/rate-limit";

/**
 * POST /api/crepes/request
 *
 * Body: { name, email, dateISO, party (1|2), message? }
 *
 * Validates input, signs a 7-day booking token, and emails Matt with
 * approve/deny buttons. No DB write — the booking lives entirely inside
 * the signed URL until Matt clicks one of the buttons.
 */
export const dynamic = "force-dynamic";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_RX = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    prefix: "crepes-request",
  });
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const obj = body as Record<string, unknown>;
  const name = (typeof obj.name === "string" ? obj.name : "").trim();
  const email = (typeof obj.email === "string" ? obj.email : "").trim();
  const dateISO = (typeof obj.dateISO === "string" ? obj.dateISO : "").trim();
  const party = Number(obj.party);
  const message =
    typeof obj.message === "string" ? obj.message.trim().slice(0, 800) : "";

  if (!name || name.length > 80) {
    return NextResponse.json(
      { error: "Please tell us your name." },
      { status: 400 }
    );
  }
  if (!EMAIL_RX.test(email) || email.length > 160) {
    return NextResponse.json(
      { error: "That doesn't look like a valid email." },
      { status: 400 }
    );
  }
  if (!ISO_RX.test(dateISO)) {
    return NextResponse.json(
      { error: "Pick a Sunday from the list." },
      { status: 400 }
    );
  }
  if (party !== 1 && party !== 2) {
    return NextResponse.json(
      { error: "Party size must be 1 or 2." },
      { status: 400 }
    );
  }

  // Must be a Sunday in the future (interpreted in local time).
  const [y, m, d] = dateISO.split("-").map(Number);
  const sunday = new Date(y, m - 1, d, 11, 0, 0);
  if (sunday.getDay() !== 0) {
    return NextResponse.json(
      { error: "That date isn't a Sunday." },
      { status: 400 }
    );
  }
  if (sunday.getTime() < Date.now() - 60_000) {
    return NextResponse.json(
      { error: "That date is in the past." },
      { status: 400 }
    );
  }

  const payload: BookingPayload = {
    name,
    email,
    dateISO,
    party: party as 1 | 2,
    message: message || undefined,
    exp: Date.now() + SEVEN_DAYS_MS,
  };

  let token: string;
  try {
    token = signBookingToken(payload);
  } catch (err) {
    console.error("[crepes/request] sign failed:", err);
    return NextResponse.json(
      { error: "Booking isn't fully set up yet. Try again in a moment." },
      { status: 503 }
    );
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const approveUrl = `${origin}/api/crepes/decision?action=approve&token=${encodeURIComponent(token)}`;
  const denyUrl = `${origin}/api/crepes/decision?action=deny&token=${encodeURIComponent(token)}`;

  try {
    await sendBookingRequestToMatt({
      name,
      email,
      dateISO,
      party: party as 1 | 2,
      message: message || undefined,
      approveUrl,
      denyUrl,
    });
  } catch (err) {
    console.error("[crepes/request] email send failed:", err);
    return NextResponse.json(
      {
        error:
          "We couldn't send the request just now. Try again, or email matt@flickmanmedia.com directly.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
