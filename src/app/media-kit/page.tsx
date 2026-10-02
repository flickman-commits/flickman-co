import type { Metadata } from "next";
import Image from "next/image";
import { compact, getLiveStats, type LiveStats } from "@/lib/instagram";

export const metadata: Metadata = {
  title: "Media Kit | Flickman & Topline",
  description:
    "Partner with Matt Hickman (@flickman) and Topline, the show that breaks down the P&Ls of real businesses.",
  // Shared directly with brands; keep rates out of search results.
  robots: { index: false, follow: false },
};

// Re-fetch live Instagram stats at most every 6 hours.
export const revalidate = 21600;

/* ── Everything editable lives here ─────────────────────────────── */

const EMAIL = "matt@flickmanmedia.com";
const IG_FLICKMAN = "https://www.instagram.com/flickman/";
const IG_TOPLINE = "https://www.instagram.com/topline_________/";
const STATS_AS_OF = "October 2026";

const STATS = [
  { value: "45K", unit: "followers", label: <>across @flickman and <ToplineHandle /></> },
  { value: "290K", unit: "views", label: "average per business breakdown" },
  { value: "7M+", unit: "views", label: "total on business breakdowns" },
  { value: "853K", unit: "views", label: "on the top breakdown" },
];

// Topline episodes, posted as collabs on both accounts. Views from the @flickman Reels tab.
const TOP_VIDEOS = [
  { name: "Planet Fitness", img: "/media-kit/planet-fitness.jpg", views: "830K", id: "Db52-XMoud0" },
  { name: "Crumbl Cookies", img: "/media-kit/crumbl.jpg", views: "787K", id: "Dbvgj_oIpte" },
  { name: "AMC Theatres", img: "/media-kit/amc.jpg", views: "356K", id: "DcwIqH5oUAT" },
  { name: "Domino's", img: "/media-kit/dominos.jpg", views: "252K", id: "DdE4BXfIpY6" },
];

// Paid partnership example. Add the reel ID (instagram.com/reel/<id>/) to link it.
const FUNBOX = { id: "DcWyuhZIzN-", img: "/media-kit/funbox.jpg", views: "160K" };

// Rate packages. Paid usage is 25% of the $4,000 post fee per month. Edit freely.
const PACKAGES = [
  {
    name: "Dedicated Post",
    price: "$4,000",
    includes: [
      <>1 dedicated Instagram post on @flickman &amp; <ToplineHandle /></>,
      "Syndicated to TikTok",
    ],
  },
  {
    name: "Brand Partnership",
    price: "$6,000",
    includes: [
      "Everything in Dedicated Post",
      "Collabed with your brand's account",
      "1 month of paid usage (whitelisting)",
    ],
  },
  {
    name: "Multi-Post Series",
    price: "$14,800",
    was: "$18,500",
    badge: "20% off",
    includes: [
      "3 posts over 3 months",
      "Everything in Brand Partnership, for each post",
      "3 months of paid usage (whitelisting)",
      "Plus a Story set with a link sticker",
    ],
  },
];
const PACKAGES_NOTE = "Extra months of paid usage (whitelisting): $1,000/mo.";


// @flickman Instagram insights. Fallbacks for when the live API (src/lib/instagram.ts) is not set up or fails.
const AUDIENCE_AS_OF = "October 2, 2026";
const REACH = [
  { value: "8.3M", label: "views in the last 90 days (6.2M Instagram, 2.1M Facebook)" },
  { value: "2.6M", label: "unique viewers in the last 90 days" },
  { value: "96%", label: "of views from people who don't follow yet" },
  { value: "31.8K", label: "accounts engaged in the last 30 days" },
];
const GENDER = { men: 84.3, women: 15.7 };
const DEMOS = [
  { title: "Age", rows: [["25-34", "32%"], ["35-44", "36%"], ["45-54", "19%"], ["Other", "13%"]] },
  { title: "Top countries", rows: [["United States", "66%"], ["Canada", "6%"], ["United Kingdom", "3%"]] },
  { title: "Top cities", rows: [["New York", "9.6%"], ["Los Angeles", "2.6%"], ["San Diego", "1.4%"], ["Toronto", "1.4%"]] },
];


// Paid brand partners. The section is hidden while this list is empty.
const PAST_PARTNERS: { name: string; url?: string }[] = [];


/* ── Live data ──────────────────────────────────────────────────── */

const pct = (n: number) => (n >= 10 ? `${Math.round(n)}%` : `${n.toFixed(1)}%`);
const today = () =>
  new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });

/** Layer whatever the Instagram API returned over the hard-coded numbers. */
function withLive(live: LiveStats | null) {
  const stats = STATS.map((s, i) =>
    i === 0 && live?.followersTotal ? { ...s, value: compact(live.followersTotal) } : s,
  );

  const reach = live
    ? [
        live.views90 !== null
          ? { value: compact(live.views90), label: "Instagram views in the last 90 days" }
          : REACH[0],
        live.reach30 !== null ? { value: compact(live.reach30), label: "accounts reached in the last 30 days" } : REACH[1],
        live.nonFollowerPct30 !== null
          ? { value: pct(live.nonFollowerPct30), label: "of views from people who don't follow yet" }
          : REACH[2],
        live.accountsEngaged30 !== null
          ? { value: compact(live.accountsEngaged30), label: "accounts engaged in the last 30 days" }
          : REACH[3],
      ]
    : REACH;

  const top = (rows: [string, number][] | null, n: number, other = false) => {
    if (!rows) return null;
    const out = rows.slice(0, n).map(([k, v]) => [k.split(",")[0], pct(v)]);
    if (other) {
      const rest = rows.slice(n).reduce((s, [, v]) => s + v, 0);
      if (rest >= 0.5) out.push(["Other", pct(rest)]);
    }
    return out;
  };
  const demos = [
    { title: "Age", rows: top(live?.age ?? null, 3, true) ?? DEMOS[0].rows },
    { title: "Top countries", rows: top(live?.countries ?? null, 3) ?? DEMOS[1].rows },
    { title: "Top cities", rows: top(live?.cities ?? null, 4) ?? DEMOS[2].rows },
  ];

  const videos = TOP_VIDEOS.map((v) =>
    live?.reelViews[v.id] ? { ...v, views: compact(live.reelViews[v.id]) } : v,
  );

  return {
    stats,
    statsAsOf: live ? today() : STATS_AS_OF,
    audienceNote: live
      ? `@flickman Instagram insights, updated ${today()}. Audience breakdown is current followers.`
      : `@flickman Instagram insights as of ${AUDIENCE_AS_OF}. Audience breakdown is from the last 30 days.`,
    reach,
    gender: live?.gender ?? GENDER,
    demos,
    videos,
  };
}

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

/* ── Page ───────────────────────────────────────────────────────── */

export default async function MediaKitPage() {
  const d = withLive(await getLiveStats(TOP_VIDEOS.map((v) => v.id)));
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
            </div>
            <div className="mk-title-row">
              <a className="mk-avatar-m" href={IG_FLICKMAN} target="_blank" rel="noopener noreferrer">
                <Image src="/media-kit/flickman.jpg" alt="Matt Hickman (@flickman)" width={600} height={600} priority />
              </a>
              <h1>Media Kit</h1>
            </div>
            <p className="mk-lede">
              I&apos;m Matt Hickman, a business owner, runner &amp; content creator based in NYC.
              I have a video series called Topline that breaks down the P&amp;Ls of real local
              businesses, and on top of that I create content about running, marketing &amp; life
              in NYC.
            </p>
            <a className="mk-btn" href={`mailto:${EMAIL}?subject=Partnership`}>
              Work with me
            </a>
          </div>
          <a className="mk-hero-img" href={IG_FLICKMAN} target="_blank" rel="noopener noreferrer">
            <Image src="/media-kit/flickman.jpg" alt="Matt Hickman (@flickman)" width={600} height={600} priority />
            <span>@flickman</span>
          </a>
        </div>
        <div className="mk-stats">
          {d.stats.map((s) => (
            <div key={s.value}>
              <strong>
                {s.value} <small>{s.unit}</small>
              </strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="mk-asof">Stats as of {d.statsAsOf}.</div>
      </section>

      {/* Audience */}
      <section className="mk-section mk-alt">
        <div className="mk-wrap">
          <h2>Audience Metrics</h2>
          <p className="mk-sub">{d.audienceNote}</p>
          <div className="mk-stats mk-reach">
            {d.reach.map((r) => (
              <div key={r.label}>
                <strong>{r.value}</strong>
                <span>{r.label}</span>
              </div>
            ))}
          </div>
          <div className="mk-gender">
            <h3>Gender</h3>
            <div className="mk-gender-bar" role="img" aria-label={`${Math.round(d.gender.men)}% men, ${Math.round(d.gender.women)}% women`}>
              <span style={{ width: `${d.gender.men}%` }} className="mk-g-men" />
              <span style={{ width: `${d.gender.women}%` }} className="mk-g-women" />
            </div>
            <div className="mk-gender-nums">
              <div>
                <strong>{Math.round(d.gender.men)}%</strong>
                <span>Men</span>
              </div>
              <div className="mk-gender-w">
                <strong>{Math.round(d.gender.women)}%</strong>
                <span>Women</span>
              </div>
            </div>
          </div>
          <div className="mk-demos">
            {d.demos.map((demo) => (
              <div key={demo.title} className="mk-demo">
                <h3>{demo.title}</h3>
                {demo.rows.map(([k, v]) => (
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
          <h2>Top-Performing Videos</h2>
          <p className="mk-sub">Topline episodes, posted as collabs on both accounts.</p>
          <div className="mk-videos">
            {d.videos.map((v) => (
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
            <a className="mk-partner-thumb" href={`https://www.instagram.com/reel/${FUNBOX.id}/`} target="_blank" rel="noopener noreferrer">
              <Image src={FUNBOX.img} alt="Topline episode on FunBox" width={360} height={640} />
            </a>
            <div>
              <div className="mk-partner-tag">Paid partnership</div>
              <h3>FunBox</h3>
              <p>
                FunBox, the world&apos;s biggest bounce park, sponsored a Topline breakdown of
                their own business: how a giant indoor bounce house pays New York rent. The caption
                sent viewers straight to their franchising team.
              </p>
              <div className="mk-partner-row">
                <span className="mk-views">{FUNBOX.views} views</span>
                <a className="mk-partner-btn" href={`https://www.instagram.com/reel/${FUNBOX.id}/`} target="_blank" rel="noopener noreferrer">
                  Watch the episode &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rates */}
      <section className="mk-section mk-alt">
        <div className="mk-wrap">
          <h2>Rates</h2>
          <div className="mk-packages">
            {PACKAGES.map((p, i) => (
              <div key={p.name} className="mk-package">
                <div className="mk-package-top">
                  <span className="mk-num">{i + 1}</span>
                  {p.badge && <span className="mk-badge">{p.badge}</span>}
                </div>
                <h3>{p.name}</h3>
                <div className="mk-package-price">
                  <strong>{p.price}</strong>
                  {p.was && <s>{p.was}</s>}
                </div>
                <ul>
                  {p.includes.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mk-fine">{PACKAGES_NOTE}</p>
        </div>
      </section>

      {/* Past partners. Hidden while the list is empty. */}
      {PAST_PARTNERS.length > 0 && (
        <section className="mk-section">
          <div className="mk-wrap">
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
        </section>
      )}

      {/* Contact */}
      <section className="mk-section">
        <div className="mk-wrap mk-contact">
          <h2>Let&apos;s work together</h2>
          <p className="mk-body">Tell me about your brand and what you have in mind.</p>
          <a className="mk-btn" href={`mailto:${EMAIL}?subject=Partnership`}>
            Email {EMAIL}
          </a>
        </div>
      </section>

      <footer className="mk-foot">Flickman · Topline</footer>
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
  box-shadow: 0 12px 30px rgba(26,26,26,0.16); border: 6px solid #fff; }
.mk-fine { font-size: 12.5px; color: var(--label); font-weight: 500; margin: 18px 0 0; }
.mk-packages { display: grid; gap: 14px; }
@media (min-width: 860px) { .mk-packages { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.mk-package { background: #fff; border: 1px solid var(--hair); border-radius: 20px; padding: 22px; display: flex; flex-direction: column; }
.mk-package:last-child { border: 2px solid var(--orange); }
.mk-package-top { display: flex; justify-content: space-between; align-items: center; min-height: 28px; }
.mk-package .mk-num { font-size: 16px; margin: 0; vertical-align: 0; }
.mk-badge { font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; background: var(--orange); color: #fff;
  border-radius: 999px; padding: 5px 10px; }
.mk .mk-package h3 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin: 12px 0 4px; }
.mk-package-price { display: flex; align-items: baseline; gap: 10px; margin-bottom: 14px; }
.mk-package-price strong { font-size: 34px; font-weight: 800; letter-spacing: -1px; font-variant-numeric: tabular-nums; }
.mk-package-price s { font-size: 16px; font-weight: 600; color: var(--muted); }
.mk-package ul { list-style: none; margin: 0; padding: 14px 0 0; border-top: 1px solid var(--hair); display: grid; gap: 10px; }
.mk-package li { position: relative; padding-left: 24px; font-size: 15px; font-weight: 500; line-height: 1.4; color: var(--ink2); }
.mk-package li::before { content: "✓"; position: absolute; left: 0; top: 0; font-weight: 800; color: var(--orange-text); }
.mk-ratecard { background: #fff; border: 1px solid var(--hair); border-radius: 20px; padding: 8px 22px; max-width: 720px; }
.mk-ratecard .mk-rate { padding: 16px 0; font-size: 16.5px; font-weight: 600; align-items: center; }
.mk-ratecard .mk-rate strong { font-size: 20px; }
.mk-rates { margin-top: 18px; border-top: 1px solid var(--hair); padding-top: 12px; }
.mk-rates-title { font-size: 11px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; color: var(--label); margin-bottom: 4px; }
.mk-rate, .mk-demo-row { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; font-size: 15px; font-weight: 500;
  border-bottom: 1px solid var(--hair); }
.mk-rate:last-child, .mk-demo-row:last-child { border-bottom: 0; }
.mk-rate strong, .mk-demo-row strong { font-weight: 800; white-space: nowrap; font-variant-numeric: tabular-nums; }
.mk-reach { margin-top: 8px; }
.mk-demos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
@media (min-width: 760px) { .mk-demos { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.mk-gender { background: #fff; border: 1px solid var(--hair); border-radius: 18px; padding: 16px 18px; margin-top: 28px; }
.mk .mk-gender h3 { font-size: 13px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: var(--label); margin: 0 0 12px; }
.mk-gender-bar { display: flex; height: 16px; border-radius: 999px; overflow: hidden; gap: 3px; }
.mk-g-men { background: #A9D3F5; }
.mk-g-women { background: #F7B9CF; }
.mk-gender-nums { display: flex; justify-content: space-between; margin-top: 12px; }
.mk-gender-nums strong { display: block; font-size: clamp(30px, 5vw, 42px); font-weight: 800; letter-spacing: -1.2px; line-height: 1; }
.mk-gender-nums span { font-size: 14px; font-weight: 600; color: var(--muted); }
.mk-gender-w { text-align: right; }
.mk-demo { background: #fff; border: 1px solid var(--hair); border-radius: 18px; padding: 14px; min-width: 0; }
.mk .mk-demo h3 { font-size: 13px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: var(--label); margin: 0 0 4px; }
.mk .mk-card-top h3 { font-size: clamp(24px, 3.4vw, 30px); font-weight: 800; letter-spacing: -0.8px; margin: 0; }
.mk-seg { margin: 0 0 14px; }
.mk-seg-label { font-size: 11px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; color: var(--label); margin-bottom: 8px; }
.mk-seg ul { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.mk-seg li { font-size: 13.5px; font-weight: 600; background: #F2EEE7; border: 1px solid var(--hair); border-radius: 999px; padding: 5px 11px; }
.mk-pill { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase;
  background: var(--ink); color: #fff; border-radius: 999px; padding: 5px 11px; margin: 4px 0 8px; }
.mk-rate span em { display: block; font-style: normal; font-size: 13px; color: var(--muted); font-weight: 500; line-height: 1.4; margin-top: 2px; }
  color: #161616; background: #F1E9D6; border-radius: 999px; padding: 6px 12px; margin-bottom: 16px; }
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
  .mk-hero-grid { grid-template-columns: 1fr 280px; gap: 56px; }
  .mk-hero-img { display: flex !important; justify-self: center; order: 0; flex-direction: column; }
  .mk-avatar-m { display: none; }
  .mk-hero-img img { width: 240px; height: 240px; }
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
@media (min-width: 760px) { .mk-videos { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; } }
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
.mk-partner { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 16px; align-items: start; }
@media (min-width: 760px) { .mk-partner { grid-template-columns: 140px minmax(0, 1fr); gap: 24px; } }
.mk-partner-thumb img { display: block; width: 100%; height: auto; aspect-ratio: 9 / 16; object-fit: cover; border-radius: 12px; }
.mk-partner-btn { display: inline-block; background: var(--ink); color: #fff !important; font-size: 14px; font-weight: 700;
  text-decoration: none; border-radius: 10px; padding: 9px 14px; }
.mk-num { display: inline-flex; align-items: center; justify-content: center; width: 1.25em; height: 1.25em; border-radius: 50%;
  background: var(--orange); color: #fff; font-size: 0.62em; font-weight: 800; letter-spacing: 0; margin-right: 10px; vertical-align: 0.18em; }
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
