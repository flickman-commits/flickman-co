import { SHEETS_SCOPE, getGoogleToken } from "./google";

/**
 * Trackstar's daily numbers, read straight from the Daily Scoreboard.
 *
 * These are not derivable from Shopify: COGS includes designer cost, ad spend
 * is external, and gross profit is a sheet formula. The scoreboard is the
 * single source of truth (the Apps Script that emails these says as much), so
 * the digest reads it rather than recomputing anything.
 *
 * Column map, matching that Apps Script:
 *   A  date          D  total revenue    J  total COGS
 *   M  ad spend      N  gross profit
 * Contribution margin is derived: gross profit − ad spend.
 *
 * Env:
 *   GOOGLE_SERVICE_ACCOUNT_JSON  see ./google
 *   TRACKSTAR_SHEET_ID           overrides the default spreadsheet
 */

const SHEET_ID =
  process.env.TRACKSTAR_SHEET_ID ??
  "1yKe9O8XAHXRxBPlOFKN4pMNlH-eYTsdsLNJsw6Tctwg";
const TAB = "Daily Scoreboard NEW";
/** The Apps Script scans rows 5–35; same window here. */
const RANGE = `${TAB}!A5:N35`;

export interface DayFinancials {
  dateISO: string;
  revenue: number;
  cogs: number;
  adSpend: number;
  grossProfit: number;
  contributionMargin: number;
}

export interface Financials {
  yesterday: DayFinancials;
  /** The day before, for day-over-day deltas. Null if the row isn't there. */
  prior: DayFinancials | null;
}

/**
 * Why there are no numbers, when there are none.
 *
 * The report drops the P&L whenever this returns nothing, which is right — zeros
 * would read as "you made nothing yesterday" rather than "we couldn't reach the
 * sheet". But collapsing every cause into one absent block hid a real failure:
 * a revoked share, a disabled API, and a scoreboard that simply hasn't been
 * rolled to the new month all looked identical from outside, and only one of
 * them is something the code can do anything about.
 *
 *   no-credential  GOOGLE_SERVICE_ACCOUNT_JSON missing or unusable
 *   unavailable    Sheets refused or the fetch failed; `reason` has the status
 *   no-row         the sheet was read fine, but yesterday isn't in rows 5-35
 */
export interface FinancialsRead {
  data: Financials | null;
  status: "ok" | "no-row" | "unavailable" | "no-credential";
  reason?: string;
}

/** Sheets serial dates count days from 1899-12-30. */
function serialToISO(serial: number): string {
  const ms = Date.UTC(1899, 11, 30) + Math.round(serial) * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

function easternDate(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

function shiftDays(dateISO: string, days: number): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  const at = new Date(Date.UTC(y, m - 1, d + days));
  return at.toISOString().slice(0, 10);
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
}

function rowToDay(row: unknown[], dateISO: string): DayFinancials {
  const revenue = num(row[3]); // D
  const cogs = num(row[9]); // J
  const adSpend = num(row[12]); // M
  const grossProfit = num(row[13]); // N
  return {
    dateISO,
    revenue,
    cogs,
    adSpend,
    grossProfit,
    contributionMargin: grossProfit - adSpend,
  };
}

/**
 * Read the range, once, with a deadline.
 *
 * This spreadsheet is not a flat table — it carries monthly roll-ups and a YTD
 * summary that recompute on access, and a values.get against it regularly takes
 * well over ten seconds. The original 10s deadline was therefore losing the P&L
 * on a coin flip: two runs in three came back empty, and because every failure
 * rendered as the same absent block, it read as lost access rather than a
 * timeout.
 *
 * Two attempts rather than one, because the failure is latency and not a
 * refusal — a second call often lands while the recalculation is still warm.
 * The budget is deliberate: 15s each caps this at 30s inside a 60s function
 * that still has curation to do afterwards.
 */
const ATTEMPT_MS = 15_000;
const ATTEMPTS = 2;

async function readRange(
  url: string,
  token: string
): Promise<{ json: { values?: unknown[][] }; elapsedMs: number }> {
  const started = Date.now();
  let last: unknown;

  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(ATTEMPT_MS),
      });
      if (!res.ok) {
        // A 401/403/404 is a decision, not a delay; retrying just burns the
        // budget and buries the status that says what to actually fix.
        throw new Error(`Sheets ${res.status}: ${(await res.text()).slice(0, 200)}`);
      }
      return {
        json: (await res.json()) as { values?: unknown[][] },
        elapsedMs: Date.now() - started,
      };
    } catch (err) {
      last = err;
      const timedOut = err instanceof Error && /abort|timeout/i.test(err.message);
      if (!timedOut || attempt === ATTEMPTS) break;
      console.warn(`[digest] sheets read timed out (attempt ${attempt}); retrying`);
    }
  }

  throw last instanceof Error ? last : new Error(String(last));
}

/**
 * Never throws. `data` is null whenever anything went wrong, and `status` says
 * what — see FinancialsRead.
 */
export async function getFinancials(now = new Date()): Promise<FinancialsRead> {
  const token = await getGoogleToken([SHEETS_SCOPE]);
  if (!token) return { data: null, status: "no-credential" };

  try {

    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/` +
      `${encodeURIComponent(RANGE)}?valueRenderOption=UNFORMATTED_VALUE`;

    const { json, elapsedMs } = await readRange(url, token);
    const rows = json.values ?? [];

    // Unformatted dates come back as serials; index by ISO date so a moved or
    // re-sorted row still resolves correctly.
    const byDate = new Map<string, unknown[]>();
    for (const row of rows) {
      const cell = row[0];
      if (typeof cell !== "number") continue;
      byDate.set(serialToISO(cell), row);
    }

    const took = `${Math.round(elapsedMs)}ms`;

    const yesterdayISO = shiftDays(easternDate(now), -1);
    const yesterdayRow = byDate.get(yesterdayISO);
    if (!yesterdayRow) {
      // The board holds one month at a time, so this is what a rollover looks
      // like: the sheet reads fine and simply doesn't contain yesterday yet.
      // Naming the dates it *does* have turns that into an obvious diagnosis
      // rather than a guess about access.
      const seen = [...byDate.keys()].sort();
      const span = seen.length ? `${seen[0]}..${seen[seen.length - 1]}` : "none";
      console.warn(`[digest] no scoreboard row for ${yesterdayISO}; sheet has ${span}`);
      return {
        data: null,
        status: "no-row",
        reason: `looked for ${yesterdayISO}, sheet has ${span} (${took})`,
      };
    }

    const priorISO = shiftDays(yesterdayISO, -1);
    const priorRow = byDate.get(priorISO);

    return {
      data: {
        yesterday: rowToDay(yesterdayRow, yesterdayISO),
        prior: priorRow ? rowToDay(priorRow, priorISO) : null,
      },
      status: "ok",
      reason: took,
    };
  } catch (err) {
    console.error("[digest] financials fetch failed:", err);
    return {
      data: null,
      status: "unavailable",
      reason: err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200),
    };
  }
}
