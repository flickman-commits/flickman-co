/**
 * Meeting prep, written to Notion by the prep agent and read here.
 *
 * The split: the calendar is the source of truth for *what's on your day* —
 * it's always current and needs no agent to have run. Notion supplies the
 * *context* for each meeting, which comes from places this server can't reach
 * (Wispr Flow transcripts, Gmail threads, web lookups). If the agent didn't run,
 * or ran badly, you still get an accurate schedule with empty context rather
 * than a missing section.
 *
 * Rows are matched to calendar events by normalized title, so the agent must
 * write the event title as the row's "Meeting". Unmatched rows are counted in
 * diagnostics rather than dropped silently — a title drift would otherwise look
 * exactly like an agent that produced nothing.
 *
 * Env:
 *   NOTION_TOKEN               internal integration token (starts "ntn_")
 *   NOTION_PREP_DATABASE_ID    overrides the default database
 */

const DATABASE_ID =
  process.env.NOTION_PREP_DATABASE_ID ?? "982704c6b1a3446eabdec95d7cf7e26a";

/** Pinned: Notion breaks queries across versions, so this shouldn't float. */
const NOTION_VERSION = "2022-06-28";

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

/**
 * Never throws. An unreachable Notion just means no context — the meetings
 * section still renders from the calendar.
 */
export async function getMeetingPrep(dateISO: string): Promise<PrepRead> {
  const token = process.env.NOTION_TOKEN?.trim();
  if (!token) return { byTitle: new Map(), status: "no-credential" };

  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filter: { property: "Date", date: { equals: dateISO } },
          page_size: 50,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) {
      throw new Error(`Notion ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }

    const json = (await res.json()) as { results?: NotionRow[] };
    const byTitle = new Map<string, MeetingPrep>();

    for (const row of json.results ?? []) {
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
