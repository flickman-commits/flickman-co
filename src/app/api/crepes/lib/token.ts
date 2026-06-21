import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Tiny HMAC-signed token for stateless booking approvals.
 *
 * Format:  base64url(payloadJSON) + "." + base64url(signature)
 *
 * No DB needed. Matt's approve/deny links carry the booking details inside the
 * URL, signed with BOOKING_SECRET so they can't be forged. Tokens expire after
 * a fixed window so old links stop working.
 */

export type BookingPayload = {
  name: string;
  email: string;
  /** Sunday date in YYYY-MM-DD. */
  dateISO: string;
  party: 1 | 2;
  message?: string;
  /** Expiry timestamp in ms since epoch. */
  exp: number;
};

const ENC = "base64url";

function getSecret(): Buffer {
  const s = process.env.BOOKING_SECRET;
  if (!s) throw new Error("BOOKING_SECRET not set");
  return Buffer.from(s, "utf8");
}

export function signBookingToken(payload: BookingPayload): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(ENC);
  const sig = createHmac("sha256", getSecret()).update(body).digest(ENC);
  return `${body}.${sig}`;
}

export function verifyBookingToken(token: string): BookingPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = createHmac("sha256", getSecret()).update(body).digest(ENC);

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  try {
    const json = Buffer.from(body, ENC).toString("utf8");
    const payload = JSON.parse(json) as BookingPayload;
    if (typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
