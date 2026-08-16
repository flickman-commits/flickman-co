import type { CuratedStory } from "./curate";
import type { Weather } from "./weather";
import type { DayFinancials, Financials } from "./financials";
import { SECTIONS } from "./sources";

export interface DigestSection {
  title: string;
  blurb: string;
  accent: string;
  accentInk: string;
  stories: CuratedStory[];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Email clients won't follow a relative or javascript: URL — drop anything odd. */
function safeUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "#";
    return u.toString();
  } catch {
    return "#";
  }
}

export function formatToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);
}

/* ──────────────────────────────────────────────────────────────── */
/* Design tokens                                                     */
/* ──────────────────────────────────────────────────────────────── */

/*
 * Clean dashboard styling: near-white ground, white cards, one hairline
 * border, generous whitespace, and color used only to carry meaning (up/down,
 * which P&L line, which news section) rather than as decoration.
 *
 * Email constraints still apply: no <style> blocks (Gmail strips them), no
 * flexbox (Outlook has none), so multi-column layout is tables throughout.
 * border-radius degrades to square corners in Outlook, which is fine.
 */

const PAGE = "#F6F7F9";
const CARD = "#FFFFFF";
const LINE = "#E4E4E7";
const INK = "#18181B";
const MUTED = "#71717A";
const FAINT = "#A1A1AA";
const ACCENT = "#3ECF8E";
const POS = "#16A34A";
const NEG = "#DC2626";

/** P&L line colors — each item keeps the same hue in the bar and the row. */
const C_COGS = "#F59E0B";
const C_AD = "#8B5CF6";
const C_MARGIN = "#10B981";

const FONT =
  "Inter, ui-sans-serif, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const CARD_STYLE = `background:${CARD}; border:1px solid ${LINE}; border-radius:10px;`;

function money(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
}

function pct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

/** "Wed, Aug 12" from a plain ET calendar date, without re-crossing zones. */
function shortDate(dateISO: string): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/* ──────────────────────────────────────────────────────────────── */
/* Stat cards                                                        */
/* ──────────────────────────────────────────────────────────────── */

/**
 * A day-over-day change is only meaningful against a non-zero base; a jump
 * from $0 is infinite, not informative, so it renders as a dash.
 */
function deltaChip(current: number, prior: number | null): string {
  if (prior == null || prior === 0) {
    return `<span style="font-size:12px; color:${FAINT};">—</span>`;
  }
  const change = ((current - prior) / Math.abs(prior)) * 100;
  const color = change >= 0 ? POS : NEG;
  return `<span style="font-size:12px; font-weight:600; color:${color};">${escapeHtml(
    pct(change)
  )}</span>`;
}

/** One tile in the top row. `foot` is pre-escaped HTML; `label`/`value` are not. */
function tile(label: string, value: string, foot: string): string {
  return `
    <div style="${CARD_STYLE} padding:10px 12px 9px;">
      <div style="font-family:${FONT}; font-size:10px; font-weight:600; letter-spacing:0.5px; text-transform:uppercase; line-height:1.3; color:${MUTED};">${escapeHtml(
        label
      )}</div>
      <div style="margin-top:6px; font-family:${FONT}; font-size:20px; font-weight:700; letter-spacing:-0.4px; line-height:1.1; color:${INK}; white-space:nowrap;">${escapeHtml(
        value
      )}</div>
      <div style="margin-top:3px; font-family:${FONT}; font-size:11px; line-height:1.35; color:${FAINT};">${foot}</div>
    </div>`;
}

/** Lays tiles out evenly with hairline gutters. Tables, because Outlook. */
function tileRow(cells: string[]): string {
  if (cells.length === 0) return "";
  const gutter = 2;
  const width = ((100 - gutter * (cells.length - 1)) / cells.length).toFixed(2);
  const tds = cells
    .map((c) => `<td width="${width}%" valign="top">${c}</td>`)
    .join(`<td width="${gutter}%" style="font-size:0; line-height:0;">&nbsp;</td>`);
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;">
      <tr>${tds}</tr>
    </table>`;
}

function weatherTile(w: Weather): string {
  const rain =
    w.precipChance != null && w.precipChance > 0 ? ` &middot; ${w.precipChance}% rain` : "";
  // Naming the city every day is what makes it trustworthy on the day it
  // changes — a silent switch would just look like a wrong forecast.
  const label = w.travelling ? `${w.place} · travelling` : w.place;
  return tile(
    label,
    `${w.high}° / ${w.low}°`,
    `${escapeHtml(w.summary)}${rain}`
  );
}

/** Weather, revenue, contribution. Gross profit lives in the P&L, not up here. */
function topRow(weather: Weather | null, fin: Financials | null): string {
  const cells: string[] = [];
  if (weather) cells.push(weatherTile(weather));
  if (fin) {
    const y = fin.yesterday;
    const p = fin.prior;
    cells.push(
      tile(
        "Revenue",
        money(y.revenue),
        `${deltaChip(y.revenue, p?.revenue ?? null)} vs prior`
      )
    );
    cells.push(
      tile(
        "Contribution",
        money(y.contributionMargin),
        `${deltaChip(y.contributionMargin, p?.contributionMargin ?? null)} vs prior`
      )
    );
  }
  return tileRow(cells);
}

/* ──────────────────────────────────────────────────────────────── */
/* P&L card                                                          */
/* ──────────────────────────────────────────────────────────────── */

function plRow(
  label: string,
  amount: string,
  swatch: string | null,
  opts: { bold?: boolean; rule?: boolean } = {}
): string {
  const weight = opts.bold ? 700 : 500;
  const color = opts.bold ? INK : MUTED;
  const border = opts.rule ? `border-top:1px solid ${LINE};` : "";
  const dot = swatch
    ? `<span style="display:inline-block; width:9px; height:9px; border-radius:2px; background:${swatch}; vertical-align:middle;">&nbsp;</span>&nbsp;&nbsp;`
    : "";
  return `
    <tr>
      <td style="${border} padding:6px 0 5px; font-family:${FONT}; font-size:14px; font-weight:${weight}; color:${color};">${dot}${escapeHtml(
        label
      )}</td>
      <td align="right" style="${border} padding:6px 0 5px; font-family:${FONT}; font-size:14px; font-weight:${
        opts.bold ? 700 : 600
      }; color:${INK}; white-space:nowrap;">${escapeHtml(amount)}</td>
    </tr>`;
}

/**
 * Proportional bar: what share of revenue each line consumed.
 *
 * On a loss day spend exceeds revenue, so the raw shares total more than 100%
 * and the cells would overflow the width. When that happens the bar switches to
 * showing the split of total spend instead, with no margin segment — which is
 * the honest picture: it was all cost.
 */
function costBar(day: DayFinancials): string {
  const base = day.revenue > 0 ? day.revenue : 0;
  if (base === 0) return "";
  const rawCogs = (day.cogs / base) * 100;
  const rawAd = (day.adSpend / base) * 100;
  const overspent = rawCogs + rawAd > 100;
  const scale = overspent ? 100 / (rawCogs + rawAd) : 1;
  const cogs = Math.max(0, rawCogs * scale);
  const ad = Math.max(0, rawAd * scale);
  const margin = overspent ? 0 : Math.max(0, 100 - cogs - ad);

  const cell = (w: number, c: string) =>
    w <= 0
      ? ""
      : `<td width="${w.toFixed(2)}%" style="background:${c}; font-size:0; line-height:0; height:8px;">&nbsp;</td>`;

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 11px; border-radius:4px; overflow:hidden;">
      <tr style="height:8px;">
        ${cell(cogs, C_COGS)}${cell(ad, C_AD)}${cell(margin, C_MARGIN)}
      </tr>
    </table>`;
}

function plCard(fin: Financials): string {
  const d = fin.yesterday;
  const marginPct = d.revenue > 0 ? (d.contributionMargin / d.revenue) * 100 : 0;
  // A loss in a green success bar reads as a win at a glance, which is exactly
  // the morning you most need to notice it.
  const barColor = d.contributionMargin < 0 ? NEG : C_MARGIN;

  return `
    <div style="${CARD_STYLE} padding:14px 15px 12px; margin:0 0 6px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
        <tr>
          <td style="font-family:${FONT}; font-size:11px; font-weight:600; letter-spacing:0.6px; text-transform:uppercase; color:${MUTED};">Trackstar P&amp;L (Yesterday)</td>
          <td align="right" style="font-family:${FONT}; font-size:12px; color:${FAINT};">${escapeHtml(
            shortDate(d.dateISO)
          )}</td>
        </tr>
      </table>

      ${costBar(d)}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${plRow("Revenue", money(d.revenue), null, { bold: true })}
        ${plRow("COGS", `-${money(d.cogs).replace("-", "")}`, C_COGS, { rule: true })}
        ${plRow("Gross profit", money(d.grossProfit), null, { rule: true, bold: true })}
        ${plRow("Ad spend", `-${money(d.adSpend).replace("-", "")}`, C_AD, { rule: true })}
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px; background:${barColor}; border-radius:8px;">
        <tr>
          <td style="padding:10px 14px; font-family:${FONT}; font-size:14px; font-weight:700; color:#FFFFFF;">Contribution margin</td>
          <td align="right" style="padding:10px 14px; font-family:${FONT}; color:#FFFFFF; white-space:nowrap;">
            <span style="font-size:19px; font-weight:700;">${escapeHtml(
              money(d.contributionMargin)
            )}</span>
            <span style="font-size:13px; font-weight:600; opacity:0.85;">&nbsp;${marginPct.toFixed(
              0
            )}%</span>
          </td>
        </tr>
      </table>
    </div>`;
}

/* ──────────────────────────────────────────────────────────────── */
/* News                                                              */
/* ──────────────────────────────────────────────────────────────── */

function renderStory(story: CuratedStory, accent: string): string {
  return `
    <div style="${CARD_STYLE} padding:12px 14px 10px; margin:0 0 7px;">
      <a href="${safeUrl(story.url)}" style="display:block; font-family:${FONT}; font-size:16px; line-height:1.35; font-weight:650; color:${INK}; text-decoration:none;">${escapeHtml(
        story.title
      )}</a>
      ${
        story.summary.trim()
          ? `<div style="margin:5px 0 0; font-family:${FONT}; font-size:14px; line-height:1.5; color:${MUTED};">${escapeHtml(
              story.summary
            )}</div>`
          : ""
      }
      <div style="margin:8px 0 0; font-family:${FONT}; font-size:12px;">
        <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:${accent}; vertical-align:middle;">&nbsp;</span>
        <span style="margin-left:6px; font-weight:600; color:${FAINT};">${escapeHtml(
          story.source
        )}</span>
        <a href="${safeUrl(story.url)}" style="margin-left:10px; font-weight:600; color:${ACCENT}; text-decoration:none;">Read &rarr;</a>
      </div>
    </div>`;
}

function renderSection(section: DigestSection): string {
  return `
    <div style="margin:0 0 16px;">
      <div style="margin:0 0 7px; font-family:${FONT}; font-size:12px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; color:${section.accent};">${escapeHtml(
        section.title
      )}</div>
      ${section.stories.map((s) => renderStory(s, section.accent)).join("")}
    </div>`;
}

/* ──────────────────────────────────────────────────────────────── */
/* Assembly                                                          */
/* ──────────────────────────────────────────────────────────────── */

/**
 * One entry in Today's Meetings. Populated later by the prep agent; the section
 * renders a placeholder until then so the slot is visible in the layout.
 */
export interface Meeting {
  /** Local time, already formatted, e.g. "9:30 AM". */
  time: string;
  title: string;
  attendees?: string;
  /** A sentence or two of what you need to know walking in. */
  context?: string;
}

export interface DailyPanel {
  weather: Weather | null;
  financials: Financials | null;
  meetings: Meeting[] | null;
}

/** Top-level divider between the report's major parts. */
function sectionHeader(title: string): string {
  return `
    <div style="margin:18px 0 9px; padding-top:12px; border-top:1px solid ${LINE};">
      <span style="font-family:${FONT}; font-size:13px; font-weight:800; letter-spacing:0.9px; text-transform:uppercase; color:${INK};">${escapeHtml(
        title
      )}</span>
    </div>`;
}

function renderMeetings(meetings: Meeting[] | null): string {
  if (!meetings) {
    return `
    <div style="${CARD_STYLE} padding:12px 14px; font-family:${FONT}; font-size:13px; color:${FAINT};">
      Meeting prep isn&rsquo;t connected yet.
    </div>`;
  }
  if (meetings.length === 0) {
    return `
    <div style="${CARD_STYLE} padding:12px 14px; font-family:${FONT}; font-size:13px; color:${MUTED};">
      Nothing on the calendar today.
    </div>`;
  }
  return meetings
    .map(
      (m) => `
    <div style="${CARD_STYLE} padding:12px 14px 10px; margin:0 0 7px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-family:${FONT}; font-size:15px; font-weight:700; line-height:1.35; color:${INK};">${escapeHtml(
            m.title
          )}</td>
          <td align="right" valign="top" style="font-family:${FONT}; font-size:12px; font-weight:600; color:${ACCENT}; white-space:nowrap; padding-left:10px;">${escapeHtml(
            m.time
          )}</td>
        </tr>
      </table>
      ${
        m.attendees
          ? `<div style="margin:4px 0 0; font-family:${FONT}; font-size:12px; color:${FAINT};">${escapeHtml(
              m.attendees
            )}</div>`
          : ""
      }
      ${
        m.context
          ? `<div style="margin:6px 0 0; font-family:${FONT}; font-size:14px; line-height:1.5; color:${MUTED};">${escapeHtml(
              m.context
            )}</div>`
          : ""
      }
    </div>`
    )
    .join("");
}

export interface RunCost {
  inputTokens: number;
  outputTokens: number;
  /** USD for this run's curation calls. */
  cost: number;
  model: string;
  degraded: boolean;
}

/**
 * Sub-cent costs read badly as "$0.0021", so show cents below a penny. The
 * monthly figure is this issue's cost × 30 — a rate, not a forecast, since a
 * busy news day costs more than a quiet one.
 */
function formatCost(run: RunCost): string {
  if (run.degraded || (run.inputTokens === 0 && run.outputTokens === 0)) {
    return "No API calls this issue — summaries came from the raw feeds.";
  }
  const each =
    run.cost < 0.01 ? `${(run.cost * 100).toFixed(2)}&cent;` : `$${run.cost.toFixed(3)}`;
  const tokens = `${run.inputTokens.toLocaleString("en-US")} in / ${run.outputTokens.toLocaleString("en-US")} out`;
  return `This issue cost ${each} &middot; ${tokens} tokens &middot; ${escapeHtml(
    run.model
  )} &middot; about $${(run.cost * 30).toFixed(2)}/mo at this rate`;
}

export function renderHtml(
  sections: DigestSection[],
  dateLabel: string,
  run: RunCost,
  panel: DailyPanel
): string {
  const news = sections.length
    ? sections.map(renderSection).join("")
    : `<div style="${CARD_STYLE} padding:18px; font-family:${FONT}; font-size:14px; color:${MUTED};">Quiet news day — nothing in the feeds worth your time.</div>`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Flickman Daily Report</title>
</head>
<body style="margin:0; padding:20px 12px; background:${PAGE};">
  <div style="max-width:600px; margin:0 auto;">

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;">
      <tr>
        <td>
          <div style="font-family:${FONT}; font-size:21px; font-weight:750; letter-spacing:-0.4px; color:${INK};">Flickman Daily Report</div>
          <div style="margin-top:3px; font-family:${FONT}; font-size:13px; color:${MUTED};">${escapeHtml(
            dateLabel
          )}</div>
        </td>
        <td align="right" valign="top">
          <div style="width:26px; height:5px; border-radius:3px; background:${ACCENT}; font-size:0; line-height:0;">&nbsp;</div>
        </td>
      </tr>
    </table>

    ${topRow(panel.weather, panel.financials)}
    ${panel.financials ? plCard(panel.financials) : ""}

    ${sectionHeader("Today's Meetings")}
    ${renderMeetings(panel.meetings)}

    ${sectionHeader("News")}
    ${news}

    <div style="border-top:1px solid ${LINE}; padding-top:12px; margin-top:14px;">
      <div style="font-family:${FONT}; font-size:12px; line-height:1.6; color:${FAINT};">
        Auto-generated from RSS. Summaries are written by AI and can be wrong — click through before you rely on one.
      </div>
      <div style="margin-top:6px; font-family:${FONT}; font-size:11px; line-height:1.6; color:${FAINT};">
        ${formatCost(run)}
      </div>
    </div>

  </div>
</body></html>`;
}

export function renderText(
  sections: DigestSection[],
  dateLabel: string,
  run: RunCost,
  panel: DailyPanel
): string {
  const lines: string[] = [`FLICKMAN DAILY REPORT — ${dateLabel}`, ""];

  if (panel.weather) {
    const w = panel.weather;
    const rain =
      w.precipChance != null && w.precipChance > 0 ? ` (${w.precipChance}% rain)` : "";
    lines.push(
      `Weather in ${w.place}${w.travelling ? " (travelling)" : ""}: ${w.high}/${w.low}F — ${w.summary}${rain}`,
      ""
    );
  }

  if (panel.financials) {
    const d = panel.financials.yesterday;
    const marginPct = d.revenue > 0 ? (d.contributionMargin / d.revenue) * 100 : 0;
    lines.push(
      `TRACKSTAR P&L — YESTERDAY (${shortDate(d.dateISO)})`,
      `  Revenue              ${money(d.revenue)}`,
      `  COGS                -${money(d.cogs).replace("-", "")}`,
      `  Gross profit         ${money(d.grossProfit)}`,
      `  Ad spend            -${money(d.adSpend).replace("-", "")}`,
      `  Contribution margin  ${money(d.contributionMargin)} (${marginPct.toFixed(0)}%)`,
      ""
    );
  }

  lines.push("TODAY'S MEETINGS", "");
  if (!panel.meetings) lines.push("Meeting prep isn't connected yet.", "");
  else if (panel.meetings.length === 0) lines.push("Nothing on the calendar today.", "");
  else {
    for (const m of panel.meetings) {
      lines.push(`${m.time}  ${m.title}`);
      if (m.attendees) lines.push(`  ${m.attendees}`);
      if (m.context) lines.push(`  ${m.context}`);
      lines.push("");
    }
  }

  lines.push("NEWS", "");
  if (!sections.length) {
    lines.push("Quiet news day — nothing in the feeds worth your time.");
  } else {
    for (const section of sections) {
      lines.push(section.title.toUpperCase(), "");
      for (const s of section.stories) {
        lines.push(s.title, s.summary, `${s.source} — ${s.url}`, "");
      }
    }
  }

  lines.push(
    "Auto-generated from RSS. Summaries are written by AI and can be wrong.",
    formatCost(run).replace(/&cent;/g, "c").replace(/&middot;/g, "·")
  );
  return lines.join("\n");
}

export function buildSections(
  curated: Record<string, CuratedStory[]>
): DigestSection[] {
  return SECTIONS.filter((s) => (curated[s.id] ?? []).length > 0).map((s) => ({
    title: s.title,
    blurb: s.blurb,
    accent: s.accent,
    accentInk: s.accentInk,
    stories: curated[s.id],
  }));
}

/**
 * Env:
 *   RESEND_API_KEY   required
 *   DIGEST_FROM_EMAIL  defaults to the shared Resend from-address
 *   DIGEST_TO_EMAIL    defaults to BOOKING_NOTIFY_EMAIL, then matt@flickmanmedia.com
 */
export async function sendDigest(opts: {
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set");

  const from =
    process.env.DIGEST_FROM_EMAIL ??
    process.env.RESEND_FROM_EMAIL ??
    "The Daily <onboarding@resend.dev>";
  const to =
    process.env.DIGEST_TO_EMAIL ??
    process.env.BOOKING_NOTIFY_EMAIL ??
    "matt@flickmanmedia.com";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: opts.subject, html: opts.html, text: opts.text }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 200)}`);
  }
}
