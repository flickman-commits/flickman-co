/**
 * Bottom Line — the engine.
 *
 * Pure functions only. The rush (tap game) and autopilot both produce an
 * Outcome; settle() turns an Outcome into a P&L. Nothing here touches React.
 */
import {
  DEPRECIATION_DAYS,
  UNLOCKABLE,
  type BusinessConfig,
  type Forecast,
  type LeaseOption,
  type UnlockableLine,
  type Upgrade,
} from "./businesses";

export type OwnedUpgrade = { id: string; boughtDay: number };

export type Plan = {
  price: number;
  /** Units bought this morning (0 if the business has no inventory). */
  buy: number;
  staff: number;
  marketing: number;
  /** Upgrade bought this morning, if any. */
  buyUpgrade?: string;
  autopilot?: boolean;
};

/** Everything about the business at the start of a day. */
export type DayContext = {
  day: number;
  cash: number;
  loan: number;
  leaseId: string;
  upgrades: OwnedUpgrade[];
  /** Units carried over from yesterday. */
  inventory: number;
  /** What those carried-over units cost you (weighted average costing). */
  inventoryValue: number;
  forecast: Forecast;
};

/** What actually happened during the rush. */
export type Outcome = {
  arrivals: number;
  served: number;
  tips: number;
  lostStockout: number;
  lostPatience: number;
  lostCrowd: number;
};

export type PnL = {
  sales: number;
  tips: number;
  cogs: number;
  spoilage: number;
  gross: number;
  wages: number;
  rent: number;
  marketing: number;
  utilities: number;
  depreciation: number;
  opex: number;
  operating: number;
  interest: number;
  taxes: number;
  net: number;
  /** The number the player is scored on: net once unlocked, else operating. */
  bottom: number;
  bottomLabel: "Profit" | "Net Profit";
};

export type DayResult = {
  day: number;
  forecastId: string;
  plan: Plan;
  outcome: Outcome;
  pnl: PnL;
  cashStart: number;
  cashEnd: number;
  purchased: number;
  purchaseCost: number;
  spoiled: number;
  inventoryStart: number;
  inventoryEnd: number;
  /** Cost basis of what's carried into tomorrow. */
  inventoryValueEnd: number;
  upgradeCost: number;
  /** Today's purchase price per unit. */
  unitCost: number;
  /** Average cost per unit of what you actually sold (carryover + today's buys). */
  avgCost: number;
  capacity: number;
  expectedDemand: number;
  stars: number;
  margin: number;
};

export function lease(cfg: BusinessConfig, id: string): LeaseOption {
  return cfg.leases.find((l) => l.id === id) ?? cfg.leases[0];
}

export function upgrade(cfg: BusinessConfig, id: string): Upgrade | undefined {
  return cfg.upgrades.find((u) => u.id === id);
}

export function isUnlocked(cfg: BusinessConfig, line: UnlockableLine, day: number): boolean {
  return day >= cfg.unlocks[line];
}

/** The first day any operating-expense line exists (so the receipt knows when to show a subtotal). */
export function firstOpexDay(cfg: BusinessConfig): number {
  return Math.min(cfg.unlocks.wages, cfg.unlocks.rent, cfg.unlocks.marketing, cfg.unlocks.utilities, cfg.unlocks.depreciation);
}

/** Lines the player has met by the given day, in unlock order. */
export function unlockedLines(cfg: BusinessConfig, day: number): UnlockableLine[] {
  return [...UNLOCKABLE].filter((l) => isUnlocked(cfg, l, day)).sort((a, b) => cfg.unlocks[a] - cfg.unlocks[b]);
}

/** Levers the player can touch on a given day. */
export function levers(cfg: BusinessConfig, day: number) {
  return {
    price: true,
    inventory: cfg.hasInventory,
    staff: isUnlocked(cfg, "wages", day),
    marketing: isUnlocked(cfg, "marketing", day),
    upgrades: isUnlocked(cfg, "depreciation", day),
  };
}

function ownedUpgrades(cfg: BusinessConfig, ctx: DayContext, plan?: Plan): Upgrade[] {
  const ids = ctx.upgrades.map((u) => u.id);
  if (plan?.buyUpgrade) ids.push(plan.buyUpgrade);
  return ids.map((id) => upgrade(cfg, id)).filter((u): u is Upgrade => !!u);
}

export type Derived = {
  demand: number;
  demandLow: number;
  demandHigh: number;
  workers: number;
  serveTime: number;
  patience: number;
  capacity: number;
  unitCost: number;
  available: number;
  marketingLift: number;
};

/** Expected numbers for a plan, before anything happens. */
export function derive(cfg: BusinessConfig, ctx: DayContext, plan: Plan): Derived {
  const ups = ownedUpgrades(cfg, ctx, plan);
  const serveMult = ups.reduce((m, u) => m * (u.serveMult ?? 1), 1);
  const patienceMult = ups.reduce((m, u) => m * (u.patienceMult ?? 1), 1);
  const demandMult = ups.reduce((m, u) => m * (u.demandMult ?? 1), 1);

  const priceFactor = Math.pow(cfg.price.base / Math.max(plan.price, 0.01), cfg.elasticity);
  const spend = isUnlocked(cfg, "marketing", ctx.day) ? plan.marketing : 0;
  const marketingLift = 1 + cfg.marketing.maxLift * (1 - Math.exp(-spend / cfg.marketing.scale));
  // Small word-of-mouth ramp so later days feel a bit busier.
  const ramp = 1 + 0.02 * Math.min(ctx.day - 1, 10);

  const demand =
    cfg.baseDemand *
    lease(cfg, ctx.leaseId).demandMult *
    priceFactor *
    marketingLift *
    ctx.forecast.demandMult *
    demandMult *
    ramp;

  const staff = isUnlocked(cfg, "wages", ctx.day) ? plan.staff : 0;
  const workers = 1 + staff;
  const serveTime = cfg.serveTime * serveMult;
  const patience = cfg.patience * patienceMult * (ctx.forecast.patienceMult ?? 1);
  const capacity = Math.floor((workers * cfg.dayLength) / serveTime);
  const unitCost = cfg.unitCost * (ctx.forecast.unitCostMult ?? 1);
  const available = cfg.hasInventory ? ctx.inventory + plan.buy : Number.POSITIVE_INFINITY;

  return {
    demand,
    demandLow: Math.round(demand * 0.75),
    demandHigh: Math.round(demand * 1.25),
    workers,
    serveTime,
    patience,
    capacity,
    unitCost,
    available,
    marketingLift,
  };
}

/** Cash the plan spends before the doors open. */
export function upfrontCost(cfg: BusinessConfig, ctx: DayContext, plan: Plan): number {
  const d = derive(cfg, ctx, plan);
  const purchases = cfg.hasInventory ? plan.buy * d.unitCost : 0;
  const up = plan.buyUpgrade ? upgrade(cfg, plan.buyUpgrade)?.cost ?? 0 : 0;
  const mkt = isUnlocked(cfg, "marketing", ctx.day) ? plan.marketing : 0;
  return purchases + up + mkt;
}

/** Run a day without the tap game. Deterministic given rng. */
export function autopilot(
  cfg: BusinessConfig,
  ctx: DayContext,
  plan: Plan,
  rng: () => number,
): Outcome {
  const d = derive(cfg, ctx, plan);
  const arrivals = Math.max(0, Math.round(d.demand * (0.8 + 0.4 * rng())));
  // A human doesn't hit theoretical capacity; neither does autopilot.
  const effCapacity = Math.floor(d.capacity * 0.9);
  // Crowding: if arrivals far exceed capacity, some leave before being helped.
  const canServe = Math.min(arrivals, effCapacity);
  const served = Math.min(canServe, d.available);
  const lostStockout = canServe - served;
  const lostPatience = arrivals - canServe;
  const tips = Math.floor(served / 5) * plan.price * cfg.bonus.pct;
  return { arrivals, served, tips, lostStockout, lostPatience, lostCrowd: 0 };
}

export function settle(
  cfg: BusinessConfig,
  ctx: DayContext,
  plan: Plan,
  outcome: Outcome,
): DayResult {
  const d = derive(cfg, ctx, plan);
  const day = ctx.day;
  const L = lease(cfg, ctx.leaseId);

  const purchased = cfg.hasInventory ? plan.buy : 0;
  const purchaseCost = purchased * d.unitCost;
  const inventoryStart = cfg.hasInventory ? ctx.inventory : 0;
  const available = cfg.hasInventory ? inventoryStart + purchased : outcome.served;
  const served = Math.min(outcome.served, available);
  const leftover = cfg.hasInventory ? available - served : 0;
  const spoiled = Math.round(leftover * cfg.perishable);
  const inventoryEnd = leftover - spoiled;

  // Weighted-average cost: what you carried in plus what you bought today.
  // Without this, shirts bought at $18 would be charged at $23 on a
  // "blanks cost more" day just because they sold today.
  const avgCost =
    cfg.hasInventory && available > 0
      ? (ctx.inventoryValue + purchaseCost) / available
      : d.unitCost;
  const inventoryValueEnd = inventoryEnd * avgCost;

  const sales = served * plan.price + outcome.tips;
  const cogs = served * avgCost;
  const spoilage = spoiled * avgCost;
  const gross = sales - cogs - spoilage;

  const staff = isUnlocked(cfg, "wages", day) ? plan.staff : 0;
  const wages = staff * cfg.staff.wage;
  const rent = isUnlocked(cfg, "rent", day) ? L.rentPerDay : 0;
  const marketing = isUnlocked(cfg, "marketing", day) ? plan.marketing : 0;
  const utilities = isUnlocked(cfg, "utilities", day)
    ? cfg.utilities.fixed + cfg.utilities.perUnit * served
    : 0;

  const owned: OwnedUpgrade[] = [
    ...ctx.upgrades,
    ...(plan.buyUpgrade ? [{ id: plan.buyUpgrade, boughtDay: day }] : []),
  ];
  const depreciation = isUnlocked(cfg, "depreciation", day)
    ? owned.reduce((sum, o) => {
        const u = upgrade(cfg, o.id);
        if (!u) return sum;
        const age = day - o.boughtDay;
        return age < DEPRECIATION_DAYS ? sum + u.cost / DEPRECIATION_DAYS : sum;
      }, 0)
    : 0;
  const upgradeCost = plan.buyUpgrade ? upgrade(cfg, plan.buyUpgrade)?.cost ?? 0 : 0;

  const opex = wages + rent + marketing + utilities + depreciation;
  const operating = gross - opex;
  const interest = isUnlocked(cfg, "interest", day) ? ctx.loan * cfg.loanRate : 0;
  const preTax = operating - interest;
  const taxes = isUnlocked(cfg, "taxes", day) ? Math.max(0, preTax) * cfg.taxRate : 0;
  const net = preTax - taxes;

  const netUnlocked = isUnlocked(cfg, "interest", day);
  const bottom = netUnlocked ? net : operating;

  const pnl: PnL = {
    sales,
    tips: outcome.tips,
    cogs,
    spoilage,
    gross,
    wages,
    rent,
    marketing,
    utilities,
    depreciation,
    opex,
    operating,
    interest,
    taxes,
    net,
    bottom,
    bottomLabel: netUnlocked ? "Net Profit" : "Profit",
  };

  const cashEnd =
    ctx.cash +
    sales -
    purchaseCost -
    wages -
    rent -
    marketing -
    utilities -
    upgradeCost -
    interest -
    taxes;

  const margin = sales > 0 ? bottom / sales : 0;
  const servedRatio = outcome.arrivals > 0 ? served / outcome.arrivals : 1;
  const stars = starsFor(cfg, sales, margin, bottom, servedRatio);

  return {
    day,
    forecastId: ctx.forecast.id,
    plan,
    outcome: { ...outcome, served },
    pnl,
    cashStart: ctx.cash,
    cashEnd,
    purchased,
    purchaseCost,
    spoiled,
    inventoryStart,
    inventoryEnd,
    inventoryValueEnd,
    upgradeCost,
    unitCost: d.unitCost,
    avgCost,
    capacity: d.capacity,
    expectedDemand: d.demand,
    stars,
    margin,
  };
}

/**
 * Stars: one for making money, two for a decent margin and a decent day,
 * three for hitting the benchmark margin AND the daily profit goal while
 * serving most of the people who showed up. Timid play can't three-star.
 */
export function starsFor(
  cfg: BusinessConfig,
  sales: number,
  margin: number,
  bottom: number,
  servedRatio = 1,
): number {
  if (sales <= 0 || bottom <= 0) return 0;
  if (margin >= cfg.benchmarkMargin && bottom >= cfg.dailyTarget && servedRatio >= 0.6) return 3;
  if (margin >= cfg.benchmarkMargin / 2 && bottom >= cfg.dailyTarget / 2) return 2;
  return 1;
}

/** Weighted random forecast. */
export function pickForecast(cfg: BusinessConfig, day: number, rng: () => number): Forecast {
  // Day 1 is always the plain day so the tutorial is predictable.
  if (day === 1) return cfg.forecasts[0];
  // Nearby seeds give correlated first draws; burn a few.
  rng();
  rng();
  rng();
  const total = cfg.forecasts.reduce((s, f) => s + f.weight, 0);
  let r = rng() * total;
  for (const f of cfg.forecasts) {
    r -= f.weight;
    if (r <= 0) return f;
  }
  return cfg.forecasts[0];
}

/** Tiny seeded RNG so a day's forecast is stable across reloads. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function money(n: number, opts: { sign?: boolean; cents?: boolean } = {}): string {
  const cents = opts.cents ?? Math.abs(n) < 100;
  const abs = Math.abs(n);
  const body = cents
    ? abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(abs).toLocaleString("en-US");
  const neg = n < -0.004;
  if (neg) return `-$${body}`;
  return `${opts.sign ? "+" : ""}$${body}`;
}

export function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}
