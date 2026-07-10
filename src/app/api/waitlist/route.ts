import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase";
import { rateLimit } from "../../../lib/rate-limit";

/**
 * POST /api/waitlist
 *
 * Body: { email, source? }
 *
 * Validates the email and upserts it into the Supabase `waitlist` table.
 * Duplicate emails are treated as success (idempotent signup). No auth —
 * this is a public waitlist form, protected only by rate limiting.
 *
 * Table (run once in Supabase SQL editor):
 *   create table if not exists waitlist (
 *     id uuid primary key default gen_random_uuid(),
 *     email text unique not null,
 *     source text,
 *     created_at timestamptz not null default now()
 *   );
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
  const email = (typeof obj.email === "string" ? obj.email : "")
    .trim()
    .toLowerCase();
  const source =
    typeof obj.source === "string" ? obj.source.trim().slice(0, 80) : "pnl-database";

  if (!EMAIL_RX.test(email) || email.length > 160) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    console.error("[waitlist] Supabase not configured");
    return NextResponse.json(
      { error: "Waitlist is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  // Upsert on the unique email so re-submitting the same address is a no-op
  // success rather than a duplicate-key error.
  const { error } = await supabase
    .from("waitlist")
    .upsert({ email, source }, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    console.error("[waitlist] insert failed:", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
