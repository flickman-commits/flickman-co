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
const IG_TRACKSTAR = "https://www.instagram.com/trackstar_art/";
const STATS_AS_OF = "October 2026";

const STATS = [
  { value: "45K", unit: "followers", label: <>across @flickman and <ToplineHandle /></> },
  { value: "290K", unit: "views", label: "average per business breakdown" },
  { value: "7M+", unit: "views", label: "total on business breakdowns" },
  { value: "853K", unit: "views", label: "on the top breakdown" },
]

// Topline episodes, posted as collabs on both accounts. Views from the @flickman Reels tab.
const TOP_VIDEOS = [
  { name: "AMC Theatres", img: "/media-kit/amc.jpg", views: "356K", id: "DcwIqH5oUAT" },
  { name: "Crunch Fitness", img: "/media-kit/crunch.jpg", views: "355K", id: "DcjVsadI0S6" },
  { name: "Popeyes", img: "/media-kit/popeyes.jpg", views: "253K", id: "DdomcCdoZwX" },
  { name: "Domino's", img: "/media-kit/dominos.jpg", views: "252K", id: "DdE4BXfIpY6" },
  { name: "Potbelly", img: "/media-kit/potbelly.jpg", views: "235K", id: "DdPnFkXo9G5" },
  { name: "CAVA", img: "/media-kit/cava.jpg", views: "223K", id: "DdXio0Oo91j" },
];

// Paid partnership example. Add the reel ID (instagram.com/reel/<id>/) to link it.
const FUNBOX = { id: "", views: "160K" };

// Line-item rates per channel. Placeholders; edit freely.
const RATES = {
  topline: [
    { item: "Sponsored episode", note: "A full breakdown of your franchise or a business that runs on your product.", price: "$5,000" },
    { item: "P&L line item", note: "Your product appears as a real line in an episode, like payroll or POS.", price: "$2,500" },
    { item: "Collab Reel on Topline + @flickman", price: "$3,500" },
    { item: "Whitelisting, per month", price: "50% of fee" },
  ],
  flickman: [
    { item: "Reel", note: "Running, New York City, business, or art and marketing.", price: "$1,000" },
    { item: "Story set", note: "Three Stories with a link sticker.", price: "$400" },
    { item: "Whitelisting, per month", price: "50% of fee" },
  ],
};const RATES_NOTE = "Whitelisting is billed each month at 50% of the upfront fee.";

// @flickman Instagram insights. Reach is the last 90 days; demographics the last 30.
const AUDIENCE_AS_OF = "October 2, 2026";
const REACH = [
  { value: "8.3M", label: "views in the last 90 days (6.2M Instagram, 2.1M Facebook)" },
  { value: "2.6M", label: "unique viewers in the last 90 days" },
  { value: "96%", label: "of views from people who don't follow yet" },
  { value: "31.8K", label: "accounts engaged in the last 30 days" },
];
const DEMOS = [
  { title: "Gender", rows: [["Men", "84%"], ["Women", "16%"]] },
  { title: "Age", rows: [["25-34", "32%"], ["35-44", "36%"], ["45-54", "19%"], ["Other", "13%"]] },
  { title: "Top countries", rows: [["United States", "66%"], ["Canada", "6%"], ["United Kingdom", "3%"]] },
  { title: "Top cities", rows: [["New York", "9.6%"], ["Los Angeles", "2.6%"], ["San Diego", "1.4%"], ["Toronto", "1.4%"]] },
];


// Trackstar co-branded print examples.
const PRINTS = [
  { name: "Brooks Running", img: "/media-kit/posters/brooks.jpg" },
  { name: "New Balance", img: "/media-kit/posters/new-balance.jpg" },
  { name: "Ulman Foundation", img: "/media-kit/posters/ulman.jpg" },
  { name: "Release Foundation", img: "/media-kit/posters/release-foundation.jpg" },
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

function RateList({ rows }: { rows: { item: string; note?: string; price: string }[] }) {
  return (
    <div className="mk-rates">
      <div className="mk-rates-title">Ways to work together</div>
      {rows.map((r) => (
        <div key={r.item} className="mk-rate">
          <span>
            {r.item}
            {r.note && <em>{r.note}</em>}
          </span>
          <strong>{r.price}</strong>
        </div>
      ))}
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
            <div className="mk-handles">
              <a href={IG_FLICKMAN} target="_blank" rel="noopener noreferrer">@flickman</a>
              <a href={IG_TOPLINE} target="_blank" rel="noopener noreferrer"><ToplineHandle /></a>
              <a href={IG_TRACKSTAR} target="_blank" rel="noopener noreferrer">@trackstar_art</a>
            </div>
            <div className="mk-title-row">
              <a className="mk-avatar-m" href={IG_FLICKMAN} target="_blank" rel="noopener noreferrer">
                <Image src="/media-kit/flickman.jpg" alt="Matt Hickman (@flickman)" width={150} height={150} priority />
              </a>
              <h1>Media Kit</h1>
            </div>
            <p className="mk-lede">
              I&apos;m Matt Hickman. I make Topline, a show that breaks down the P&amp;Ls
              of real local businesses, plus content on running and life in New York
              City. My audience is business owners, operators, people who want to be
              one, and runners.
            </p>
            <a className="mk-btn" href={`mailto:${EMAIL}?subject=Partnership`}>
              Work with me
            </a>
          </div>
          <a className="mk-hero-img" href={IG_FLICKMAN} target="_blank" rel="noopener noreferrer">
            <Image src="/media-kit/flickman.jpg" alt="Matt Hickman (@flickman)" width={150} height={150} priority />
            <span>@flickman</span>
          </a>
        </div>
        <div className="mk-stats">
          {STATS.map((s) => (
            <div key={s.value}>
              <strong>
                {s.value} <small>{s.unit}</small>
              </strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="mk-asof">Stats as of {STATS_AS_OF}.</div>
      </section>

      {/* Audience */}
      <section className="mk-section mk-alt">
        <div className="mk-wrap">
          <h2>Audience Metrics</h2>
          <p className="mk-sub">@flickman Instagram insights as of {AUDIENCE_AS_OF}. Audience breakdown is from the last 30 days.</p>
          <div className="mk-stats mk-reach">
            {REACH.map((r) => (
              <div key={r.label}>
                <strong>{r.value}</strong>
                <span>{r.label}</span>
              </div>
            ))}
          </div>
          <div className="mk-demos">
            {DEMOS.map((d) => (
              <div key={d.title} className="mk-demo">
                <h3>{d.title}</h3>
                {d.rows.map(([k, v]) => (
                  <div key={k} className="mk-demo-row">
                    <span>{k}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
            ))}
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
                </div>
              </a>
            ))}
          </div>

          <div className="mk-partner">
            <div className="mk-partner-tag">Paid partnership</div>
            <h3>FunBox</h3>
            <p>
              FunBox, the world&apos;s biggest bounce park, sponsored a Topline breakdown of
              their own business: how a giant indoor bounce house pays New York rent. Franchise
              brands get a real look at their unit economics in front of people who want to own one.
            </p>
            <div className="mk-partner-row">
              <span className="mk-views">{FUNBOX.views} views</span>
              {FUNBOX.id && (
                <a href={`https://www.instagram.com/reel/${FUNBOX.id}/`} target="_blank" rel="noopener noreferrer">
                  Watch the episode &rarr;
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Work together */}
      <section className="mk-section mk-alt">
        <div className="mk-wrap">
          <h2>Ways to work together</h2>
          <p className="mk-sub">Starting rates. Bundles and custom ideas welcome.</p>
          <div className="mk-cols">
            <div className="mk-card">
              <div className="mk-card-top">
                <h3>Topline Account</h3>
                <a href={IG_TOPLINE} target="_blank" rel="noopener noreferrer">
                  <ToplineHandle />
                </a>
              </div>
              <p>
                Short breakdowns of real brick-and-mortar businesses and franchises: what
                they make, what they spend, and what they keep.
              </p>
              <div className="mk-pill">Audience</div>
              <p>Small business owners, franchise owners and buyers, operators, and the finance-curious.</p>
              <div className="mk-pill">Best for</div>
              <p>Franchise brands and B2B software that serves brick-and-mortar businesses.</p>
              <RateList rows={RATES.topline} />
            </div>
            <div className="mk-card">
              <div className="mk-card-top">
                <h3>Flickman Account</h3>
                <a href={IG_FLICKMAN} target="_blank" rel="noopener noreferrer">
                  @flickman
                </a>
              </div>
              <p>
                My personal page: running, New York City lifestyle, business breakdowns,
                and the art and marketing world.
              </p>
              <div className="mk-pill">Audience</div>
              <p>Runners, New Yorkers, founders, and creatives.</p>
              <div className="mk-pill">Best for</div>
              <p>Running and fitness brands, NYC lifestyle, creative and marketing tools.</p>
              <RateList rows={RATES.flickman} />
            </div>
          </div>
          <p className="mk-fine">{RATES_NOTE}</p>
        </div>
      </section>

      {/* Trackstar */}
      <section className="mk-ts">
        <div className="mk-wrap">
          <div className="mk-ts-kicker">Additional collaboration opportunity</div>
          <h2>Co-branded race prints with Trackstar</h2>
          <p className="mk-ts-body">
            <a href={TRACKSTAR} target="_blank" rel="noopener noreferrer">Trackstar</a> creates
            personalized race prints: each runner&apos;s name, finish time, pace, and course. We partner
            with brands and foundations to give them to their runners at any marathon, co-branded with
            your logo. Here are a few examples:
          </p>
          <div className="mk-prints">
            {PRINTS.map((p) => (
              <figure key={p.name}>
                <Image src={p.img} alt={`Co-branded Trackstar print example for ${p.name}`} width={900} height={900} />
                <figcaption>{p.name}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mk-ts-fine">Examples made for this kit. Pricing is custom, based on the number of runners.</p>
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
.mk-handles { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.mk-handles a { font-size: 13px; font-weight: 700; text-decoration: none; background: #fff; border: 1px solid var(--hair);
  border-radius: 999px; padding: 6px 12px; color: var(--ink2) !important; }
.mk-handles a:hover { color: var(--ink) !important; border-color: var(--ink2); }
.mk-posters { display: grid; gap: 16px; margin-top: 22px; }
@media (min-width: 760px) { .mk-posters { grid-template-columns: repeat(3, minmax(0, 1fr)); } .mk-poster { max-width: none; } }
.mk-poster-card h3 { font-size: 18px; font-weight: 800; margin: 14px 0 4px; }
.mk-poster-card p { margin: 0; color: var(--ink2); font-weight: 500; font-size: 15px; line-height: 1.45; }
.mk-poster { max-width: 260px; aspect-ratio: 3 / 4; border-radius: 14px; padding: 18px; display: flex; flex-direction: column;
  box-shadow: 0 12px 30px rgba(26,26,26,0.16); border: 6px solid #fff; }
.mk-poster-race { font-size: 13px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
.mk-poster-route { width: 100%; flex: 1; min-height: 0; margin: 10px 0; }
.mk-poster-name { color: #fff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.1; }
.mk-poster-time { color: #fff; font-size: 30px; font-weight: 800; letter-spacing: -1px; font-variant-numeric: tabular-nums; }
.mk-poster-foot { font-size: 11px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; margin-top: 10px; opacity: 0.9; }
.mk-fine { font-size: 12.5px; color: var(--label); font-weight: 500; margin: 18px 0 0; }
.mk-rates { margin-top: 18px; border-top: 1px solid var(--hair); padding-top: 12px; }
.mk-rates-title { font-size: 11px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; color: var(--label); margin-bottom: 4px; }
.mk-rate, .mk-demo-row { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; font-size: 15px; font-weight: 500;
  border-bottom: 1px solid var(--hair); }
.mk-rate:last-child, .mk-demo-row:last-child { border-bottom: 0; }
.mk-rate strong, .mk-demo-row strong { font-weight: 800; white-space: nowrap; font-variant-numeric: tabular-nums; }
.mk-reach { margin-top: 8px; }
.mk-demos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 28px; }
@media (min-width: 760px) { .mk-demos { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.mk-demo { background: #fff; border: 1px solid var(--hair); border-radius: 18px; padding: 14px; min-width: 0; }
.mk .mk-demo h3 { font-size: 13px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: var(--label); margin: 0 0 4px; }
.mk .mk-card-top h3 { font-size: clamp(24px, 3.4vw, 30px); font-weight: 800; letter-spacing: -0.8px; margin: 0; }
.mk-pill { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase;
  background: var(--ink); color: #fff; border-radius: 999px; padding: 5px 11px; margin: 4px 0 8px; }
.mk-rate span em { display: block; font-style: normal; font-size: 13px; color: var(--muted); font-weight: 500; line-height: 1.4; margin-top: 2px; }
.mk-ts { background: #161616; color: #F1E9D6; border-radius: 24px; margin: 12px 8px; padding: clamp(44px, 7vw, 80px) 0; }
.mk-ts-kicker { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 1.8px; text-transform: uppercase;
  color: #161616; background: #F1E9D6; border-radius: 999px; padding: 6px 12px; margin-bottom: 16px; }
.mk .mk-ts h2 { color: #F1E9D6; }
.mk-ts-body { font-size: 16.5px; line-height: 1.55; font-weight: 500; color: rgba(241,233,214,0.82); max-width: 640px; margin: 0 0 26px; }
.mk-ts-body a { color: #F1E9D6 !important; font-weight: 700; }
.mk-prints { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
@media (min-width: 760px) { .mk-prints { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; } }
.mk-prints figure { margin: 0; }
.mk-prints img { display: block; width: 100%; height: auto; border-radius: 14px; }
.mk-prints figcaption { font-size: 14px; font-weight: 700; margin-top: 8px; color: #F1E9D6; }
.mk-ts-fine { font-size: 12.5px; color: rgba(241,233,214,0.6); font-weight: 500; margin: 20px 0 0; }
.mk-kicker { font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--orange-text); margin-bottom: 10px; }
.mk h1 { font-size: clamp(36px, 6vw, 64px); font-weight: 800; line-height: 1.02; letter-spacing: -1.8px; margin: 0; }
.mk-lede { font-size: clamp(16.5px, 2vw, 19px); font-weight: 500; line-height: 1.5; color: var(--ink2); margin: 16px 0 22px; max-width: 560px; }
.mk-btn { display: inline-block; background: var(--ink); color: #fff !important; font-weight: 700; font-size: 16px;
  text-decoration: none; border-radius: 12px; padding: 14px 24px; transition: transform 120ms ease; }
.mk-btn:hover { transform: translateY(-2px); }
.mk-hero-img { display: flex; flex-direction: column; align-items: center; gap: 10px; text-decoration: none; justify-self: start; order: -1; flex-direction: row; }
.mk-hero-img img { display: block; width: 72px; height: 72px; border-radius: 50%; object-fit: cover;
  border: 3px solid #fff; box-shadow: 0 10px 28px rgba(26,26,26,0.18); }
.mk-title-row { display: flex; align-items: center; gap: 16px; }
.mk-avatar-m img { display: block; width: 94px; height: 94px; border-radius: 50%; object-fit: cover;
  border: 3px solid #fff; box-shadow: 0 8px 22px rgba(26,26,26,0.16); }
.mk-hero-img { display: none !important; }
.mk-hero-img span { display: none; font-size: 14px; font-weight: 700; color: var(--ink2); }
@media (min-width: 760px) {
  .mk-hero-grid { grid-template-columns: 1fr 200px; gap: 56px; }
  .mk-hero-img { display: flex !important; justify-self: center; order: 0; flex-direction: column; }
  .mk-avatar-m { display: none; }
  .mk-hero-img img { width: 150px; height: 150px; }
  .mk-hero-img span { display: block; }
}
.mk-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 14px; margin-top: 36px; }
@media (min-width: 760px) { .mk-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.mk-stats div { border-top: 3px solid var(--orange); padding-top: 10px; }
.mk-stats strong { display: block; font-size: clamp(30px, 5vw, 44px); font-weight: 800; letter-spacing: -1.4px; line-height: 1; }
.mk-stats strong small { font-size: 0.5em; letter-spacing: -0.3px; font-weight: 800; }
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
.mk-partner { margin-top: 20px; background: #fff; border: 1px solid var(--hair); border-left: 5px solid var(--orange);
  border-radius: 20px; padding: 22px; }
.mk-partner-tag { font-size: 11px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; color: var(--orange-text); }
.mk-partner h3 { font-size: 24px; font-weight: 800; letter-spacing: -0.6px; margin: 4px 0 8px; }
.mk-partner p { margin: 0 0 12px; color: var(--ink2); font-weight: 500; line-height: 1.5; font-size: 15.5px; max-width: 640px; }
.mk-partner-row { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
.mk-partner-row a { font-size: 14px; font-weight: 700; text-decoration: none; color: var(--ink) !important; }
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
