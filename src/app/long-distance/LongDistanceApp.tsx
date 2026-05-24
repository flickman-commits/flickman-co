"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { questionOfTheDay } from "./lib/questions";
import { tokens, type } from "./lib/design";

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

  const applySettings = useCallback((s: Settings) => {
    setSettings(s);
    saveSettings(s);
    setEditing(false);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: c.canvas,
          fontFamily: FONT,
        }}
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
        paddingTop: "max(env(safe-area-inset-top), 16px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
      }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 20px" }}>
        <TopBar onEdit={() => setEditing(true)} />

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

        <Footer />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Top bar                                                          */
/* ──────────────────────────────────────────────────────────────── */

function TopBar({ onEdit }: { onEdit: () => void }) {
  return (
    <div
      style={{
        padding: "8px 0 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <a
        href="/"
        style={{
          ...type.caption,
          color: c.muted,
          textDecoration: "none",
        }}
      >
        ← flickman.co
      </a>
      <button
        onClick={onEdit}
        style={{
          ...type.captionUppercase,
          color: c.muted,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 4,
          fontFamily: FONT,
        }}
      >
        Settings
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Onboarding                                                       */
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
            // The Clay signature: Inter at weight 500 with tight negative
            // letter-spacing as a Plain Black stand-in.
            fontWeight: 500,
          }}
        >
          {isFirstRun ? "Tell us about the two of you" : "Update the basics"}
        </h1>
        <p
          style={{
            ...type.bodyMd,
            color: c.muted,
            margin: "8px 0 0",
          }}
        >
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
            <button
              type="button"
              onClick={onCancel}
              style={{
                ...buttonSecondary,
                flex: 1,
              }}
            >
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
/* Main view                                                        */
/* ──────────────────────────────────────────────────────────────── */

function MainView({ settings, onEdit }: { settings: Settings; onEdit: () => void }) {
  return (
    <main style={{ paddingTop: 12, paddingBottom: 8 }}>
      <Hero settings={settings} />
      <TimeZonesStrip settings={settings} />
      <SectionLabel>Daily View</SectionLabel>
      {/* Cards cycle through the brand palette: pink → lavender → peach → teal */}
      <VoiceMemoCard partnerName={settings.partnerName} />
      <PartnerCalendarCard settings={settings} />
      <FaceTimeSuggestionCard settings={settings} />
      <QuestionCard partnerName={settings.partnerName} />
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button
          onClick={onEdit}
          style={{
            ...type.bodySm,
            background: "transparent",
            border: "none",
            color: c.ink,
            textDecoration: "underline",
            cursor: "pointer",
            fontFamily: FONT,
          }}
        >
          Update names, timezones, or next visit →
        </button>
      </div>
    </main>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Hero + countdown                                                 */
/* ──────────────────────────────────────────────────────────────── */

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function Hero({ settings }: { settings: Settings }) {
  const now = useNow(1000);
  const visit = new Date(settings.nextVisitISO).getTime();
  const diff = visit - now;
  const reunited = diff <= 0;

  const days = Math.max(0, Math.floor(diff / 86_400_000));
  const hours = Math.max(0, Math.floor((diff / 3_600_000) % 24));
  const mins = Math.max(0, Math.floor((diff / 60_000) % 60));
  const secs = Math.max(0, Math.floor((diff / 1000) % 60));

  const fmtVisit = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(settings.nextVisitISO));

  return (
    <section style={{ padding: "32px 0 32px" }}>
      <div
        style={{
          ...type.captionUppercase,
          color: c.muted,
          marginBottom: 14,
        }}
      >
        {settings.yourName} <span style={{ color: c.brandPink }}>♥</span>{" "}
        {settings.partnerName}
      </div>

      <div
        style={{
          ...type.captionUppercase,
          color: c.muted,
          marginBottom: 10,
        }}
      >
        {reunited ? "You're together right now" : "Next visit in"}
      </div>

      {reunited ? (
        <div
          style={{
            ...type.displayMd,
            color: c.ink,
            fontWeight: 500,
          }}
        >
          Enjoy every second. 🫶
        </div>
      ) : (
        <>
          {/* The Clay signature display: huge Inter 500 with negative letter-spacing.
              Scales down on narrow screens via clamp. */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, auto)",
              alignItems: "baseline",
              gap: "0 8px",
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: "clamp(48px, 16vw, 72px)",
              lineHeight: 1,
              letterSpacing: "-0.035em",
              color: c.ink,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <BigUnit value={days} label="d" />
            <BigSep />
            <BigUnit value={hours} label="h" />
            <BigSep />
            <BigUnit value={mins} label="m" />
            <BigSep />
            <BigUnit value={secs} label="s" />
          </div>
          <div
            style={{
              ...type.bodyMd,
              color: c.muted,
              marginTop: 14,
            }}
          >
            {fmtVisit}
          </div>
        </>
      )}
    </section>
  );
}

function BigUnit({ value, label }: { value: number; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}>
      <span>{String(value).padStart(2, "0")}</span>
      <span
        style={{
          fontSize: "0.32em",
          fontWeight: 500,
          color: c.muted,
          letterSpacing: 0,
        }}
      >
        {label}
      </span>
    </span>
  );
}

function BigSep() {
  return (
    <span style={{ color: c.mutedSoft, fontWeight: 500 }} aria-hidden>
      ·
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Timezones strip — cream card                                      */
/* ──────────────────────────────────────────────────────────────── */

function TimeZonesStrip({ settings }: { settings: Settings }) {
  const now = useNow(1000);
  const yourTime = formatTime(now, settings.yourTimezone);
  const partnerTime = formatTime(now, settings.partnerTimezone);
  const diffLabel = describeTimezoneDiff(settings.yourTimezone, settings.partnerTimezone);

  return (
    <section
      style={{
        background: c.surfaceCard,
        borderRadius: tokens.radius.lg,
        padding: "20px 20px",
        marginTop: 16,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 8,
        }}
      >
        <TimeColumn label={settings.yourName} time={yourTime.time} city={yourTime.city} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, color: c.brandPink, lineHeight: 1 }}>♥</div>
        </div>
        <TimeColumn
          label={settings.partnerName}
          time={partnerTime.time}
          city={partnerTime.city}
        />
      </div>
      {diffLabel && (
        <div
          style={{
            ...type.captionUppercase,
            color: c.muted,
            textAlign: "center",
            marginTop: 12,
            paddingTop: 12,
            borderTop: `1px solid ${c.hairline}`,
          }}
        >
          {diffLabel}
        </div>
      )}
    </section>
  );
}

function TimeColumn({ label, time, city }: { label: string; time: string; city: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          ...type.captionUppercase,
          color: c.muted,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: -1,
          color: c.ink,
          margin: "4px 0 2px",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {time}
      </div>
      <div style={{ ...type.bodySm, color: c.muted }}>{city}</div>
    </div>
  );
}

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

function describeTimezoneDiff(tzA: string, tzB: string): string {
  try {
    const now = Date.now();
    const offsetA = getOffsetMinutes(tzA, now);
    const offsetB = getOffsetMinutes(tzB, now);
    const diffMin = offsetB - offsetA;
    if (diffMin === 0) return "Same time zone";
    const hours = Math.abs(diffMin) / 60;
    const dir = diffMin > 0 ? "ahead" : "behind";
    const h = hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
    return `${h} hr ${dir}`;
  } catch {
    return "";
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

/* ──────────────────────────────────────────────────────────────── */
/* Daily-view feature cards (Clay's saturated palette)              */
/* ──────────────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        ...type.captionUppercase,
        color: c.muted,
        margin: "40px 0 12px",
      }}
    >
      {children}
    </h2>
  );
}

type CardVariant = "pink" | "lavender" | "peach" | "teal" | "ochre" | "cream";

function FeatureCard({
  variant,
  icon,
  title,
  children,
  cta,
}: {
  variant: CardVariant;
  icon: string;
  title: string;
  children: React.ReactNode;
  cta?: { label: string; href?: string; onClick?: () => void };
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
    <section
      style={{
        background: bg,
        color: fg,
        borderRadius: tokens.radius.xl,
        padding: 24,
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <h3
          style={{
            ...type.titleMd,
            color: fg,
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      <div style={{ ...type.bodyMd, color: muted }}>{children}</div>
      {cta && (
        <div style={{ marginTop: 16 }}>
          <FeatureCta dark={dark} {...cta} />
        </div>
      )}
    </section>
  );
}

function FeatureCta({
  dark,
  label,
  href,
  onClick,
}: {
  dark: boolean;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  // On dark/pink cards we invert: white button + ink text.
  // On light cards we use the standard black primary.
  const style: React.CSSProperties = dark
    ? {
        ...buttonOnColor,
      }
    : {
        ...buttonPrimary,
      };
  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        style={{
          ...style,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {label}
      </a>
    );
  }
  return (
    <button onClick={onClick} style={{ ...style, cursor: "pointer" }}>
      {label}
    </button>
  );
}

function VoiceMemoCard({ partnerName }: { partnerName: string }) {
  return (
    <FeatureCard
      variant="pink"
      icon="🎙"
      title="Send a voice memo"
      cta={{
        label: "Record a memo →",
        onClick: () =>
          alert("Recording flow coming soon — for now, drop a voice note in iMessage."),
      }}
    >
      Start the day in {partnerName}&rsquo;s ear. Tell them one tiny thing about
      your morning — what you&rsquo;re wearing, what you ate, what made you laugh.
    </FeatureCard>
  );
}

function PartnerCalendarCard({ settings }: { settings: Settings }) {
  const events = [
    { time: "9:00 AM", title: "Standup" },
    { time: "12:30 PM", title: "Lunch with Priya" },
    { time: "4:00 PM", title: "Free until evening" },
    { time: "7:00 PM", title: "Run club" },
  ];

  return (
    <FeatureCard variant="lavender" icon="📅" title={`${settings.partnerName}'s day`}>
      <div style={{ marginTop: 4 }}>
        {events.map((e, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 12,
              padding: "8px 0",
              borderBottom:
                i < events.length - 1 ? `1px solid rgba(10,10,10,0.1)` : "none",
            }}
          >
            <div
              style={{
                fontVariantNumeric: "tabular-nums",
                color: c.ink,
                fontWeight: 600,
                width: 84,
                flexShrink: 0,
                fontSize: 14,
              }}
            >
              {e.time}
            </div>
            <div style={{ color: c.ink, fontSize: 15 }}>{e.title}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          ...type.bodySm,
          color: c.ink,
          opacity: 0.6,
          marginTop: 12,
          fontStyle: "italic",
        }}
      >
        Calendar integration coming soon — connect Google/Apple Calendar to pull
        their real day.
      </div>
    </FeatureCard>
  );
}

function FaceTimeSuggestionCard({ settings }: { settings: Settings }) {
  const suggestion = useMemo(() => {
    const now = new Date();
    const candidate = new Date(now);
    candidate.setHours(now.getHours() + 4, 0, 0, 0);
    const yourFmt = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: settings.yourTimezone,
    }).format(candidate);
    const theirFmt = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: settings.partnerTimezone,
    }).format(candidate);
    return { yourFmt, theirFmt };
  }, [settings.yourTimezone, settings.partnerTimezone]);

  return (
    <FeatureCard
      variant="peach"
      icon="📞"
      title="Suggested FaceTime"
      cta={{ label: "Open FaceTime →", href: "facetime://" }}
    >
      Today at <strong style={{ color: c.ink }}>{suggestion.yourFmt}</strong> your time
      &middot; {suggestion.theirFmt} {settings.partnerName}&rsquo;s time. Both of
      you should be free and awake.
    </FeatureCard>
  );
}

function QuestionCard({ partnerName }: { partnerName: string }) {
  const [q] = useState(() => questionOfTheDay());
  return (
    <FeatureCard
      variant="teal"
      icon="💭"
      title="One deep question today"
      cta={{
        label: `Send to ${partnerName} →`,
        href: `sms:&body=${encodeURIComponent(q)}`,
      }}
    >
      <div
        style={{
          ...type.titleLg,
          color: c.onDark,
          fontWeight: 500,
          letterSpacing: -0.4,
          padding: "4px 0",
        }}
      >
        &ldquo;{q}&rdquo;
      </div>
    </FeatureCard>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Footer                                                            */
/* ──────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer
      style={{
        textAlign: "center",
        paddingTop: 48,
        paddingBottom: 16,
      }}
    >
      <div
        style={{
          ...type.displaySm,
          color: c.ink,
          fontWeight: 500,
          marginBottom: 8,
        }}
      >
        Closer than the miles say.
      </div>
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

const buttonOnColor: React.CSSProperties = {
  height: 44,
  padding: "0 20px",
  borderRadius: tokens.radius.md,
  background: c.canvas,
  color: c.ink,
  border: "none",
  ...type.button,
  fontFamily: FONT,
  cursor: "pointer",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          ...type.captionUppercase,
          color: c.muted,
          marginBottom: 6,
        }}
      >
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
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, appearance: "none" }}
    >
      {opts.map((tz) => (
        <option key={tz} value={tz}>
          {tz.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}
