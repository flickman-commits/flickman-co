"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/* ── Shared helpers ─────────────────────────────────────────────── */

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Starts false, flips true the first time the element scrolls into view. */
function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

/** Once in view, returns a counter that bumps every `every` ms so a keyed child replays. */
function useReplay(seen: boolean, every: number) {
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (!seen) return;
    setRun(1);
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setRun((r) => r + 1), every);
    return () => clearInterval(id);
  }, [seen, every]);
  return run;
}

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/* ── Falling dollars (hero background) ──────────────────────────── */

// Fixed values (no Math.random) so server and client render the same thing.
const DROPS = [
  { x: 4, s: 30, dur: 11, delay: 0, bill: false },
  { x: 11, s: 20, dur: 14, delay: 4, bill: true },
  { x: 19, s: 40, dur: 12, delay: 7, bill: false },
  { x: 27, s: 22, dur: 16, delay: 1.5, bill: false },
  { x: 35, s: 26, dur: 13, delay: 9, bill: true },
  { x: 44, s: 34, dur: 15, delay: 3, bill: false },
  { x: 52, s: 18, dur: 12, delay: 11, bill: false },
  { x: 60, s: 24, dur: 17, delay: 6, bill: true },
  { x: 68, s: 44, dur: 13, delay: 2, bill: false },
  { x: 76, s: 20, dur: 15, delay: 8.5, bill: false },
  { x: 83, s: 28, dur: 12, delay: 5, bill: true },
  { x: 90, s: 36, dur: 16, delay: 0.8, bill: false },
  { x: 96, s: 22, dur: 14, delay: 10, bill: false },
];

export function MoneyRain() {
  return (
    <div className="g-rain" aria-hidden="true">
      {DROPS.map((p, i) => (
        <span
          key={i}
          className={p.bill ? "g-drop g-bill" : "g-drop"}
          style={
            {
              left: `${p.x}%`,
              fontSize: p.s,
              animationDuration: `${p.dur}s`,
              animationDelay: `-${p.delay}s`,
              "--spin": `${i % 2 ? -1 : 1}`,
              color: i % 3 === 0 ? "#3FA36D" : "var(--green)",
            } as CSSProperties
          }
        >
          $
        </span>
      ))}
    </div>
  );
}

/* ── Toolkit peeks: Notion template + Claude skill ──────────────── */

function Window({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="g-card g-win">
      <div className="g-win-bar">
        <i />
        <i />
        <i />
        <span>{title}</span>
      </div>
      <div className="g-win-body">{children}</div>
    </div>
  );
}

const CHECKLIST = [
  "Reconcile the books",
  "Check last month's projection",
  "Read the P&L",
  "Project next month",
];

function NotionBody({ play }: { play: boolean }) {
  return (
    <div className={play ? "g-np g-play" : "g-np"}>
      <div className="g-np-icon">🤑</div>
      <div className="g-np-title">Money Dinner 031</div>
      <div className="g-np-props">
        <span>Status</span>
        <b>Closing out</b>
        <span>Date</span>
        <b className="g-plain">Mar 31</b>
      </div>
      <div className="g-np-h">This month</div>
      {CHECKLIST.map((item, i) => (
        <div key={item} className="g-check" style={d(500 + i * 650)}>
          <span className="g-box" />
          <span className="g-check-text">{item}</span>
        </div>
      ))}
      <div className="g-np-h">The numbers</div>
      <div className="g-np-table">
        <span>Revenue</span>
        <span>$48,200</span>
        <span>Costs</span>
        <span>$41,800</span>
        <span>Kept</span>
        <span className="g-green-text">$6,400</span>
      </div>
    </div>
  );
}

export function NotionPeek() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const run = useReplay(seen, 9000);
  return (
    <div ref={ref}>
      <Window title="Notion template">
        <NotionBody key={run} play={run > 0} />
      </Window>
    </div>
  );
}

const CLAUDE_LINES = [
  { mark: "✓", text: "Pulled 214 transactions from QuickBooks" },
  { mark: "✓", text: "Categorized 209. 5 need a quick look from you." },
  { mark: "↑", text: "Revenue $48.2k, up 6% on February" },
  { mark: "!", text: "Coffee & milk costs up 3 points. Check supplier invoices." },
  { mark: "→", text: "Your one thing for April: renegotiate the milk order." },
];

function ClaudeBody({ play }: { play: boolean }) {
  return (
    <div className={play ? "g-cl g-play" : "g-cl"}>
      <div className="g-cl-you">/money-dinner march</div>
      {CLAUDE_LINES.map((l, i) => (
        <div key={l.text} className="g-cl-line g-in" style={d(700 + i * 750)}>
          <span className={l.mark === "!" ? "g-mark g-mark-o" : "g-mark"}>{l.mark}</span>
          {l.text}
        </div>
      ))}
      <span className="g-caret g-in" style={d(700 + CLAUDE_LINES.length * 750)} />
    </div>
  );
}

export function ClaudePeek() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const run = useReplay(seen, 9500);
  return (
    <div ref={ref}>
      <Window title="Claude skill">
        <ClaudeBody key={run} play={run > 0} />
      </Window>
    </div>
  );
}

/* ── Daily Financial Tracker (Google Sheet) ─────────────────────── */

// Made-up numbers (not real Trackstar data).
const DAYS = [
  { day: "Mon 9/01", rev: 1240, cost: 512 },
  { day: "Tue 9/02", rev: 980, cost: 431 },
  { day: "Wed 9/03", rev: 1515, cost: 602 },
  { day: "Thu 9/04", rev: 410, cost: 488 },
  { day: "Fri 9/05", rev: 2130, cost: 845 },
];

const money = (n: number) =>
  n < 0 ? `($${Math.abs(n).toLocaleString("en-US")})` : `$${n.toLocaleString("en-US")}`;

function TrackerBody({ play }: { play: boolean }) {
  const rev = DAYS.reduce((s, x) => s + x.rev, 0);
  const cost = DAYS.reduce((s, x) => s + x.cost, 0);
  const totalAt = 500 + DAYS.length * 550;
  return (
    <div className={play ? "g-sheet g-play" : "g-sheet"}>
      <div className="g-sheet-title">Daily scoreboard · September</div>
      <div className="g-sheet-grid">
        <span className="g-sh">Date</span>
        <span className="g-sh">Revenue</span>
        <span className="g-sh">Costs</span>
        <span className="g-sh">Profit</span>
        {DAYS.map((x, i) => {
          const p = x.rev - x.cost;
          return (
            <div key={x.day} className="g-sheet-row g-in" style={d(500 + i * 550)}>
              <span>{x.day}</span>
              <span>{money(x.rev)}</span>
              <span>{money(x.cost)}</span>
              <span className={p < 0 ? "g-neg" : "g-pos"}>{money(p)}</span>
            </div>
          );
        })}
        <div className="g-sheet-row g-sheet-total g-in" style={d(totalAt)}>
          <span>Month to date</span>
          <span>{money(rev)}</span>
          <span>{money(cost)}</span>
          <span className="g-pos">{money(rev - cost)}</span>
        </div>
      </div>
      <div className="g-tabs">
        <span className="g-tab-on">Daily</span>
        <span>Monthly</span>
        <span>YTD</span>
        <span>Expenses</span>
      </div>
    </div>
  );
}

export function TrackerPeek() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const run = useReplay(seen, 9000);
  return (
    <div ref={ref} className="g-peek-wide">
      <Window title="Daily Financial Tracker">
        <TrackerBody key={run} play={run > 0} />
      </Window>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────── */

export const GRAPHICS_CSS = `
/* falling dollars */
.g-rain { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
.g-drop { position: absolute; top: -60px; font-weight: 800; opacity: 0.5; line-height: 1;
  animation-name: g-fall; animation-timing-function: linear; animation-iteration-count: infinite; }
.g-bill { font-size: 13px !important; width: 38px; height: 20px; border: 2px solid currentColor;
  border-radius: 5px; display: flex; align-items: center; justify-content: center; opacity: 0.45; }
@keyframes g-fall {
  0%   { transform: translate(0, 0) rotate(calc(var(--spin) * -14deg)); }
  25%  { transform: translate(14px, 27vh) rotate(calc(var(--spin) * 12deg)); }
  50%  { transform: translate(-6px, 55vh) rotate(calc(var(--spin) * -12deg)); }
  75%  { transform: translate(12px, 82vh) rotate(calc(var(--spin) * 10deg)); }
  100% { transform: translate(0, 110vh) rotate(calc(var(--spin) * -8deg)); }
}

/* shared */
.g-card { background: #fff; border: 1px solid var(--hair); border-radius: 18px; }
.g-in { opacity: 0; }
.g-play .g-in { animation: g-in 380ms ease forwards; animation-delay: var(--d); }
@keyframes g-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

/* windows */
.g-peeks { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 28px; }
.g-win { overflow: hidden; height: 100%; }
.g-win-bar { display: flex; align-items: center; gap: 6px; padding: 12px 14px; border-bottom: 1px solid var(--hair); }
.g-win-bar i { width: 10px; height: 10px; border-radius: 50%; background: var(--track); }
.g-win-bar span { margin-left: 8px; font-size: 12px; font-weight: 600; letter-spacing: 1.6px; text-transform: uppercase; color: var(--label); }
.g-win-body { padding: 20px 20px 22px; }

/* notion */
.g-np-icon { font-size: 30px; }
.g-np-title { font-size: 22px; font-weight: 800; letter-spacing: -0.6px; margin: 6px 0 12px; }
.g-np-props { display: grid; grid-template-columns: 70px 1fr; gap: 6px 10px; font-size: 13px; color: var(--muted); font-weight: 500; }
.g-np-props b { font-weight: 600; color: var(--ink); background: #FFE9DE; border-radius: 5px; padding: 1px 8px; justify-self: start; }
.g-np-props b.g-plain { background: none; padding: 0; }
.g-np-h { font-size: 15px; font-weight: 800; margin: 18px 0 8px; }
.g-check { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; padding: 4px 0; }
.g-box { width: 16px; height: 16px; border: 2px solid var(--tan); border-radius: 4px; flex-shrink: 0; position: relative; }
.g-box::after { content: "✓"; position: absolute; inset: -3px 0 0 1px; font-size: 13px; font-weight: 800; color: #fff; opacity: 0; }
.g-play .g-box { animation: g-tick 300ms ease forwards; animation-delay: var(--d); }
.g-play .g-box::after { animation: g-in 200ms ease forwards; animation-delay: var(--d); }
@keyframes g-tick { to { background: var(--ink); border-color: var(--ink); } }
.g-play .g-check-text { animation: g-strike 300ms ease forwards; animation-delay: var(--d); }
@keyframes g-strike { to { color: var(--muted); text-decoration: line-through; text-decoration-color: var(--tan); } }
.g-np-table { display: grid; grid-template-columns: 1fr auto; border-top: 1px solid var(--hair); font-size: 14px; }
.g-np-table span { padding: 7px 0; border-bottom: 1px solid var(--hair); font-weight: 500; }
.g-np-table span:nth-child(even) { text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; }
.g-green-text { color: var(--green); }

/* claude */
.g-cl-you { display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px;
  background: var(--track); border-radius: 8px; padding: 7px 11px; margin-bottom: 14px; }
.g-cl-line { display: flex; gap: 10px; font-size: 14px; font-weight: 500; line-height: 1.45; padding: 5px 0; }
.g-mark { width: 18px; flex-shrink: 0; font-weight: 800; color: var(--ink); text-align: center; }
.g-mark-o { color: var(--orange); }
.g-caret { display: inline-block; width: 8px; height: 16px; background: var(--orange); margin: 6px 0 0 28px; }
.g-play .g-caret { animation: g-in 200ms ease forwards, g-blink 1s step-end infinite; animation-delay: var(--d), var(--d); }
@keyframes g-blink { 50% { opacity: 0; } }

/* tracker sheet */
.g-peek-wide { grid-column: 1 / -1; }
.g-sheet-title { background: var(--ink); color: #fff; font-weight: 800; font-size: 15px; letter-spacing: -0.2px;
  padding: 10px 12px; border-radius: 8px 8px 0 0; }
.g-sheet-grid { display: grid; grid-template-columns: 1.3fr 1fr 1fr 1fr; font-size: 14px;
  font-variant-numeric: tabular-nums; border: 1px solid var(--hair); border-top: none; }
.g-sheet-row { display: contents; }
.g-sheet-grid > span, .g-sheet-row > span { padding: 8px 10px; border-bottom: 1px solid var(--hair); }
.g-sheet-grid > span:nth-child(n+2), .g-sheet-row > span:nth-child(n+2) { text-align: right; }
.g-sh { font-size: 11px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: var(--label);
  background: var(--bg); }
.g-sheet-row > span { opacity: 0; font-weight: 500; }
.g-play .g-sheet-row > span { animation: g-in 380ms ease forwards; animation-delay: var(--d); }
.g-sheet-total > span { font-weight: 800; border-bottom: none; background: var(--bg); }
.g-pos { color: var(--green); font-weight: 700 !important; }
.g-neg { color: var(--orange); font-weight: 700 !important; }
.g-tabs { display: flex; gap: 2px; margin-top: 10px; font-size: 12px; font-weight: 600; color: var(--muted); }
.g-tabs span { padding: 6px 12px; border-radius: 0 0 6px 6px; background: var(--track); }
.g-tabs .g-tab-on { background: #fff; color: var(--ink); border: 1px solid var(--hair); border-top: 2px solid var(--green); }

@media (prefers-reduced-motion: reduce) {
  .g-drop { animation: none; display: none; }
  .g-in, .g-sheet-row > span { opacity: 1 !important; transform: none !important; animation: none !important; }
}
`;
