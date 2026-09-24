"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BUSINESSES,
  DIFFICULTY_LABEL,
  GLOSSARY,
  SEASON_DAYS,
  getBusiness,
  type BusinessConfig,
  type Forecast,
} from "./lib/businesses";
import { lessonsFor, type Lesson } from "./lib/lessons";
import {
  autopilot,
  derive,
  firstOpexDay,
  isUnlocked,
  lease,
  levers,
  money,
  mulberry32,
  pct,
  pickForecast,
  settle,
  unlockedLines,
  upfrontCost,
  upgrade as getUpgrade,
  type DayContext,
  type DayResult,
  type Outcome,
  type OwnedUpgrade,
  type Plan,
  type PnL,
} from "./lib/sim";

/* ────────────────────────────────────────────────────────────── */
/* Save state                                                      */
/* ────────────────────────────────────────────────────────────── */

const SAVE_KEY = "bottom-line:v1";

type BizStatus = "new" | "loan" | "lease" | "playing" | "broke" | "done";

type BizSave = {
  status: BizStatus;
  day: number;
  cash: number;
  loan: number;
  leaseId: string;
  upgrades: OwnedUpgrade[];
  inventory: number;
  /** Cost basis of carried-over inventory. */
  inventoryValue: number;
  lastPlan?: Plan;
  history: DayResult[];
  seed: number;
};

type Save = { v: 1; biz: Record<string, BizSave> };

function freshBiz(cfg: BusinessConfig): BizSave {
  return {
    status: "new",
    day: 1,
    cash: cfg.startingCash,
    loan: 0,
    leaseId: cfg.leases[0].id,
    upgrades: [],
    inventory: 0,
    inventoryValue: 0,
    history: [],
    seed: Math.floor(Math.random() * 1e9),
  };
}

function loadSave(): Save {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Save;
      if (parsed && parsed.v === 1 && parsed.biz) return parsed;
    }
  } catch {}
  return { v: 1, biz: {} };
}

function persist(s: Save) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch {}
}

function forecastFor(cfg: BusinessConfig, b: BizSave, day: number): Forecast {
  return pickForecast(cfg, day, mulberry32(b.seed + day * 7919));
}

function contextFor(cfg: BusinessConfig, b: BizSave): DayContext {
  return {
    day: b.day,
    cash: b.cash,
    loan: b.loan,
    leaseId: b.leaseId,
    upgrades: b.upgrades,
    inventory: b.inventory,
    // Saves from before average costing: assume carryover cost today's price.
    inventoryValue: b.inventoryValue ?? b.inventory * cfg.unitCost,
    forecast: forecastFor(cfg, b, b.day),
  };
}

/* ────────────────────────────────────────────────────────────── */
/* Palette + atoms                                                 */
/* ────────────────────────────────────────────────────────────── */

const PIXEL = "font-[family-name:var(--font-pixel)]";
const GREEN = "#22A855";
const RED = "#E05A2B";
const BLUE = "#2B7FE0";
const GOLD = "#E8B030";

function Pixel({
  children,
  className = "",
  size = 10,
  color,
}: {
  children: React.ReactNode;
  className?: string;
  size?: number;
  color?: string;
}) {
  return (
    <span
      className={`${PIXEL} ${className}`}
      style={{ fontSize: size, lineHeight: 1.6, color }}
    >
      {children}
    </span>
  );
}

function Panel({
  children,
  className = "",
  tone = "light",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "light" | "dark" | "gold" | "green" | "red";
  onClick?: () => void;
}) {
  const bg =
    tone === "dark"
      ? "bg-coal text-cream"
      : tone === "gold"
        ? "bg-gold text-coal"
        : tone === "green"
          ? "text-white"
          : tone === "red"
            ? "text-white"
            : "bg-white text-coal";
  const style =
    tone === "green" ? { background: GREEN } : tone === "red" ? { background: RED } : undefined;
  return (
    <div
      className={`block-border-sm ${bg} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function Btn({
  children,
  onClick,
  tone = "grass",
  disabled,
  className = "",
  small,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "grass" | "gold" | "coal" | "ghost" | "red";
  disabled?: boolean;
  className?: string;
  small?: boolean;
}) {
  const bg =
    tone === "grass"
      ? "bg-grass text-white"
      : tone === "gold"
        ? "bg-gold text-coal"
        : tone === "coal"
          ? "bg-coal text-cream"
          : tone === "red"
            ? "text-white"
            : "bg-white text-coal";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`block-border-sm ${bg} ${PIXEL} ${small ? "px-3 py-2" : "px-4 py-3"} w-full cursor-pointer transition-transform active:translate-y-[2px] disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={{
        fontSize: small ? 9 : 11,
        lineHeight: 1.6,
        background: tone === "red" ? RED : undefined,
      }}
    >
      {children}
    </button>
  );
}

function Stars({ n, size = 22, animate = false }: { n: number; size?: number; animate?: boolean }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${n} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial={animate ? { scale: 0, rotate: -30 } : false}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: animate ? 0.2 + i * 0.25 : 0, type: "spring", stiffness: 300 }}
          style={{ fontSize: size, filter: i < n ? "none" : "grayscale(1) opacity(0.3)" }}
        >
          ⭐
        </motion.span>
      ))}
    </span>
  );
}

function Stepper({
  value,
  onChange,
  min,
  max,
  step,
  format,
  canIncrease = true,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  canIncrease?: boolean;
}) {
  const dec = () => onChange(Math.max(min, +(value - step).toFixed(2)));
  const inc = () => onChange(Math.min(max, +(value + step).toFixed(2)));
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={dec}
        disabled={value <= min}
        className={`block-border-sm bg-white w-11 h-11 text-xl font-bold cursor-pointer active:translate-y-[2px] disabled:opacity-30`}
        aria-label="less"
      >
        −
      </button>
      <div className="flex-1 text-center">
        <span className="text-xl font-bold tabular-nums">{format(value)}</span>
      </div>
      <button
        onClick={inc}
        disabled={value >= max || !canIncrease}
        className={`block-border-sm bg-white w-11 h-11 text-xl font-bold cursor-pointer active:translate-y-[2px] disabled:opacity-30`}
        aria-label="more"
      >
        +
      </button>
    </div>
  );
}

function Header({
  title,
  sub,
  onBack,
  right,
}: {
  title: string;
  sub?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className={`${PIXEL} text-[9px] text-coal/50 hover:text-coal cursor-pointer mb-2 block`}
          >
            ← back
          </button>
        )}
        <h2 className="text-2xl font-bold leading-tight">{title}</h2>
        {sub && <p className="text-coal/60 text-sm mt-1">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function Glossary({ id, onClose }: { id: string; onClose: () => void }) {
  const g = GLOSSARY[id];
  if (!g) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="bg-sky-light border-l-4 p-3 mt-1 mb-2 text-sm"
      style={{ borderColor: BLUE }}
      onClick={onClose}
    >
      <div className="font-bold">{g.kid}</div>
      <div className="text-xs text-coal/60 mb-1">Grown-ups call it: {g.grownUp}</div>
      <div className="text-coal/80 leading-snug">{g.explain}</div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Home                                                            */
/* ────────────────────────────────────────────────────────────── */

function Home({
  save,
  onPick,
  onCompare,
}: {
  save: Save;
  onPick: (id: string) => void;
  onCompare: () => void;
}) {
  const playedAny = Object.values(save.biz).some((b) => b.history.length > 0);
  return (
    <div>
      <a href="/" className={`${PIXEL} text-[9px] text-coal/50 hover:text-coal`}>
        ← flickman.co
      </a>
      <div className="mt-6 mb-2">
        <div className="inline-block bg-gold text-coal px-3 py-1.5 block-border-sm mb-3">
          <Pixel size={9}>A GAME ABOUT THE P&L</Pixel>
        </div>
        <h1 className={`${PIXEL} text-2xl sm:text-3xl leading-relaxed`}>
          Bottom<br />Line
        </h1>
        <p className="text-coal/70 mt-3 leading-relaxed">
          Run a business. Watch the scoreboard. Keep what&apos;s left.
        </p>
      </div>

      <div className="mt-6 mb-3">
        <Pixel size={9} className="text-coal/50">
          PICK A BUSINESS
        </Pixel>
      </div>

      <div className="grid gap-3">
        {BUSINESSES.map((cfg, i) => {
          const b = save.biz[cfg.id];
          const stars = b?.history.reduce((s, r) => s + r.stars, 0) ?? 0;
          const d = DIFFICULTY_LABEL[cfg.difficulty];
          const status = !b || b.status === "new"
            ? "Start"
            : b.status === "done"
              ? "Season complete · Play again"
              : b.status === "broke"
                ? "Went broke · Try again"
                : `Continue · Day ${b.day}`;
          return (
            <motion.button
              key={cfg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onPick(cfg.id)}
              className="block-border-sm block-hover bg-white text-left p-4 cursor-pointer w-full"
            >
              <div className="flex items-center gap-3">
                <div className="text-4xl w-12 text-center">{cfg.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">{cfg.name}</span>
                    <span
                      className={`${PIXEL} text-[7px] px-1.5 py-1 text-white`}
                      style={{ background: d.color, borderRadius: 2 }}
                    >
                      {d.label}
                    </span>
                  </div>
                  <div className="text-xs text-coal/60 mt-0.5 leading-snug">{cfg.tagline}</div>
                  <div className="flex items-center justify-between mt-2">
                    <Pixel size={8} className="text-coal/50">
                      {status}
                    </Pixel>
                    {stars > 0 && (
                      <span className="text-xs tabular-nums">⭐ {stars}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6">
        <Btn tone={playedAny ? "coal" : "ghost"} onClick={onCompare} disabled={!playedAny}>
          📊 COMPARE BUSINESSES
        </Btn>
        {!playedAny && (
          <p className="text-xs text-coal/50 text-center mt-2">
            Finish a day in two businesses to unlock the comparison.
          </p>
        )}
      </div>

      <p className="text-xs text-coal/40 text-center mt-8 leading-relaxed">
        Every tap moves a line on the P&L. Start with the lemonade stand.
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Onboarding: loan + lease                                        */
/* ────────────────────────────────────────────────────────────── */

function LoanScreen({
  cfg,
  onPick,
  onBack,
}: {
  cfg: BusinessConfig;
  onPick: (id: string) => void;
  onBack: () => void;
}) {
  const [sel, setSel] = useState(cfg.loans[1].id);
  const loan = cfg.loans.find((l) => l.id === sel)!;
  return (
    <div>
      <Header
        title="Step 1: Get a loan"
        sub={`Every ${cfg.name.toLowerCase()} starts with money it doesn't have yet.`}
        onBack={onBack}
      />
      <Panel className="p-4 mb-4">
        <div className="flex gap-3">
          <div className="text-4xl">🏦</div>
          <div className="text-sm leading-relaxed">
            <b>The bank lends you cash to start.</b> You keep the cash and pay them back later.
            While you owe it, they charge <b>interest</b> every single day. Bigger loan, bigger
            interest. Your first week is interest-free.
          </div>
        </div>
      </Panel>

      <div className="grid gap-2 mb-4">
        {cfg.loans.map((l) => {
          const active = l.id === sel;
          return (
            <button
              key={l.id}
              onClick={() => setSel(l.id)}
              className={`block-border-sm text-left p-3 cursor-pointer w-full ${active ? "bg-gold" : "bg-white"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{l.name}</div>
                  <div className="text-xs text-coal/60">{l.blurb}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold tabular-nums">{money(l.amount, { cents: false })}</div>
                  <div className="text-[10px] text-coal/60 tabular-nums">
                    {money(l.amount * cfg.loanRate)}/day interest
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Panel tone="dark" className="p-3 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-cream/60">You start with</span>
          <span className="tabular-nums">{money(cfg.startingCash, { cents: false })}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cream/60">Plus the loan</span>
          <span className="tabular-nums">+{money(loan.amount, { cents: false })}</span>
        </div>
        <div className="flex justify-between font-bold border-t border-cream/20 mt-1 pt-1">
          <span>Cash on day one</span>
          <span className="tabular-nums" style={{ color: "#7BE06A" }}>
            {money(cfg.startingCash + loan.amount, { cents: false })}
          </span>
        </div>
        <div className="flex justify-between text-cream/60 text-xs mt-1">
          <span>Interest from day {cfg.unlocks.interest}</span>
          <span className="tabular-nums">{money(loan.amount * cfg.loanRate)}/day</span>
        </div>
      </Panel>

      <Btn onClick={() => onPick(sel)}>✍️ SIGN FOR {money(loan.amount, { cents: false })}</Btn>
    </div>
  );
}

function LeaseScreen({
  cfg,
  cash,
  onPick,
  onBack,
}: {
  cfg: BusinessConfig;
  cash: number;
  onPick: (id: string) => void;
  onBack: () => void;
}) {
  const [sel, setSel] = useState(cfg.leases[1].id);
  const L = lease(cfg, sel);
  return (
    <div>
      <Header title="Step 2: Sign a lease" sub={cfg.leaseIntro} onBack={onBack} />
      <Panel className="p-4 mb-4">
        <div className="flex gap-3">
          <div className="text-4xl">🏢</div>
          <div className="text-sm leading-relaxed">
            <b>Rent is a fixed cost.</b> You pay the same on a packed day and an empty one.
            Better spots cost more but more people find you.{" "}
            {cfg.unlocks.rent > 2
              ? `Your landlord is giving you the first ${cfg.unlocks.rent - 1} days free.`
              : "Your landlord is giving you the first day free."}
          </div>
        </div>
      </Panel>

      <div className="grid gap-2 mb-4">
        {cfg.leases.map((l) => {
          const active = l.id === sel;
          const dots = Math.round(l.demandMult * 3);
          return (
            <button
              key={l.id}
              onClick={() => setSel(l.id)}
              className={`block-border-sm text-left p-3 cursor-pointer w-full ${active ? "bg-gold" : "bg-white"}`}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{l.emoji}</div>
                <div className="flex-1">
                  <div className="font-bold">{l.name}</div>
                  <div className="text-xs text-coal/60">{l.blurb}</div>
                  <div className="text-[10px] text-coal/60 mt-1">
                    {cfg.trafficLabel}: {"🟩".repeat(dots)}{"⬜".repeat(Math.max(0, 6 - dots))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold tabular-nums">
                    {l.rentPerDay === 0 ? "Free" : money(l.rentPerDay, { cents: false })}
                  </div>
                  <div className="text-[10px] text-coal/60">per day</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Panel tone="dark" className="p-3 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-cream/60">Cash in hand</span>
          <span className="tabular-nums">{money(cash, { cents: false })}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cream/60">Rent from day {cfg.unlocks.rent}</span>
          <span className="tabular-nums">{money(L.rentPerDay, { cents: false })}/day</span>
        </div>
        <div className="flex justify-between text-xs text-cream/60 mt-1">
          <span>Over a {SEASON_DAYS}-day season that&apos;s</span>
          <span className="tabular-nums">
            {money(L.rentPerDay * (SEASON_DAYS - cfg.unlocks.rent + 1), { cents: false })}
          </span>
        </div>
      </Panel>

      <Btn onClick={() => onPick(sel)}>✍️ SIGN THE LEASE</Btn>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Morning                                                         */
/* ────────────────────────────────────────────────────────────── */

function MorningScreen({
  cfg,
  biz,
  onOpen,
  onHome,
  onReset,
}: {
  cfg: BusinessConfig;
  biz: BizSave;
  onOpen: (plan: Plan) => void;
  onHome: () => void;
  onReset: () => void;
}) {
  const ctx = useMemo(() => contextFor(cfg, biz), [cfg, biz]);
  const lv = levers(cfg, biz.day);
  const [plan, setPlan] = useState<Plan>(() => {
    const last = biz.lastPlan;
    return {
      price: last?.price ?? cfg.price.base,
      buy: cfg.hasInventory ? (last?.buy ?? cfg.inventory.step * 4) : 0,
      staff: lv.staff ? (last?.staff ?? 0) : 0,
      marketing: lv.marketing ? (last?.marketing ?? 0) : 0,
      buyUpgrade: undefined,
      autopilot: last?.autopilot ?? false,
    };
  });
  const [gloss, setGloss] = useState<string | null>(null);

  const d = derive(cfg, ctx, plan);
  const upfront = upfrontCost(cfg, ctx, plan);
  const cashAfter = biz.cash - upfront;
  const canAfford = cashAfter >= -0.001;
  const card = cfg.curriculum[biz.day];
  const rentIsFree = lease(cfg, biz.leaseId).rentPerDay === 0;
  const lesson = card
    ? { ...card, blurb: biz.day === cfg.unlocks.rent && rentIsFree && card.freeRentBlurb ? card.freeRentBlurb : card.blurb }
    : undefined;
  const set = (p: Partial<Plan>) => setPlan((x) => ({ ...x, ...p }));
  const affordable = (extra: number) => biz.cash - upfront - extra >= -0.001;

  const staffWages = isUnlocked(cfg, "wages", biz.day) ? plan.staff * cfg.staff.wage : 0;
  const rentToday = isUnlocked(cfg, "rent", biz.day) ? lease(cfg, biz.leaseId).rentPerDay : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={onHome} className={`${PIXEL} text-[9px] text-coal/50 cursor-pointer`}>
          ← businesses
        </button>
        <Pixel size={9} className="text-coal/50">
          DAY {biz.day} / {SEASON_DAYS}
        </Pixel>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="text-4xl">{cfg.emoji}</div>
        <div className="flex-1">
          <h2 className="text-xl font-bold leading-tight">Morning at the {cfg.name}</h2>
          <div className="text-sm text-coal/60">Make your calls, then open the doors.</div>
        </div>
        <div className="text-right">
          <Pixel size={7} className="text-coal/50">
            CASH
          </Pixel>
          <div className="font-bold tabular-nums" style={{ color: biz.cash < 0 ? RED : GREEN }}>
            {money(biz.cash, { cents: false })}
          </div>
        </div>
      </div>

      {lesson && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <Panel tone="gold" className="p-3 mb-3">
            <Pixel size={8}>NEW ON YOUR P&L TODAY</Pixel>
            <div className="font-bold mt-1">
              {lesson.emoji} {lesson.title}
            </div>
            <div className="text-sm leading-snug mt-1">{lesson.blurb}</div>
          </Panel>
        </motion.div>
      )}

      <Panel className="p-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{ctx.forecast.emoji}</div>
          <div className="flex-1">
            <Pixel size={8} className="text-coal/50">
              TODAY&apos;S FORECAST
            </Pixel>
            <div className="font-bold">{ctx.forecast.name}</div>
            <div className="text-xs text-coal/60">{ctx.forecast.blurb}</div>
          </div>
          <div className="text-right">
            <Pixel size={7} className="text-coal/50">
              EXPECT
            </Pixel>
            <div className="font-bold tabular-nums text-sm">
              {d.demandLow}–{d.demandHigh}
            </div>
            <div className="text-[10px] text-coal/60">{cfg.customerNoun.plural}</div>
          </div>
        </div>
      </Panel>

      {/* Price */}
      <Panel className="p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="font-bold text-sm">
              {cfg.unit.emoji} Price per {cfg.unit.singular}
            </div>
            <div className="text-[11px] text-coal/60">
              Each one costs you {money(d.unitCost)}
              {ctx.forecast.unitCostMult ? " today" : ""}. Higher price, fewer {cfg.customerNoun.plural}.
            </div>
          </div>
        </div>
        <Stepper
          value={plan.price}
          onChange={(v) => set({ price: v })}
          min={cfg.price.min}
          max={cfg.price.max}
          step={cfg.price.step}
          format={(v) => money(v)}
        />
      </Panel>

      {/* Inventory */}
      {lv.inventory && (
        <Panel className="p-3 mb-3">
          <div className="font-bold text-sm">🛒 {cfg.inventory.label}</div>
          <div className="text-[11px] text-coal/60 mb-2">
            {money(d.unitCost)} each · {cfg.perishable >= 1
              ? "Leftovers get thrown out."
              : cfg.perishable > 0
                ? `About ${Math.round(cfg.perishable * 100)}% of leftovers go bad.`
                : "Leftovers keep for tomorrow."}
            {biz.inventory > 0 && ` ${biz.inventory} left over from yesterday.`}
          </div>
          <Stepper
            value={plan.buy}
            onChange={(v) => set({ buy: v })}
            min={0}
            max={cfg.inventory.max}
            step={cfg.inventory.step}
            format={(v) => `${v} (${money(v * d.unitCost, { cents: false })})`}
            canIncrease={affordable(cfg.inventory.step * d.unitCost)}
          />
        </Panel>
      )}

      {/* Staff */}
      {lv.staff && (
        <Panel className="p-3 mb-3">
          <div className="font-bold text-sm">
            {cfg.staff.emoji} Hire {cfg.staff.plural}
          </div>
          <div className="text-[11px] text-coal/60 mb-2">
            {money(cfg.staff.wage, { cents: false })} each per day, paid tonight. You always work
            too. More hands, fewer {cfg.customerNoun.plural} kept waiting.
          </div>
          <Stepper
            value={plan.staff}
            onChange={(v) => set({ staff: v })}
            min={0}
            max={cfg.staff.max}
            step={1}
            format={(v) => `${v} (${money(v * cfg.staff.wage, { cents: false })})`}
          />
        </Panel>
      )}

      {/* Marketing */}
      {lv.marketing && (
        <Panel className="p-3 mb-3">
          <div className="font-bold text-sm">📣 {cfg.marketing.label}</div>
          <div className="text-[11px] text-coal/60 mb-2">
            Paid up front. Brings more {cfg.customerNoun.plural}, with diminishing returns.
          </div>
          <Stepper
            value={plan.marketing}
            onChange={(v) => set({ marketing: v })}
            min={0}
            max={cfg.marketing.max}
            step={cfg.marketing.step}
            format={(v) =>
              v === 0 ? "None" : `${money(v, { cents: false })} (+${Math.round((d.marketingLift - 1) * 100)}%)`
            }
            canIncrease={affordable(cfg.marketing.step)}
          />
        </Panel>
      )}

      {/* Upgrades */}
      {lv.upgrades && (
        <Panel className="p-3 mb-3">
          <div className="font-bold text-sm">🔧 Equipment shop</div>
          <div className="text-[11px] text-coal/60 mb-2">
            Paid in cash today. The P&L spreads the cost over 10 days.
          </div>
          <div className="grid gap-2">
            {cfg.upgrades.map((u) => {
              const owned = biz.upgrades.some((o) => o.id === u.id);
              const picked = plan.buyUpgrade === u.id;
              const can = owned || picked || affordable(u.cost);
              return (
                <button
                  key={u.id}
                  disabled={owned || !can}
                  onClick={() => set({ buyUpgrade: picked ? undefined : u.id })}
                  className={`block-border-sm p-2 text-left w-full cursor-pointer disabled:cursor-default ${
                    owned ? "bg-sky-light" : picked ? "bg-gold" : "bg-white"
                  } ${!can && !owned ? "opacity-40" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{u.emoji}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{u.name}</div>
                      <div className="text-[11px] text-coal/60">{u.blurb}</div>
                    </div>
                    <div className="text-sm font-bold tabular-nums">
                      {owned ? "✓ Owned" : money(u.cost, { cents: false })}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>
      )}

      {/* Preview */}
      <Panel tone="dark" className="p-3 mb-3 text-sm">
        <Pixel size={8} className="text-cream/50">
          BEFORE YOU OPEN
        </Pixel>
        <div className="mt-2 space-y-1">
          <Row label="Cash now" value={money(biz.cash, { cents: false })} />
          {upfront > 0 && <Row label="Spent this morning" value={`-${money(upfront, { cents: false })}`} dim />}
          {staffWages > 0 && <Row label="Wages due tonight" value={`-${money(staffWages, { cents: false })}`} dim />}
          {rentToday > 0 && <Row label="Rent due tonight" value={`-${money(rentToday, { cents: false })}`} dim />}
          <Row
            label="You can handle up to"
            value={`${d.capacity} ${cfg.customerNoun.plural}`}
            dim
            onInfo={() => setGloss(gloss === "capacity" ? null : "capacity")}
          />
          {gloss === "capacity" && (
            <div className="text-xs text-cream/70 leading-snug py-1">
              {d.workers} worker{d.workers === 1 ? "" : "s"} × {cfg.dayLength}s ÷ {d.serveTime.toFixed(1)}s
              per {cfg.unit.singular}. If more show up than this, they wait, and some leave.
            </div>
          )}
        </div>
        {!canAfford && (
          <div className="mt-2 text-xs font-bold" style={{ color: "#FF8A65" }}>
            You can&apos;t afford that plan. Cut something.
          </div>
        )}
      </Panel>

      <div className="flex gap-2 items-stretch mb-2">
        <Btn onClick={() => onOpen({ ...plan, autopilot: false })} disabled={!canAfford}>
          ▶ OPEN FOR BUSINESS
        </Btn>
      </div>
      <button
        onClick={() => onOpen({ ...plan, autopilot: true })}
        disabled={!canAfford}
        className={`${PIXEL} text-[8px] text-coal/50 hover:text-coal w-full text-center py-2 cursor-pointer disabled:opacity-30`}
      >
        ⚡ skip the rush, just run the numbers
      </button>

      <div className="text-center mt-6">
        <button
          onClick={() => {
            if (window.confirm(`Start the ${cfg.name} over from day 1?`)) onReset();
          }}
          className={`${PIXEL} text-[7px] text-coal/30 hover:text-coal/60 cursor-pointer`}
        >
          start this business over
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  dim,
  onInfo,
}: {
  label: string;
  value: string;
  dim?: boolean;
  onInfo?: () => void;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={dim ? "text-cream/60" : ""}>
        {label}
        {onInfo && (
          <button onClick={onInfo} className="ml-1 text-cream/40 cursor-pointer text-xs">
            ⓘ
          </button>
        )}
      </span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Rush (the Diner Dash part)                                      */
/* ────────────────────────────────────────────────────────────── */

type Cust = {
  id: number;
  emoji: string;
  slot: number;
  arrivedAt: number;
  patience: number;
  status: "waiting" | "ordered" | "serving" | "done" | "left";
  serveStart?: number;
  endAt?: number;
  leftReason?: "patience" | "soldout" | "closed";
};

type Float = { id: number; slot: number; text: string; color: string; born: number };

type Sim = {
  t: number;
  nextSpawn: number;
  burst: number;
  slowUntil: number;
  surpriseAt: number;
  surpriseDone: boolean;
  banner?: { text: string; until: number };
  customers: Cust[];
  floats: Float[];
  arrivals: number;
  served: number;
  tips: number;
  lostStockout: number;
  lostPatience: number;
  lostCrowd: number;
  inventory: number;
  streak: number;
  busy: number;
  nextId: number;
  closing: boolean;
  ended: boolean;
};

function RushScreen({
  cfg,
  ctx,
  plan,
  onDone,
}: {
  cfg: BusinessConfig;
  ctx: DayContext;
  plan: Plan;
  onDone: (o: Outcome) => void;
}) {
  const d = useMemo(() => derive(cfg, ctx, plan), [cfg, ctx, plan]);
  const rng = useMemo(() => {
    const r = mulberry32(ctx.day * 31 + Math.floor(Math.random() * 1e6));
    r(); r(); r();
    return r;
  }, [ctx.day]);
  const simRef = useRef<Sim>({
    t: 0,
    nextSpawn: 0.8,
    burst: 0,
    slowUntil: 0,
    surpriseAt: cfg.dayLength * (0.3 + 0.35 * Math.random()),
    surpriseDone: Math.random() > 0.35,
    customers: [],
    floats: [],
    arrivals: 0,
    served: 0,
    tips: 0,
    lostStockout: 0,
    lostPatience: 0,
    lostCrowd: 0,
    inventory: cfg.hasInventory ? ctx.inventory + plan.buy : Number.POSITIVE_INFINITY,
    streak: 0,
    busy: 0,
    nextId: 1,
    closing: false,
    ended: false,
  });
  const [, setFrame] = useState(0);
  const [started, setStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const doneRef = useRef(false);

  const spawnInterval = cfg.dayLength / Math.max(d.demand, 1);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const s = simRef.current;
    onDone({
      arrivals: s.arrivals,
      served: s.served,
      tips: s.tips,
      lostStockout: s.lostStockout,
      lostPatience: s.lostPatience,
      lostCrowd: s.lostCrowd,
    });
  }, [onDone]);

  // Countdown.
  useEffect(() => {
    if (started) return;
    if (countdown <= 0) {
      setStarted(true);
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 700);
    return () => clearTimeout(id);
  }, [countdown, started]);

  const assign = useCallback(
    (s: Sim) => {
      while (s.busy < d.workers) {
        const next = s.customers
          .filter((c) => c.status === "ordered")
          .sort((a, b) => a.arrivedAt - b.arrivedAt)[0];
        if (!next) break;
        if (s.inventory <= 0) {
          next.status = "left";
          next.leftReason = "soldout";
          next.endAt = s.t;
          s.lostStockout++;
          s.streak = 0;
          s.floats.push({ id: s.nextId++, slot: next.slot, text: cfg.rush.soldOutLabel, color: RED, born: s.t });
          continue;
        }
        s.inventory--;
        next.status = "serving";
        next.serveStart = s.t;
        s.busy++;
      }
    },
    [d.workers, cfg.rush.soldOutLabel],
  );

  const tap = useCallback(
    (id: number) => {
      const s = simRef.current;
      const c = s.customers.find((x) => x.id === id);
      if (!c || c.status !== "waiting" || s.closing) return;
      if (s.inventory <= 0) {
        c.status = "left";
        c.leftReason = "soldout";
        c.endAt = s.t;
        s.lostStockout++;
        s.streak = 0;
        s.floats.push({ id: s.nextId++, slot: c.slot, text: cfg.rush.soldOutLabel, color: RED, born: s.t });
        return;
      }
      c.status = "ordered";
      assign(s);
      setFrame((f) => f + 1);
    },
    [assign, cfg.rush.soldOutLabel],
  );

  // Main loop.
  useEffect(() => {
    if (!started) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const s = simRef.current;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      s.t += dt;
      const T = cfg.dayLength;

      if (!s.closing && s.t >= T) {
        s.closing = true;
        for (const c of s.customers) {
          if (c.status === "waiting" || c.status === "ordered") {
            c.status = "left";
            c.leftReason = "closed";
            c.endAt = s.t;
          }
        }
      }

      if (s.closing) {
        if (s.busy === 0 || s.t >= T + 5) {
          s.ended = true;
        }
      } else {
        // Surprise event.
        if (!s.surpriseDone && s.t >= s.surpriseAt) {
          s.surpriseDone = true;
          if (rng() < 0.6) {
            s.burst = Math.max(3, Math.round(d.demand * 0.15));
            s.banner = { text: "🚌 A bus just pulled up!", until: s.t + 3 };
          } else {
            s.slowUntil = s.t + 8;
            s.banner = { text: "🚧 Road closed. It's quiet out there.", until: s.t + 3 };
          }
        }

        // Spawn.
        if (s.t >= s.nextSpawn && s.t < T - 1.5) {
          const free = Array.from({ length: cfg.slots }, (_, i) => i).filter(
            (i) => !s.customers.some((c) => c.slot === i && (c.status === "waiting" || c.status === "ordered" || c.status === "serving")),
          );
          s.arrivals++;
          if (free.length === 0) {
            s.lostCrowd++;
          } else {
            const slot = free[Math.floor(rng() * free.length)];
            s.customers.push({
              id: s.nextId++,
              emoji: cfg.customers[Math.floor(rng() * cfg.customers.length)],
              slot,
              arrivedAt: s.t,
              patience: d.patience * (0.8 + 0.4 * rng()),
              status: "waiting",
            });
          }
          let interval = spawnInterval * (0.5 + rng());
          if (s.burst > 0) {
            s.burst--;
            interval = 0.45;
          } else if (s.t < s.slowUntil) {
            interval *= 2.5;
          }
          s.nextSpawn = s.t + interval;
        }

        // Patience.
        for (const c of s.customers) {
          if (c.status === "waiting" && s.t - c.arrivedAt >= c.patience) {
            c.status = "left";
            c.leftReason = "patience";
            c.endAt = s.t;
            s.lostPatience++;
            s.streak = 0;
            s.floats.push({ id: s.nextId++, slot: c.slot, text: "😤", color: RED, born: s.t });
          }
        }
      }

      // Serving progress.
      for (const c of s.customers) {
        if (c.status === "serving" && c.serveStart !== undefined && s.t - c.serveStart >= d.serveTime) {
          c.status = "done";
          c.endAt = s.t;
          s.busy--;
          s.served++;
          s.streak++;
          let text = money(plan.price, { sign: true });
          if (s.streak % 5 === 0 && cfg.bonus.pct > 0) {
            const tip = plan.price * cfg.bonus.pct;
            s.tips += tip;
            text = `${money(plan.price + tip, { sign: true })} 🔥 ${cfg.bonus.label}!`;
          }
          s.floats.push({ id: s.nextId++, slot: c.slot, text, color: GREEN, born: s.t });
        }
      }
      if (!s.closing) assign(s);

      // Cleanup.
      s.customers = s.customers.filter(
        (c) => !(c.endAt !== undefined && s.t - c.endAt > 0.7),
      );
      s.floats = s.floats.filter((f) => s.t - f.born < 1.1);
      if (s.banner && s.t > s.banner.until) s.banner = undefined;

      setFrame((f) => f + 1);
      if (s.ended) {
        setTimeout(finish, 600);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, cfg, d, plan.price, assign, finish, rng, spawnInterval]);

  const s = simRef.current;
  const T = cfg.dayLength;
  const progress = Math.min(1, s.t / T);
  const day = ctx.day;
  const L = lease(cfg, ctx.leaseId);

  // Live P&L.
  const sales = s.served * plan.price + s.tips;
  const cogs = s.served * d.unitCost;
  const drip = (v: number) => v * progress;
  const live: { key: string; label: string; v: number }[] = [];
  if (isUnlocked(cfg, "wages", day)) live.push({ key: "wages", label: "Wages", v: drip(plan.staff * cfg.staff.wage) });
  if (isUnlocked(cfg, "rent", day)) live.push({ key: "rent", label: "Rent", v: drip(L.rentPerDay) });
  if (isUnlocked(cfg, "marketing", day) && plan.marketing > 0)
    live.push({ key: "marketing", label: "Marketing", v: plan.marketing });
  if (isUnlocked(cfg, "utilities", day))
    live.push({ key: "utilities", label: "Utilities", v: drip(cfg.utilities.fixed) + cfg.utilities.perUnit * s.served });
  if (isUnlocked(cfg, "depreciation", day)) {
    const owned = [...ctx.upgrades, ...(plan.buyUpgrade ? [{ id: plan.buyUpgrade, boughtDay: day }] : [])];
    const dep = owned.reduce((sum, o) => {
      const u = getUpgrade(cfg, o.id);
      return u && day - o.boughtDay < 10 ? sum + u.cost / 10 : sum;
    }, 0);
    if (dep > 0) live.push({ key: "depreciation", label: "Equipment", v: drip(dep) });
  }
  if (isUnlocked(cfg, "interest", day)) live.push({ key: "interest", label: "Interest", v: drip(ctx.loan * cfg.loanRate) });
  const profit = sales - cogs - live.reduce((a, b) => a + b.v, 0);

  const workers = Array.from({ length: d.workers }, (_, i) => i);

  return (
    <div className="select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-2">
        <Pixel size={9} className="text-coal/60">
          DAY {day} · {ctx.forecast.emoji}
        </Pixel>
        <div className="flex items-center gap-3">
          {cfg.hasInventory && (
            <Pixel size={9} color={s.inventory <= 3 ? RED : undefined}>
              {cfg.inventory.emoji} {s.inventory}
            </Pixel>
          )}
          {s.streak >= 2 && (
            <Pixel size={9} color={GOLD}>
              🔥{s.streak}
            </Pixel>
          )}
        </div>
      </div>
      <div className="h-3 block-border-sm bg-white overflow-hidden mb-3">
        <div
          className="h-full"
          style={{
            width: `${(1 - progress) * 100}%`,
            background: progress > 0.8 ? RED : GOLD,
            transition: "width 0.1s linear",
          }}
        />
      </div>

      {/* Shop */}
      <div className="block-border-sm bg-sky-light relative overflow-hidden" style={{ height: 250 }}>
        {/* Customers */}
        <div className="absolute inset-x-0 top-0 grid px-2 pt-3" style={{ gridTemplateColumns: `repeat(${cfg.slots}, 1fr)`, height: 170 }}>
          {Array.from({ length: cfg.slots }, (_, slot) => {
            const c = s.customers.find(
              (x) => x.slot === slot && (x.status === "waiting" || x.status === "ordered" || x.status === "serving" || (x.status === "done" && s.t - (x.endAt ?? 0) < 0.4)),
            );
            const floats = s.floats.filter((f) => f.slot === slot);
            const patienceLeft = c && c.status === "waiting" ? 1 - (s.t - c.arrivedAt) / c.patience : 1;
            const serveProg = c && c.status === "serving" && c.serveStart !== undefined ? (s.t - c.serveStart) / d.serveTime : 0;
            return (
              <button
                key={slot}
                onClick={() => c && tap(c.id)}
                className="relative flex flex-col items-center justify-end cursor-pointer"
                style={{ touchAction: "manipulation" }}
                aria-label={c ? "serve customer" : "empty"}
              >
                {floats.map((f) => (
                  <span
                    key={f.id}
                    className={`absolute ${PIXEL} pointer-events-none whitespace-nowrap`}
                    style={{
                      fontSize: 8,
                      color: f.color,
                      top: 10 - (s.t - f.born) * 40,
                      opacity: 1 - (s.t - f.born) / 1.1,
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    {f.text}
                  </span>
                ))}
                <AnimatePresence>
                  {c && (
                    <motion.div
                      key={c.id}
                      initial={{ y: 40, opacity: 0 }}
                      animate={{
                        y: 0,
                        opacity: 1,
                        scale: c.status === "serving" ? 1.08 : 1,
                        x: c.status === "waiting" && patienceLeft < 0.3 ? [0, -3, 3, -3, 0] : 0,
                      }}
                      exit={{ y: -30, opacity: 0 }}
                      transition={{ x: { repeat: Infinity, duration: 0.4 } }}
                      className="flex flex-col items-center"
                    >
                      <div
                        className="bg-white block-border-sm px-1.5 py-0.5 text-sm mb-1"
                        style={{ minWidth: 30, textAlign: "center" }}
                      >
                        {c.status === "waiting" ? cfg.unit.emoji : c.status === "ordered" ? "⏳" : c.status === "serving" ? cfg.rush.servingEmoji : cfg.rush.doneEmoji}
                      </div>
                      <div style={{ fontSize: 34, lineHeight: 1 }}>{c.emoji}</div>
                      <div className="w-10 h-1.5 bg-black/10 mt-1.5 overflow-hidden" style={{ borderRadius: 1 }}>
                        <div
                          className="h-full"
                          style={{
                            width: `${(c.status === "serving" ? serveProg : patienceLeft) * 100}%`,
                            background: c.status === "serving" ? BLUE : patienceLeft > 0.5 ? GREEN : patienceLeft > 0.25 ? GOLD : RED,
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        {/* Counter */}
        <div className="absolute inset-x-0 bottom-0" style={{ height: 78 }}>
          <div className="h-3 bg-wood" style={{ opacity: 0.9 }} />
          <div className="bg-sand h-full flex items-center justify-center gap-4 pixel-grid">
            {workers.map((i) => (
              <div key={i} className="text-center">
                <div style={{ fontSize: 30, lineHeight: 1 }} className={i < s.busy ? "" : "opacity-70"}>
                  {i === 0 ? cfg.ownerEmoji : cfg.staff.emoji}
                </div>
                <Pixel size={6} className="text-coal/50">
                  {i < s.busy ? "busy" : "ready"}
                </Pixel>
              </div>
            ))}
          </div>
        </div>

        {/* Overlays */}
        <AnimatePresence>
          {!started && (
            <motion.div
              key="count"
              className="absolute inset-0 flex flex-col items-center justify-center bg-coal/70 text-cream"
              exit={{ opacity: 0 }}
            >
              <Pixel size={10} className="mb-3 text-center px-4">
                {cfg.rush.instruction}
              </Pixel>
              <motion.div key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Pixel size={28}>{countdown > 0 ? countdown : "GO!"}</Pixel>
              </motion.div>
            </motion.div>
          )}
          {s.banner && (
            <motion.div
              key="banner"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-2 left-2 right-2 bg-coal text-cream block-border-sm px-3 py-2 text-center"
            >
              <Pixel size={9}>{s.banner.text}</Pixel>
            </motion.div>
          )}
          {s.closing && (
            <motion.div
              key="closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-coal/60 text-cream"
            >
              <Pixel size={16}>CLOSED</Pixel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live P&L */}
      <Panel tone="dark" className="p-3 mt-3">
        <div className="flex justify-between items-center mb-1">
          <Pixel size={8} className="text-cream/50">
            LIVE P&L
          </Pixel>
          <Pixel size={8} className="text-cream/50">
            {s.served} {cfg.unit.verb}
          </Pixel>
        </div>
        <LiveRow label="Sales" v={sales} color="#7BE06A" />
        <LiveRow label="Cost of goods" v={-cogs} />
        {live.map((l) => (
          <LiveRow key={l.key} label={l.label} v={-l.v} />
        ))}
        <div className="flex justify-between items-center border-t border-cream/20 mt-2 pt-2">
          <Pixel size={10}>PROFIT</Pixel>
          <span
            className={`${PIXEL} tabular-nums`}
            style={{ fontSize: 14, color: profit >= 0 ? "#7BE06A" : "#FF8A65" }}
          >
            {money(profit)}
          </span>
        </div>
      </Panel>
    </div>
  );
}

function LiveRow({ label, v, color }: { label: string; v: number; color?: string }) {
  return (
    <div className="flex justify-between text-sm py-0.5">
      <span className="text-cream/70">{label}</span>
      <span className="tabular-nums" style={{ color: color ?? (v < 0 ? "#FFB79A" : undefined) }}>
        {money(v)}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Closing: the receipt                                            */
/* ────────────────────────────────────────────────────────────── */

type ReceiptLine =
  | { kind: "line"; key: string; label: string; v: number; note?: string }
  | { kind: "sub"; key: string; label: string; v: number; big?: boolean };

function receiptLines(cfg: BusinessConfig, r: DayResult): ReceiptLine[] {
  const p = r.pnl;
  const day = r.day;
  const out: ReceiptLine[] = [];
  out.push({
    kind: "line",
    key: "sales",
    label: "Sales",
    v: p.sales,
    note: `${r.outcome.served} ${cfg.unit.plural} × ${money(r.plan.price)}${p.tips > 0 ? ` + ${money(p.tips)} ${cfg.bonus.pluralLabel}` : ""}`,
  });
  out.push({
    kind: "line",
    key: "cogs",
    label: "Cost of goods",
    v: -(p.cogs + p.spoilage),
    note: p.spoilage > 0 ? `incl. ${money(p.spoilage)} wasted` : `${r.outcome.served} × ${money(r.avgCost)}`,
  });
  out.push({ kind: "sub", key: "gross", label: "Gross profit", v: p.gross });
  const anyOpex = day >= firstOpexDay(cfg);
  if (isUnlocked(cfg, "wages", day)) out.push({ kind: "line", key: "wages", label: "Wages", v: -p.wages, note: `${r.plan.staff} ${r.plan.staff === 1 ? cfg.staff.title : cfg.staff.plural}` });
  if (isUnlocked(cfg, "rent", day)) out.push({ kind: "line", key: "rent", label: "Rent", v: -p.rent, note: p.rent === 0 ? "your own space" : undefined });
  if (isUnlocked(cfg, "marketing", day)) out.push({ kind: "line", key: "marketing", label: "Marketing", v: -p.marketing, note: cfg.marketing.label });
  if (isUnlocked(cfg, "utilities", day)) out.push({ kind: "line", key: "utilities", label: "Utilities", v: -p.utilities, note: cfg.utilities.label });
  if (isUnlocked(cfg, "depreciation", day)) out.push({ kind: "line", key: "depreciation", label: "Equipment", v: -p.depreciation, note: p.depreciation > 0 ? "spread over 10 days" : "none yet" });
  const netUnlocked = isUnlocked(cfg, "interest", day);
  if (anyOpex) {
    out.push({ kind: "sub", key: "operating", label: netUnlocked ? "Operating profit" : "Profit", v: p.operating, big: !netUnlocked });
  }
  if (netUnlocked) {
    out.push({ kind: "line", key: "interest", label: "Interest", v: -p.interest });
    out.push({ kind: "line", key: "taxes", label: "Taxes", v: -p.taxes, note: p.taxes === 0 ? "no profit, no tax" : `${Math.round(cfg.taxRate * 100)}% of profit` });
    out.push({ kind: "sub", key: "net", label: "Net profit", v: p.net, big: true });
  }
  if (!anyOpex) {
    // Day 1: gross profit is the bottom line.
    out[out.length - 1] = { kind: "sub", key: "gross", label: "Profit", v: p.gross, big: true };
  }
  return out;
}

function ClosingScreen({
  cfg,
  result,
  lessons,
  isLastDay,
  broke,
  onNext,
}: {
  cfg: BusinessConfig;
  result: DayResult;
  lessons: Lesson[];
  isLastDay: boolean;
  broke: boolean;
  onNext: () => void;
}) {
  const lines = useMemo(() => receiptLines(cfg, result), [cfg, result]);
  const [shown, setShown] = useState(0);
  const [gloss, setGloss] = useState<string | null>(null);
  const total = lines.length;
  const revealed = shown >= total;

  useEffect(() => {
    if (shown >= total) return;
    const id = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 400 : 420);
    return () => clearTimeout(id);
  }, [shown, total]);

  const cashDelta = result.cashEnd - result.cashStart;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Pixel size={9} className="text-coal/50">
          DAY {result.day} · CLOSING TIME
        </Pixel>
        <button onClick={() => setShown(total)} className={`${PIXEL} text-[8px] text-coal/40 cursor-pointer`}>
          {revealed ? "" : "skip ›"}
        </button>
      </div>

      <Panel className="p-4 mb-3" tone="light">
        <div className="text-center mb-3">
          <Pixel size={9} className="text-coal/50">
            {cfg.emoji} {cfg.name.toUpperCase()}
          </Pixel>
          <div className={`${PIXEL} text-[8px] text-coal/40 mt-1`}>P&L · DAY {result.day}</div>
        </div>
        <div className="border-t border-dashed border-coal/20 pt-2">
          {lines.slice(0, shown).map((l) => (
            <div key={l.key}>
              <motion.button
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setGloss(gloss === l.key ? null : l.key)}
                className={`w-full text-left cursor-pointer ${
                  l.kind === "sub" ? "border-t border-coal/20 mt-1 pt-1.5 pb-1" : "py-1"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className={l.kind === "sub" ? (l.big ? `${PIXEL} text-[11px]` : "font-bold") : "text-sm"}>
                    {l.kind === "sub" && l.big ? l.label.toUpperCase() : l.label}
                    {GLOSSARY[l.key] && <span className="text-coal/30 text-xs ml-1">ⓘ</span>}
                  </span>
                  <span
                    className={`tabular-nums ${l.kind === "sub" ? (l.big ? `${PIXEL} text-[14px]` : "font-bold") : "text-sm"}`}
                    style={{
                      color:
                        l.kind === "sub"
                          ? l.v >= 0
                            ? GREEN
                            : RED
                          : l.v < 0
                            ? "#B5462A"
                            : "#1E7A3E",
                    }}
                  >
                    {money(l.v)}
                  </span>
                </div>
                {l.kind === "line" && l.note && (
                  <div className="text-[11px] text-coal/50 leading-tight">{l.note}</div>
                )}
              </motion.button>
              <AnimatePresence>{gloss === l.key && <Glossary id={l.key} onClose={() => setGloss(null)} />}</AnimatePresence>
            </div>
          ))}
        </div>
      </Panel>

      {revealed && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex gap-4">
              <div>
                <Pixel size={8} className="text-coal/50">
                  MARGIN
                </Pixel>
                <div className="font-bold tabular-nums" style={{ color: result.margin >= 0 ? GREEN : RED }}>
                  {result.pnl.sales > 0 ? pct(result.margin) : "—"}
                  <span className="text-xs text-coal/50 font-normal ml-1">/ {pct(cfg.benchmarkMargin)}</span>
                </div>
              </div>
              <div>
                <Pixel size={8} className="text-coal/50">
                  {result.pnl.bottomLabel.toUpperCase()}
                </Pixel>
                <div className="font-bold tabular-nums" style={{ color: result.pnl.bottom >= 0 ? GREEN : RED }}>
                  {money(result.pnl.bottom, { cents: false })}
                  <span className="text-xs text-coal/50 font-normal ml-1">/ {money(cfg.dailyTarget, { cents: false })} goal</span>
                </div>
              </div>
            </div>
            <Stars n={result.stars} animate />
          </div>

          <Panel tone="dark" className="p-3 mb-3 text-sm">
            <div className="flex justify-between">
              <span className="text-cream/60">Cash this morning</span>
              <span className="tabular-nums">{money(result.cashStart, { cents: false })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cream/60">Cash tonight</span>
              <span className="tabular-nums font-bold" style={{ color: result.cashEnd < 0 ? "#FF8A65" : "#7BE06A" }}>
                {money(result.cashEnd, { cents: false })}
                <span className="text-cream/50 font-normal text-xs ml-2">({money(cashDelta, { sign: true, cents: false })})</span>
              </span>
            </div>
            {result.inventoryEnd > 0 && (
              <div className="flex justify-between text-xs text-cream/60 mt-1">
                <span>Carried over</span>
                <span>{result.inventoryEnd} {cfg.unit.plural}</span>
              </div>
            )}
          </Panel>

          {lessons.map((l, i) => (
            <motion.div key={l.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.2 }}>
              <Panel className="p-3 mb-3" tone={l.tone === "good" ? "green" : l.tone === "bad" ? "light" : "light"}>
                <div className="flex gap-3">
                  <div className="text-3xl">{l.emoji}</div>
                  <div className="flex-1">
                    <div className="font-bold">{l.title}</div>
                    <div className={`text-sm leading-snug mt-1 ${l.tone === "good" ? "text-white/90" : "text-coal/80"}`}>{l.body}</div>
                  </div>
                </div>
              </Panel>
            </motion.div>
          ))}

          <Btn onClick={onNext} tone={broke ? "red" : isLastDay ? "gold" : "grass"}>
            {broke ? "😵 OUT OF CASH" : isLastDay ? "🏁 SEASON OVER · SEE RESULTS" : `→ DAY ${result.day + 1}`}
          </Btn>
        </motion.div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Season end / broke                                              */
/* ────────────────────────────────────────────────────────────── */

function sumPnl(history: DayResult[]): PnL {
  const z: PnL = {
    sales: 0, tips: 0, cogs: 0, spoilage: 0, gross: 0, wages: 0, rent: 0, marketing: 0,
    utilities: 0, depreciation: 0, opex: 0, operating: 0, interest: 0, taxes: 0, net: 0,
    bottom: 0, bottomLabel: "Profit",
  };
  for (const r of history) {
    for (const k of Object.keys(z) as (keyof PnL)[]) {
      if (k === "bottomLabel") continue;
      (z[k] as number) += r.pnl[k] as number;
    }
  }
  return z;
}

function EndScreen({
  cfg,
  biz,
  broke,
  onHome,
  onAgain,
}: {
  cfg: BusinessConfig;
  biz: BizSave;
  broke: boolean;
  onHome: () => void;
  onAgain: () => void;
}) {
  const tot = sumPnl(biz.history);
  const stars = biz.history.reduce((s, r) => s + r.stars, 0);
  const profitableDays = biz.history.filter((r) => r.pnl.bottom > 0).length;
  const learned = unlockedLines(cfg, biz.history.length);
  return (
    <div>
      <div className="text-center mb-4">
        <div className="text-6xl mb-2">{broke ? "😵" : "🏁"}</div>
        <h2 className={`${PIXEL} text-base leading-relaxed`}>
          {broke ? "OUT OF CASH" : "SEASON COMPLETE"}
        </h2>
        <p className="text-sm text-coal/60 mt-2 leading-relaxed">
          {broke
            ? `The bank called the loan on day ${biz.history.length}. Plenty of real businesses end this way. The P&L tells you why.`
            : `${SEASON_DAYS} days running the ${cfg.name}. Here's the whole season on one page.`}
        </p>
      </div>

      <Panel className="p-4 mb-3">
        <Pixel size={8} className="text-coal/50">
          SEASON P&L · {biz.history.length} DAYS
        </Pixel>
        <div className="mt-2 text-sm">
          <TotRow label="Sales" v={tot.sales} />
          <TotRow label="Cost of goods" v={-(tot.cogs + tot.spoilage)} />
          <TotRow label="Wages" v={-tot.wages} />
          <TotRow label="Rent" v={-tot.rent} />
          <TotRow label="Marketing" v={-tot.marketing} />
          <TotRow label="Utilities" v={-tot.utilities} />
          <TotRow label="Equipment" v={-tot.depreciation} />
          <TotRow label="Interest" v={-tot.interest} />
          <TotRow label="Taxes" v={-tot.taxes} />
          <div className="flex justify-between border-t border-coal/20 mt-2 pt-2">
            <Pixel size={11}>NET PROFIT</Pixel>
            <span className={`${PIXEL} text-[14px] tabular-nums`} style={{ color: tot.net >= 0 ? GREEN : RED }}>
              {money(tot.net, { cents: false })}
            </span>
          </div>
          <div className="flex justify-between text-xs text-coal/50 mt-1">
            <span>Margin</span>
            <span>{tot.sales > 0 ? pct(tot.net / tot.sales) : "—"}</span>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <Panel className="p-3 text-center">
          <div className="text-xl font-bold tabular-nums">⭐ {stars}</div>
          <Pixel size={7} className="text-coal/50">
            OF {SEASON_DAYS * 3}
          </Pixel>
        </Panel>
        <Panel className="p-3 text-center">
          <div className="text-xl font-bold tabular-nums">{profitableDays}</div>
          <Pixel size={7} className="text-coal/50">
            PROFITABLE DAYS
          </Pixel>
        </Panel>
        <Panel className="p-3 text-center">
          <div className="text-xl font-bold tabular-nums" style={{ color: biz.cash < 0 ? RED : GREEN }}>
            {money(biz.cash, { cents: false })}
          </div>
          <Pixel size={7} className="text-coal/50">
            CASH LEFT
          </Pixel>
        </Panel>
      </div>

      <Panel tone="gold" className="p-3 mb-4">
        <Pixel size={8}>P&L LINES YOU NOW KNOW</Pixel>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {["sales", "cogs", "gross", ...learned, ...(learned.includes("interest") ? ["net"] : [])].map((k) => (
            <span key={k} className="bg-white/70 text-[11px] px-2 py-1 block-border-sm">
              {GLOSSARY[k]?.grownUp.split(" (")[0] ?? k}
            </span>
          ))}
        </div>
      </Panel>

      <div className="grid gap-2">
        <Btn onClick={onAgain}>🔁 PLAY {cfg.name.toUpperCase()} AGAIN</Btn>
        <Btn onClick={onHome} tone="coal">
          🏪 TRY ANOTHER BUSINESS
        </Btn>
      </div>
    </div>
  );
}

function TotRow({ label, v }: { label: string; v: number }) {
  if (v === 0) return null;
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-coal/70">{label}</span>
      <span className="tabular-nums" style={{ color: v < 0 ? "#B5462A" : "#1E7A3E" }}>
        {money(v, { cents: false })}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Compare                                                         */
/* ────────────────────────────────────────────────────────────── */

const SEG = {
  cogs: { label: "Goods", color: "#E05A2B" },
  wages: { label: "Wages", color: "#2B7FE0" },
  rent: { label: "Rent", color: "#9B44D4" },
  marketing: { label: "Ads", color: "#E8B030" },
  other: { label: "Other", color: "#7F8C8D" },
  profit: { label: "Profit", color: GREEN },
};

function CompareScreen({ save, onBack }: { save: Save; onBack: () => void }) {
  const rows = BUSINESSES.map((cfg) => {
    const b = save.biz[cfg.id];
    if (!b || b.history.length === 0) return null;
    const t = sumPnl(b.history);
    if (t.sales <= 0) return null;
    const share = (v: number) => Math.max(0, v / t.sales);
    const segs = {
      cogs: share(t.cogs + t.spoilage),
      wages: share(t.wages),
      rent: share(t.rent),
      marketing: share(t.marketing),
      other: share(t.utilities + t.depreciation + t.interest + t.taxes),
      profit: t.net / t.sales,
    };
    return { cfg, days: b.history.length, segs, net: t.net, sales: t.sales };
  }).filter((x): x is NonNullable<typeof x> => !!x);

  const sorted = [...rows].sort((a, b) => b.segs.profit - a.segs.profit);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  return (
    <div>
      <Header title="Compare" sub="Every dollar of sales, split by where it went." onBack={onBack} />

      {rows.length < 2 && (
        <Panel className="p-3 mb-3 text-sm text-coal/70">
          Play a day in another business and the patterns start to show.
        </Panel>
      )}

      {rows.map((r) => {
        const costs = r.segs.cogs + r.segs.wages + r.segs.rent + r.segs.marketing + r.segs.other;
        const scale = costs > 1 ? 1 / costs : 1;
        return (
          <Panel key={r.cfg.id} className="p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold">
                {r.cfg.emoji} {r.cfg.name}
              </div>
              <div className="text-xs text-coal/50">
                {r.days} day{r.days === 1 ? "" : "s"} · {r.segs.profit >= 0 ? "keeps" : "loses"}{" "}
                <b style={{ color: r.segs.profit >= 0 ? GREEN : RED }}>
                  {Math.abs(Math.round(r.segs.profit * 100))}¢
                </b>{" "}
                per $1
              </div>
            </div>
            <div className="flex h-6 overflow-hidden block-border-sm">
              {(Object.keys(SEG) as (keyof typeof SEG)[]).map((k) => {
                const v = k === "profit" ? Math.max(0, r.segs.profit) : r.segs[k] * scale;
                if (v <= 0.005) return null;
                return (
                  <div
                    key={k}
                    style={{ width: `${v * 100}%`, background: SEG[k].color }}
                    title={`${SEG[k].label} ${Math.round(v * 100)}%`}
                  />
                );
              })}
            </div>
            {r.segs.profit < 0 && (
              <div className="text-[11px] mt-1" style={{ color: RED }}>
                Costs were bigger than sales. Loss of {Math.round(-r.segs.profit * 100)}¢ per $1.
              </div>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              {(Object.keys(SEG) as (keyof typeof SEG)[]).map((k) => (
                <span key={k} className="text-[10px] text-coal/60 flex items-center gap-1">
                  <span className="inline-block w-2 h-2" style={{ background: SEG[k].color }} />
                  {SEG[k].label} {Math.round((k === "profit" ? r.segs.profit : r.segs[k]) * 100)}%
                </span>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-coal/10">
              <Pixel size={7} className="text-coal/40">
                REAL WORLD
              </Pixel>
              <div className="flex h-2 overflow-hidden mt-1" style={{ borderRadius: 1 }}>
                {r.cfg.realWorld.map((s, i) => (
                  <div
                    key={s.label}
                    style={{
                      width: `${s.pct}%`,
                      background: [SEG.cogs.color, SEG.wages.color, SEG.rent.color, SEG.other.color, SEG.profit.color][i] ?? SEG.other.color,
                      opacity: 0.6,
                    }}
                    title={`${s.label} ${s.pct}%`}
                  />
                ))}
              </div>
              <div className="text-[10px] text-coal/50 mt-1">
                A real {r.cfg.name.toLowerCase()} keeps about {r.cfg.realWorld[r.cfg.realWorld.length - 1].pct}¢ per $1.
              </div>
            </div>
          </Panel>
        );
      })}

      {rows.length >= 2 && best && worst && best !== worst && (
        <Panel tone="gold" className="p-3">
          <Pixel size={8}>THE PATTERN</Pixel>
          <div className="text-sm leading-snug mt-1">
            Your {best.cfg.name} keeps {Math.round(best.segs.profit * 100)}¢ of every dollar. Your{" "}
            {worst.cfg.name} {worst.segs.profit >= 0 ? "keeps" : "loses"}{" "}
            {Math.abs(Math.round(worst.segs.profit * 100))}¢. Same idea, sell stuff for more than it
            costs, but the shape of the costs is totally different. That shape is what people mean
            by a &quot;business model.&quot;
          </div>
        </Panel>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Root                                                            */
/* ────────────────────────────────────────────────────────────── */

type Screen =
  | { kind: "home" }
  | { kind: "compare" }
  | { kind: "loan"; biz: string }
  | { kind: "lease"; biz: string }
  | { kind: "morning"; biz: string }
  | { kind: "rush"; biz: string; plan: Plan; ctx: DayContext }
  | { kind: "closing"; biz: string; result: DayResult; lessons: Lesson[]; nextStatus: BizStatus }
  | { kind: "end"; biz: string; broke: boolean };

export default function BottomLineApp() {
  const [save, setSave] = useState<Save>({ v: 1, biz: {} });
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState<Screen>({ kind: "home" });

  useEffect(() => {
    setSave(loadSave());
    setLoaded(true);
  }, []);

  // Every screen starts at the top.
  const screenKey = screen.kind + ("biz" in screen ? screen.biz : "") + ("result" in screen ? screen.result.day : "");
  useEffect(() => {
    window.scrollTo({ top: 0 });
    // Again once the screen transition has swapped the content in.
    const id = setTimeout(() => window.scrollTo({ top: 0 }), 220);
    return () => clearTimeout(id);
  }, [screenKey]);

  const update = useCallback((id: string, fn: (b: BizSave) => BizSave) => {
    setSave((s) => {
      const cfg = getBusiness(id);
      const next = { ...s, biz: { ...s.biz, [id]: fn(s.biz[id] ?? freshBiz(cfg)) } };
      persist(next);
      return next;
    });
  }, []);

  const pick = (id: string) => {
    const cfg = getBusiness(id);
    const b = save.biz[id] ?? freshBiz(cfg);
    if (!save.biz[id]) update(id, () => b);
    if (b.status === "new" || b.status === "loan") setScreen({ kind: "loan", biz: id });
    else if (b.status === "lease") setScreen({ kind: "lease", biz: id });
    else if (b.status === "playing") setScreen({ kind: "morning", biz: id });
    else setScreen({ kind: "end", biz: id, broke: b.status === "broke" });
  };

  const reset = (id: string) => {
    const cfg = getBusiness(id);
    update(id, () => freshBiz(cfg));
    setScreen({ kind: "loan", biz: id });
  };

  const openDay = (id: string, plan: Plan) => {
    const cfg = getBusiness(id);
    const b = save.biz[id];
    const ctx = contextFor(cfg, b);
    if (plan.autopilot) {
      const outcome = autopilot(cfg, ctx, plan, mulberry32(b.seed + b.day * 104729 + 17));
      closeDay(id, ctx, plan, outcome);
    } else {
      setScreen({ kind: "rush", biz: id, plan, ctx });
    }
  };

  const closeDay = (id: string, ctx: DayContext, plan: Plan, outcome: Outcome) => {
    const cfg = getBusiness(id);
    const result = settle(cfg, ctx, plan, outcome);
    const lessons = lessonsFor(cfg, result);
    const broke = result.cashEnd < 0;
    const last = ctx.day >= SEASON_DAYS;
    const nextStatus: BizStatus = broke ? "broke" : last ? "done" : "playing";
    update(id, (b) => ({
      ...b,
      status: nextStatus,
      day: b.day + 1,
      cash: result.cashEnd,
      inventory: result.inventoryEnd,
      inventoryValue: result.inventoryValueEnd,
      upgrades: plan.buyUpgrade ? [...b.upgrades, { id: plan.buyUpgrade, boughtDay: ctx.day }] : b.upgrades,
      lastPlan: { ...plan, buyUpgrade: undefined },
      history: [...b.history, result],
    }));
    setScreen({ kind: "closing", biz: id, result, lessons, nextStatus });
  };

  if (!loaded) return <Shell />;

  let body: React.ReactNode = null;
  switch (screen.kind) {
    case "home":
      body = <Home save={save} onPick={pick} onCompare={() => setScreen({ kind: "compare" })} />;
      break;
    case "compare":
      body = <CompareScreen save={save} onBack={() => setScreen({ kind: "home" })} />;
      break;
    case "loan": {
      const cfg = getBusiness(screen.biz);
      body = (
        <LoanScreen
          cfg={cfg}
          onBack={() => setScreen({ kind: "home" })}
          onPick={(loanId) => {
            const amt = cfg.loans.find((l) => l.id === loanId)!.amount;
            update(cfg.id, (b) => ({ ...b, loan: amt, cash: cfg.startingCash + amt, status: "lease" }));
            setScreen({ kind: "lease", biz: cfg.id });
          }}
        />
      );
      break;
    }
    case "lease": {
      const cfg = getBusiness(screen.biz);
      const b = save.biz[cfg.id];
      body = (
        <LeaseScreen
          cfg={cfg}
          cash={b.cash}
          onBack={() => setScreen({ kind: "loan", biz: cfg.id })}
          onPick={(leaseId) => {
            update(cfg.id, (x) => ({ ...x, leaseId, status: "playing" }));
            setScreen({ kind: "morning", biz: cfg.id });
          }}
        />
      );
      break;
    }
    case "morning": {
      const cfg = getBusiness(screen.biz);
      const b = save.biz[cfg.id];
      body = (
        <MorningScreen
          key={`${cfg.id}-${b.day}`}
          cfg={cfg}
          biz={b}
          onOpen={(plan) => openDay(cfg.id, plan)}
          onHome={() => setScreen({ kind: "home" })}
          onReset={() => reset(cfg.id)}
        />
      );
      break;
    }
    case "rush": {
      const cfg = getBusiness(screen.biz);
      body = (
        <RushScreen
          key={`${cfg.id}-${screen.ctx.day}`}
          cfg={cfg}
          ctx={screen.ctx}
          plan={screen.plan}
          onDone={(o) => closeDay(cfg.id, screen.ctx, screen.plan, o)}
        />
      );
      break;
    }
    case "closing": {
      const cfg = getBusiness(screen.biz);
      const broke = screen.nextStatus === "broke";
      body = (
        <ClosingScreen
          cfg={cfg}
          result={screen.result}
          lessons={screen.lessons}
          isLastDay={screen.nextStatus === "done"}
          broke={broke}
          onNext={() => {
            if (screen.nextStatus === "playing") setScreen({ kind: "morning", biz: cfg.id });
            else setScreen({ kind: "end", biz: cfg.id, broke });
          }}
        />
      );
      break;
    }
    case "end": {
      const cfg = getBusiness(screen.biz);
      const b = save.biz[cfg.id];
      body = (
        <EndScreen
          cfg={cfg}
          biz={b}
          broke={screen.broke}
          onHome={() => setScreen({ kind: "home" })}
          onAgain={() => reset(cfg.id)}
        />
      );
      break;
    }
  }

  return (
    <Shell>
      <AnimatePresence mode="wait">
        <motion.div
          key={screenKey}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {body}
        </motion.div>
      </AnimatePresence>
    </Shell>
  );
}

function Shell({ children }: { children?: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-cream text-coal pixel-grid">
      <div className="max-w-md mx-auto px-4 pt-6 pb-16">{children}</div>
    </main>
  );
}
