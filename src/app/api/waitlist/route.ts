import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublic } from "../../../lib/supabase";
import { rateLimit } from "../../../lib/rate-limit";

/**
 * POST /api/waitlist
 *
 * Body: { email, source? }
 *
 * Validates the email and inserts it into the Supabase `topline_waitlist`
 * table using the public anon key (RLS allows insert-only). Duplicate emails
 * are treated as success (idempotent signup). No auth — this is a public
 * waitlist form, protected only by rate limiting.
 *
 * Table + RLS policy live in supabase/migrations/0001_create_waitlist.sql.
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
    supabase = getSupabasePublic();
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
    .from("topline_waitlist")
    .upsert({ email, source }, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    console.error("[waitlist] insert failed:", error.message);
    // TEMP diagnostic: reveal the real error only when the caller passes the
    // secret ?_diag= token. Remove after debugging.
    const diag = new URL(req.url).searchParams.get("_diag") === "tl9f2a7c";
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again.",
        ...(diag
          ? { detail: error.message, code: error.code, hint: error.hint, details: error.details }
          : {}),
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
