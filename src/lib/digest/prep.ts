/**
 * Meeting prep: rows in Notion, written by this report and by the prep agent.
 *
 * The split: the calendar is the source of truth for *what's on your day* —
 * it's always current and needs no agent to have run. Notion supplies the
 * *context* for each meeting, which comes from places this server can't reach
 * (Wispr Flow transcripts, Gmail threads, web lookups). If the agent didn't run,
 * or ran badly, you still get an accurate schedule with empty context rather
 * than a missing section.
 *
 * Notion is also the bridge. The prep agent runs in a cloud environment whose
 * egress can't reach this domain, so it can't ask the report what to prepare —
 * but it can reach Notion, and so can we. The report seeds today's meetings as
 * empty rows before the agent runs; the agent fills in Context on rows that are
 * already there. Nothing crosses the blocked path.
 *
 * That also closes the failure that used to hide itself. Rows are matched to
 * calendar events by normalized title, and when the agent invented its own
 * titles they matched nothing: every meeting silently lost its context and the
 * section still looked fine. Now the report writes the title, so the join key
 * is one it authored.
 *
 * Env:
 *   NOTION_TOKEN               internal integration token (starts "ntn_")
 *   NOTION_PREP_DATABASE_ID    overrides the default database
 */

const DATABASE_ID =
  process.env.NOTION_PREP_DATABASE_ID ?? "982704c6b1a3446eabdec95d7cf7e26a";

/** Pinned: Notion breaks queries across versions, so this shouldn't float. */
const NOTION_VERSION = "2022-06-28";

/** Notion rejects a rich_text value over 2000 characters outright. */
const MAX_TEXT = 1900;

export interface MeetingPrep {
  title: string;
  context?: string;
  attendees?: string;
  sources?: string;
}

export interface PrepRead {
  /** Keyed by normalized title. */
  byTitle: Map<string, MeetingPrep>;
  status: "ok" | "unavailable" | "no-credential";
  reason?: string;
}

/** Titles drift in whitespace, case and punctuation; the meeting is the same. */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

interface NotionRichText {
  plain_text?: string;
}

interface NotionRow {
  properties?: Record<
    string,
    { title?: NotionRichText[]; rich_text?: NotionRichText[] }
  >;
}

function plain(prop?: { title?: NotionRichText[]; rich_text?: NotionRichText[] }): string {
  const parts = prop?.title ?? prop?.rich_text ?? [];
  return parts
    .map((p) => p.plain_text ?? "")
    .join("")
    .trim();
}

async function notionFetch(
  path: string,
  token: string,
  body: unknown
): Promise<Response> {
  return fetch(`https://api.notion.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
}

/** Every prep row filed under one ET calendar date. */
async function rowsForDate(token: string, dateISO: string): Promise<NotionRow[]> {
  const res = await notionFetch(`databases/${DATABASE_ID}/query`, token, {
    filter: { property: "Date", date: { equals: dateISO } },
    page_size: 50,
  });
  if (!res.ok) {
    throw new Error(`Notion ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const json = (await res.json()) as { results?: NotionRow[] };
  return json.results ?? [];
}

/**
 * Never throws. An unreachable Notion just means no context — the meetings
 * section still renders from the calendar.
 */
export async function getMeetingPrep(dateISO: string): Promise<PrepRead> {
  const token = process.env.NOTION_TOKEN?.trim();
  if (!token) return { byTitle: new Map(), status: "no-credential" };

  try {
    const byTitle = new Map<string, MeetingPrep>();

    for (const row of await rowsForDate(token, dateISO)) {
      const title = plain(row.properties?.["Meeting"]);
      if (!title) continue;
      byTitle.set(normalizeTitle(title), {
        title,
        context: plain(row.properties?.["Context"]) || undefined,
        attendees: plain(row.properties?.["Attendees"]) || undefined,
        sources: plain(row.properties?.["Sources"]) || undefined,
      });
    }

    return { byTitle, status: "ok" };
  } catch (err) {
    console.error("[digest] meeting prep fetch failed:", err);
    return {
      byTitle: new Map(),
      status: "unavailable",
      reason: err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200),
    };
  }
}

export interface SeedResult {
  status: "ok" | "partial" | "unavailable" | "no-credential";
  created: number;
  existing: number;
  reason?: string;
}

function text(value: string) {
  return [{ text: { content: value.slice(0, MAX_TEXT) } }];
}

/**
 * Create a row for each of today's meetings, leaving any that already exist
 * alone.
 *
 * Existing rows are never modified. By the time this runs again the agent may
 * have filled in Context, and a re-seed must not overwrite its work — so this
 * is create-if-absent rather than upsert. Re-running it is safe and cheap.
 *
 * Stale rows are left in place too: a meeting cancelled after seeding turns
 * into an unmatched row, which the report already counts and reports. Deleting
 * on this side would risk removing research the agent had already done.
 */
export async function seedMeetingRows(
  dateISO: string,
  meetings: { title: string; attendees?: string }[]
): Promise<SeedResult> {
  const token = process.env.NOTION_TOKEN?.trim();
  if (!token) return { status: "no-credential", created: 0, existing: 0 };

  try {
    const present = new Set(
      (await rowsForDate(token, dateISO))
        .map((row) => plain(row.properties?.["Meeting"]))
        .filter(Boolean)
        .map(normalizeTitle)
    );

    // A duplicate title within one day would otherwise create two rows on the
    // first run and match ambiguously on the read.
    const missing = meetings.filter((m) => {
      const key = normalizeTitle(m.title);
      if (!key || present.has(key)) return false;
      present.add(key);
      return true;
    });

    const settled = await Promise.allSettled(
      missing.map(async (m) => {
        const properties: Record<string, unknown> = {
          Meeting: { title: text(m.title) },
          Date: { date: { start: dateISO } },
        };
        if (m.attendees) properties.Attendees = { rich_text: text(m.attendees) };

        const res = await notionFetch("pages", token, {
          parent: { database_id: DATABASE_ID },
          properties,
        });
        if (!res.ok) {
          throw new Error(`Notion ${res.status}: ${(await res.text()).slice(0, 200)}`);
        }
      })
    );

    const failures = settled.filter((r) => r.status === "rejected");
    for (const f of failures) {
      console.error("[digest] prep row create failed:", (f as PromiseRejectedResult).reason);
    }

    const created = missing.length - failures.length;
    return {
      // A partial write is worth distinguishing: the agent will still find
      // rows, just not all of them, and that looks like success from the read.
      status: failures.length ? "partial" : "ok",
      created,
      existing: meetings.length - missing.length,
      reason: failures.length
        ? `${failures.length} of ${missing.length} creates failed`
        : undefined,
    };
  } catch (err) {
    console.error("[digest] prep row seed failed:", err);
    return {
      status: "unavailable",
      created: 0,
      existing: 0,
      reason: err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200),
    };
  }
}
