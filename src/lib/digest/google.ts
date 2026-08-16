import { JWT } from "google-auth-library";

/**
 * Shared service-account auth for the Google APIs the digest reads.
 *
 * One credential, several scopes: the Trackstar scoreboard (Sheets) and the
 * calendar used to work out which city to report weather for. Both are
 * read-only, and both require the resource to be shared with the service
 * account's client_email — a service account has no access to anything by
 * default, sharing is what grants it.
 *
 * Env:
 *   GOOGLE_SERVICE_ACCOUNT_JSON  full service-account key JSON
 */

export const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
export const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

/** Returns null when the credential is absent or unusable. Never logs the key. */
export async function getGoogleToken(scopes: string[]): Promise<string | null> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw || !raw.trim()) return null;

  try {
    const creds = JSON.parse(raw) as { client_email?: string; private_key?: string };
    if (!creds.client_email || !creds.private_key) {
      console.error("[digest] service account JSON missing client_email/private_key");
      return null;
    }
    const auth = new JWT({
      email: creds.client_email,
      // Env UIs commonly store the key with literal "\n" rather than real
      // newlines; normalizing here beats debugging a signature error later.
      key: creds.private_key.replace(/\\n/g, "\n"),
      scopes,
    });
    const { token } = await auth.getAccessToken();
    return token ?? null;
  } catch (err) {
    console.error("[digest] google auth failed:", err);
    return null;
  }
}
