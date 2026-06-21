"use client";

import { useMemo, useState } from "react";

interface Palette {
  cream: string;
  creamDark: string;
  red: string;
  redDark: string;
  mustard: string;
  ink: string;
  body: string;
  muted: string;
  white: string;
  hairline: string;
}

/* ──────────────────────────────────────────────────────────────── */
/* Past guests. Edit as Sundays come and go.                        */
/* ──────────────────────────────────────────────────────────────── */
type PastGuest = {
  date: string; // YYYY-MM-DD of a Sunday
  guests: string; // display name
  party: number;
};

const PAST_GUESTS: PastGuest[] = [
  { date: "2026-05-17", guests: "Jason & Julia", party: 2 },
];

/* ──────────────────────────────────────────────────────────────── */

const RECEIPT_TEAL = "#B0CDC1"; // soft teal ruled line, guest-check vibe
const RECEIPT_TEAL_DARK = "#5E8C7E";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parseSunday(yyyymmdd: string): Date {
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  return new Date(y, m - 1, d, 11, 0, 0);
}

function toISODate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Return the next `count` upcoming Sundays (today counts if Sunday <11 AM). */
function getUpcomingSundays(count = 6): Date[] {
  const out: Date[] = [];
  const now = new Date();
  const d = new Date(now);
  d.setHours(11, 0, 0, 0);

  let daysUntilSunday = (7 - d.getDay()) % 7;
  if (d.getDay() === 0 && now.getTime() < d.getTime()) {
    daysUntilSunday = 0;
  } else if (d.getDay() === 0) {
    daysUntilSunday = 7;
  }
  d.setDate(d.getDate() + daysUntilSunday);

  for (let i = 0; i < count; i++) {
    out.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return out;
}

function fmtDateShort(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function fmtDateFull(d: Date): string {
  return `Sunday, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

type Row =
  | { kind: "past"; date: Date; guests: string; party: number }
  | { kind: "open"; date: Date };

type View = "receipt" | "form";

export default function CalendarSection({ palette }: { palette: Palette }) {
  const c = palette;
  const [selected, setSelected] = useState<Date | null>(null);
  const [view, setView] = useState<View>("receipt");
  // Tracks if user has interacted so we only animate slides AFTER first interaction,
  // not on initial page render.
  const [hasNavigated, setHasNavigated] = useState(false);

  const rows: Row[] = useMemo(() => {
    const past: Row[] = PAST_GUESTS.map((g) => ({
      kind: "past" as const,
      date: parseSunday(g.date),
      guests: g.guests,
      party: g.party,
    })).sort((a, b) => a.date.getTime() - b.date.getTime());

    const upcoming: Row[] = getUpcomingSundays(6).map((d) => ({
      kind: "open" as const,
      date: d,
    }));

    return [...past, ...upcoming];
  }, []);

  const goToForm = (d: Date) => {
    setSelected(d);
    setHasNavigated(true);
    setView("form");
  };
  const goBack = () => {
    setHasNavigated(true);
    setView("receipt");
  };

  const slideAnim =
    !hasNavigated
      ? "none"
      : view === "form"
      ? "crepes-slide-from-right 320ms cubic-bezier(0.2, 0.8, 0.2, 1) both"
      : "crepes-slide-from-left 320ms cubic-bezier(0.2, 0.8, 0.2, 1) both";

  return (
    <>
      {/* Inline keyframes for the slide-over animation between receipt and form. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes crepes-slide-from-right {
              from { transform: translateX(14%); opacity: 0; }
              to   { transform: translateX(0);   opacity: 1; }
            }
            @keyframes crepes-slide-from-left {
              from { transform: translateX(-14%); opacity: 0; }
              to   { transform: translateX(0);    opacity: 1; }
            }
          `,
        }}
      />

      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        {view === "receipt" && (
          <div key="receipt" style={{ animation: slideAnim }}>
            <GuestCheckReceipt palette={c} rows={rows} onBook={goToForm} />
          </div>
        )}

        {view === "form" && selected && (
          <div key="form" style={{ animation: slideAnim }}>
            <BookingForm date={selected} palette={c} onBack={goBack} />
          </div>
        )}
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Guest check receipt                                              */
/* ──────────────────────────────────────────────────────────────── */

function GuestCheckReceipt({
  palette,
  rows,
  onBook,
}: {
  palette: Palette;
  rows: Row[];
  onBook: (d: Date) => void;
}) {
  const c = palette;
  return (
    <div
      style={{
        background: c.white,
        border: `2px solid ${c.ink}`,
        borderRadius: 4,
        padding: 0,
        boxShadow: `0 6px 0 ${c.ink}`,
        overflow: "hidden",
      }}
    >
      <Perforation color={c.red} />

      <div style={{ padding: "18px 22px 14px", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "ui-serif, Georgia, 'Times New Roman', serif",
            fontWeight: 700,
            fontSize: "clamp(26px, 5.5vw, 32px)",
            letterSpacing: 0.5,
            color: c.red,
            margin: 0,
            lineHeight: 1.05,
            textTransform: "uppercase",
          }}
        >
          Book Your Sunday
        </h2>
        <div
          style={{
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            fontSize: 13,
            color: c.body,
            marginTop: 8,
            lineHeight: 1.45,
            maxWidth: 360,
            marginInline: "auto",
          }}
        >
          Tap &lsquo;Book Now&rsquo; next to the date you&rsquo;d like to reserve.
        </div>
      </div>

      {/* 2-column header: Date | Guests */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "0.55fr 1fr",
          gap: 0,
          padding: "8px 16px 6px",
          borderTop: `2px solid ${RECEIPT_TEAL_DARK}`,
          borderBottom: `2px solid ${RECEIPT_TEAL_DARK}`,
          background: `${RECEIPT_TEAL}22`,
        }}
      >
        {["Date", "Guests"].map((label) => (
          <div
            key={label}
            style={{
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: RECEIPT_TEAL_DARK,
              textAlign: "left",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div style={{ padding: "0 16px" }}>
        {rows.map((row, i) => (
          <ReceiptRow
            key={`${row.kind}-${row.date.toISOString()}`}
            row={row}
            palette={c}
            onBook={() => row.kind === "open" && onBook(row.date)}
            isLast={i === rows.length - 1}
          />
        ))}
      </div>

      <div
        style={{
          padding: "10px 18px 14px",
          textAlign: "center",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 10,
          color: c.red,
          opacity: 0.85,
          letterSpacing: 1,
        }}
      >
        SERVED WITH ♥
      </div>

      <Perforation color={c.red} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Booking form                                                     */
/* ──────────────────────────────────────────────────────────────── */

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "done" }
  | { kind: "error"; message: string };

function BookingForm({
  date,
  palette,
  onBack,
}: {
  date: Date;
  palette: Palette;
  onBack: () => void;
}) {
  const c = palette;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [party, setParty] = useState<1 | 2>(2);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  const canSubmit = name.trim().length > 0 && /^\S+@\S+\.\S+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setState({ kind: "submitting" });
    try {
      const res = await fetch("/api/crepes/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          dateISO: toISODate(date),
          party,
          message: message.trim() || undefined,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setState({
          kind: "error",
          message:
            body.error ||
            "Something went wrong. Try again, or email matt@flickmanmedia.com directly.",
        });
        return;
      }
      setState({ kind: "done" });
    } catch (err) {
      setState({
        kind: "error",
        message:
          err instanceof Error
            ? err.message
            : "Couldn't reach the server. Try again.",
      });
    }
  };

  const cardStyle: React.CSSProperties = {
    background: c.white,
    border: `2px solid ${c.ink}`,
    borderRadius: 6,
    padding: "18px 22px 18px",
    boxShadow: `0 6px 0 ${c.ink}`,
  };

  if (state.kind === "done") {
    return (
      <div style={{ ...cardStyle, textAlign: "center" }}>
        <BackButton palette={c} onClick={onBack} label="Back to dates" />
        <div style={{ fontSize: 40, margin: "8px 0 4px" }}>🥞</div>
        <div
          style={{
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            fontSize: 11,
            color: c.red,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Request sent
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: c.ink,
            marginBottom: 8,
            letterSpacing: -0.3,
          }}
        >
          We got it, {name.split(" ")[0]}.
        </div>
        <div
          style={{
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            fontSize: 14,
            color: c.body,
            lineHeight: 1.55,
            marginBottom: 4,
          }}
        >
          You&rsquo;ll hear back within a day. If we&rsquo;re a yes, you&rsquo;ll
          get a confirmation with a calendar invite.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      <BackButton palette={c} onClick={onBack} label="Back to dates" />

      <div
        style={{
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: 11,
          color: c.red,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 6,
          textAlign: "center",
        }}
      >
        You picked
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: c.ink,
          marginBottom: 4,
          letterSpacing: -0.3,
          textAlign: "center",
        }}
      >
        {fmtDateFull(date)}
      </div>
      <div
        style={{
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: 13,
          color: c.body,
          marginBottom: 18,
          textAlign: "center",
        }}
      >
        11:00 AM
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <FieldLabel label="Your name" palette={c}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sarah"
            autoComplete="name"
            required
            style={inputStyle(c)}
          />
        </FieldLabel>

        <FieldLabel label="Email" palette={c}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sarah@example.com"
            autoComplete="email"
            required
            style={inputStyle(c)}
          />
        </FieldLabel>

        <FieldLabel label="Party" palette={c}>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setParty(n as 1 | 2)}
                style={{
                  flex: 1,
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  background: party === n ? c.red : c.white,
                  color: party === n ? c.white : c.ink,
                  border: `2px solid ${party === n ? c.redDark : c.ink}`,
                  borderRadius: 4,
                  padding: "10px 0",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: party === n ? "none" : `0 3px 0 ${c.ink}`,
                  transform: party === n ? "translateY(2px)" : "none",
                  transition: "transform 80ms ease",
                }}
              >
                {n === 1 ? "Just me" : "Two of us"}
              </button>
            ))}
          </div>
        </FieldLabel>

        <FieldLabel label="Anything we should know? (optional)" palette={c}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Allergies, who you're bringing, why this date matters..."
            rows={3}
            style={{
              ...inputStyle(c),
              resize: "vertical",
              minHeight: 72,
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          />
        </FieldLabel>
      </div>

      {state.kind === "error" && (
        <div
          style={{
            marginTop: 14,
            padding: "10px 12px",
            background: "#FCE7E4",
            color: c.redDark,
            border: `1px solid ${c.red}`,
            borderRadius: 4,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            fontSize: 13,
          }}
        >
          {state.message}
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <button
          type="submit"
          disabled={!canSubmit || state.kind === "submitting"}
          style={{
            width: "100%",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            background: canSubmit ? c.red : "#D5BFBA",
            color: c.white,
            border: `2px solid ${canSubmit ? c.redDark : "#A89691"}`,
            borderRadius: 4,
            padding: "12px 22px",
            fontWeight: 700,
            fontSize: 15,
            cursor:
              !canSubmit || state.kind === "submitting"
                ? "not-allowed"
                : "pointer",
            boxShadow: canSubmit ? `0 4px 0 ${c.redDark}` : "none",
            transition: "transform 80ms ease",
          }}
        >
          {state.kind === "submitting" ? "Sending..." : "Request this date"}
        </button>
      </div>

      <div
        style={{
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: 11,
          color: c.muted,
          marginTop: 12,
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        We approve every reservation. You&rsquo;ll hear back within a day.
      </div>
    </form>
  );
}

function BackButton({
  palette,
  onClick,
  label,
}: {
  palette: Palette;
  onClick: () => void;
  label: string;
}) {
  const c = palette;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: c.muted,
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        padding: "4px 0 12px",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>
        ←
      </span>
      {label}
    </button>
  );
}

function FieldLabel({
  label,
  children,
  palette,
}: {
  label: string;
  children: React.ReactNode;
  palette: Palette;
}) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          color: palette.muted,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}

function inputStyle(c: Palette): React.CSSProperties {
  return {
    width: "100%",
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    fontSize: 15,
    color: c.ink,
    background: c.white,
    border: `2px solid ${c.ink}`,
    borderRadius: 4,
    padding: "10px 12px",
    outline: "none",
    boxSizing: "border-box",
  };
}

/* ──────────────────────────────────────────────────────────────── */
/* Bits                                                              */
/* ──────────────────────────────────────────────────────────────── */

function ReceiptRow({
  row,
  palette,
  onBook,
  isLast,
}: {
  row: Row;
  palette: Palette;
  onBook: () => void;
  isLast: boolean;
}) {
  const c = palette;
  const isPast = row.kind === "past";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "0.55fr 1fr",
        gap: 0,
        alignItems: "center",
        padding: "12px 0 10px",
        borderBottom: isLast ? "none" : `1px dashed ${RECEIPT_TEAL}`,
      }}
    >
      {/* DATE column */}
      <div
        style={{
          fontFamily:
            "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
          fontSize: 14,
          fontWeight: 700,
          color: c.red,
          letterSpacing: 0.4,
        }}
      >
        {fmtDateShort(row.date)}
      </div>

      {/* GUESTS column: past name (italic serif) OR "Book Now" button (pen underline) */}
      <div>
        {isPast && row.kind === "past" ? (
          <span
            style={{
              fontFamily: "ui-serif, Georgia, serif",
              fontSize: 15,
              fontWeight: 600,
              color: c.ink,
              fontStyle: "italic",
              letterSpacing: -0.2,
            }}
          >
            {row.guests}
            <span
              style={{
                fontFamily:
                  "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
                fontSize: 12,
                fontWeight: 600,
                fontStyle: "normal",
                color: c.muted,
                marginLeft: 8,
                letterSpacing: 0,
              }}
            >
              party of {row.party}
            </span>
          </span>
        ) : (
          <BookNowButton palette={c} onClick={onBook} />
        )}
      </div>
    </div>
  );
}

function BookNowButton({
  palette,
  onClick,
}: {
  palette: Palette;
  onClick: () => void;
}) {
  const c = palette;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        padding: "2px 0 0",
        cursor: "pointer",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        color: c.red,
      }}
      aria-label="Book this Sunday"
    >
      <span
        style={{
          fontFamily: "ui-serif, Georgia, serif",
          fontSize: 16,
          fontWeight: 700,
          color: c.red,
          letterSpacing: -0.2,
          fontStyle: "italic",
        }}
      >
        Book Now
      </span>
      {/* Hand-drawn pen-style underline */}
      <svg
        aria-hidden
        viewBox="0 0 72 8"
        preserveAspectRatio="none"
        style={{
          display: "block",
          width: 72,
          height: 6,
          marginTop: 1,
          overflow: "visible",
        }}
      >
        <path
          d="M 1.5 5 C 12 2.5, 24 6, 36 4 S 60 3, 70.5 5"
          stroke={c.red}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

function Perforation({ color }: { color: string }) {
  return (
    <div
      aria-hidden
      style={{
        height: 8,
        backgroundImage: `linear-gradient(90deg, ${color} 50%, transparent 50%)`,
        backgroundSize: "12px 2px",
        backgroundRepeat: "repeat-x",
        backgroundPosition: "center",
      }}
    />
  );
}
