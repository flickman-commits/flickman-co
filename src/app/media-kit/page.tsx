import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Media Kit | Flickman & Topline",
  description:
    "Partner with Matt Hickman (@flickman) and Topline, the show that breaks down the P&Ls of real businesses.",
  // Shared directly with brands; keep rates out of search results.
  robots: { index: false, follow: false },
};

/* ── Everything editable lives here ─────────────────────────────── */

const EMAIL = "matt@flickmanmedia.com";
const IG_FLICKMAN = "https://www.instagram.com/flickman/";
const IG_TOPLINE = "https://www.instagram.com/topline_________/";
const TRACKSTAR = "https://www.trackstar.art";
const STATS_AS_OF = "October 2026";

const STATS = [
  { value: "43K", label: "followers across @flickman and Topline" },
  { value: "245K", label: "average views per Topline episode" },
  { value: "1M+", label: "views in Topline's first month" },
  { value: "334K", label: "views on the top episode (Crunch Fitness)" },
];

// Top-performing Topline episodes (posted as collabs on both accounts).
const TOP_VIDEOS = [
  { name: "Crunch Fitness", img: "/media-kit/crunch.jpg", views: "334K", likes: "3,844", comments: "147", id: "DcjVsadI0S6" },
  { name: "AMC Theatres", img: "/media-kit/amc.jpg", views: "227K", likes: "4,856", comments: "97", id: "DcwIqH5oUAT" },
  { name: "Popeyes", img: "/media-kit/popeyes.jpg", views: "166K", likes: "2,376", comments: "54", id: "DdomcCdoZwX" },
  { name: "Domino's", img: "/media-kit/dominos.jpg", views: "162K", likes: "1,664", comments: "74", id: "DdE4BXfIpY6" },
  { name: "Potbelly", img: "/media-kit/potbelly.jpg", views: "154K", likes: "810", comments: "17", id: "DdPnFkXo9G5" },
  { name: "CAVA", img: "/media-kit/cava.jpg", views: "148K", likes: "1,738", comments: "41", id: "DdXio0Oo91j" },
];

// Starting rates. Confirm before sharing.
const OFFERS = [
  {
    channel: "Topline",
    title: "P&L line item",
    price: "From $2,500",
    body: "Your product shows up as a line item in a real business breakdown. A payroll company becomes the payroll line, a POS becomes the card fees line. Viewers see exactly where you fit in a business like theirs.",
    best: "B2B software for brick-and-mortar: payroll, POS, scheduling, bookkeeping, lending, insurance.",
  },
  {
    channel: "Topline",
    title: "Sponsored episode",
    price: "From $5,000",
    body: "A full breakdown built around your brand: your franchise, or a business that runs on your product.",
    best: "Franchise brands and B2B companies with a customer story to tell.",
  },
  {
    channel: "Flickman",
    title: "Dedicated Reel",
    price: "From $1,000",
    body: "A Reel on @flickman about running, New York City, business, or art and marketing. Whatever fits your brand best.",
    best: "Running and fitness brands, NYC lifestyle, creative and marketing tools.",
  },
  {
    channel: "Flickman",
    title: "Story set",
    price: "From $400",
    body: "Three Instagram Stories with a link sticker, straight to your site.",
    best: "Launches, promo codes, and events.",
  },
  {
    channel: "Trackstar",
    title: "Poster collab",
    price: "Custom",
    body: "Co-branded race posters through Trackstar, my running poster brand. A keepsake runners actually hang on the wall.",
    best: "Race sponsors and running brands.",
  },
];

const FORMATS = [
  "Instagram Reels",
  "Stories with link sticker",
  "Collab posts on @flickman and Topline",
  "Carousels",
  "Link in bio",
  "Usage rights and whitelisting (add-on)",
  "Race posters with Trackstar",
];

// Paid brand partners. The section is hidden while this list is empty.
const PAST_PARTNERS: { name: string; url?: string }[] = [];

const FEATURED = ["Crunch Fitness", "AMC Theatres", "Popeyes", "Domino's", "CAVA", "Potbelly", "McDonald's"];

/* ── Pieces ─────────────────────────────────────────────────────── */

function ToplineHandle() {
  return (
    <span className="mk-handle">
      <span className="mk-sr">@topline_________</span>
      <span aria-hidden="true">
        @topline
        <i className="mk-us" />
      </span>
    </span>
  );
}

function LineItemExample() {
  const rows = [
    { label: "Cost of goods", amount: "$14,460" },
    { label: "Payroll", amount: "$13,980", sponsor: "Your payroll app" },
    { label: "Rent", amount: "$6,750" },
    { label: "Card fees & other", amount: "$6,610" },
  ];
  return (
    <div className="mk-pl">
      <div className="mk-pl-title">Coffee shop P&amp;L</div>
      <div className="mk-pl-sub">One month, from a Topline breakdown</div>
      <div className="mk-pl-row mk-pl-rev">
        <span>Revenue</span>
        <strong>$48,200</strong>
      </div>
      {rows.map((r) => (
        <div key={r.label} className={r.sponsor ? "mk-pl-row mk-pl-sponsor" : "mk-pl-row"}>
          <span>
            {r.label}
            {r.sponsor && <em>{r.sponsor}</em>}
          </span>
          <strong>{r.amount}</strong>
        </div>
      ))}
      <div className="mk-pl-kept">
        <span>What they kept</span>
        <strong>$6,400</strong>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */

export default function MediaKitPage() {
  return (
    <main className="mk">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="mk-top">
        <div className="mk-logo">Flickman</div>
        <a className="mk-top-link" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
      </header>

      {/* Hero */}
      <section className="mk-wrap mk-hero">
        <div className="mk-hero-grid">
          <div>
            <div className="mk-kicker">Media kit</div>
            <h1>Partner with Flickman &amp; Topline</h1>
            <p className="mk-lede">
              I&apos;m Matt Hickman. I make Topline, a show that breaks down the P&amp;Ls
              of real local businesses, plus content on running and life in New York
              City. My audience is business owners, operators, and people who want to
              be one.
            </p>
            <a className="mk-btn" href={`mailto:${EMAIL}?subject=Partnership`}>
              Work with me
            </a>
          </div>
          <a className="mk-hero-img" href={IG_TOPLINE} target="_blank" rel="noopener noreferrer">
            <Image
              src="/topline/episode.jpg"
              alt="Matt filming a Topline episode on a New York street"
              width={360}
              height={640}
              priority
            />
          </a>
        </div>
        <div className="mk-stats">
          {STATS.map((s) => (
            <div key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="mk-asof">Stats as of {STATS_AS_OF}.</div>
      </section>

      {/* Channels */}
      <section className="mk-section mk-alt">
        <div className="mk-wrap">
          <h2>Two ways to reach people</h2>
          <div className="mk-cols">
            <div className="mk-card">
              <div className="mk-card-top">
                <h3>Topline</h3>
                <a href={IG_TOPLINE} target="_blank" rel="noopener noreferrer">
                  <ToplineHandle />
                </a>
              </div>
              <p>
                Short breakdowns of real brick-and-mortar businesses and franchises: what
                they make, what they spend, and what they keep.
              </p>
              <dl>
                <dt>Audience</dt>
                <dd>Small business owners, franchise owners and buyers, operators, and the finance-curious.</dd>
                <dt>Best for</dt>
                <dd>Franchise brands and B2B software that serves brick-and-mortar businesses.</dd>
              </dl>
            </div>
            <div className="mk-card">
              <div className="mk-card-top">
                <h3>Flickman</h3>
                <a href={IG_FLICKMAN} target="_blank" rel="noopener noreferrer">
                  @flickman
                </a>
              </div>
              <p>
                My personal page: running, New York City lifestyle, business breakdowns,
                and the art and marketing world.
              </p>
              <dl>
                <dt>Audience</dt>
                <dd>Runners, New Yorkers, founders, and creatives.</dd>
                <dt>Best for</dt>
                <dd>Running and fitness brands, NYC lifestyle, creative and marketing tools.</dd>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Top videos */}
      <section className="mk-section">
        <div className="mk-wrap">
          <h2>Videos that did well</h2>
          <p className="mk-sub">Recent Topline episodes, posted on both accounts.</p>
          <div className="mk-videos">
            {TOP_VIDEOS.map((v) => (
              <a
                key={v.id}
                className="mk-video"
                href={`https://www.instagram.com/reel/${v.id}/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image src={v.img} alt={`Topline episode on ${v.name}`} width={360} height={640} />
                <div className="mk-video-info">
                  <strong>{v.name}</strong>
                  <span className="mk-views">{v.views} views</span>
                  <span className="mk-eng">
                    {v.likes} likes · {v.comments} comments
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Offers */}
      <section className="mk-section mk-alt">
        <div className="mk-wrap">
          <h2>Ways to work together</h2>
          <p className="mk-sub">Starting rates. Bundles and custom ideas welcome.</p>
          <div className="mk-offers">
            {OFFERS.map((o) => (
              <div key={o.title} className="mk-offer">
                <div className="mk-offer-top">
                  <span className="mk-tag">{o.channel}</span>
                  <span className="mk-price">{o.price}</span>
                </div>
                <h3>{o.title}</h3>
                <p>{o.body}</p>
                <p className="mk-best">
                  <strong>Best for:</strong> {o.best}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Line item */}
      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-split">
            <div>
              <h2>The most natural ad on the show</h2>
              <p className="mk-body">
                Every Topline episode walks through a real P&amp;L. If your product is a
                cost every business has, like payroll, POS, insurance, or software, it can
                be one of the lines.
              </p>
              <p className="mk-body">
                It doesn&apos;t interrupt the story. It&apos;s part of it, and viewers see
                exactly where you fit in a business like theirs.
              </p>
            </div>
            <LineItemExample />
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className="mk-section mk-alt">
        <div className="mk-wrap">
          <h2>Formats</h2>
          <ul className="mk-chips">
            {FORMATS.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Brands */}
      <section className="mk-section">
        <div className="mk-wrap">
          {PAST_PARTNERS.length > 0 && (
            <div className="mk-brands">
              <h2>Brands I&apos;ve worked with</h2>
              <ul className="mk-chips mk-chips-strong">
                {PAST_PARTNERS.map((p) => (
                  <li key={p.name}>
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noopener noreferrer">
                        {p.name}
                      </a>
                    ) : (
                      p.name
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <h2>Featured on Topline</h2>
          <p className="mk-sub">Businesses we&apos;ve broken down. Editorial, not sponsored.</p>
          <ul className="mk-chips">
            {FEATURED.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="mk-note">
            Running brands: ask about co-branded race posters with{" "}
            <a href={TRACKSTAR} target="_blank" rel="noopener noreferrer">
              Trackstar
            </a>
            .
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="mk-section mk-alt">
        <div className="mk-wrap mk-contact">
          <h2>Let&apos;s work together</h2>
          <p className="mk-body">Tell me about your brand and what you have in mind.</p>
          <a className="mk-btn" href={`mailto:${EMAIL}?subject=Partnership`}>
            Email {EMAIL}
          </a>
        </div>
      </section>

      <footer className="mk-foot">Flickman · Topline · Trackstar</footer>
    </main>
  );
}

/* ── Styles ─────────────────────────────────────────────────────── */

const CSS = `
.mk {
  --bg: #FBFAF8; --ink: #1A1A1A; --ink2: #5A554D; --muted: #8C8C8C;
  --label: #B9B3AA; --hair: #E7E3DC; --track: #EEEBE6;
  --orange: #FF7F4A; --orange-text: #E0561F; --green: #0E7A45;
  background: var(--bg); color: var(--ink); min-height: 100vh;
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
}
.mk * { box-sizing: border-box; }
.mk a { color: inherit; }
.mk-wrap { max-width: 1040px; margin: 0 auto; padding: 0 20px; }
.mk-top { display: flex; justify-content: space-between; align-items: center; gap: 12px;
  max-width: 1040px; margin: 0 auto; padding: 16px 20px; }
.mk-logo { font-weight: 800; font-size: 18px; letter-spacing: -0.5px; }
.mk-top-link { font-size: 13px; font-weight: 600; text-decoration: none; color: var(--ink2) !important;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.mk-hero { padding-top: clamp(20px, 5vw, 56px); padding-bottom: clamp(40px, 6vw, 64px); }
.mk-hero-grid { display: grid; gap: 28px; align-items: center; }
.mk-kicker { font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--orange-text); margin-bottom: 10px; }
.mk h1 { font-size: clamp(36px, 6vw, 64px); font-weight: 800; line-height: 1.02; letter-spacing: -1.8px; margin: 0; }
.mk-lede { font-size: clamp(16.5px, 2vw, 19px); font-weight: 500; line-height: 1.5; color: var(--ink2); margin: 16px 0 22px; max-width: 560px; }
.mk-btn { display: inline-block; background: var(--ink); color: #fff !important; font-weight: 700; font-size: 16px;
  text-decoration: none; border-radius: 12px; padding: 14px 24px; transition: transform 120ms ease; }
.mk-btn:hover { transform: translateY(-2px); }
.mk-hero-img img { display: block; width: 100%; max-width: 170px; height: auto; margin: 0 auto;
  border-radius: 22px; box-shadow: 0 16px 36px rgba(26,26,26,0.18); }
@media (min-width: 760px) {
  .mk-hero-grid { grid-template-columns: 1fr 260px; gap: 56px; }
  .mk-hero-img img { max-width: none; }
}
.mk-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 14px; margin-top: 36px; }
@media (min-width: 760px) { .mk-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.mk-stats div { border-top: 3px solid var(--orange); padding-top: 10px; }
.mk-stats strong { display: block; font-size: clamp(30px, 5vw, 44px); font-weight: 800; letter-spacing: -1.4px; line-height: 1; }
.mk-stats span { display: block; font-size: 13px; font-weight: 500; line-height: 1.35; color: var(--muted); margin-top: 6px; }
.mk-asof { font-size: 12px; color: var(--label); margin-top: 14px; font-weight: 500; }

.mk-section { padding: clamp(40px, 7vw, 72px) 0; }
.mk-alt { background: #F2EEE7; --hair: #E1DBD1; border-radius: 24px; margin: 0 8px; }
@media (min-width: 760px) { .mk-alt { border-radius: 40px; margin: 0 24px; } }
.mk h2 { font-size: clamp(27px, 4.2vw, 38px); font-weight: 800; letter-spacing: -1px; line-height: 1.1; margin: 0 0 18px; }
.mk h3 { font-size: 19px; font-weight: 800; letter-spacing: -0.4px; margin: 0; }
.mk-sub { color: var(--ink2); font-weight: 500; font-size: 15.5px; margin: -8px 0 20px; }
.mk-body { color: var(--ink2); font-weight: 500; font-size: 16.5px; line-height: 1.55; margin: 0 0 12px; max-width: 560px; }

.mk-cols { display: grid; gap: 14px; }
@media (min-width: 760px) { .mk-cols { grid-template-columns: 1fr 1fr; } }
.mk-card { background: #fff; border: 1px solid var(--hair); border-radius: 20px; padding: 22px; }
.mk-card-top { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.mk-card-top a { font-size: 14px; font-weight: 700; text-decoration: none; color: var(--orange-text) !important; }
.mk-card p { margin: 0 0 14px; color: var(--ink2); font-weight: 500; line-height: 1.5; font-size: 15.5px; }
.mk-card dl { margin: 0; display: grid; gap: 4px; }
.mk-card dt { font-size: 11px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; color: var(--label); margin-top: 8px; }
.mk-card dd { margin: 0; font-size: 15px; font-weight: 500; line-height: 1.45; }
.mk-handle { white-space: nowrap; }
.mk-us { display: inline-block; width: 4.4em; height: 2px; background: currentColor; vertical-align: -0.15em; margin-left: 0.06em; }
.mk-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.mk-videos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
@media (min-width: 760px) { .mk-videos { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; } }
.mk-video { display: block; text-decoration: none; background: #fff; border: 1px solid var(--hair);
  border-radius: 18px; overflow: hidden; transition: transform 120ms ease; }
.mk-video:hover { transform: translateY(-3px); }
.mk-video img { display: block; width: 100%; height: auto; aspect-ratio: 9 / 16; object-fit: cover; }
.mk-video-info { padding: 12px 14px 14px; display: grid; gap: 2px; }
.mk-video-info strong { font-size: 15px; font-weight: 800; }
.mk-views { font-size: 20px; font-weight: 800; color: var(--orange-text); letter-spacing: -0.5px; }
.mk-eng { font-size: 12px; font-weight: 500; color: var(--muted); }

.mk-offers { display: grid; gap: 12px; }
@media (min-width: 760px) { .mk-offers { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; } }
.mk-offer { background: #fff; border: 1px solid var(--hair); border-radius: 20px; padding: 20px 20px 18px; display: flex; flex-direction: column; }
.mk-offer-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; }
.mk-tag { font-size: 11px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: var(--ink2);
  background: var(--track); padding: 4px 9px; border-radius: 6px; }
.mk-price { font-size: 17px; font-weight: 800; letter-spacing: -0.3px; }
.mk-offer h3 { margin-bottom: 6px; }
.mk-offer p { margin: 0 0 10px; color: var(--ink2); font-weight: 500; line-height: 1.5; font-size: 15px; }
.mk-offer .mk-best { margin: auto 0 0; padding-top: 10px; border-top: 1px solid var(--hair); font-size: 14px; }
.mk-best strong { color: var(--ink); }

.mk-split { display: grid; gap: 24px; align-items: center; }
@media (min-width: 760px) { .mk-split { grid-template-columns: 1fr 380px; gap: 48px; } }
.mk-pl { background: #fff; border: 1px solid var(--hair); border-radius: 20px; padding: 20px; }
.mk-pl-title { font-size: 22px; font-weight: 800; letter-spacing: -0.6px; }
.mk-pl-sub { font-size: 13px; color: var(--muted); font-weight: 500; margin: 2px 0 14px; }
.mk-pl-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 9px 10px;
  border-bottom: 1px solid var(--hair); font-size: 15px; font-weight: 500; }
.mk-pl-row strong { font-variant-numeric: tabular-nums; }
.mk-pl-rev { font-weight: 700; }
.mk-pl-sponsor { border: 2px solid var(--orange); border-radius: 12px; background: #FFF4EE; margin: 4px 0; }
.mk-pl-sponsor em { display: block; font-style: normal; font-size: 12px; font-weight: 700; color: var(--orange-text); margin-top: 1px; }
.mk-pl-kept { display: flex; justify-content: space-between; margin-top: 12px; background: var(--green); color: #fff;
  border-radius: 12px; padding: 12px 14px; font-weight: 800; }

.mk-chips { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.mk-chips li { background: #fff; border: 1px solid var(--hair); border-radius: 999px; padding: 8px 14px;
  font-size: 14.5px; font-weight: 600; }
.mk-chips a { text-decoration: none; }
.mk-brands { margin-bottom: 36px; }
.mk-note { margin: 22px 0 0; font-size: 15px; color: var(--ink2); font-weight: 500; }
.mk-note a { font-weight: 700; color: var(--ink) !important; }

.mk-contact { text-align: center; }
.mk-contact .mk-body { margin: 0 auto 18px; }
.mk-contact .mk-btn { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.mk-foot { text-align: center; font-size: 13px; font-weight: 600; color: var(--label); padding: 24px 20px 36px; }
`;
