import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import CalendarSection from "./CalendarSection";

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Crepe Sundays · Matt & Nat",
  description:
    "A standing Sunday morning crepe bar at our place. One seat per week. Friends only. Come hungry.",
};

/* ──────────────────────────────────────────────────────────────── */
/* Palette — warm mom-and-pop diner.                                */
/* ──────────────────────────────────────────────────────────────── */
const c = {
  // Sampled directly from the watercolor's paper (#FEFFFA–#FFFFFF) so the
  // illustration blends seamlessly into the page.
  cream: "#FEFFFA",
  creamDark: "#EFE6D2",
  red: "#B23A2A",
  redDark: "#8A2A1E",
  mustard: "#D9A441",
  ink: "#2A1A14",
  body: "#4B3A2F",
  muted: "#7C6A5D",
  white: "#FFFCF6",
  hairline: "#D9CDB1",
};

/* ──────────────────────────────────────────────────────────────── */
/* Content                                                          */
/* ──────────────────────────────────────────────────────────────── */
const REVIEWS = [
  {
    name: "Emma",
    where: "Brooklyn",
    stars: 5,
    body: "Matt's banana-nutella crepe ruined every other crepe for me. Nat's espresso is no joke either.",
  },
  {
    name: "Diego",
    where: "Jersey City",
    stars: 5,
    body: "It's the best two hours of my Sunday. They make you feel like family the second you walk in.",
  },
  {
    name: "Priya",
    where: "Manhattan",
    stars: 5,
    body: "The savory ham-and-cheese is unreal. I came hungry, left hugged, brought my mom the next week.",
  },
  {
    name: "Sam",
    where: "Astoria",
    stars: 5,
    body: "If you get the invite, GO. Don't ask questions. Just go.",
  },
];

const PHOTOS = [
  { caption: "The first crepe of the morning" },
  { caption: "Nat at the espresso bar" },
  { caption: "Strawberry & cream" },
  { caption: "Sunday morning regulars" },
  { caption: "Ham, gruyère, runny egg" },
  { caption: "The line forms around 10:55" },
];

/* ──────────────────────────────────────────────────────────────── */

export default function CrepesPage() {
  return (
    <div
      className={display.className}
      style={{
        background: c.cream,
        color: c.ink,
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 20px" }}>
        {/* ─── Hero — illustrated cover ────────────────────────── */}
        <section style={{ padding: "20px 0 8px", textAlign: "center" }}>
          {/* The cover already contains the wordmark + "with Matt & Nat" subtitle,
              so we let the artwork carry the hero and skip a redundant text title. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/crepes/cover.png"
            alt="Crepe Sundays with Matt & Nat — illustrated cover of Matt and Nat at the breakfast table with plates of crepes, bananas, and strawberries"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: 4,
            }}
          />

          <div
            style={{
              display: "inline-block",
              padding: "6px 14px",
              borderRadius: 999,
              background: c.red,
              color: c.white,
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              margin: "8px 0 20px",
            }}
          >
            🥞 Open Sundays · 11 AM sharp
          </div>

          {/* Decorative rule with star */}
          <DividerWithStar />

          <p
            style={{
              fontFamily:
                "ui-sans-serif, system-ui, -apple-system, sans-serif",
              fontSize: 17,
              lineHeight: 1.65,
              color: c.body,
              maxWidth: 540,
              margin: "24px auto 0",
            }}
          >
            Every Sunday morning, our kitchen turns into a little neighborhood
            crepe bar. Matt makes the crepes — sweet, savory, off-menu requests
            welcome. Nat runs the espresso.{" "}
            <strong>One reservation a week — table for two.</strong>{" "}
            Friends only, and friends of friends if we like you.
          </p>
        </section>

        {/* ─── Menu strip / "today's specials" ─────────────────── */}
        <MenuStrip />

        {/* ─── Booking calendar ────────────────────────────────── */}
        <section style={{ padding: "48px 0 16px" }}>
          <SectionTitle eyebrow="Reservations" title="Book your Sunday" />
          <p
            style={{
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              fontSize: 15,
              color: c.muted,
              textAlign: "center",
              maxWidth: 460,
              margin: "0 auto 28px",
            }}
          >
            One 11:00 AM reservation per Sunday — seats two. Tap a date to
            reach out and Nat will confirm by text.
          </p>
          <CalendarSection palette={c} />
        </section>

        {/* ─── Photo strip ─────────────────────────────────────── */}
        <section style={{ padding: "48px 0 16px" }}>
          <SectionTitle eyebrow="On the griddle" title="Past Sundays" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              marginTop: 24,
            }}
          >
            {PHOTOS.map((p, i) => (
              <PhotoPlaceholder key={i} index={i} caption={p.caption} />
            ))}
          </div>
          <p
            style={{
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              fontSize: 12,
              color: c.muted,
              textAlign: "center",
              marginTop: 16,
              fontStyle: "italic",
            }}
          >
            Drop real photos into <code>public/crepes/</code> and they&rsquo;ll
            slot right in.
          </p>
        </section>

        {/* ─── Reviews ─────────────────────────────────────────── */}
        <section style={{ padding: "48px 0" }}>
          <SectionTitle eyebrow="The regulars say" title="Word of mouth" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
              marginTop: 24,
            }}
          >
            {REVIEWS.map((r, i) => (
              <ReviewCard key={i} review={r} />
            ))}
          </div>
        </section>

        {/* ─── Footer ──────────────────────────────────────────── */}
        <footer
          style={{
            borderTop: `1px solid ${c.hairline}`,
            padding: "28px 0 40px",
            textAlign: "center",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          <div
            style={{
              fontStyle: "italic",
              fontFamily: display.style.fontFamily,
              fontSize: 22,
              color: c.red,
              marginBottom: 8,
            }}
          >
            Come hungry. Leave full.
          </div>
          <div style={{ fontSize: 13, color: c.muted }}>
            Crepe Sundays · run out of a tiny West Village kitchen by{" "}
            <span style={{ color: c.ink, fontWeight: 600 }}>Matt &amp; Nat</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* Pieces                                                            */
/* ──────────────────────────────────────────────────────────────── */

function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: 11,
          color: c.red,
          letterSpacing: 2,
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          fontSize: "clamp(28px, 5vw, 40px)",
          fontWeight: 700,
          margin: 0,
          color: c.ink,
          letterSpacing: -0.5,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function DividerWithStar() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        maxWidth: 320,
        margin: "0 auto",
      }}
    >
      <div style={{ flex: 1, height: 1, background: c.hairline }} />
      <span style={{ fontSize: 16, color: c.mustard }}>★</span>
      <div style={{ flex: 1, height: 1, background: c.hairline }} />
    </div>
  );
}

function MenuStrip() {
  const items = [
    { name: "Strawberry & Cream", price: "—", note: "sweet" },
    { name: "Banana Nutella", price: "—", note: "house favorite" },
    { name: "Ham, Gruyère, Egg", price: "—", note: "savory" },
    { name: "Off-menu", price: "—", note: "just ask" },
  ];
  return (
    <div
      style={{
        background: c.white,
        border: `2px solid ${c.ink}`,
        borderRadius: 4,
        padding: "16px 20px",
        marginTop: 8,
        boxShadow: `0 6px 0 ${c.ink}`,
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: 10,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: c.muted,
          marginBottom: 8,
        }}
      >
        — On the menu —
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 10,
        }}
      >
        {items.map((it) => (
          <div key={it.name} style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: c.ink,
              }}
            >
              {it.name}
            </div>
            <div
              style={{
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                fontSize: 11,
                color: c.muted,
                fontStyle: "italic",
                marginTop: 2,
              }}
            >
              {it.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotoPlaceholder({
  index,
  caption,
}: {
  index: number;
  caption: string;
}) {
  // Subtle palette variation per tile so the strip feels warm even without real images.
  const tints = [c.creamDark, c.mustard + "55", c.red + "22", c.creamDark, c.mustard + "33", c.red + "33"];
  const bg = tints[index % tints.length];
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        borderRadius: 6,
        overflow: "hidden",
        background: bg,
        border: `1px solid ${c.hairline}`,
        boxShadow: `0 3px 0 ${c.ink}11`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
        }}
      >
        🥞
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "10px 12px",
          background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.55))",
          color: c.white,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: 12,
          fontStyle: "italic",
          letterSpacing: 0.2,
        }}
      >
        {caption}
      </div>
    </div>
  );
}

function ReviewCard({
  review,
}: {
  review: { name: string; where: string; stars: number; body: string };
}) {
  return (
    <div
      style={{
        background: c.white,
        border: `1px solid ${c.hairline}`,
        borderRadius: 6,
        padding: 20,
        position: "relative",
      }}
    >
      <div style={{ color: c.mustard, fontSize: 14, marginBottom: 8 }}>
        {"★".repeat(review.stars)}
      </div>
      <blockquote
        style={{
          margin: 0,
          fontSize: 18,
          fontStyle: "italic",
          lineHeight: 1.4,
          color: c.body,
          fontWeight: 400,
        }}
      >
        &ldquo;{review.body}&rdquo;
      </blockquote>
      <div
        style={{
          marginTop: 14,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: 13,
          color: c.muted,
        }}
      >
        — <strong style={{ color: c.ink }}>{review.name}</strong>, {review.where}
      </div>
    </div>
  );
}
