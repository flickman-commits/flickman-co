/**
 * Bottom Line — lessons.
 *
 * Looks at a settled day and picks the one or two things worth saying.
 * Ordered by how much money the mistake (or win) was worth.
 */
import { type BusinessConfig } from "./businesses";
import { money, pct, type DayResult } from "./sim";

export type Lesson = {
  id: string;
  emoji: string;
  title: string;
  body: string;
  tone: "bad" | "good" | "neutral";
  /** Rough dollars at stake; used to rank. */
  weight: number;
};

export function lessonsFor(cfg: BusinessConfig, r: DayResult): Lesson[] {
  const out: Lesson[] = [];
  const { pnl, outcome, plan, day } = r;
  const unit = cfg.unit;
  const who = cfg.customerNoun;
  const price = plan.price;
  const staffLeverTomorrow = day + 1 >= cfg.unlocks.wages;
  const staffLeverToday = day >= cfg.unlocks.wages;

  // Sold out.
  if (outcome.lostStockout > 0) {
    const lost = outcome.lostStockout * price;
    out.push({
      id: "stockout",
      emoji: "🚫",
      title: `You ran out of ${cfg.inventory.noun}`,
      body: `${outcome.lostStockout} ${outcome.lostStockout === 1 ? who.singular : who.plural} wanted a ${unit.singular} and you had no ${cfg.inventory.noun} left. That's about ${money(lost)} in sales you never got. Buy more tomorrow.`,
      tone: "bad",
      weight: lost,
    });
  }

  // Waste.
  if (r.spoiled > 0 && r.purchased > 0 && r.spoiled / (r.purchased + r.inventoryStart) >= 0.2) {
    out.push({
      id: "waste",
      emoji: "🗑️",
      title: "You bought too much",
      body: `You had enough ${cfg.inventory.noun} for ${r.purchased + r.inventoryStart} ${unit.plural}, ${unit.verb} ${outcome.served}, and ${r.spoiled} ${unit.plural}' worth went to waste. That's ${money(pnl.spoilage)} of profit gone. Cost of goods includes what you waste, not just what you sell.`,
      tone: "bad",
      weight: pnl.spoilage,
    });
  }

  // Long waits (customers who gave up, plus ones who never joined the line).
  const walked = outcome.lostPatience + outcome.lostCrowd;
  if (outcome.arrivals > 0 && walked / outcome.arrivals >= 0.2) {
    const lost = walked * price;
    const fix = staffLeverToday
      ? `Another ${cfg.staff.title} costs ${money(cfg.staff.wage)} a day. Worth it if they bring in more than that.`
      : staffLeverTomorrow
        ? `Tomorrow you'll be able to hire help.`
        : `In a couple of days you'll be able to hire help. Until then, tap fast.`;
    const detail =
      outcome.lostCrowd > 0
        ? `${outcome.lostPatience} ${who.plural} ${cfg.leftVerb} after waiting too long and ${outcome.lostCrowd} more saw the backlog and never joined.`
        : `${outcome.lostPatience} ${who.plural} ${cfg.leftVerb} before you could get to them.`;
    out.push({
      id: "waits",
      emoji: "😤",
      title: `${who.plural[0].toUpperCase() + who.plural.slice(1)} got tired of waiting`,
      body: `${detail} That's about ${money(lost)} in sales you didn't get. ${fix}`,
      tone: "bad",
      weight: lost,
    });
  }

  // Idle staff: you alone could have handled the day.
  const ownerCapacity = r.capacity / (1 + plan.staff);
  if (pnl.wages > 0 && outcome.served > 0 && outcome.served <= ownerCapacity * 0.9 && outcome.lostPatience + outcome.lostCrowd < 3) {
    const perSale = pnl.wages / outcome.served;
    out.push({
      id: "idle",
      emoji: "🧍",
      title: "Your staff stood around",
      body: `You could have ${unit.verb} ${outcome.served} ${unit.plural} on your own. Instead you paid ${money(pnl.wages)} in wages, which is ${money(perSale)} per ${unit.singular}. Wages don't shrink on a slow day, so match staff to the crowd you expect.`,
      tone: "bad",
      weight: pnl.wages * 0.5,
    });
  }

  // Rent share.
  if (pnl.rent > 0 && pnl.sales > 0 && pnl.rent / pnl.sales >= 0.35) {
    out.push({
      id: "rent",
      emoji: "🏢",
      title: "Rent ate your day",
      body: `Rent was ${pct(pnl.rent / pnl.sales)} of sales. It's the same ${money(pnl.rent)} on a packed day or an empty one, so the only fix is more sales or a cheaper spot.`,
      tone: "bad",
      weight: pnl.rent * 0.6,
    });
  }

  // Price scared people off.
  if (
    outcome.arrivals > 0 &&
    price > cfg.price.base * 1.4 &&
    r.expectedDemand < cfg.baseDemand * 0.5
  ) {
    out.push({
      id: "pricey",
      emoji: "💸",
      title: "Your price scared people off",
      body: `At ${money(price)} a ${unit.singular}, far fewer ${who.plural} showed up. A higher price means more profit per sale but fewer sales. Somewhere in the middle is the sweet spot.`,
      tone: "bad",
      weight: (cfg.baseDemand - r.expectedDemand) * cfg.price.base * 0.3,
    });
  }

  // Negative gross margin.
  if (outcome.served > 0 && price <= r.avgCost) {
    out.push({
      id: "underwater",
      emoji: "🫠",
      title: "You lose money on every sale",
      body: `Each ${unit.singular} sells for ${money(price)} and costs you ${money(r.avgCost)}. No amount of ${who.plural} fixes that. Raise the price.`,
      tone: "bad",
      weight: outcome.served * (r.avgCost - price) + 1000,
    });
  }

  // Marketing ROI.
  if (pnl.marketing > 0 && pnl.sales > 0) {
    // Estimate customers the ads brought in.
    const lift = 1 + cfg.marketing.maxLift * (1 - Math.exp(-plan.marketing / cfg.marketing.scale));
    const extra = outcome.served - outcome.served / lift;
    const extraGross = extra * (price - r.avgCost);
    if (extraGross < pnl.marketing) {
      out.push({
        id: "adsbad",
        emoji: "📉",
        title: "The ads didn't pay for themselves",
        body: `You spent ${money(pnl.marketing)} on ${cfg.marketing.label.toLowerCase()} and they brought in roughly ${Math.round(extra)} extra ${who.plural} worth about ${money(extraGross)} in gross profit. Spend less, or make sure you can actually serve the crowd ads bring.`,
        tone: "bad",
        weight: pnl.marketing - extraGross,
      });
    } else if (extraGross > pnl.marketing * 1.5) {
      out.push({
        id: "adsgood",
        emoji: "📈",
        title: "The ads paid off",
        body: `${money(pnl.marketing)} of ${cfg.marketing.label.toLowerCase()} brought in about ${Math.round(extra)} extra ${who.plural} worth ${money(extraGross)} in gross profit. That's the whole point of marketing.`,
        tone: "good",
        weight: extraGross - pnl.marketing,
      });
    }
  }

  // Profit vs cash.
  const cashDelta = r.cashEnd - r.cashStart;
  if (Math.abs(cashDelta - pnl.bottom) > Math.max(5, Math.abs(pnl.bottom) * 0.25)) {
    const reason =
      r.upgradeCost > 0
        ? `you paid ${money(r.upgradeCost)} cash for equipment, but the P&L only charges ${money(pnl.depreciation)} of it today and spreads the rest over the next ${9} days`
        : r.inventoryEnd > 0
          ? `you paid cash for ${cfg.inventory.noun} you haven't sold yet. It'll hit cost of goods when it sells`
          : `some of today's costs and sales landed on different sides of the cash register`;
    out.push({
      id: "cash",
      emoji: "🏦",
      title: "Profit isn't cash",
      body: `The P&L says ${money(pnl.bottom, { sign: true })} but your cash moved ${money(cashDelta, { sign: true })}. Why? Because ${reason}. Plenty of profitable businesses run out of cash. Watch both.`,
      tone: "neutral",
      weight: Math.abs(cashDelta - pnl.bottom) * 0.4,
    });
  }

  // Interest unlocked today.
  if (day === cfg.unlocks.interest && pnl.interest > 0) {
    out.push({
      id: "interest",
      emoji: "🏦",
      title: "The bank wants its cut now",
      body: `Interest is ${money(pnl.interest)} a day on your loan, every day, until you pay it back. Taxes only show up when you profit. What's left after both is the real bottom line.`,
      tone: "neutral",
      weight: pnl.interest * 2,
    });
  }

  // Good day.
  if (r.stars === 3) {
    out.push({
      id: "great",
      emoji: "🏆",
      title: "That's a great margin",
      body: `You kept ${pct(r.margin)} of every dollar. A real ${cfg.name.toLowerCase()} would be thrilled with that. Real ones average around ${pct(cfg.benchmarkMargin)}.`,
      tone: "good",
      weight: pnl.bottom * 0.5,
    });
  } else if (r.stars === 0 && pnl.sales > 0 && out.length === 0) {
    out.push({
      id: "loss",
      emoji: "📉",
      title: "You lost money today",
      body: `Sales were ${money(pnl.sales)} but costs were ${money(pnl.sales - pnl.bottom)}. Look at the biggest cost line and ask what would shrink it.`,
      tone: "bad",
      weight: -pnl.bottom,
    });
  }

  if (out.length === 0) {
    out.push({
      id: "steady",
      emoji: "🙂",
      title: "A solid day",
      body: `You ${unit.verb} ${outcome.served} ${unit.plural} and kept ${pct(r.margin)} of every dollar. Real ${cfg.name.toLowerCase()}s aim for about ${pct(cfg.benchmarkMargin)}. Can you beat that?`,
      tone: "neutral",
      weight: 0,
    });
  }

  return out.sort((a, b) => b.weight - a.weight).slice(0, 2);
}
