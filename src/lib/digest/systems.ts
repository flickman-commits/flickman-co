/**
 * Overnight health of the Trackstar fulfillment tool, read from that app.
 *
 * Same split as meeting prep, for the same reason. A nightly agent sweeps the
 * fulfillment tool at 05:00 UTC, fixes what it safely can, and stores a
 * rendered report there. This reads it. Nothing here writes, and the token
 * below can do exactly one thing — fetch that stored report — so a leak costs
 * a health summary rather than access to the fulfillment API.
 *
 * Pull rather than push on purpose: the alternative was a write credential
 * living in a scheduler prompt, able to inject arbitrary content into this
 * email.
 *
 * The report is deliberately the STORED one rather than a fresh sweep. The
 * numbers have to be the ones the agent acted on overnight, not a new set
 * taken six hours later that no longer matches what it says it fixed.
 *
 * Env:
 *   TRACKSTAR_BASE_URL             defaults to production
 *   NIGHTLY_REPORT_READ_TOKEN      read-only token for the stored report
 */

const DEFAULT_BASE = "https://fast.trackstar.art";

/** The report runs to a couple of hundred findings; ?brief=1 is the email cut. */
const REPORT_PATH = "/api/admin/nightly-sweep?cached=1&format=markdown&brief=1";

const TIMEOUT_MS = 8000;

export interface SystemsReport {
  /** Markdown, already trimmed to what belongs in an email. */
  body: string | null;
  status: "ok" | "no-report" | "unavailable" | "no-credential";
  reason?: string;
}

/**
 * Fetch last night's sweep.
 *
 * Never throws. Every failure resolves to a status and a null body, so the
 * section is omitted and the rest of the report still sends — the same
 * contract every other source in this digest honours.
 */
export async function getSystemsReport(): Promise<SystemsReport> {
  const token = process.env.NIGHTLY_REPORT_READ_TOKEN;
  if (!token) {
    return { body: null, status: "no-credential", reason: "NIGHTLY_REPORT_READ_TOKEN not set" };
  }

  const base = process.env.TRACKSTAR_BASE_URL ?? DEFAULT_BASE;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${base}${REPORT_PATH}`, {
      headers: { "x-report-token": token },
      signal: controller.signal,
      cache: "no-store",
    });

    // 404 means the sweep has never stored a report - the agent has not run
    // yet. Distinct from an error, and the right response is a quiet omission.
    if (res.status === 404) {
      return { body: null, status: "no-report", reason: "no sweep stored yet" };
    }
    if (!res.ok) {
      return { body: null, status: "unavailable", reason: `HTTP ${res.status}` };
    }

    const body = (await res.text()).trim();
    // The sweep writes nothing when there is nothing worth saying. Treat that
    // as "no report" so the email stays quiet rather than printing a heading
    // over empty space.
    if (!body) return { body: null, status: "no-report", reason: "sweep had nothing to report" };

    return { body, status: "ok" };
  } catch (err) {
    const reason = err instanceof Error && err.name === "AbortError"
      ? `timed out after ${TIMEOUT_MS}ms`
      : err instanceof Error ? err.message : "unknown error";
    return { body: null, status: "unavailable", reason };
  } finally {
    clearTimeout(timer);
  }
}
