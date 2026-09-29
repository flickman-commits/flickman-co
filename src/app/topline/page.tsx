"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { ClaudePeek, GRAPHICS_CSS, MoneyRain, NotionPeek, TrackerPeek } from "./graphics";

/* ── Easy-to-change numbers ─────────────────────────────────────── */

const SPOTS = 10;
// Pricing is hidden while we test demand with the waitlist. Flip to true to
// show it again (it sits between "What you get" and "The crowd"; check the
// card backgrounds still alternate).
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

// What happens each month (the Money Lunch checklist).
const STEPS = [
  { lead: "Clean up.", text: "Every dollar goes in the right place." },
  { lead: "Check your guess.", text: "Did last month go how you thought?" },
  { lead: "The big reveal.", text: "What came in, what went out, what you kept." },
  {
    lead: "Look ahead.",
    text: "What's locked in for next month and what still has to happen.",
  },
  { lead: "Pick one thing.", text: "One change you'll make before the next lunch." },
];

const INCLUDED = [
  "A monthly call with a small group of owners like you",
  "A daily tracker, so you know where you stand any day",
  "The Money Lunch template that walks you through the month",
  "A Claude skill that does the boring sorting for you",
  "The research behind every Topline episode",
];

/* ── Pieces ─────────────────────────────────────────────────────── */

function Cta() {
  return (
    <div className="md-cta">
      <a href="#join" className="md-btn">
        Save my seat
      </a>
      <div className="md-cta-note">Only {SPOTS} seats in the first room.</div>
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
          source: "money-lunches",
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
        <p>We&apos;ll reach out before the first {SPOTS} seats open up.</p>
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
        <strong>Why we ask:</strong> this room is for owners already up and running.
        Not there yet? Come back when you are.
      </p>
      <button type="submit" className="md-btn md-btn-full" disabled={loading}>
        {loading ? "Saving your seat…" : "Join the waitlist"}
      </button>
      <div className={`md-form-note ${status === "error" ? "md-err" : ""}`}>
        {status === "error"
          ? error
          : "Nothing is charged to join."}
      </div>
    </form>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */

export default function MoneyLunchesPage() {
  return (
    <main className="md">
      <style dangerouslySetInnerHTML={{ __html: CSS + GRAPHICS_CSS }} />

      <header className="md-top">
        <div className="md-logo">Money Lunches</div>
        <a href="#join" className="md-top-link">
          Save my seat
        </a>
      </header>

      {/* Hero */}
      <section className="md-hero-band">
        <MoneyRain />
        <div className="md-hero md-wrap">
          <div className="md-label">Topline presents</div>
          <div className="md-brand">Money Lunches</div>
          <h1>You should know if your business is actually making money.</h1>
          <p className="md-lede">
            Once a month, a small room of business owners opens their books together.
            What you find might surprise you. It surprised me.
          </p>
          <Cta />
        </div>
      </section>

      {/* The reveal */}
      <section className="md-section md-alt">
        <div className="md-wrap">
          <div className="md-label">The reveal</div>
          <h2 className="md-h2-gap">I thought my business was breaking even. It wasn&apos;t.</h2>
          <div className="md-story">
            <p>
              For years I ran my businesses on vibes. Then one day I finally sat down
              and looked. <strong>Trackstar was losing money, and I had no idea.</strong>
            </p>
            <p>
              One lunch a month fixed that. Now I know where every dollar goes, every
              single day.
            </p>
            <div className="md-sig">Matt, host of Topline</div>
          </div>
        </div>
      </section>

      {/* Sound familiar */}
      <section className="md-section">
        <div className="md-wrap">
          <div className="md-label">Sound familiar?</div>
          <ul className="md-rows">
            <li>The only number you look at is your bank balance.</li>
            <li>You haven&apos;t opened QuickBooks since tax season.</li>
            <li>You think you&apos;re making money. You&apos;re not sure.</li>
          </ul>
          <p className="md-punch">
            You&apos;re not bad with money. You&apos;ve just never had a system, or
            anyone watching.
          </p>
        </div>
      </section>

      {/* The main event */}
      <section className="md-section md-alt">
        <div className="md-wrap">
          <div className="md-label">The main event</div>
          <h2 className="md-h2-gap">What happens each month</h2>
          <ol className="md-list">
            {STEPS.map((step, i) => (
              <li key={step.lead}>
                <span className="md-list-num">{i + 1}</span>
                <p>
                  <strong>{step.lead}</strong> {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What you get */}
      <section className="md-section">
        <div className="md-wrap">
          <div className="md-label">More than the price of admission</div>
          <h2 className="md-h2-gap">Here&apos;s everything you get</h2>
          <ul className="md-checks">
            {INCLUDED.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="g-peeks">
            <TrackerPeek />
            <NotionPeek />
            <ClaudePeek />
          </div>
          <p className="md-punch">We&apos;d rather give you too much than too little.</p>
        </div>
      </section>

      {/* Pricing (hidden while testing demand) */}
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
                <p>Billed monthly, 3 month minimum.</p>
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
          </div>
        </section>
      )}

      {/* The crowd */}
      <section className="md-section md-alt">
        <div className="md-wrap">
          <div className="md-label">The crowd</div>
          <h2 className="md-h2-gap">People can&apos;t stop watching other businesses&apos; numbers.</h2>
          <div className="md-stats">
            <div>
              <strong>245K</strong>
              <span>average views per episode</span>
            </div>
            <div>
              <strong>1M+</strong>
              <span>views in the first month</span>
            </div>
            <div>
              <strong>43K</strong>
              <span>followers</span>
            </div>
          </div>
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
            </div>
            <p className="md-proof">
              You&apos;ve seen how Planet Fitness, Chipotle, and 16 Handles make money.
              Now it&apos;s your turn to look at yours.
            </p>
          </div>
        </div>
      </section>

      {/* Admission */}
      <section className="md-section">
        <div className="md-wrap">
          <div className="md-label">Admission</div>
          <ul className="md-admit">
            <li className="md-admit-in">
              <strong>Come in</strong> if you do $500k+ a year, and you know you should
              look at your numbers more but you don&apos;t.
            </li>
            <li className="md-admit-out">
              <strong>Skip it</strong> if you don&apos;t have customers yet, or you
              already close your books every month (nice work).
            </li>
          </ul>
        </div>
      </section>

      {/* Last call */}
      <section className="md-section md-alt" id="join">
        <div className="md-wrap">
          <div className="md-join">
            <div className="md-label">Last call</div>
            <h2>{SPOTS} seats. Then the doors close.</h2>
            <p className="md-sub">
              The first room is capped at {SPOTS} owners. When it fills, the next spot
              opens with the next room.
            </p>
            <SignupForm />
          </div>
        </div>
      </section>

      <footer className="md-foot">Money Lunches, a Topline community</footer>
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
.md-brand { font-size: clamp(22px, 3.4vw, 30px); font-weight: 800; letter-spacing: -0.6px;
  color: #E0561F; margin: -4px 0 10px; }
.md-list strong, .md-proof strong { color: var(--ink); }
.md-admit { list-style: none; padding: 0; margin: 0; border-top: 1px solid var(--hair); }
.md-admit li { position: relative; padding: 14px 0 14px 30px; border-bottom: 1px solid var(--hair);
  font-size: clamp(16.5px, 2.2vw, 19px); font-weight: 500; line-height: 1.4; color: var(--ink2); }
.md-admit strong { color: var(--ink); }
.md-admit-in::before { content: "✓"; color: var(--green); font-weight: 800; position: absolute; left: 4px; top: 14px; }
.md-admit-out::before { content: "✕"; color: var(--label); font-weight: 800; position: absolute; left: 4px; top: 14px; }
.md-join h2 { margin-bottom: 0; }
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

.md-show { display: grid; gap: 18px; align-items: center; margin-top: 24px; }
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
