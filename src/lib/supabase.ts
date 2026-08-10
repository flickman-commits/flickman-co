/**
 * Supabase client.
 *
 * Required env vars (set in .env.local and on Vercel):
 *   NEXT_PUBLIC_SUPABASE_URL       Project URL, e.g. "https://xxxx.supabase.co"
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  Public "anon" key
 *
 * We use the anon key (not service_role) so this is safe even when the project
 * is shared with other data: the anon key can only do what Row Level Security
 * policies allow. For the waitlist that's "insert only, no read." Created
 * lazily so a missing env var fails at request time with a clear message.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabasePublic(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  cached = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
