import type { CuratedStory } from "./curate";
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
/* Minecraft theme, translated for email                             */
/* ──────────────────────────────────────────────────────────────── */

/*
 * The site gets its look from globals.css: the Press Start 2P pixel font,
 * `.block-border`'s inset bevels, and the @theme palette. Email can't have most
 * of that — Gmail strips <style> blocks and @font-face, and Outlook ignores
 * inset box-shadow — so this rebuilds the same look from parts every client
 * renders: solid chunky borders, a hard offset shadow for pixel depth, and
 * flat palette colors. Apple Mail and iOS pick up the real pixel font from the
 * <link> below; everywhere else falls back to monospace, which still reads
 * retro rather than broken.
 */

const COAL = "#2C2C2C";
const CREAM = "#FFF8F0";
const SKY = "#87CEEB";
const STONE = "#7F8C8D";
const GRASS = "#5D9C30";
const GRASS_LIGHT = "#6AAF35";
const DIRT = "#8B6914";
const DIRT_DARK = "#6B4F0E";

const PIXEL = "'Press Start 2P', 'Courier New', Courier, monospace";
const BODY =
  "Inter, ui-sans-serif, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** The chunky outline + hard drop shadow that stands in for `.block-border`. */
const BLOCK = `border:3px solid ${COAL}; box-shadow:4px 4px 0 ${COAL};`;

function renderStory(story: CuratedStory, accent: string): string {
  return `
    <div style="background:${CREAM}; ${BLOCK} padding:16px 16px 14px; margin:0 0 16px;">
      <a href="${safeUrl(story.url)}" style="display:block; font-family:${BODY}; font-size:17px; line-height:1.35; font-weight:700; color:${COAL}; text-decoration:none;">${escapeHtml(
        story.title
      )}</a>
      ${
        // Some feed items (job listings especially) carry no description at
        // all. An empty div just leaves a gap in the card.
        story.summary.trim()
          ? `<div style="margin:8px 0 0; font-family:${BODY}; font-size:15px; line-height:1.55; color:rgba(44,44,44,0.78);">${escapeHtml(
              story.summary
            )}</div>`
          : ""
      }
      <div style="margin:12px 0 0;">
        <span style="display:inline-block; background:${accent}; border:2px solid ${COAL}; padding:3px 6px; font-family:${PIXEL}; font-size:8px; line-height:1.5; color:${COAL};">${escapeHtml(
          story.source.toUpperCase()
        )}</span>
        <a href="${safeUrl(story.url)}" style="font-family:${BODY}; font-size:12px; font-weight:600; color:${STONE}; text-decoration:underline; margin-left:8px;">Read &rarr;</a>
      </div>
    </div>`;
}

function renderSection(section: DigestSection): string {
  return `
    <div style="margin:0 0 30px;">
      <div style="margin-bottom:14px;">
        <span style="display:inline-block; background:${section.accent}; border:3px solid ${COAL}; box-shadow:3px 3px 0 ${COAL}; padding:8px 10px; font-family:${PIXEL}; font-size:10px; line-height:1.5; color:${section.accentInk};">${escapeHtml(
          section.title.toUpperCase()
        )}</span>
      </div>
      ${section.stories.map((s) => renderStory(s, section.accent)).join("")}
    </div>`;
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
    run.cost < 0.01
      ? `${(run.cost * 100).toFixed(2)}&cent;`
      : `$${run.cost.toFixed(3)}`;
  const monthly = run.cost * 30;
  const tokens = `${run.inputTokens.toLocaleString("en-US")} in / ${run.outputTokens.toLocaleString("en-US")} out`;
  return `This issue cost ${each} &middot; ${tokens} tokens &middot; ${escapeHtml(
    run.model
  )} &middot; about $${monthly.toFixed(2)}/mo at this rate`;
}

export function renderHtml(
  sections: DigestSection[],
  dateLabel: string,
  run: RunCost
): string {
  const body = sections.length
    ? sections.map(renderSection).join("")
    : `<div style="background:${CREAM}; ${BLOCK} padding:18px; font-family:${BODY}; font-size:15px; color:${COAL};">Quiet day. Nothing in the feeds worth mining.</div>`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <title>The Daily</title>
</head>
<body style="margin:0; padding:24px 12px; background:${SKY};">
  <div style="max-width:580px; margin:0 auto;">

    <!-- Grass block: green cap over dirt, same as the site's .grass-top -->
    <div style="border:3px solid ${COAL}; box-shadow:5px 5px 0 ${COAL};">
      <div style="background:${GRASS_LIGHT}; border-bottom:4px solid ${GRASS}; height:14px; line-height:14px; font-size:0;">&nbsp;</div>
      <div style="background:${DIRT}; border-top:3px solid ${DIRT_DARK}; padding:20px 20px 18px;">
        <div style="font-family:${PIXEL}; font-size:19px; line-height:1.45; color:#FFFFFF;">THE DAILY</div>
        <div style="margin-top:10px; font-family:${PIXEL}; font-size:9px; line-height:1.6; color:rgba(255,255,255,0.82);">${escapeHtml(
          dateLabel.toUpperCase()
        )}</div>
      </div>
    </div>

    <div style="height:26px; font-size:0;">&nbsp;</div>

    ${body}

    <div style="background:${STONE}; border:3px solid ${COAL}; box-shadow:4px 4px 0 ${COAL}; padding:14px 16px;">
      <div style="font-family:${PIXEL}; font-size:8px; line-height:1.9; color:#FFFFFF;">AUTO-GENERATED FROM RSS</div>
      <div style="margin-top:8px; font-family:${BODY}; font-size:12px; line-height:1.6; color:rgba(255,255,255,0.9);">
        Summaries are written by AI and can be wrong. Click through before you rely on one.
      </div>
      <div style="margin-top:10px; padding-top:9px; border-top:2px solid rgba(255,255,255,0.28); font-family:${BODY}; font-size:11px; line-height:1.6; color:rgba(255,255,255,0.82);">
        ${formatCost(run)}
      </div>
    </div>

    <div style="height:20px; font-size:0;">&nbsp;</div>
  </div>
</body></html>`;
}

export function renderText(
  sections: DigestSection[],
  dateLabel: string,
  run: RunCost
): string {
  const costLine = formatCost(run).replace(/&cent;/g, "c").replace(/&middot;/g, "·");
  if (!sections.length) {
    return `THE DAILY — ${dateLabel}\n\nQuiet day. Nothing in the feeds worth mining.\n\n${costLine}`;
  }
  const blocks = sections.map((section) => {
    const stories = section.stories
      .map((s) => `${s.title}\n${s.summary}\n${s.source} — ${s.url}`)
      .join("\n\n");
    return `[ ${section.title.toUpperCase()} ]\n\n${stories}`;
  });
  return `THE DAILY — ${dateLabel}\n\n${blocks.join("\n\n\n")}\n\nAuto-generated from RSS. Summaries are written by AI and can be wrong.\n${costLine}`;
}

/* ──────────────────────────────────────────────────────────────── */
/* Sending                                                           */
/* ──────────────────────────────────────────────────────────────── */

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
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject: opts.subject, html: opts.html, text: opts.text }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 200)}`);
  }
}
