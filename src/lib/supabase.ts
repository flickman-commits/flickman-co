/**
 * Supabase server client.
 *
 * Required env vars (set in .env.local and on Vercel):
 *   NEXT_PUBLIC_SUPABASE_URL     Project URL, e.g. "https://xxxx.supabase.co"
 *   SUPABASE_SERVICE_ROLE_KEY    Service-role key (server-only — NEVER expose to the client)
 *
 * The service-role key bypasses Row Level Security, so this client must only
 * ever be imported from server code (API routes, server components). It is
 * created lazily so a missing env var fails at request time with a clear
 * message rather than at build time.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
