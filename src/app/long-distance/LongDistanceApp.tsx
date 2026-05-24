"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { tokens, type } from "./lib/design";
import { coordsFor, continentPathStrings, project } from "./lib/geo";

const c = tokens.color;
const FONT = tokens.fontFamily;

/* ──────────────────────────────────────────────────────────────── */
/* Storage                                                          */
/* ──────────────────────────────────────────────────────────────── */
const SETTINGS_KEY = "ldl-settings:v1";

type Settings = {
  yourName: string;
  partnerName: string;
  yourTimezone: string;
  partnerTimezone: string;
  nextVisitISO: string;
  /** When the current "wait" started — used to fill the progress bar. */
  waitStartISO?: string;
};

function loadSettings(): Settings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Settings;
  } catch {
    return null;
  }
}

function saveSettings(s: Settings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {}
}

function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

const TIMEZONE_OPTIONS = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "America/Honolulu",
  "America/Toronto",
  "America/Vancouver",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Amsterdam",
  "Europe/Stockholm",
  "Europe/Athens",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
];

/* ──────────────────────────────────────────────────────────────── */
/* Root                                                              */
/* ──────────────────────────────────────────────────────────────── */

export default function LongDistanceApp() {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setMounted(true);
  }, []);

  const applySettings = useCallback(
    (s: Settings) => {
      // If the next-visit date changed (or there's no wait anchor yet),
      // reset the progress bar's start point to "right now".
      const next: Settings = { ...s };
      const visitChanged = !settings || settings.nextVisitISO !== s.nextVisitISO;
      if (visitChanged || !s.waitStartISO) {
        next.waitStartISO = new Date().toISOString();
      } else {
        next.waitStartISO = s.waitStartISO;
      }
      setSettings(next);
      saveSettings(next);
      setEditing(false);
    },
    [settings]
  );

  if (!mounted) {
    return (
      <div
        style={{ minHeight: "100vh", background: c.canvas, fontFamily: FONT }}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: c.canvas,
        color: c.ink,
        fontFamily: FONT,
        paddingTop: "max(env(safe-area-inset-top), 20px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px" }}>
        {settings && !editing && (
          <MainView settings={settings} onEdit={() => setEditing(true)} />
        )}

        {(!settings || editing) && (
          <Onboarding
            existing={settings}
            onCancel={settings ? () => setEditing(false) : undefined}
            onSave={applySettings}
          />
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Main view — compact top + bento daily view + resources           */
/* ──────────────────────────────────────────────────────────────── */

function MainView({
  settings,
  onEdit,
}: {
  settings: Settings;
  onEdit: () => void;
}) {
  return (
    <main>
      <CompactTop settings={settings} />
      <DailyViewSection />
      <ResourcesSection />
      <Footer onEdit={onEdit} />
    </main>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Compact top: title → progress bar → map + times                  */
/* ──────────────────────────────────────────────────────────────── */

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function CompactTop({ settings }: { settings: Settings }) {
  return (
    <section style={{ paddingTop: 4 }}>
      <h2
        style={{
          ...type.titleLg,
          color: c.ink,
          margin: "0 0 16px",
          fontWeight: 500,
          letterSpacing: -0.5,
        }}
      >
        Long Distance Lovers
      </h2>

      <VisitProgress settings={settings} />

      <DualTimeMap settings={settings} />
    </section>
  );
}

function VisitProgress({ settings }: { settings: Settings }) {
  const now = useNow(60_000); // minute granularity is enough for the bar
  const visit = new Date(settings.nextVisitISO).getTime();
  const start =
    settings.waitStartISO != null
      ? new Date(settings.waitStartISO).getTime()
      : Date.now() - 30 * 86_400_000;

  const totalMs = Math.max(1, visit - start);
  const elapsed = Math.max(0, Math.min(totalMs, now - start));
  const pct = (elapsed / totalMs) * 100;
  const daysLeft = Math.max(0, Math.ceil((visit - now) / 86_400_000));
  const reunited = visit - now <= 0;

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <div style={{ ...type.captionUppercase, color: c.muted }}>
          Time till next visit
        </div>
        <div
          style={{
            ...type.caption,
            color: c.ink,
            fontWeight: 600,
          }}
        >
          {reunited ? "Together now ♥" : `${daysLeft} ${daysLeft === 1 ? "day" : "days"}`}
        </div>
      </div>

      <div
        style={{
          height: 8,
          background: c.surfaceCard,
          borderRadius: tokens.radius.pill,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${pct}%`,
            background: c.brandPink,
            borderRadius: tokens.radius.pill,
            transition: "width 800ms ease",
          }}
        />
      </div>
    </div>
  );
}

function DualTimeMap({ settings }: { settings: Settings }) {
  const now = useNow(1000);
  const yourTime = formatTime(now, settings.yourTimezone);
  const partnerTime = formatTime(now, settings.partnerTimezone);
  const ahead = describeAhead(settings);

  return (
    <section
      style={{
        background: c.surfaceCard,
        borderRadius: tokens.radius.lg,
        padding: 16,
        marginBottom: 24,
      }}
    >
      <MiniWorldMap
        youCoords={coordsFor(settings.yourTimezone)}
        partnerCoords={coordsFor(settings.partnerTimezone)}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginTop: 12,
        }}
      >
        <TimeCol label={settings.yourName} time={yourTime.time} city={yourTime.city} />
        <TimeCol
          label={settings.partnerName}
          time={partnerTime.time}
          city={partnerTime.city}
          align="right"
        />
      </div>

      {ahead && (
        <div
          style={{
            ...type.caption,
            color: c.muted,
            textAlign: "center",
            marginTop: 10,
            paddingTop: 10,
            borderTop: `1px solid ${c.hairline}`,
          }}
        >
          {ahead}
        </div>
      )}
    </section>
  );
}

function TimeCol({
  label,
  time,
  city,
  align = "left",
}: {
  label: string;
  time: string;
  city: string;
  align?: "left" | "right";
}) {
  return (
    <div style={{ textAlign: align }}>
      <div style={{ ...type.captionUppercase, color: c.muted }}>{label}</div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: -0.6,
          color: c.ink,
          margin: "2px 0",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {time}
      </div>
      <div style={{ ...type.bodySm, color: c.muted }}>{city}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Mini world map                                                    */
/* ──────────────────────────────────────────────────────────────── */

function MiniWorldMap({
  youCoords,
  partnerCoords,
}: {
  youCoords: [number, number];
  partnerCoords: [number, number];
}) {
  const a = project(youCoords[0], youCoords[1]);
  const b = project(partnerCoords[0], partnerCoords[1]);
  const paths = useMemo(() => continentPathStrings(), []);

  // Curve the connecting line slightly for visual interest (great-circle vibe).
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 18 };
  const curve = `M ${a.x.toFixed(1)},${a.y.toFixed(1)} Q ${mid.x.toFixed(1)},${mid.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;

  return (
    <div
      style={{
        background: c.canvas,
        borderRadius: tokens.radius.md,
        padding: "12px 8px",
      }}
    >
      <svg
        viewBox="0 0 360 180"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "auto", display: "block" }}
        aria-hidden
      >
        {/* Continents */}
        <g fill={c.surfaceStrong} stroke="none">
          {paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* Connecting curve */}
        <path
          d={curve}
          fill="none"
          stroke={c.brandPink}
          strokeWidth={1}
          strokeDasharray="2,2"
          opacity={0.7}
        />

        {/* Pins */}
        <Pin x={a.x} y={a.y} />
        <Pin x={b.x} y={b.y} />
      </svg>
    </div>
  );
}

function Pin({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {/* Soft glow */}
      <circle cx={x} cy={y} r={6} fill={c.brandPink} opacity={0.18} />
      {/* Solid dot with ink ring */}
      <circle cx={x} cy={y} r={3.2} fill={c.brandPink} stroke={c.ink} strokeWidth={0.6} />
    </g>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Daily view — bento cards                                         */
/* ──────────────────────────────────────────────────────────────── */

type CardVariant = "pink" | "lavender" | "peach" | "teal" | "ochre" | "cream";

const BENTO: Array<{
  variant: CardVariant;
  span?: "wide";
  problem: string;
  solution: string;
  cta?: string;
}> = [
  {
    variant: "pink",
    problem: "Feels like you're maintaining but not growing the relationship?",
    solution: "Ask a deep question of the day.",
    cta: "Get a question →",
  },
  {
    variant: "lavender",
    problem: "Feel disconnected from his / her day-to-day?",
    solution: "Send a morning voice memo with what you're up to.",
    cta: "Record one →",
  },
  {
    variant: "peach",
    problem: "Having trouble scheduling time for calls?",
    solution: "Find the times that work best for both of you.",
    cta: "Find a time →",
  },
  {
    variant: "teal",
    span: "wide",
    problem: "Miss the excitement of a date night?",
    solution: "Plan a virtual date night together.",
    cta: "Pick a date →",
  },
  {
    variant: "ochre",
    span: "wide",
    problem: "Travel expenses adding up?",
    solution:
      "Track flights to each other's cities and get pinged when they're cheap.",
    cta: "Watch a route →",
  },
];

function DailyViewSection() {
  return (
    <section style={{ paddingTop: 16, paddingBottom: 16 }}>
      <div style={{ marginBottom: 24 }}>
        <div
          style={{ ...type.captionUppercase, color: c.muted, marginBottom: 10 }}
        >
          Daily view
        </div>
        <h2
          style={{
            ...type.displaySm,
            color: c.ink,
            fontWeight: 500,
            margin: 0,
            maxWidth: 640,
          }}
        >
          Most long-distance relationships die because of communication issues.
          That&rsquo;s not going to happen to you.
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {BENTO.map((card, i) => (
          <BentoCard
            key={i}
            variant={card.variant}
            problem={card.problem}
            solution={card.solution}
            cta={card.cta}
            span={card.span}
          />
        ))}
      </div>
    </section>
  );
}

function BentoCard({
  variant,
  problem,
  solution,
  cta,
  span,
}: {
  variant: CardVariant;
  problem: string;
  solution: string;
  cta?: string;
  span?: "wide";
}) {
  const dark = variant === "pink" || variant === "teal";
  const bg = {
    pink: c.brandPink,
    lavender: c.brandLavender,
    peach: c.brandPeach,
    teal: c.brandTeal,
    ochre: c.brandOchre,
    cream: c.surfaceCard,
  }[variant];
  const fg = dark ? c.onDark : c.ink;
  const muted = dark ? "rgba(255,255,255,0.78)" : c.body;

  return (
    <article
      style={{
        background: bg,
        color: fg,
        borderRadius: tokens.radius.xl,
        padding: 20,
        gridColumn: span === "wide" ? "1 / -1" : undefined,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: 180,
      }}
    >
      <p
        style={{
          ...type.bodySm,
          color: muted,
          margin: 0,
          fontStyle: "italic",
        }}
      >
        {problem}
      </p>
      <h3
        style={{
          ...type.titleMd,
          color: fg,
          margin: 0,
          letterSpacing: -0.2,
          fontWeight: 600,
        }}
      >
        {solution}
      </h3>
      {cta && (
        <div style={{ marginTop: "auto" }}>
          <button
            onClick={() => alert("Coming soon!")}
            style={{
              ...type.button,
              background: dark ? c.canvas : c.primary,
              color: dark ? c.ink : c.onPrimary,
              border: "none",
              borderRadius: tokens.radius.md,
              padding: "10px 16px",
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            {cta}
          </button>
        </div>
      )}
    </article>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Resources                                                         */
/* ──────────────────────────────────────────────────────────────── */

const RESOURCES = [
  {
    icon: "📉",
    title: "Why most long-distance relationships fail",
    source: "Article · 6 min read",
    href: "#",
  },
  {
    icon: "🧩",
    title: "The biggest problems in long-distance relationships",
    source: "Article · 8 min read",
    href: "#",
  },
  {
    icon: "💪",
    title: "How successful long-distance relationships got through it",
    source: "Video · 12 min",
    href: "#",
  },
];

function ResourcesSection() {
  return (
    <section style={{ paddingTop: 16, paddingBottom: 16 }}>
      <div style={{ marginBottom: 18 }}>
        <div
          style={{ ...type.captionUppercase, color: c.muted, marginBottom: 10 }}
        >
          Resources
        </div>
        <h2
          style={{
            ...type.displaySm,
            color: c.ink,
            fontWeight: 500,
            margin: 0,
            letterSpacing: -0.4,
          }}
        >
          Learn from the ones who made it.
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {RESOURCES.map((r, i) => (
          <a
            key={i}
            href={r.href}
            style={{
              background: c.surfaceCard,
              border: `1px solid ${c.hairline}`,
              borderRadius: tokens.radius.lg,
              padding: 20,
              textDecoration: "none",
              color: c.ink,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              minHeight: 150,
            }}
          >
            <div style={{ fontSize: 28 }}>{r.icon}</div>
            <h3
              style={{
                ...type.titleMd,
                color: c.ink,
                margin: 0,
                letterSpacing: -0.2,
              }}
            >
              {r.title}
            </h3>
            <div
              style={{
                ...type.bodySm,
                color: c.muted,
                marginTop: "auto",
              }}
            >
              {r.source} →
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Footer (settings icon + tagline)                                  */
/* ──────────────────────────────────────────────────────────────── */

function Footer({ onEdit }: { onEdit: () => void }) {
  return (
    <footer
      style={{
        paddingTop: 48,
        paddingBottom: 16,
        textAlign: "center",
        borderTop: `1px solid ${c.hairline}`,
        marginTop: 32,
      }}
    >
      <button
        onClick={onEdit}
        aria-label="Settings"
        title="Settings"
        style={{
          background: "transparent",
          border: `1px solid ${c.hairline}`,
          borderRadius: tokens.radius.pill,
          width: 40,
          height: 40,
          cursor: "pointer",
          color: c.ink,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <GearIcon />
      </button>
      <div style={{ ...type.bodySm, color: c.muted }}>
        Long Distance Loves · from{" "}
        <a
          href="/"
          style={{ color: c.muted, textDecoration: "underline" }}
        >
          flickman.co
        </a>
      </div>
    </footer>
  );
}

function GearIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Helpers                                                           */
/* ──────────────────────────────────────────────────────────────── */

function formatTime(ts: number, tz: string): { time: string; city: string } {
  try {
    const time = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: tz,
    }).format(ts);
    const city = tz.split("/").pop()?.replace(/_/g, " ") ?? tz;
    return { time, city };
  } catch {
    return { time: "—", city: tz };
  }
}

function getOffsetMinutes(tz: string, ts: number): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(new Date(ts));
  const map: Record<string, number> = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = Number(p.value);
  const asUTC = Date.UTC(
    map.year,
    map.month - 1,
    map.day,
    map.hour === 24 ? 0 : map.hour,
    map.minute,
    map.second
  );
  return Math.round((asUTC - ts) / 60_000);
}

function describeAhead(settings: Settings): string {
  try {
    const now = Date.now();
    const yourOff = getOffsetMinutes(settings.yourTimezone, now);
    const theirOff = getOffsetMinutes(settings.partnerTimezone, now);
    const diff = theirOff - yourOff;
    if (diff === 0) return `${settings.partnerName} is in the same time zone`;
    const hours = Math.abs(diff) / 60;
    const h = hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
    const dir = diff > 0 ? "ahead" : "behind";
    return `${settings.partnerName} is ${h} hr ${dir}`;
  } catch {
    return "";
  }
}

/* ──────────────────────────────────────────────────────────────── */
/* Onboarding (same shape as before, Clay primitives)               */
/* ──────────────────────────────────────────────────────────────── */

function Onboarding({
  existing,
  onCancel,
  onSave,
}: {
  existing: Settings | null;
  onCancel?: () => void;
  onSave: (s: Settings) => void;
}) {
  const defaultTz = browserTimezone();
  const tomorrow30 = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    d.setHours(18, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  }, []);

  const [yourName, setYourName] = useState(existing?.yourName ?? "");
  const [partnerName, setPartnerName] = useState(existing?.partnerName ?? "");
  const [yourTimezone, setYourTimezone] = useState(
    existing?.yourTimezone ?? defaultTz
  );
  const [partnerTimezone, setPartnerTimezone] = useState(
    existing?.partnerTimezone ?? "Europe/London"
  );
  const [nextVisit, setNextVisit] = useState(
    existing?.nextVisitISO
      ? new Date(existing.nextVisitISO).toISOString().slice(0, 16)
      : tomorrow30
  );

  const canSave =
    yourName.trim() && partnerName.trim() && yourTimezone && partnerTimezone && nextVisit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    onSave({
      yourName: yourName.trim(),
      partnerName: partnerName.trim(),
      yourTimezone,
      partnerTimezone,
      nextVisitISO: new Date(nextVisit).toISOString(),
      waitStartISO: existing?.waitStartISO,
    });
  };

  const isFirstRun = !existing;

  return (
    <main style={{ paddingTop: 48 }}>
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            ...type.captionUppercase,
            color: c.muted,
            marginBottom: 12,
          }}
        >
          Long Distance Loves
        </div>
        <h1
          style={{
            ...type.displaySm,
            color: c.ink,
            margin: 0,
            fontWeight: 500,
          }}
        >
          {isFirstRun ? "Tell us about the two of you" : "Update the basics"}
        </h1>
        <p style={{ ...type.bodyMd, color: c.muted, margin: "8px 0 0" }}>
          {isFirstRun
            ? "Everything stays on this device for now."
            : "Saved on this device."}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <Field label="Your name">
          <Input value={yourName} onChange={setYourName} placeholder="Matt" />
        </Field>
        <Field label="Their name">
          <Input value={partnerName} onChange={setPartnerName} placeholder="Sarah" />
        </Field>
        <Field label="Your timezone">
          <Select value={yourTimezone} onChange={setYourTimezone} options={TIMEZONE_OPTIONS} />
        </Field>
        <Field label="Their timezone">
          <Select value={partnerTimezone} onChange={setPartnerTimezone} options={TIMEZONE_OPTIONS} />
        </Field>
        <Field label="Next time you'll see each other">
          <input
            type="datetime-local"
            value={nextVisit}
            onChange={(e) => setNextVisit(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          {onCancel && (
            <button type="button" onClick={onCancel} style={{ ...buttonSecondary, flex: 1 }}>
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!canSave}
            style={{
              ...buttonPrimary,
              flex: 2,
              background: canSave ? c.primary : c.primaryDisabled,
              color: canSave ? c.onPrimary : c.muted,
              cursor: canSave ? "pointer" : "not-allowed",
            }}
          >
            {isFirstRun ? "Start →" : "Save changes"}
          </button>
        </div>
      </form>
    </main>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Form primitives                                                   */
/* ──────────────────────────────────────────────────────────────── */

const inputStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: tokens.radius.md,
  border: `1px solid ${c.hairline}`,
  background: c.canvas,
  color: c.ink,
  fontSize: 16,
  fontFamily: FONT,
  height: 44,
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

const buttonPrimary: React.CSSProperties = {
  height: 44,
  padding: "0 20px",
  borderRadius: tokens.radius.md,
  background: c.primary,
  color: c.onPrimary,
  border: "none",
  ...type.button,
  fontFamily: FONT,
  cursor: "pointer",
};

const buttonSecondary: React.CSSProperties = {
  height: 44,
  padding: "0 20px",
  borderRadius: tokens.radius.md,
  background: c.canvas,
  color: c.ink,
  border: `1px solid ${c.hairline}`,
  ...type.button,
  fontFamily: FONT,
  cursor: "pointer",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ ...type.captionUppercase, color: c.muted, marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const opts = options.includes(value) ? options : [value, ...options];
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
      {opts.map((tz) => (
        <option key={tz} value={tz}>
          {tz.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}
