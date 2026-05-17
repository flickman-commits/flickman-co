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

/** Return the next `count` upcoming Sundays (including today if it's Sunday & before 11). */
function getUpcomingSundays(count = 8): Date[] {
  const out: Date[] = [];
  const now = new Date();
  const d = new Date(now);
  d.setHours(11, 0, 0, 0);

  let daysUntilSunday = (7 - d.getDay()) % 7;
  // If today is Sunday and it's still before 11 AM, count today.
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

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function fmtDate(d: Date) {
  return {
    month: MONTHS[d.getMonth()],
    day: d.getDate(),
    weekday: "Sun",
    iso: d.toISOString().slice(0, 10),
    full: `Sunday, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
  };
}

export default function CalendarSection({ palette }: { palette: Palette }) {
  const c = palette;
  const sundays = useMemo(() => getUpcomingSundays(8), []);
  const [selected, setSelected] = useState<Date | null>(null);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 10,
        }}
      >
        {sundays.map((d) => {
          const fd = fmtDate(d);
          const isSelected =
            selected?.toDateString() === d.toDateString();
          return (
            <button
              key={fd.iso}
              onClick={() => setSelected(d)}
              style={{
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                background: isSelected ? c.red : c.white,
                color: isSelected ? c.white : c.ink,
                border: isSelected
                  ? `2px solid ${c.redDark}`
                  : `2px solid ${c.ink}`,
                borderRadius: 4,
                padding: "12px 8px",
                cursor: "pointer",
                textAlign: "center",
                boxShadow: isSelected
                  ? `0 2px 0 ${c.redDark}`
                  : `0 3px 0 ${c.ink}`,
                transform: isSelected ? "translateY(1px)" : "none",
                transition: "transform 80ms ease",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  opacity: 0.7,
                  marginBottom: 2,
                }}
              >
                {fd.weekday}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>
                {fd.day}
              </div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                {fd.month} · 11 AM
              </div>
              <div
                style={{
                  fontSize: 10,
                  marginTop: 6,
                  color: isSelected ? c.white : c.mustard,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                ● 2 seats
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected-date confirmation card */}
      {selected && (
        <div
          style={{
            marginTop: 20,
            background: c.white,
            border: `2px solid ${c.ink}`,
            borderRadius: 6,
            padding: "20px 20px 16px",
            boxShadow: `0 6px 0 ${c.ink}`,
            textAlign: "center",
          }}
        >
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
            You picked
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: c.ink,
              marginBottom: 4,
              letterSpacing: -0.3,
            }}
          >
            {fmtDate(selected).full}
          </div>
          <div
            style={{
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              fontSize: 14,
              color: c.body,
              marginBottom: 18,
            }}
          >
            11:00 AM · Table for two
          </div>

          <a
            href={`mailto:matt@flickman.co?subject=${encodeURIComponent(
              "Crepe Sunday — " + fmtDate(selected).full
            )}&body=${encodeURIComponent(
              `Hi Matt & Nat —\n\nI'd love to come to crepes on ${fmtDate(selected).full} at 11 AM.\n\n— `
            )}`}
            style={{
              display: "inline-block",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              background: c.red,
              color: c.white,
              border: `2px solid ${c.redDark}`,
              borderRadius: 4,
              padding: "12px 28px",
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: 0.3,
              textDecoration: "none",
              boxShadow: `0 4px 0 ${c.redDark}`,
            }}
          >
            Reach out to book →
          </a>

          <div
            style={{
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              fontSize: 11,
              color: c.muted,
              marginTop: 12,
              fontStyle: "italic",
            }}
          >
            Real one-tap booking coming soon. For now it just opens a draft email.
          </div>
        </div>
      )}
    </>
  );
}
