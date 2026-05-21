"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { questionOfTheDay } from "./lib/questions";

/* ──────────────────────────────────────────────────────────────── */
/* Palette — warm, dusky, romantic.                                 */
/* ──────────────────────────────────────────────────────────────── */
const c = {
  bg: "#FFF3EB",
  card: "#FFFFFF",
  primary: "#E85A77",
  primaryDark: "#C9415E",
  accent: "#8E7CC3",
  heart: "#E85A77",
  ink: "#3D2E3F",
  body: "#5D4D60",
  muted: "#9A8B9D",
  mutedSoft: "#C2B5C4",
  hairline: "#F0DDD8",
  hairlineSoft: "#F8ECE6",
  surface: "#FBEEE6",
};

const FONT_DISPLAY =
  "var(--font-playfair-ldl), 'Playfair Display', 'Cormorant Garamond', Georgia, serif";
const FONT_BODY =
  "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/* ──────────────────────────────────────────────────────────────── */
/* Storage                                                          */
/* ──────────────────────────────────────────────────────────────── */
const SETTINGS_KEY = "ldl-settings:v1";

type Settings = {
  yourName: string;
  partnerName: string;
  yourTimezone: string; // IANA
  partnerTimezone: string; // IANA
  /** ISO datetime (in local time) of next planned reunion. */
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

/** A small starter list of common timezones. Expand later if needed. */
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
/* Component                                                        */
/* ──────────────────────────────────────────────────────────────── */

export default function LongDistanceApp() {
  // Client-only render: avoids any server/client mismatch with localStorage,
  // dates, timezones, or browser-detected fields.
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
    // SSR placeholder — same outer chrome so layout doesn't shift on hydrate.
    return (
      <div
        style={{
          minHeight: "100vh",
          background: c.bg,
          fontFamily: FONT_BODY,
        }}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: c.bg,
        color: c.ink,
        fontFamily: FONT_BODY,
        paddingTop: "max(env(safe-area-inset-top), 12px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
      }}
    >
      {/* Playfair Display is loaded by the server-side page wrapper via
          next/font — see page.tsx. */}

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>
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
        padding: "12px 0 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <a
        href="/"
        style={{
          fontSize: 12,
          color: c.muted,
          textDecoration: "none",
          letterSpacing: 0.3,
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        ← flickman.co
      </a>
      <button
        onClick={onEdit}
        style={{
          fontSize: 12,
          color: c.muted,
          background: "transparent",
          border: "none",
          textTransform: "uppercase",
          letterSpacing: 0.3,
          fontWeight: 600,
          cursor: "pointer",
          padding: 4,
        }}
        aria-label="Settings"
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
    return d.toISOString().slice(0, 16); // for datetime-local
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
    <main style={{ paddingTop: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 48 }}>💌</div>
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 32,
            fontWeight: 600,
            color: c.ink,
            margin: "8px 0 4px",
            letterSpacing: -0.3,
          }}
        >
          {isFirstRun ? "Tell us about the two of you" : "Update the basics"}
        </h1>
        <p style={{ color: c.muted, fontSize: 14, margin: 0 }}>
          {isFirstRun
            ? "Everything stays on this device for now."
            : "Saved on this device."}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        <Field label="Your name">
          <Input value={yourName} onChange={setYourName} placeholder="Matt" />
        </Field>
        <Field label="Their name">
          <Input
            value={partnerName}
            onChange={setPartnerName}
            placeholder="Sarah"
          />
        </Field>
        <Field label="Your timezone">
          <Select value={yourTimezone} onChange={setYourTimezone} options={TIMEZONE_OPTIONS} />
        </Field>
        <Field label="Their timezone">
          <Select
            value={partnerTimezone}
            onChange={setPartnerTimezone}
            options={TIMEZONE_OPTIONS}
          />
        </Field>
        <Field label="Next time you'll see each other">
          <input
            type="datetime-local"
            value={nextVisit}
            onChange={(e) => setNextVisit(e.target.value)}
            style={{
              ...inputStyle,
              width: "100%",
            }}
          />
        </Field>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                ...buttonBase,
                background: c.card,
                color: c.ink,
                border: `1px solid ${c.hairline}`,
              }}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!canSave}
            style={{
              ...buttonBase,
              flex: 2,
              background: canSave ? c.primary : c.mutedSoft,
              color: "#fff",
              border: "none",
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
    <main style={{ paddingTop: 8, paddingBottom: 8 }}>
      <Hero settings={settings} />
      <TimeZonesStrip settings={settings} />
      <SectionHeading>Daily View</SectionHeading>
      <VoiceMemoCard partnerName={settings.partnerName} />
      <PartnerCalendarCard settings={settings} />
      <FaceTimeSuggestionCard settings={settings} />
      <QuestionCard partnerName={settings.partnerName} />
      <div style={{ textAlign: "center", marginTop: 28 }}>
        <button
          onClick={onEdit}
          style={{
            background: "transparent",
            border: "none",
            color: c.muted,
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: 13,
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
    <section
      style={{
        textAlign: "center",
        padding: "28px 0 16px",
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 26,
          fontWeight: 600,
          color: c.ink,
          letterSpacing: -0.3,
          marginBottom: 4,
        }}
      >
        {settings.yourName} <span style={{ color: c.heart }}>♥</span>{" "}
        {settings.partnerName}
      </div>
      <div
        style={{
          fontSize: 12,
          color: c.muted,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          fontWeight: 700,
          marginTop: 14,
        }}
      >
        {reunited ? "You're together right now" : "See each other in"}
      </div>

      {reunited ? (
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 36,
            fontWeight: 600,
            color: c.primary,
            marginTop: 6,
            fontStyle: "italic",
          }}
        >
          Enjoy every second. 🫶
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
              marginTop: 14,
              maxWidth: 360,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <TimeBox value={days} label="days" />
            <TimeBox value={hours} label="hrs" />
            <TimeBox value={mins} label="min" />
            <TimeBox value={secs} label="sec" />
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 13,
              color: c.muted,
              fontFamily: FONT_BODY,
            }}
          >
            {fmtVisit}
          </div>
        </>
      )}
    </section>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div
      style={{
        background: c.card,
        border: `1px solid ${c.hairline}`,
        borderRadius: 14,
        padding: "12px 6px 10px",
        boxShadow: "0 2px 10px rgba(232,90,119,0.06)",
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 28,
          fontWeight: 700,
          color: c.ink,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <div
        style={{
          fontSize: 10,
          color: c.muted,
          textTransform: "uppercase",
          letterSpacing: 1,
          marginTop: 4,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Timezones strip                                                  */
/* ──────────────────────────────────────────────────────────────── */

function TimeZonesStrip({ settings }: { settings: Settings }) {
  const now = useNow(1000);
  const yourTime = formatTime(now, settings.yourTimezone);
  const partnerTime = formatTime(now, settings.partnerTimezone);
  const diffLabel = describeTimezoneDiff(settings.yourTimezone, settings.partnerTimezone);

  return (
    <section
      style={{
        background: c.card,
        border: `1px solid ${c.hairline}`,
        borderRadius: 18,
        padding: "16px 18px",
        marginTop: 16,
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: 8,
      }}
    >
      <TimeColumn label={settings.yourName} time={yourTime.time} city={yourTime.city} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 18, color: c.heart, lineHeight: 1 }}>♥</div>
        <div
          style={{
            fontSize: 9,
            color: c.muted,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginTop: 4,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {diffLabel}
        </div>
      </div>
      <TimeColumn
        label={settings.partnerName}
        time={partnerTime.time}
        city={partnerTime.city}
      />
    </section>
  );
}

function TimeColumn({ label, time, city }: { label: string; time: string; city: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: 10,
          color: c.muted,
          textTransform: "uppercase",
          letterSpacing: 1,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 24,
          fontWeight: 700,
          color: c.ink,
          margin: "2px 0",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {time}
      </div>
      <div style={{ fontSize: 11, color: c.muted }}>{city}</div>
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
    if (diffMin === 0) return "Same time";
    const hours = Math.abs(diffMin) / 60;
    const dir = diffMin > 0 ? "ahead" : "behind";
    const h = hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
    return `${h} hr ${dir}`;
  } catch {
    return "";
  }
}

/** Offset of `tz` from UTC in minutes (positive = ahead of UTC). */
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
/* Daily view cards                                                 */
/* ──────────────────────────────────────────────────────────────── */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 11,
        color: c.muted,
        textTransform: "uppercase",
        letterSpacing: 2,
        fontWeight: 700,
        margin: "32px 4px 12px",
      }}
    >
      {children}
    </h2>
  );
}

function Card({
  icon,
  title,
  children,
  cta,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
  cta?: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <section
      style={{
        background: c.card,
        border: `1px solid ${c.hairline}`,
        borderRadius: 18,
        padding: "18px 18px 18px",
        marginBottom: 12,
        boxShadow: "0 2px 12px rgba(232,90,119,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <h3
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 19,
            fontWeight: 600,
            color: c.ink,
            margin: 0,
            letterSpacing: -0.2,
          }}
        >
          {title}
        </h3>
      </div>
      <div style={{ color: c.body, fontSize: 14, lineHeight: 1.5 }}>{children}</div>
      {cta &&
        (cta.href ? (
          <a
            href={cta.href}
            target={cta.href.startsWith("http") ? "_blank" : undefined}
            rel={cta.href.startsWith("http") ? "noopener noreferrer" : undefined}
            style={{ ...pillCta }}
          >
            {cta.label}
          </a>
        ) : (
          <button onClick={cta.onClick} style={{ ...pillCta, border: "none", cursor: "pointer" }}>
            {cta.label}
          </button>
        ))}
    </section>
  );
}

function VoiceMemoCard({ partnerName }: { partnerName: string }) {
  return (
    <Card
      icon="🎙"
      title="Send a voice memo"
      cta={{ label: "Record a memo →", onClick: () => alert("Recording flow coming soon — for now, drop a voice note in iMessage.") }}
    >
      Start the day in {partnerName}&rsquo;s ear. Tell them one tiny thing about
      your morning — what you&rsquo;re wearing, what you ate, what made you laugh.
    </Card>
  );
}

function PartnerCalendarCard({ settings }: { settings: Settings }) {
  // Placeholder events. Real implementation: pull from Google/Apple calendar
  // via OAuth and render today's items in the partner's timezone.
  const events = [
    { time: "9:00 AM", title: "Standup" },
    { time: "12:30 PM", title: "Lunch with Priya" },
    { time: "4:00 PM", title: "Free until evening" },
    { time: "7:00 PM", title: "Run club" },
  ];

  return (
    <Card icon="📅" title={`${settings.partnerName}'s day`}>
      <div style={{ marginTop: 2 }}>
        {events.map((e, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 12,
              padding: "8px 0",
              borderBottom:
                i < events.length - 1 ? `1px solid ${c.hairlineSoft}` : "none",
            }}
          >
            <div
              style={{
                fontVariantNumeric: "tabular-nums",
                color: c.muted,
                fontWeight: 600,
                width: 76,
                flexShrink: 0,
                fontSize: 13,
              }}
            >
              {e.time}
            </div>
            <div style={{ color: c.ink, fontSize: 14 }}>{e.title}</div>
          </div>
        ))}
      </div>
      <div style={{ color: c.muted, fontSize: 12, marginTop: 10, fontStyle: "italic" }}>
        Calendar integration coming soon — connect Google/Apple Calendar to pull
        their real day.
      </div>
    </Card>
  );
}

function FaceTimeSuggestionCard({ settings }: { settings: Settings }) {
  // Suggest a time that's "evening for both" — for the scaffold, pick a slot
  // a few hours from now that's still daytime for both partners.
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
    <Card
      icon="📞"
      title="Suggested FaceTime"
      cta={{
        label: "Open FaceTime →",
        href: "facetime://",
      }}
    >
      Today at <strong style={{ color: c.ink }}>{suggestion.yourFmt}</strong> your time
      &middot; {suggestion.theirFmt} {settings.partnerName}&rsquo;s time. Both of
      you should be free and awake.
    </Card>
  );
}

function QuestionCard({ partnerName }: { partnerName: string }) {
  const [q] = useState(() => questionOfTheDay());
  return (
    <Card
      icon="💭"
      title="One deep question today"
      cta={{
        label: "Send to " + partnerName + " →",
        href: `sms:&body=${encodeURIComponent(q)}`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontStyle: "italic",
          fontSize: 19,
          lineHeight: 1.4,
          color: c.ink,
          padding: "4px 0",
        }}
      >
        &ldquo;{q}&rdquo;
      </div>
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Footer                                                            */
/* ──────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer style={{ textAlign: "center", paddingTop: 32 }}>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontStyle: "italic",
          fontSize: 16,
          color: c.heart,
        }}
      >
        Closer than the miles say.
      </div>
      <div style={{ color: c.muted, fontSize: 12, marginTop: 6 }}>
        Long Distance Loves · an experiment from{" "}
        <a href="/" style={{ color: c.muted, textDecoration: "underline" }}>
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
  padding: "12px 14px",
  borderRadius: 12,
  border: `1px solid ${c.hairline}`,
  background: c.card,
  color: c.ink,
  fontSize: 16,
  fontFamily: FONT_BODY,
  width: "100%",
  outline: "none",
};

const buttonBase: React.CSSProperties = {
  height: 48,
  borderRadius: 999,
  padding: "0 22px",
  fontSize: 15,
  fontWeight: 600,
  fontFamily: FONT_BODY,
};

const pillCta: React.CSSProperties = {
  display: "inline-block",
  background: c.primary,
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  padding: "8px 16px",
  borderRadius: 999,
  textDecoration: "none",
  marginTop: 12,
  letterSpacing: 0.2,
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
          fontSize: 11,
          color: c.muted,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          fontWeight: 700,
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
  // Ensure the current value is present even if not in our static list.
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
