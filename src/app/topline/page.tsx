"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { ClaudePeek, GRAPHICS_CSS, MoneyRain, NotionPeek, TrackerPeek } from "./graphics";

/* ── Easy-to-change numbers ─────────────────────────────────────── */

const SPOTS = 10;
// Pricing is hidden while we test demand with the waitlist. Flip to true to
// show it again (then swap md-alt between the Topline and form sections so
// the card pattern keeps alternating).
const SHOW_PRICING = false;
const IG_TOPLINE = "https://www.instagram.com/topline_________/";
const PRICE_3MO = 250; // per month, 3-month minimum
const PRICE_MONTHLY = 350; // per month, cancel anytime

const INDUSTRIES = [
  "Restaurant, cafe or bar",
  "Retail shop",
  "Fitness or wellness",
  "Beauty or salon",
  "Home services or trades",
  "Professional services or agency",
  "E-commerce",
  "Other",
];

const REVENUE_RANGES = [
  "Under $250k",
  "$250k to $500k",
  "$500k to $1M",
  "$1M to $5M",
  "Over $5M",
];

// The monthly Money Dinner checklist (from the real template, business side).
const CHECKLIST = [
  {
    title: "Reconcile your books",
    body: "Categorize every transaction from the month so your reports are actually right.",
  },
  {
    title: "Check last month's guess",
    body: "Pull up what you projected you'd make this month. Were you close?",
  },
  {
    title: "Read your P&L",
    body: "Revenue, expenses, net income, your three biggest costs, and how much cash is in the bank.",
  },
  {
    title: "Update your year to date",
    body: "Add the month to a running total so you see the trend, not just one month.",
  },
  {
    title: "Project next month",
    body: "What money is already locked in for next month, and what still has to happen.",
  },
  {
    title: "Update your net worth",
    body: "Business and personal, one number, once a month. Watch it move.",
  },
  {
    title: "Write your month in review",
    body: "What worked, what didn't, and the one thing you'll do differently next month.",
  },
];

/* ── Pieces ─────────────────────────────────────────────────────── */

function Cta() {
  return (
    <div className="md-cta">
      <a href="#join" className="md-btn">
        Join the Waitlist
      </a>
      <div className="md-cta-note">
        Limited Spots. Only {SPOTS} to start.
      </div>
    </div>
  );
}

function SignupForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    businessName: "",
    industry: "",
    industryOther: "",
    revenue: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (status === "error") setStatus("idle");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          businessName: form.businessName,
          industry:
            form.industry === "Other" ? `Other: ${form.industryOther.trim()}` : form.industry,
          revenue: form.revenue,
          source: "money-dinners",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="md-done">
        <div className="md-done-title">You&apos;re on the list.</div>
        <p>We&apos;ll reach out before the first {SPOTS} spots open up.</p>
      </div>
    );
  }

  const loading = status === "loading";

  return (
    <form className="md-form" onSubmit={submit}>
      <label>
        Your name
        <input
          required
          maxLength={100}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Jane Smith"
          disabled={loading}
        />
      </label>
      <label>
        Email
        <input
          required
          type="email"
          maxLength={160}
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="you@yourbusiness.com"
          disabled={loading}
        />
      </label>
      <label>
        Business name
        <input
          required
          maxLength={120}
          value={form.businessName}
          onChange={(e) => set("businessName", e.target.value)}
          placeholder="Smith's Bakery"
          disabled={loading}
        />
      </label>
      <label>
        What kind of business?
        <select
          required
          value={form.industry}
          onChange={(e) => set("industry", e.target.value)}
          disabled={loading}
        >
          <option value="" disabled>
            Pick one
          </option>
          {INDUSTRIES.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </select>
      </label>
      {form.industry === "Other" && (
        <label>
          Tell us what kind
          <input
            required
            autoFocus
            maxLength={60}
            value={form.industryOther}
            onChange={(e) => set("industryOther", e.target.value)}
            placeholder="Dog grooming, bike shop, bakery…"
            disabled={loading}
          />
        </label>
      )}
      <label>
        How much revenue does it make a year?
        <select
          required
          value={form.revenue}
          onChange={(e) => set("revenue", e.target.value)}
          disabled={loading}
        >
          <option value="" disabled>
            Pick one
          </option>
          {REVENUE_RANGES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <p className="md-why">
        <strong>Why we ask about revenue:</strong> this group is for owners who are
        already up and running and ready to invest in their business. We don&apos;t
        want anyone spending money with us who shouldn&apos;t be. If you&apos;re not
        there yet, no hard feelings, just come back when you are.
      </p>
      <button type="submit" className="md-btn md-btn-full" disabled={loading}>
        {loading ? "Saving your spot…" : "Join the Waitlist"}
      </button>
      <div className={`md-form-note ${status === "error" ? "md-err" : ""}`}>
        {status === "error"
          ? error
          : `Limited Spots. Only ${SPOTS} to start. Nothing gets charged to join the waitlist.`}
      </div>
    </form>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */

export default function MoneyDinnersPage() {
  return (
    <main className="md">
      <style dangerouslySetInnerHTML={{ __html: CSS + GRAPHICS_CSS }} />

      <header className="md-top">
        <div className="md-logo">Money Dinners</div>
        <a href="#join" className="md-top-link">
          Join the waitlist
        </a>
      </header>

      {/* Hero */}
      <section className="md-hero-band">
        <MoneyRain />
        <div className="md-hero md-wrap">
          <h1>
            Know <span className="md-under">WTF</span> is happening in your business
          </h1>
          <p className="md-lede">
            Money Dinners is a small group of business owners who sit down once a
            month and actually look at their numbers. Together. It makes your
            finances less scary, and a lot harder to ignore.
          </p>
          <Cta />
        </div>
      </section>

      {/* Problem */}
      <section className="md-section md-alt">
        <div className="md-wrap">
        <div className="md-label">Sound familiar?</div>
        <h2 className="md-h2-gap">You&apos;re making decisions based on vibes.</h2>
        <ul className="md-rows">
          <li>You check your bank balance and call that bookkeeping.</li>
          <li>Your P&amp;L lives in a QuickBooks tab you haven&apos;t opened since tax season.</li>
          <li>You think you&apos;re breaking even. You&apos;re not actually sure.</li>
          <li>You know you should look at the numbers every month. You just don&apos;t.</li>
        </ul>
        <p className="md-punch">
          You&apos;re not bad at this. You just don&apos;t have a system, or anyone
          holding you to it.
        </p>
        </div>
      </section>

      {/* Story */}
      <section className="md-section">
        <div className="md-wrap">
        <div className="md-label">Why I started this</div>
        <div className="md-story">
          <p>
            I never got a proper business school education. I just started hustling
            in college, trying to make money, and eventually started making some.
          </p>
          <p>
            But for years I was making decisions based on vibes and whatever was in
            the bank that day. It wasn&apos;t until about a year ago that I got
            crystal clear on my numbers, and it was eye opening. I thought Trackstar
            was breaking even in Q1. <strong>It was actually losing money.</strong>
          </p>
          <p>
            So I changed a few things. I started doing a monthly round up I call a{" "}
            <strong>money dinner</strong>. I turned on bank notifications so I see my
            balance every morning, a tight feedback loop. And I built some tools to
            make it easy: a daily financial tracker, a few Claude skills, and the
            Money Dinner template.
          </p>
          <p>
            Now I know where the ship stands every day. It actually pushed me to
            switch my business model, because once I could see the numbers I could
            see the flaws in the one I had (creative services, one-off projects
            only).
          </p>
          <p>
            The other thing nobody tells you: once your numbers are accurate, you can
            use Claude as a real strategy partner. Bouncing ideas off your actual data
            beats asking &ldquo;how do I grow my business?&rdquo;
          </p>
          <p className="md-story-punch">
            Money Dinners is all of that, with a group of people doing it with you.
          </p>
          <div className="md-sig">Matt, Topline</div>
        </div>
        </div>
      </section>

      {/* The checklist */}
      <section className="md-section md-alt">
        <div className="md-wrap">
        <h2 className="md-h2-gap">What we go over each month</h2>
        <ol className="md-list">
          {CHECKLIST.map((item, i) => (
            <li key={item.title}>
              <span className="md-list-num">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
        </div>
      </section>

      {/* How it works */}
      <section className="md-section">
        <div className="md-wrap">
        <div className="md-label">How it works</div>
        <h2 className="md-h2-gap">
          Make it a habit. Make it fun. Take out the friction.
        </h2>
        <ol className="md-steps">
          <li>
            <span className="md-num">1</span>
            <div>
              <h3>Time set aside</h3>
              <p>
                One call at the end of every month. It&apos;s on the calendar, so it
                happens. We start as one big group, then split into small groups of
                owners with businesses like yours.
              </p>
            </div>
          </li>
          <li>
            <span className="md-num">2</span>
            <div>
              <h3>Tools that make it easy</h3>
              <p>
                The hardest part of doing your numbers is getting started. These cut
                that down to nothing, so showing up for yourself each month is easy:
                a daily financial tracker so you know where you stand any day, the
                Money Dinner template that walks you through the month, a Claude
                skill that does the boring parts, and an accountant in the group for
                questions.
              </p>
            </div>
          </li>
        </ol>
        <div className="g-peeks">
          <TrackerPeek />
          <NotionPeek />
          <ClaudePeek />
        </div>
        <p className="md-bonus">
          <strong>Bonus:</strong> you also get all the research behind every Topline
          episode, plus the Claude skills I use to make the show.
        </p>
        <ol className="md-steps md-steps-after" start={3}>
          <li>
            <span className="md-num">3</span>
            <div>
              <h3>A group that expects you</h3>
              <p>
                Your small group sees your numbers every month, and there&apos;s a
                group chat in between. It&apos;s a lot harder to skip when people
                notice.
              </p>
            </div>
          </li>
        </ol>
        <p className="md-punch">
          Do it every month and it stops being a chore. It becomes a habit you keep
          for the rest of your life.
        </p>
        <Cta />
        </div>
      </section>

      {/* Fit */}
      <section className="md-section md-alt">
        <div className="md-wrap">
        <div className="md-fit">
          <div>
            <div className="md-label">It&apos;s for you if</div>
            <ul className="md-checks">
              <li>You own a business doing $500k+ a year in revenue</li>
              <li>You know you should look at your finances more, but you never have the time</li>
              <li>You don&apos;t have the system, the support, or someone keeping you honest</li>
            </ul>
          </div>
          <div>
            <div className="md-label">It&apos;s not for you if</div>
            <ul className="md-crosses">
              <li>You&apos;re just getting started and don&apos;t have customers yet</li>
              <li>You already close your books every month and know your numbers cold (nice work, honestly)</li>
            </ul>
          </div>
        </div>
        </div>
      </section>

      {/* Pricing */}
      {SHOW_PRICING && (
        <section className="md-section">
          <div className="md-wrap">
          <div className="md-label">What it costs</div>
          <div className="md-prices">
            <div className="md-price md-price-best">
              <div className="md-badge">Best value</div>
              <h3>3-month plan</h3>
              <div className="md-amount">
                ${PRICE_3MO}
                <span>/mo</span>
              </div>
              <p>Billed monthly, 3 month minimum. Enough time to make it a habit.</p>
            </div>
            <div className="md-price">
              <h3>Month to month</h3>
              <div className="md-amount">
                ${PRICE_MONTHLY}
                <span>/mo</span>
              </div>
              <p>Cancel anytime.</p>
            </div>
          </div>
          <Cta />
          </div>
        </section>
      )}

      {/* Topline proof */}
      <section className="md-section">
        <div className="md-wrap">
        <div className="md-show">
          <div className="md-show-media">
            <a
              className="md-show-img"
              href={IG_TOPLINE}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Watch Topline on Instagram"
            >
              <Image
                src="/topline/episode.jpg"
                alt="Matt filming a Topline episode on a New York street"
                width={360}
                height={640}
              />
            </a>
            <a
              className="md-btn md-btn-ig"
              href={IG_TOPLINE}
              target="_blank"
              rel="noopener noreferrer"
            >
              ▶ Watch it on Instagram
            </a>
            <div className="md-handle">
              <span className="md-sr">@topline_________</span>
              <span aria-hidden="true">
                @topline
                <i className="md-us" />
              </span>
            </div>
          </div>
          <div>
            <div className="md-label">About Topline</div>
            <p className="md-proof">
              I create a show on Instagram called Topline, where I break down the P&amp;Ls
              of real local businesses. Turns out a lot of people are fascinated by the
              numbers behind the places they walk past every day. Money Dinners is for the
              owners who want to get their own numbers in order.
            </p>
          </div>
        </div>
        <div className="md-stats">
          <div>
            <strong>1M+</strong>
            <span>views in the first month</span>
          </div>
          <div>
            <strong>100K</strong>
            <span>average views per episode</span>
          </div>
          <div>
            <strong>43K</strong>
            <span>followers across both accounts</span>
          </div>
        </div>
        </div>
      </section>

      {/* Form */}
      <section className="md-section md-alt" id="join">
        <div className="md-wrap">
        <div className="md-join">
          <h2>Join the waitlist</h2>
          <p className="md-sub">
            Limited Spots. Only {SPOTS} to start. Takes about 30 seconds.
          </p>
          <SignupForm />
        </div>
        </div>
      </section>

      <footer className="md-foot">Money Dinners, a Topline community</footer>
    </main>
  );
}

/* ── Styles (from the Topline graphics) ─────────────────────────── */

const CSS = `
.md {
  --bg: #FBFAF8; --ink: #1A1A1A; --ink2: #5A554D; --muted: #8C8C8C;
  --label: #B9B3AA; --hair: #E7E3DC; --track: #EEEBE6; --tan: #C7C1B7;
  --orange: #FF7F4A; --green: #0E7A45; --green-soft: #BFF8DC;
  background: var(--bg); color: var(--ink); min-height: 100vh;
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
}
.md * { box-sizing: border-box; }
.md-wrap { max-width: 920px; margin: 0 auto; padding: 0 20px; }
.md-story p, .md-proof, .md-punch { max-width: 680px; }
.md-top { display: flex; justify-content: space-between; align-items: center;
  max-width: 1040px; margin: 0 auto; padding: 16px 20px; }
.md-logo { font-weight: 800; font-size: 18px; letter-spacing: -0.5px; }
.md-top-link { font-size: 14px; font-weight: 700; color: var(--ink); text-decoration: none;
  border-bottom: 3px solid var(--orange); padding-bottom: 2px; }

.md-label { font-size: 12px; font-weight: 600; letter-spacing: 2.2px; text-transform: uppercase;
  color: var(--label); margin-bottom: 10px; }

.md-hero-band { position: relative; overflow: hidden; padding-bottom: clamp(40px, 7vw, 72px); }
.md-hero { position: relative; z-index: 1; padding-top: clamp(24px, 7vw, 88px); }
.md-h2-gap { margin-bottom: 16px !important; }
.md h1 { font-size: clamp(38px, 7vw, 72px); font-weight: 800; line-height: 1;
  letter-spacing: -2px; margin: 0; }
.md-under { background: linear-gradient(var(--orange), var(--orange)) no-repeat 0 92% / 100% 0.12em; }
.md-lede { font-size: clamp(17px, 2.2vw, 20px); font-weight: 500; color: var(--ink2);
  line-height: 1.45; max-width: 600px; margin: 16px 0 0; }

.md-section { padding: clamp(40px, 7vw, 72px) 0; }
.md-alt { background: #F2EEE7; --hair: #E1DBD1; border-radius: 24px; margin: 0 8px; }
@media (min-width: 760px) { .md-alt { border-radius: 40px; margin: 0 24px; } }
.md h2 { font-size: clamp(27px, 4.6vw, 40px); font-weight: 800; letter-spacing: -1.1px;
  line-height: 1.1; margin: 0; }
.md h3 { font-size: 17px; font-weight: 700; letter-spacing: -0.3px; line-height: 1.3; margin: 0 0 3px; }
.md-sub { color: var(--ink2); font-weight: 500; margin: 6px 0 18px; font-size: 15px; }

.md-cta { margin-top: 22px; }
.md-btn { display: inline-block; background: var(--ink); color: #fff; font-weight: 700;
  font-size: 16px; text-decoration: none; border: none; border-radius: 12px;
  padding: 14px 26px; cursor: pointer; font-family: inherit; transition: transform 120ms ease, background 120ms ease; }
.md-btn:hover { transform: translateY(-2px); background: #000; }
.md-btn:disabled { opacity: 0.6; cursor: default; transform: none; }
.md-btn-full { width: 100%; margin-top: 4px; }
.md-cta-note { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600;
  color: var(--ink2); margin-top: 10px; }
.md-cta-note::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--orange); }

.md-rows { list-style: none; padding: 0; margin: 0; border-top: 1px solid var(--hair); }
.md-rows li { font-size: clamp(16.5px, 2.2vw, 20px); font-weight: 500; line-height: 1.35;
  padding: 12px 0; border-bottom: 1px solid var(--hair); }
.md-punch { font-size: clamp(18px, 2.4vw, 22px); font-weight: 800; letter-spacing: -0.4px;
  line-height: 1.3; margin: 18px 0 0; }

.md-story { border-left: 3px solid var(--orange); padding-left: 16px; }
.md-story p { font-size: 16.5px; line-height: 1.5; margin: 0 0 12px; font-weight: 500; color: var(--ink2); }
.md-story strong { color: var(--ink); }
.md-story .md-story-punch { font-weight: 800; font-size: 18.5px; line-height: 1.35; color: var(--ink); letter-spacing: -0.3px; }
.md-sig { font-size: 14px; font-weight: 600; color: var(--muted); }

.md-list { list-style: none; padding: 0; margin: 0; border-top: 1px solid var(--hair); }
.md-list li { display: flex; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--hair); }
.md-list-num { font-size: 13px; font-weight: 700; color: var(--label); letter-spacing: 1px; padding-top: 2px; min-width: 20px; }
.md-list p { margin: 0; color: var(--ink2); line-height: 1.4; font-weight: 500; font-size: 15px; }
.md-bonus { font-size: 15px; font-weight: 500; line-height: 1.45; color: var(--ink2); margin: 12px 0 0;
  padding: 11px 14px; border: 2px dashed var(--orange); border-radius: 12px; }
.md-bonus strong { color: var(--ink); }
.md-steps { list-style: none; padding: 0; margin: 0; border-top: 1px solid var(--hair); }
.md-steps-after { margin-top: 12px; border-top: none; }
.md-steps li { display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--hair); }
.md-num { font-size: 30px; font-weight: 800; color: var(--orange); line-height: 1; min-width: 22px; }
.md-steps p { margin: 0; color: var(--ink2); line-height: 1.45; font-weight: 500; font-size: 15px; }

.md-fit { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 22px 32px; }
.md-checks, .md-crosses { list-style: none; padding: 0; margin: 0; }
.md-checks li, .md-crosses li { padding: 9px 0 9px 26px; position: relative; line-height: 1.4;
  font-weight: 500; font-size: 15px; border-bottom: 1px solid var(--hair); }
.md-checks li::before { content: "✓"; color: var(--green); font-weight: 800; position: absolute; left: 3px; }
.md-crosses li { color: var(--ink2); }
.md-crosses li::before { content: "✕"; color: var(--label); font-weight: 800; position: absolute; left: 3px; }

.md-prices { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
.md-price { position: relative; background: #fff; border: 1px solid var(--hair); border-radius: 18px; padding: 24px 20px 20px; }
.md-price p { margin: 0; color: var(--ink2); font-weight: 500; line-height: 1.45; }
.md-price-best { border: 2px solid var(--orange); }
.md-badge { position: absolute; top: -12px; left: 18px; background: var(--orange); color: var(--ink);
  font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
  padding: 4px 10px; border-radius: 6px; }
.md-amount { font-size: 42px; font-weight: 800; letter-spacing: -1.6px; margin: 4px 0 8px; }
.md-amount span { font-size: 16px; color: var(--muted); font-weight: 600; letter-spacing: 0; }

.md-show { display: grid; gap: 18px; align-items: center; margin-bottom: 24px; }
.md-show-img { display: block; text-decoration: none; text-align: center; }
.md-show-img img { display: block; width: 100%; max-width: 190px; height: auto; margin: 0 auto;
  border-radius: 20px; box-shadow: 0 14px 32px rgba(26,26,26,0.18); }
.md-show-media { text-align: center; }
.md-btn-ig { margin-top: 14px; font-size: 15px; padding: 12px 20px; }
.md-handle { margin-top: 8px; font-size: 13px; font-weight: 700; color: var(--ink2); }
.md-us { display: inline-block; width: 4.4em; height: 2px; background: currentColor;
  vertical-align: -0.15em; margin-left: 0.06em; }
.md-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (min-width: 760px) {
  .md-show { grid-template-columns: 240px 1fr; gap: 44px; }
  .md-show-img img { max-width: none; }
}
.md-proof { font-size: 16.5px; line-height: 1.5; font-weight: 500; margin: 0; color: var(--ink2); }
.md-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.md-stats div { border-top: 3px solid var(--orange); padding-top: 8px; }
.md-stats strong { display: block; font-size: clamp(26px, 6vw, 40px); font-weight: 800; letter-spacing: -1.2px; line-height: 1.05; }
.md-stats span { display: block; font-size: 12px; font-weight: 500; line-height: 1.3; color: var(--muted); margin-top: 2px; }

.md-join { border: 3px dashed var(--orange); border-radius: 22px; padding: clamp(18px, 4vw, 36px); }
.md-form { display: grid; gap: 12px; }
.md-form label { display: grid; gap: 6px; font-size: 14px; font-weight: 700; }
.md-form input, .md-form select { width: 100%; font: inherit; font-size: 16px; font-weight: 500;
  color: var(--ink); background: #fff; border: 1px solid var(--hair); border-radius: 11px;
  padding: 12px 14px; outline: none; transition: border-color 120ms ease; }
.md-form input::placeholder { color: var(--label); }
.md-form input:focus, .md-form select:focus { border-color: var(--ink); }
.md-why { font-size: 13px; line-height: 1.45; color: var(--ink2); margin: 0; font-weight: 500;
  padding: 11px 13px; background: var(--track); border-radius: 11px; }
.md-why strong { color: var(--ink); }
.md-form-note { font-size: 12.5px; font-weight: 600; color: var(--muted); text-align: center; }
.md-err { color: #C0392B; }

.md-done { background: var(--green); color: #fff; border-radius: 18px; padding: 22px 20px; }
.md-done-title { font-size: 26px; font-weight: 800; letter-spacing: -0.8px; }
.md-done p { color: var(--green-soft); font-weight: 600; margin: 4px 0 0; font-size: 15px; }

.md-foot { text-align: center; font-size: 13px; font-weight: 600; color: var(--label);
  padding: 20px 20px 32px; letter-spacing: 0.3px; }
`;
