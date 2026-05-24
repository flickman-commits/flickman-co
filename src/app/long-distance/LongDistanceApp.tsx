"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { tokens, type } from "./lib/design";
import { project } from "./lib/geo";
import { LAND_PATH, BORDER_PATH } from "./lib/worldmap";
import {
  CITIES,
  resolveCity,
  findCityIdByTimezone,
} from "./lib/cities";
import {
  searchPlaces,
  lookupTimezone,
  type Place,
} from "./lib/geocode";
import { randomQuestion } from "./lib/questions";
import {
  useDailyTodos,
  displayedStreak,
  type TodoKey,
} from "./lib/todos";

const c = tokens.color;
const FONT = tokens.fontFamily;

/* ──────────────────────────────────────────────────────────────── */
/* Types & storage                                                  */
/* ──────────────────────────────────────────────────────────────── */
const SETTINGS_KEY = "ldl-settings:v1";

type Location = {
  /** Short display label, e.g. "South Lake Tahoe". */
  label: string;
  /** Long display label, e.g. "South Lake Tahoe, California, United States". */
  fullLabel: string;
  lat: number;
  lng: number;
  /** IANA timezone, e.g. "America/Los_Angeles". */
  tz: string;
};

type Settings = {
  yourName: string;
  yourLocation: Location;
  /** Your home airport IATA code (e.g. "JFK") for the flight tracker. */
  yourAirport: string;
  partnerName: string;
  partnerLocation: Location;
  nextVisitISO: string;
  lastVisitISO: string;
};

/** Convert a curated city entry into a Location. */
function locationFromCityId(cityId: string): Location {
  const c = resolveCity(cityId);
  return {
    label: c.city,
    fullLabel: `${c.city}, ${c.region}`,
    lat: c.coords[0],
    lng: c.coords[1],
    tz: c.tz,
  };
}

/** Read whatever's in storage, migrating older shapes to Location-based. */
function loadSettings(): Settings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as Partial<Settings> & {
      yourTimezone?: string;
      partnerTimezone?: string;
      yourCityId?: string;
      partnerCityId?: string;
      waitStartISO?: string;
      yourAirport?: string;
    };

    if (!obj.yourName || !obj.partnerName || !obj.nextVisitISO) return null;

    const yourLocation: Location = obj.yourLocation
      ? obj.yourLocation
      : locationFromCityId(
          obj.yourCityId ?? findCityIdByTimezone(obj.yourTimezone ?? "")
        );

    const partnerLocation: Location = obj.partnerLocation
      ? obj.partnerLocation
      : locationFromCityId(
          obj.partnerCityId ?? findCityIdByTimezone(obj.partnerTimezone ?? "")
        );

    return {
      yourName: obj.yourName,
      yourLocation,
      yourAirport:
        obj.yourAirport ?? nearestAirport(yourLocation.label),
      partnerName: obj.partnerName,
      partnerLocation,
      nextVisitISO: obj.nextVisitISO,
      lastVisitISO:
        obj.lastVisitISO ??
        obj.waitStartISO ??
        new Date(Date.now() - 30 * 86_400_000).toISOString(),
    };
  } catch {
    return null;
  }
}

function saveSettings(s: Settings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {}
}

/** Closest curated city's tz, used as fallback when the tz API fails. */
function nearestCuratedTz(lat: number, lng: number): string {
  let best = CITIES[0];
  let bestD = Infinity;
  for (const c of CITIES) {
    const dLat = c.coords[0] - lat;
    const dLng = c.coords[1] - lng;
    const d = dLat * dLat + dLng * dLng;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best.tz;
}

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
/* Main view                                                         */
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
      <DailyActionsSection settings={settings} />
      <MakeSomeMovesSection settings={settings} />
      <ResourcesSection />
      <Footer onEdit={onEdit} />
    </main>
  );
}

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
      <h1
        style={{
          ...type.displaySm,
          color: c.ink,
          margin: "0 0 18px",
          fontWeight: 700,
          letterSpacing: -0.6,
        }}
      >
        Long Distance Lovers
      </h1>

      <VisitProgress settings={settings} />

      <DualTimeMap settings={settings} />
    </section>
  );
}

function VisitProgress({ settings }: { settings: Settings }) {
  const now = useNow(60_000);
  const visit = new Date(settings.nextVisitISO).getTime();
  const start = new Date(settings.lastVisitISO).getTime();

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
        <div style={{ ...type.caption, color: c.ink, fontWeight: 600 }}>
          {reunited
            ? "Together now ♥"
            : `${daysLeft} ${daysLeft === 1 ? "day" : "days"}`}
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
  const youLoc = settings.yourLocation;
  const partnerLoc = settings.partnerLocation;

  const youOffset = getOffsetMinutes(youLoc.tz, now);
  const partnerOffset = getOffsetMinutes(partnerLoc.tz, now);
  const youIsBehind = youOffset <= partnerOffset;

  const left = youIsBehind
    ? { name: settings.yourName, loc: youLoc, time: formatTime(now, youLoc.tz) }
    : {
        name: settings.partnerName,
        loc: partnerLoc,
        time: formatTime(now, partnerLoc.tz),
      };
  const right = youIsBehind
    ? {
        name: settings.partnerName,
        loc: partnerLoc,
        time: formatTime(now, partnerLoc.tz),
      }
    : { name: settings.yourName, loc: youLoc, time: formatTime(now, youLoc.tz) };

  const aheadLabel = describeAhead(youLoc.tz, partnerLoc.tz, settings.partnerName);

  return (
    <section
      style={{
        background: c.surfaceCard,
        borderRadius: tokens.radius.lg,
        padding: 14,
        marginBottom: 24,
      }}
    >
      <MiniWorldMap
        coordsA={[left.loc.lat, left.loc.lng]}
        coordsB={[right.loc.lat, right.loc.lng]}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginTop: 10,
        }}
      >
        <TimeCol label={left.name} time={left.time.time} city={left.loc.label} />
        <TimeCol
          label={right.name}
          time={right.time.time}
          city={right.loc.label}
          align="right"
        />
      </div>

      {aheadLabel && (
        <div
          style={{
            ...type.caption,
            color: c.muted,
            textAlign: "center",
            marginTop: 8,
            paddingTop: 8,
            borderTop: `1px solid ${c.hairline}`,
          }}
        >
          {aheadLabel}
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
/* Mini world map                                                   */
/* ──────────────────────────────────────────────────────────────── */

const MAP_ASPECT = 2.6;
const MAP_PAD_PCT = 0.6;

function MiniWorldMap({
  coordsA,
  coordsB,
}: {
  coordsA: [number, number];
  coordsB: [number, number];
}) {
  const a = project(coordsA[0], coordsA[1]);
  const b = project(coordsB[0], coordsB[1]);
  const viewBox = useMemo(
    () => computeViewBox(a, b, MAP_ASPECT, MAP_PAD_PCT),
    [a, b]
  );

  const mid = {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2 - Math.max(8, Math.abs(b.x - a.x) * 0.12),
  };
  const curve = `M ${a.x.toFixed(2)},${a.y.toFixed(2)} Q ${mid.x.toFixed(2)},${mid.y.toFixed(2)} ${b.x.toFixed(2)},${b.y.toFixed(2)}`;

  return (
    <div
      style={{
        background: c.canvas,
        borderRadius: tokens.radius.md,
        padding: 8,
        aspectRatio: `${MAP_ASPECT} / 1`,
        width: "100%",
        overflow: "hidden",
      }}
    >
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%", display: "block" }}
        aria-hidden
      >
        {/* Real geography from Natural Earth (110m). Land first, then
            hair-thin country borders on top for a touch of realism. */}
        <path d={LAND_PATH} fill={c.surfaceStrong} stroke="none" />
        <path
          d={BORDER_PATH}
          fill="none"
          stroke={c.canvas}
          strokeWidth={0.25}
          strokeLinejoin="round"
          opacity={0.85}
          vectorEffect="non-scaling-stroke"
        />

        {/* Connecting great-circle-ish curve */}
        <path
          d={curve}
          fill="none"
          stroke={c.brandPink}
          strokeWidth={0.6}
          strokeDasharray="1.4,1.4"
          opacity={0.8}
        />

        <Pin x={a.x} y={a.y} />
        <Pin x={b.x} y={b.y} />
      </svg>
    </div>
  );
}

function Pin({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={3.4} fill={c.brandPink} opacity={0.2} />
      <circle
        cx={x}
        cy={y}
        r={1.8}
        fill={c.brandPink}
        stroke={c.ink}
        strokeWidth={0.4}
      />
    </g>
  );
}

function computeViewBox(
  a: { x: number; y: number },
  b: { x: number; y: number },
  aspect: number,
  padPct: number
): string {
  let xMin = Math.min(a.x, b.x);
  let xMax = Math.max(a.x, b.x);
  let yMin = Math.min(a.y, b.y);
  let yMax = Math.max(a.y, b.y);

  const w0 = Math.max(1, xMax - xMin);
  const h0 = Math.max(1, yMax - yMin);
  const padX = Math.max(w0 * padPct, 14);
  const padY = Math.max(h0 * padPct, 14);

  xMin -= padX;
  xMax += padX;
  yMin -= padY;
  yMax += padY;

  let w = xMax - xMin;
  let h = yMax - yMin;

  if (w / h < aspect) {
    const newW = h * aspect;
    const extra = (newW - w) / 2;
    xMin -= extra;
    xMax += extra;
    w = newW;
  } else {
    const newH = w / aspect;
    const extra = (newH - h) / 2;
    yMin -= extra;
    yMax += extra;
    h = newH;
  }

  return `${xMin.toFixed(2)} ${yMin.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`;
}

/* ──────────────────────────────────────────────────────────────── */
/* Daily actions — bento                                            */
/* ──────────────────────────────────────────────────────────────── */

type CardVariant = "pink" | "lavender" | "peach" | "teal" | "ochre" | "cream";

function cardColors(variant: CardVariant) {
  const dark = variant === "pink" || variant === "teal";
  const bg = {
    pink: c.brandPink,
    lavender: c.brandLavender,
    peach: c.brandPeach,
    teal: c.brandTeal,
    ochre: c.brandOchre,
    cream: c.surfaceCard,
  }[variant];
  return {
    dark,
    bg,
    fg: dark ? c.onDark : c.ink,
    muted: dark ? "rgba(255,255,255,0.78)" : c.body,
  };
}

function DailyActionsSection({ settings }: { settings: Settings }) {
  const partner = settings.partnerName || "them";
  const [question, setQuestion] = useState<string | null>(null);
  const { todos, streak, toggle, markDone } = useDailyTodos();
  const streakCount = displayedStreak(streak);

  const askDeepQuestion = () => {
    setQuestion(randomQuestion(question ?? undefined));
    markDone("deepQuestion");
  };

  const sendVoiceMemo = () => {
    // Open the native Messages composer. User picks the recipient and taps
    // the mic to record a voice memo.
    window.location.href = "sms:";
    markDone("voiceMemo");
  };

  const scheduleFaceTime = () => {
    const body = `When's good for a FaceTime today, love?`;
    window.location.href = `sms:&body=${encodeURIComponent(body)}`;
    markDone("faceTime");
  };

  return (
    <section style={{ paddingTop: 16, paddingBottom: 16 }}>
      {/* Streak pill */}
      <StreakPill count={streakCount} />

      <div style={{ marginBottom: 14 }}>
        <div
          style={{ ...type.captionUppercase, color: c.muted, marginBottom: 8 }}
        >
          Daily actions
        </div>
        <h2
          style={{
            ...type.displaySm,
            color: c.ink,
            fontWeight: 500,
            margin: 0,
            letterSpacing: -0.5,
          }}
        >
          Strengthen your relationship.
        </h2>
      </div>

      {/* Stacked checkable to-do list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <TodoCard
          variant="pink"
          icon="💭"
          title={`Ask ${partner} a deep question`}
          done={todos.deepQuestion}
          onAction={askDeepQuestion}
          onToggle={() => toggle("deepQuestion")}
        />
        <TodoCard
          variant="lavender"
          icon="🎙"
          title={`Send ${partner} a voice memo`}
          done={todos.voiceMemo}
          onAction={sendVoiceMemo}
          onToggle={() => toggle("voiceMemo")}
        />
        <TodoCard
          variant="peach"
          icon="📞"
          title={`Schedule FaceTime with ${partner}`}
          subtitle={`${partner} is most free 5–8 PM today (per their calendar)`}
          done={todos.faceTime}
          onAction={scheduleFaceTime}
          onToggle={() => toggle("faceTime")}
        />
      </div>

      {question && (
        <DeepQuestionReveal
          question={question}
          partnerName={partner}
          onAnother={() => {
            setQuestion(randomQuestion(question ?? undefined));
          }}
          onClose={() => setQuestion(null)}
        />
      )}
    </section>
  );
}

function StreakPill({ count }: { count: number }) {
  // We show even at 0 — it's a gentle nudge to start the streak today.
  const alive = count > 0;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: tokens.radius.pill,
        background: alive ? c.brandPink + "22" : c.surfaceCard,
        color: alive ? c.ink : c.muted,
        marginBottom: 12,
        ...type.captionUppercase,
      }}
    >
      <span style={{ fontSize: 14, lineHeight: 1, textTransform: "none" }}>
        {alive ? "🔥" : "✨"}
      </span>
      <span>
        {alive
          ? `${count}-day streak`
          : "Start a streak today"}
      </span>
    </div>
  );
}

/* Stacked checkable to-do item — circular checkbox on left + tappable card. */
function TodoCard({
  variant,
  icon,
  title,
  subtitle,
  done,
  onAction,
  onToggle,
}: {
  variant: CardVariant;
  icon: string;
  title: string;
  subtitle?: string;
  done: boolean;
  onAction: () => void;
  onToggle: () => void;
}) {
  const { dark, bg, fg, muted } = cardColors(variant);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onAction}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAction();
        }
      }}
      style={{
        background: bg,
        color: fg,
        borderRadius: tokens.radius.lg,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        userSelect: "none",
        transition: "transform 120ms ease, opacity 200ms ease",
        opacity: done ? 0.55 : 1,
      }}
      onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.985)")}
      onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <Checkbox dark={dark} checked={done} onClick={onToggle} />
      <div style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: -0.2,
            lineHeight: 1.3,
            color: fg,
            textDecoration: done ? "line-through" : "none",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              ...type.bodySm,
              color: dark ? muted : c.muted,
              fontSize: 12,
              lineHeight: 1.35,
              marginTop: 2,
              textDecoration: done ? "line-through" : "none",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

function Checkbox({
  dark,
  checked,
  onClick,
}: {
  dark: boolean;
  checked: boolean;
  onClick: () => void;
}) {
  const stroke = dark ? c.onDark : c.ink;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={checked ? "Mark as not done" : "Mark as done"}
      style={{
        width: 26,
        height: 26,
        borderRadius: tokens.radius.pill,
        background: checked
          ? dark
            ? "rgba(255,255,255,0.95)"
            : c.ink
          : "transparent",
        border: `2px solid ${
          checked ? (dark ? "rgba(255,255,255,0.95)" : c.ink) : stroke + "66"
        }`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
        padding: 0,
        transition: "background-color 150ms ease, border-color 150ms ease",
      }}
    >
      {checked && (
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke={dark ? c.ink : c.canvas}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

function DeepQuestionReveal({
  question,
  partnerName,
  onAnother,
  onClose,
}: {
  question: string;
  partnerName: string;
  onAnother: () => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        marginTop: 14,
        background: c.surfaceCard,
        border: `1px solid ${c.hairline}`,
        borderRadius: tokens.radius.xl,
        padding: 20,
      }}
    >
      <div
        style={{ ...type.captionUppercase, color: c.muted, marginBottom: 8 }}
      >
        Ask {partnerName}
      </div>
      <p
        style={{
          ...type.titleLg,
          color: c.ink,
          margin: 0,
          fontWeight: 500,
          letterSpacing: -0.3,
        }}
      >
        “{question}”
      </p>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 16,
          flexWrap: "wrap",
        }}
      >
        <a
          href={`sms:&body=${encodeURIComponent(question)}`}
          style={{
            ...type.button,
            background: c.primary,
            color: c.onPrimary,
            border: "none",
            borderRadius: tokens.radius.md,
            padding: "10px 16px",
            fontFamily: FONT,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Text it to {partnerName} →
        </a>
        <button
          onClick={onAnother}
          style={{
            ...type.button,
            background: c.canvas,
            color: c.ink,
            border: `1px solid ${c.hairline}`,
            borderRadius: tokens.radius.md,
            padding: "10px 16px",
            cursor: "pointer",
            fontFamily: FONT,
          }}
        >
          Another →
        </button>
        <button
          onClick={onClose}
          style={{
            ...type.button,
            background: "transparent",
            color: c.muted,
            border: "none",
            padding: "10px 8px",
            cursor: "pointer",
            fontFamily: FONT,
          }}
        >
          Close
        </button>
      </div>

      <div
        style={{
          ...type.bodySm,
          color: c.mutedSoft,
          marginTop: 14,
          fontStyle: "italic",
        }}
      >
        From the Partners are Humans deck.
      </div>
    </div>
  );
}

function MakeSomeMovesSection({ settings }: { settings: Settings }) {
  return (
    <section style={{ paddingTop: 24, paddingBottom: 16 }}>
      <div style={{ marginBottom: 18 }}>
        <div
          style={{ ...type.captionUppercase, color: c.muted, marginBottom: 8 }}
        >
          Make some moves
        </div>
        <h2
          style={{
            ...type.displaySm,
            color: c.ink,
            fontWeight: 500,
            margin: 0,
            letterSpacing: -0.5,
          }}
        >
          Plan something together.
        </h2>
      </div>

      <DateNightCard />
      <FlightTrackerCard settings={settings} />
    </section>
  );
}

/* Small, snappy action card — compact, like a tap target. */
function ActionButton({
  variant,
  icon,
  title,
  subtitle,
  onClick,
}: {
  variant: CardVariant;
  icon: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
}) {
  const { dark, bg, fg, muted } = cardColors(variant);
  return (
    <button
      onClick={onClick ?? (() => alert("Coming soon!"))}
      style={{
        background: bg,
        color: fg,
        border: "none",
        borderRadius: tokens.radius.lg,
        padding: "14px 14px 16px",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: FONT,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minHeight: 96,
        transition: "transform 120ms ease",
      }}
      onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.985)")}
      onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <div style={{ fontSize: 20, lineHeight: 1 }}>{icon}</div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: -0.2,
          lineHeight: 1.3,
          color: fg,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            ...type.bodySm,
            color: dark ? muted : c.muted,
            fontSize: 12,
            lineHeight: 1.35,
          }}
        >
          {subtitle}
        </div>
      )}
    </button>
  );
}

/* Date night — big teal card with 3 sub-cards inside */
const DATE_NIGHT_OPTIONS: Array<{ icon: string; name: string }> = [
  { icon: "🎮", name: "Custom Jeopardy" },
  { icon: "📸", name: "Photo Roulette" },
  { icon: "🔎", name: "Scavenger Hunt" },
];

function DateNightCard() {
  const { bg, fg } = cardColors("teal");
  return (
    <article
      style={{
        background: bg,
        color: fg,
        borderRadius: tokens.radius.xl,
        padding: "22px 20px",
        marginBottom: 14,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontSize: 22, marginBottom: 6 }}>💞</div>
        <h3
          style={{
            ...type.titleMd,
            color: fg,
            fontWeight: 600,
            margin: 0,
            letterSpacing: -0.2,
          }}
        >
          Reignite the spark with a virtual date night.
        </h3>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: 8,
        }}
      >
        {DATE_NIGHT_OPTIONS.map((opt) => (
          <button
            key={opt.name}
            onClick={() => alert("Coming soon!")}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: fg,
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: tokens.radius.md,
              padding: "12px 10px",
              cursor: "pointer",
              fontFamily: FONT,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              transition: "background 120ms ease",
            }}
            onPointerEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.18)")
            }
            onPointerLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
            }
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>{opt.icon}</span>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: -0.1,
                lineHeight: 1.25,
                textAlign: "center",
              }}
            >
              {opt.name}
            </span>
          </button>
        ))}
      </div>
    </article>
  );
}

/* Flight tracker — big ochre card with tracked routes inside */
type TrackedFlight = {
  airline: string; // 2-letter code
  airlineColor: string;
  number: string;
  from: string;
  to: string;
  date: string;
  price: number;
  target: number;
};

function FlightTrackerCard({ settings }: { settings: Settings }) {
  const { bg, fg } = cardColors("ochre");

  // Placeholder data — wire to a real flight API later.
  // Origin uses the user's saved home airport; destination derives from
  // their partner's city via the small lookup.
  const here = settings.yourAirport || nearestAirport(settings.yourLocation.label);
  const there = nearestAirport(settings.partnerLocation.label);

  const flights: TrackedFlight[] = [
    {
      airline: "DL",
      airlineColor: "#C8102E",
      number: "245",
      from: here,
      to: there,
      date: "Jun 12",
      price: 342,
      target: 300,
    },
    {
      airline: "UA",
      airlineColor: "#005DAA",
      number: "1502",
      from: there,
      to: here,
      date: "Jun 28",
      price: 389,
      target: 300,
    },
    {
      airline: "B6",
      airlineColor: "#0033A0",
      number: "718",
      from: here,
      to: there,
      date: "Jul 4",
      price: 268,
      target: 300,
    },
  ];

  return (
    <article
      style={{
        background: bg,
        color: fg,
        borderRadius: tokens.radius.xl,
        padding: "22px 20px",
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 22, marginBottom: 6 }}>✈️</div>
        <h3
          style={{
            ...type.titleMd,
            color: fg,
            fontWeight: 600,
            margin: 0,
            letterSpacing: -0.2,
          }}
        >
          Flight tracker
        </h3>
        <p
          style={{
            ...type.bodySm,
            color: c.body,
            margin: "4px 0 0",
            fontStyle: "italic",
          }}
        >
          Waiting for it to go below $300.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {flights.map((f, i) => (
          <FlightRow key={i} flight={f} />
        ))}
      </div>

      <button
        onClick={() => alert("Coming soon!")}
        style={{
          ...type.button,
          background: c.primary,
          color: c.onPrimary,
          border: "none",
          borderRadius: tokens.radius.md,
          padding: "10px 16px",
          cursor: "pointer",
          fontFamily: FONT,
          marginTop: 14,
        }}
      >
        Add a route →
      </button>
    </article>
  );
}

function FlightRow({ flight }: { flight: TrackedFlight }) {
  const belowTarget = flight.price <= flight.target;
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.5)",
        borderRadius: tokens.radius.md,
        padding: "12px 14px",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 12,
      }}
    >
      <AirlineBadge code={flight.airline} color={flight.airlineColor} />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 600,
            color: c.ink,
            letterSpacing: -0.1,
          }}
        >
          {flight.airline} {flight.number}
          <span style={{ color: c.muted, fontWeight: 500, marginLeft: 8 }}>
            {flight.from} → {flight.to}
          </span>
        </div>
        <div
          style={{
            ...type.bodySm,
            fontSize: 12,
            color: c.muted,
            marginTop: 1,
          }}
        >
          {flight.date}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: 700,
            color: belowTarget ? "#16a34a" : c.ink,
            letterSpacing: -0.3,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          ${flight.price}
        </div>
        <div
          style={{
            ...type.bodySm,
            fontSize: 11,
            color: belowTarget ? "#16a34a" : c.muted,
            marginTop: 1,
            fontWeight: 600,
          }}
        >
          {belowTarget ? "BELOW TARGET" : `↓ to $${flight.target}`}
        </div>
      </div>
    </div>
  );
}

function AirlineBadge({ code, color }: { code: string; color: string }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: tokens.radius.sm,
        background: color,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.4,
        flexShrink: 0,
      }}
    >
      {code}
    </div>
  );
}

/** Crude city → airport code mapping for the flight card placeholder. */
function nearestAirport(cityLabel: string): string {
  const c = cityLabel.toLowerCase();
  const lookup: Record<string, string> = {
    "new york": "JFK",
    brooklyn: "JFK",
    boston: "BOS",
    washington: "DCA",
    miami: "MIA",
    atlanta: "ATL",
    chicago: "ORD",
    austin: "AUS",
    dallas: "DFW",
    houston: "IAH",
    denver: "DEN",
    "los angeles": "LAX",
    "san francisco": "SFO",
    "san diego": "SAN",
    seattle: "SEA",
    portland: "PDX",
    "lake tahoe": "RNO",
    reno: "RNO",
    "las vegas": "LAS",
    toronto: "YYZ",
    vancouver: "YVR",
    london: "LHR",
    paris: "CDG",
    berlin: "BER",
    madrid: "MAD",
    rome: "FCO",
    amsterdam: "AMS",
    dublin: "DUB",
    tokyo: "HND",
    seoul: "ICN",
    "hong kong": "HKG",
    singapore: "SIN",
    sydney: "SYD",
    melbourne: "MEL",
    auckland: "AKL",
    dubai: "DXB",
    mumbai: "BOM",
    delhi: "DEL",
  };
  for (const k of Object.keys(lookup)) {
    if (c.includes(k)) return lookup[k];
  }
  // Fall back to the first 3 letters of the city, uppercased.
  return cityLabel.slice(0, 3).toUpperCase();
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
          style={{ ...type.captionUppercase, color: c.muted, marginBottom: 8 }}
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
            <div style={{ ...type.bodySm, color: c.muted, marginTop: "auto" }}>
              {r.source} →
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Footer                                                            */
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
        Long Distance Lovers · from{" "}
        <a href="/" style={{ color: c.muted, textDecoration: "underline" }}>
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

function formatTime(ts: number, tz: string): { time: string } {
  try {
    const time = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: tz,
    }).format(ts);
    return { time };
  } catch {
    return { time: "—" };
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

function describeAhead(
  yourTz: string,
  partnerTz: string,
  partnerName: string
): string {
  try {
    const now = Date.now();
    const yourOff = getOffsetMinutes(yourTz, now);
    const theirOff = getOffsetMinutes(partnerTz, now);
    const diff = theirOff - yourOff;
    if (diff === 0) return `${partnerName} is in your time zone`;
    const hours = Math.abs(diff) / 60;
    const h = hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
    const dir = diff > 0 ? "ahead" : "behind";
    return `${partnerName} is ${h} hr ${dir}`;
  } catch {
    return "";
  }
}

/* ──────────────────────────────────────────────────────────────── */
/* Onboarding                                                        */
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
  // datetime-local needs values formatted as YYYY-MM-DDTHH:mm in *local* time —
  // toISOString() returns UTC, so we build the string manually to avoid an
  // off-by-one timezone shift when the user picks today.
  const toLocalDtValue = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T` +
      `${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  };

  const nowDt = useMemo(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    return toLocalDtValue(d);
  }, []);
  const inThirtyDays = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    d.setHours(18, 0, 0, 0);
    return toLocalDtValue(d);
  }, []);

  const [yourName, setYourName] = useState(existing?.yourName ?? "");
  const [yourLocation, setYourLocation] = useState<Location | null>(
    existing?.yourLocation ?? null
  );
  const [yourAirport, setYourAirport] = useState<string>(
    existing?.yourAirport ?? ""
  );
  const [partnerName, setPartnerName] = useState(existing?.partnerName ?? "");
  const [partnerLocation, setPartnerLocation] = useState<Location | null>(
    existing?.partnerLocation ?? null
  );

  // Auto-suggest a home airport from the picked city if the user hasn't typed
  // their own yet. They can override.
  useEffect(() => {
    if (yourLocation && !yourAirport.trim()) {
      setYourAirport(nearestAirport(yourLocation.label));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yourLocation]);
  const [lastVisit, setLastVisit] = useState(
    existing?.lastVisitISO ? toLocalDtValue(new Date(existing.lastVisitISO)) : nowDt
  );
  const [nextVisit, setNextVisit] = useState(
    existing?.nextVisitISO
      ? toLocalDtValue(new Date(existing.nextVisitISO))
      : inThirtyDays
  );

  const canSave =
    yourName.trim() &&
    partnerName.trim() &&
    yourLocation !== null &&
    partnerLocation !== null &&
    nextVisit &&
    lastVisit &&
    yourAirport.trim().length >= 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    onSave({
      yourName: yourName.trim(),
      yourLocation: yourLocation!,
      yourAirport: yourAirport.trim().toUpperCase().slice(0, 4),
      partnerName: partnerName.trim(),
      partnerLocation: partnerLocation!,
      nextVisitISO: new Date(nextVisit).toISOString(),
      lastVisitISO: new Date(lastVisit).toISOString(),
    });
  };

  const isFirstRun = !existing;

  return (
    <main style={{ paddingTop: 48 }}>
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            ...type.captionUppercase,
            color: c.muted,
            marginBottom: 12,
          }}
        >
          Long Distance Lovers
        </div>
        <h1
          style={{
            ...type.displaySm,
            color: c.ink,
            margin: 0,
            fontWeight: 500,
            letterSpacing: -0.5,
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
        <Pair>
          <Field label="Your name">
            <Input value={yourName} onChange={setYourName} placeholder="Matt" />
          </Field>
          <Field label="Your city">
            <CityAutocomplete
              value={yourLocation}
              onChange={setYourLocation}
              placeholder="Search any city or town…"
            />
          </Field>
        </Pair>

        <Pair>
          <Field label="Their name">
            <Input
              value={partnerName}
              onChange={setPartnerName}
              placeholder="Nat"
            />
          </Field>
          <Field label="Their city">
            <CityAutocomplete
              value={partnerLocation}
              onChange={setPartnerLocation}
              placeholder="e.g. Lake Tahoe"
            />
          </Field>
        </Pair>

        <Field label="Your home airport">
          <input
            type="text"
            value={yourAirport}
            onChange={(e) =>
              setYourAirport(e.target.value.toUpperCase().slice(0, 4))
            }
            placeholder="JFK"
            maxLength={4}
            autoCapitalize="characters"
            spellCheck={false}
            style={{
              ...inputStyle,
              fontFamily: FONT,
              letterSpacing: 1,
              fontWeight: 600,
            }}
          />
          <div
            style={{
              ...type.bodySm,
              color: c.muted,
              marginTop: 6,
              padding: "10px 12px",
              borderRadius: tokens.radius.md,
              background: c.surfaceSoft,
              border: `1px solid ${c.hairlineSoft}`,
            }}
          >
            ✈️ This is so we can track flight prices and tell you when
            it&rsquo;s the cheapest to fly to see your partner.
          </div>
        </Field>

        <Field label="When did you last see each other?">
          <input
            type="datetime-local"
            value={lastVisit}
            max={nowDt}
            onChange={(e) => setLastVisit(e.target.value)}
            style={inputStyle}
          />
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
              style={{ ...buttonSecondary, flex: 1 }}
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

function Pair({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* City autocomplete (Nominatim → tz lookup)                         */
/* ──────────────────────────────────────────────────────────────── */

function CityAutocomplete({
  value,
  onChange,
  placeholder,
}: {
  value: Location | null;
  onChange: (loc: Location) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState(value?.fullLabel ?? "");
  const [results, setResults] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Close dropdown when clicking outside.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Debounced search.
  useEffect(() => {
    if (!open) return;
    if (debounceRef.current != null) window.clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    // If the query exactly matches the current value, skip search.
    if (value && q === value.fullLabel) {
      setResults([]);
      return;
    }

    setSearching(true);
    setError(null);

    debounceRef.current = window.setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const places = await searchPlaces(q, controller.signal);
        setResults(places);
        setSearching(false);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Search failed — try again");
          setSearching(false);
        }
      }
    }, 320);

    return () => {
      if (debounceRef.current != null) window.clearTimeout(debounceRef.current);
    };
  }, [query, open, value]);

  const selectPlace = async (place: Place) => {
    setOpen(false);
    setResults([]);
    setQuery(place.label);
    setResolving(true);
    setError(null);
    try {
      let tz = await lookupTimezone(place.lat, place.lng);
      if (!tz) tz = nearestCuratedTz(place.lat, place.lng);
      const loc: Location = {
        label: place.short,
        fullLabel: place.label,
        lat: place.lat,
        lng: place.lng,
        tz,
      };
      onChange(loc);
    } catch {
      // Fallback to nearest curated tz.
      const tz = nearestCuratedTz(place.lat, place.lng);
      onChange({
        label: place.short,
        fullLabel: place.label,
        lat: place.lat,
        lng: place.lng,
        tz,
      });
    } finally {
      setResolving(false);
    }
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (query.trim().length >= 2) setOpen(true);
        }}
        autoComplete="off"
        spellCheck={false}
        style={inputStyle}
      />

      {/* Confirmation / status line under the input */}
      {value && !open && (
        <div
          style={{
            ...type.bodySm,
            color: c.muted,
            marginTop: 4,
            paddingLeft: 2,
          }}
        >
          📍 {value.fullLabel}
          {value.tz && (
            <span style={{ color: c.mutedSoft, marginLeft: 6 }}>
              · {value.tz.replace(/_/g, " ")}
            </span>
          )}
        </div>
      )}
      {resolving && (
        <div
          style={{
            ...type.bodySm,
            color: c.muted,
            marginTop: 4,
            paddingLeft: 2,
          }}
        >
          Detecting timezone…
        </div>
      )}

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: c.canvas,
            border: `1px solid ${c.hairline}`,
            borderRadius: tokens.radius.md,
            boxShadow:
              "0 4px 16px rgba(10,10,10,0.08), 0 1px 3px rgba(10,10,10,0.06)",
            zIndex: 20,
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {searching && (
            <div
              style={{
                padding: "12px 14px",
                ...type.bodySm,
                color: c.muted,
              }}
            >
              Searching…
            </div>
          )}
          {!searching && results.length === 0 && query.trim().length >= 2 && (
            <div
              style={{
                padding: "12px 14px",
                ...type.bodySm,
                color: c.muted,
              }}
            >
              {error ?? "No matches — try a different spelling"}
            </div>
          )}
          {!searching &&
            results.map((p, i) => (
              <button
                key={`${p.label}-${i}`}
                type="button"
                onClick={() => selectPlace(p)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  ...type.bodyMd,
                  color: c.ink,
                  fontFamily: FONT,
                  borderBottom:
                    i < results.length - 1
                      ? `1px solid ${c.hairlineSoft}`
                      : "none",
                }}
              >
                <div style={{ fontWeight: 500 }}>{p.short}</div>
                {p.short !== p.label && (
                  <div style={{ ...type.bodySm, color: c.muted, marginTop: 2 }}>
                    {p.label}
                  </div>
                )}
              </button>
            ))}
          {!searching && results.length > 0 && (
            <div
              style={{
                padding: "8px 14px",
                ...type.bodySm,
                color: c.mutedSoft,
                borderTop: `1px solid ${c.hairlineSoft}`,
                background: c.surfaceSoft,
              }}
            >
              Geocoded by OpenStreetMap
            </div>
          )}
        </div>
      )}
    </div>
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
        style={{ ...type.captionUppercase, color: c.muted, marginBottom: 6 }}
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
