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
/* Palette: warm mom-and-pop diner.                                  */
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
    name: "Jason & Julia",
    stars: 5,
    body:
      "As the beta testers of Crepe Sundays, we were so touched by the thought Matt and Nat put into hosting. From an array of fresh crepe toppings to coordinated outfits and a curated playlist, we can’t think of a better way to spend Sunday morning. Already looking forward to our next visit!",
  },
  {
    name: "Tom & Lex",
    stars: 5,
    body: "It was such a delight to be hosted by Matt & Nat for crepe sundays. They created a space for generous hospitality and connection right in the heart of the west village. Five stars for these two!",
  },
];

const FAQ = [
  {
    q: "What's it cost?",
    a: "Nothing. We just love feeding people. If you really want to bring something, flowers or a bottle or a book you loved are all great. But truly, never required.",
  },
  {
    q: "Where is it?",
    a: "Our apartment in the West Village. We'll text you the address once we confirm your date.",
  },
  {
    q: "Can I bring someone?",
    a: "Yes. Every reservation seats two, so bring one. Tell us who you're bringing when you book and we'll say hi by name when you walk in.",
  },
  {
    q: "How long does it usually go?",
    a: "About 90 minutes. First crepe hits the pan at 11 sharp. Most folks roll out around 12:30 stuffed.",
  },
  {
    q: "What should I bring?",
    a: "An appetite. That's it.",
  },
];

type Photo = { src?: string; caption: string };

const PHOTOS: Photo[] = [
  { src: "/crepes/IMG_2808.jpeg", caption: "Fresh strawberries & bananas" },
  { src: "/crepes/IMG_2813.jpeg", caption: "The hosts" },
  { caption: "The first crepe of the morning" },
  { caption: "Sunday morning" },
  { caption: "Strawberry & cream" },
  { caption: "Sunday morning regulars" },
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
      {/* Scoped style: smooth in-page scroll + FAQ +/× toggle via rotate. */}
      <style>{`
        html { scroll-behavior: smooth; }
        .fm-faq-toggle {
          display: inline-block;
          transition: transform 180ms ease;
        }
        details[open] > summary .fm-faq-toggle {
          transform: rotate(45deg);
        }
        details > summary::-webkit-details-marker { display: none; }
      `}</style>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 20px" }}>
        {/* ─── Hero: illustrated cover ─────────────────────────── */}
        <section style={{ padding: "20px 0 8px", textAlign: "center" }}>
          {/* The cover already contains the wordmark + "with Matt & Nat" subtitle,
              so we let the artwork carry the hero and skip a redundant text title. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/crepes/cover.png"
            alt="Crepe Sundays with Matt and Nat. Illustrated cover of Matt and Nat at the breakfast table with plates of crepes, bananas, and strawberries."
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
            🥞 Every Sunday at 11am
          </div>

          {/* Primary CTA above the fold so users can book in one tap. */}
          <div style={{ marginBottom: 20 }}>
            <a
              href="#reservations"
              style={{
                display: "inline-block",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                background: c.red,
                color: c.white,
                border: `2px solid ${c.redDark}`,
                borderRadius: 4,
                padding: "14px 32px",
                fontWeight: 800,
                fontSize: 17,
                letterSpacing: 0.3,
                textDecoration: "none",
                boxShadow: `0 5px 0 ${c.redDark}`,
              }}
            >
              Book Your Sunday →
            </a>
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
            Every Sunday we open our home to 2 lovely guests and treat them to
            the Crepe Sundays experience. Expect to indulge in crepes with a
            variety of toppings, some fresh squeezed orange juice &amp; a couple
            of surprises. Please book your reservation below.
          </p>
        </section>

        {/* ─── Booking calendar (heading lives inside the receipt) ── */}
        <section id="reservations" style={{ padding: "48px 0 16px", scrollMarginTop: 16 }}>
          <CalendarSection palette={c} />
        </section>

        {/* ─── Photo strip (horizontal swipe) ──────────────────── */}
        <section style={{ padding: "48px 0 16px" }}>
          <SectionTitle eyebrow="" title="Past Sundays" />
          {/* Horizontal swipe carousel. Hide native scrollbar via the global
              rule injected below; keep keyboard/touch scrolling intact. */}
          <style
            dangerouslySetInnerHTML={{
              __html: `.crepes-photo-swipe::-webkit-scrollbar { display: none; }`,
            }}
          />
          <div
            className="crepes-photo-swipe"
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              marginTop: 24,
              marginInline: -20, // bleed to viewport edges on mobile
              paddingInline: 20,
              paddingBottom: 8,
              scrollbarWidth: "none",
            }}
          >
            {PHOTOS.map((p, i) => (
              <div
                key={i}
                style={{
                  flex: "0 0 80%",
                  maxWidth: 360,
                  scrollSnapAlign: "center",
                }}
              >
                <PhotoPlaceholder index={i} caption={p.caption} src={p.src} />
              </div>
            ))}
          </div>
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

        {/* ─── FAQ ─────────────────────────────────────────────── */}
        <section style={{ padding: "48px 0" }}>
          <SectionTitle eyebrow="Before you come" title="Frequently asked" />
          <div style={{ maxWidth: 640, margin: "28px auto 0" }}>
            {FAQ.map((item, i) => (
              <FAQRow key={i} item={item} isLast={i === FAQ.length - 1} />
            ))}
          </div>

          {/* Repeated CTA so the page ends with a clear action. */}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <a
              href="#reservations"
              style={{
                display: "inline-block",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                background: c.red,
                color: c.white,
                border: `2px solid ${c.redDark}`,
                borderRadius: 4,
                padding: "14px 32px",
                fontWeight: 800,
                fontSize: 17,
                letterSpacing: 0.3,
                textDecoration: "none",
                boxShadow: `0 5px 0 ${c.redDark}`,
              }}
            >
              Book Your Sunday →
            </a>
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
              lineHeight: 1.3,
            }}
          >
            Come hungry, leave full.
          </div>
          <div
            style={{
              fontStyle: "italic",
              fontFamily: display.style.fontFamily,
              fontSize: 16,
              color: c.ink,
              fontWeight: 600,
            }}
          >
            With love, Matt + Nat
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
      {eyebrow && (
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
      )}
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

function PhotoPlaceholder({
  index,
  caption,
  src,
}: {
  index: number;
  caption: string;
  src?: string;
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
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={caption}
          loading="lazy"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
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
      )}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "10px 12px",
          background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.6))",
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

function FAQRow({
  item,
  isLast,
}: {
  item: { q: string; a: string };
  isLast: boolean;
}) {
  return (
    <details
      style={{
        borderTop: `1px solid ${c.hairline}`,
        borderBottom: isLast ? `1px solid ${c.hairline}` : "none",
        padding: "16px 4px",
      }}
    >
      <summary
        style={{
          listStyle: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          fontSize: 18,
          fontWeight: 600,
          color: c.ink,
          letterSpacing: -0.2,
        }}
      >
        <span>{item.q}</span>
        <span
          aria-hidden
          style={{
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            fontSize: 22,
            color: c.red,
            fontWeight: 400,
            flexShrink: 0,
          }}
          className="fm-faq-toggle"
        >
          +
        </span>
      </summary>
      <p
        style={{
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: 15,
          lineHeight: 1.6,
          color: c.body,
          margin: "10px 0 0",
        }}
      >
        {item.a}
      </p>
    </details>
  );
}

function ReviewCard({
  review,
}: {
  review: { name: string; stars: number; body: string };
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
        <strong style={{ color: c.ink, fontSize: 16 }}>{review.name}</strong>
      </div>
    </div>
  );
}
