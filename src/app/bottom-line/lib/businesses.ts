/**
 * Bottom Line — business configs.
 *
 * Every business is just data. The same engine (sim.ts) and the same
 * screens run all of them. Each business has its own unlock order and its
 * own words, so a gym meets rent on day 2 and a streetwear brand meets ads
 * on day 2, because that's the line that defines that business.
 */

export type Difficulty = "beginner" | "medium" | "hard";

export type LeaseOption = {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  rentPerDay: number;
  /** Traffic multiplier on demand. */
  demandMult: number;
};

export type LoanOption = {
  id: string;
  name: string;
  amount: number;
  blurb: string;
};

export type Upgrade = {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  cost: number;
  /** Multiplies serve time (0.7 = 30% faster). */
  serveMult?: number;
  /** Multiplies customer patience. */
  patienceMult?: number;
  /** Multiplies demand. */
  demandMult?: number;
};

export type Forecast = {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  demandMult: number;
  unitCostMult?: number;
  patienceMult?: number;
  /** Relative likelihood. */
  weight: number;
};

export const UNLOCKABLE = ["wages", "rent", "marketing", "utilities", "depreciation", "interest", "taxes"] as const;
export type UnlockableLine = (typeof UNLOCKABLE)[number];

export type CurriculumCard = {
  title: string;
  emoji: string;
  blurb: string;
  /** Shown instead of blurb when the player's rent is $0 (only used on the rent day). */
  freeRentBlurb?: string;
};

export type BusinessConfig = {
  id: string;
  name: string;
  emoji: string;
  difficulty: Difficulty;
  tagline: string;
  /** Why it's this difficulty, shown on the pick screen. */
  why: string;
  /** The thing you sell. verb is past tense ("sold"), verbBase is the infinitive ("sell"). */
  unit: { singular: string; plural: string; emoji: string; verb: string; verbBase: string };
  /** What you call the people (or orders) who show up. */
  customerNoun: { singular: string; plural: string };
  /** Past tense for a customer who gave up: "walked out", "cancelled". */
  leftVerb: string;
  /** Emoji pool for customers. */
  customers: string[];
  ownerEmoji: string;
  /** The rush screen's words and icons. */
  rush: {
    instruction: string;
    servingEmoji: string;
    doneEmoji: string;
    soldOutLabel: string;
  };
  /** Streak bonus every 5 in a row: tips, add-ons, a friend joining. pct of price. */
  bonus: { label: string; pluralLabel: string; pct: number };
  price: { base: number; min: number; max: number; step: number };
  unitCost: number;
  /** Demand ∝ (basePrice / price) ^ elasticity */
  elasticity: number;
  /** Customers per day at base price, 1.0x location, no ads. */
  baseDemand: number;
  /** Seconds one worker needs per customer. */
  serveTime: number;
  /** Seconds the rush lasts. */
  dayLength: number;
  /** Seconds a customer waits before leaving. */
  patience: number;
  /** How many customers can wait at once. */
  slots: number;
  /** Does the player buy inventory each morning? */
  hasInventory: boolean;
  /** Fraction of leftover inventory that's lost overnight (1 = spoils fully). */
  perishable: number;
  /** noun is the stuff itself ("lemonade", "patties"), used in sentences. */
  inventory: { step: number; max: number; label: string; noun: string; emoji: string };
  staff: { title: string; plural: string; emoji: string; wage: number; max: number };
  /** One line at the top of the lease screen. */
  leaseIntro: string;
  /** What the traffic bar on a lease is called. */
  trafficLabel: string;
  leases: LeaseOption[];
  loans: LoanOption[];
  /** Daily interest rate on the loan. */
  loanRate: number;
  startingCash: number;
  utilities: { fixed: number; perUnit: number; label: string };
  marketing: {
    label: string;
    /** Lift = maxLift * (1 - e^(-spend/scale)) */
    scale: number;
    maxLift: number;
    step: number;
    max: number;
  };
  upgrades: Upgrade[];
  forecasts: Forecast[];
  /** Net margin a great day hits. Drives stars. */
  benchmarkMargin: number;
  /** Profit per day a great day hits. Also drives stars, so timid play can't 3-star. */
  dailyTarget: number;
  /** Rough real-world P&L shape for the compare screen. Must sum to 100. */
  realWorld: { label: string; pct: number }[];
  taxRate: number;
  /** The day each P&L line first appears (and starts costing money). */
  unlocks: Record<UnlockableLine, number>;
  /** The card shown each morning of the first week. */
  curriculum: Record<number, CurriculumCard>;
};

export const SEASON_DAYS = 14;
export const DEPRECIATION_DAYS = 10;

export type GlossaryEntry = {
  kid: string;
  grownUp: string;
  explain: string;
};

export const GLOSSARY: Record<string, GlossaryEntry> = {
  sales: {
    kid: "Money that came in",
    grownUp: "Sales (Revenue, the Top Line)",
    explain:
      "Everything customers paid you today, including any bonuses. This is the top line of the P&L. It's not what you keep.",
  },
  cogs: {
    kid: "What the stuff cost you",
    grownUp: "Cost of Goods Sold (COGS)",
    explain:
      "The direct cost of what you sold: ingredients, materials, shipping. It rises and falls with sales. Anything you bought and threw away is in here too.",
  },
  gross: {
    kid: "Money left after the stuff",
    grownUp: "Gross Profit",
    explain:
      "Sales minus cost of goods. Divide it by sales and you get gross margin, the single most watched number in any business.",
  },
  wages: {
    kid: "Paying your helpers",
    grownUp: "Wages (Labor)",
    explain:
      "What you pay staff. You owe it whether they served 50 people or stood around. Most businesses' biggest expense.",
  },
  rent: {
    kid: "Paying for your spot",
    grownUp: "Rent (Occupancy)",
    explain:
      "A fixed cost. It's the same on a packed day and an empty one. Better locations cost more but bring more people to your door.",
  },
  marketing: {
    kid: "Paying to be noticed",
    grownUp: "Marketing (Advertising)",
    explain:
      "Money spent to bring in customers. The question is always whether the customers it brings are worth more than it cost.",
  },
  utilities: {
    kid: "Bills that keep the lights on",
    grownUp: "Utilities & Supplies (Overhead)",
    explain:
      "Power, water, software, packaging, phone. Mostly fixed, a little grows with volume. Never huge, never zero.",
  },
  depreciation: {
    kid: "Big purchases, spread out",
    grownUp: "Depreciation",
    explain:
      "When you buy equipment, you paid cash today but you'll use it for a long time. So the P&L charges a slice each day instead of the whole thing at once. This is why profit and cash aren't the same number.",
  },
  operating: {
    kid: "Profit from running the business",
    grownUp: "Operating Profit (EBIT)",
    explain:
      "What the business itself makes before the bank and the government take their share. This tells you if the business works.",
  },
  interest: {
    kid: "Paying the bank for the loan",
    grownUp: "Interest",
    explain:
      "The bank lent you money to start. Every day they charge a small percentage for it. Paying interest doesn't shrink the loan, only paying back the principal does.",
  },
  taxes: {
    kid: "The government's cut",
    grownUp: "Taxes",
    explain:
      "When you make a profit, you pay a percentage in tax. Lose money and you pay nothing.",
  },
  net: {
    kid: "What you actually keep",
    grownUp: "Net Profit (Net Income, the Bottom Line)",
    explain:
      "Sales minus every cost on this page. This is the number the whole game is named after.",
  },
};

const INTEREST_CARD: CurriculumCard = {
  title: "Interest & Taxes",
  emoji: "🏦",
  blurb:
    "The bank's grace period is over, so interest on your loan is due every day now. And when you make a profit, the tax office wants a cut. What's left is the real bottom line.",
};

export const BUSINESSES: BusinessConfig[] = [
  /* ───────────────────────── Lemonade ───────────────────────── */
  {
    id: "lemonade",
    name: "Lemonade Stand",
    emoji: "🍋",
    difficulty: "beginner",
    tagline: "Cups, lemons, sunshine. The purest business there is.",
    why: "Tiny numbers, patient customers, cheap mistakes.",
    unit: { singular: "cup", plural: "cups", emoji: "🥤", verb: "sold", verbBase: "sell" },
    customerNoun: { singular: "customer", plural: "customers" },
    leftVerb: "walked off",
    customers: ["🧒", "👧", "👦", "🧑", "👵", "👴", "🧑‍🦱", "👩", "🐕"],
    ownerEmoji: "🧑‍🍳",
    rush: {
      instruction: "TAP CUSTOMERS TO POUR THEM A CUP",
      servingEmoji: "🫗",
      doneEmoji: "😋",
      soldOutLabel: "SOLD OUT",
    },
    bonus: { label: "tip", pluralLabel: "tips", pct: 0.5 },
    price: { base: 2, min: 0.5, max: 5, step: 0.25 },
    unitCost: 0.5,
    elasticity: 1.2,
    baseDemand: 30,
    serveTime: 1.5,
    dayLength: 40,
    patience: 10,
    slots: 4,
    hasInventory: true,
    perishable: 1,
    inventory: { step: 5, max: 120, label: "Cups to make", noun: "lemonade", emoji: "🍋" },
    staff: { title: "helper", plural: "helpers", emoji: "🧒", wage: 15, max: 3 },
    leaseIntro: "Where you set up the stand decides who walks past it.",
    trafficLabel: "Foot traffic",
    leases: [
      { id: "driveway", name: "Your driveway", emoji: "🏠", blurb: "Free, but only the neighbors walk by.", rentPerDay: 0, demandMult: 0.6 },
      { id: "park", name: "Park corner", emoji: "🌳", blurb: "Steady foot traffic. The classic spot.", rentPerDay: 12, demandMult: 1 },
      { id: "boardwalk", name: "Beach boardwalk", emoji: "🏖️", blurb: "Crowds all day. Costs real money.", rentPerDay: 35, demandMult: 1.7 },
    ],
    loans: [
      { id: "s", name: "Piggy bank", amount: 50, blurb: "Enough for lemons and cups." },
      { id: "m", name: "Allowance advance", amount: 100, blurb: "Room to hire a friend." },
      { id: "l", name: "Grandma's loan", amount: 200, blurb: "Big pitcher money." },
    ],
    loanRate: 0.01,
    startingCash: 25,
    utilities: { fixed: 2, perUnit: 0.05, label: "Ice & water" },
    marketing: { label: "Flyers", scale: 15, maxLift: 0.6, step: 5, max: 40 },
    upgrades: [
      { id: "pitcher", name: "Giant pitcher", emoji: "🫗", blurb: "Pour 30% faster.", cost: 40, serveMult: 0.7 },
      { id: "umbrella", name: "Shade umbrella", emoji: "⛱️", blurb: "Customers wait 50% longer.", cost: 30, patienceMult: 1.5 },
      { id: "sign", name: "Painted sign", emoji: "🪧", blurb: "20% more people stop by.", cost: 50, demandMult: 1.2 },
    ],
    forecasts: [
      { id: "sunny", name: "Sunny", emoji: "☀️", blurb: "A normal day.", demandMult: 1, weight: 4 },
      { id: "heat", name: "Heat wave", emoji: "🥵", blurb: "Everyone's thirsty.", demandMult: 1.5, weight: 2 },
      { id: "rain", name: "Rain", emoji: "🌧️", blurb: "Not many people out.", demandMult: 0.5, weight: 2 },
      { id: "lemons", name: "Lemon shortage", emoji: "🍋", blurb: "Lemons cost 60% more today.", demandMult: 1, unitCostMult: 1.6, weight: 1 },
      { id: "school", name: "School's out", emoji: "🎒", blurb: "Kids everywhere.", demandMult: 1.3, weight: 1 },
    ],
    benchmarkMargin: 0.3,
    dailyTarget: 20,
    realWorld: [
      { label: "Lemons & cups", pct: 25 },
      { label: "Helpers", pct: 20 },
      { label: "Spot", pct: 15 },
      { label: "Other", pct: 10 },
      { label: "Profit", pct: 30 },
    ],
    taxRate: 0.2,
    unlocks: { wages: 2, rent: 3, marketing: 4, utilities: 5, depreciation: 6, interest: 7, taxes: 7 },
    curriculum: {
      1: {
        title: "Sales & Cost of Goods",
        emoji: "💵",
        blurb: "Every cup you sell brings money in. Every cup cost you lemons, sugar and a paper cup. What's left is your gross profit.",
      },
      2: {
        title: "Wages",
        emoji: "👷",
        blurb: "You can hire a friend now. Two people pour twice as fast, but you pay them whether the line is long or not.",
      },
      3: {
        title: "Rent",
        emoji: "🏢",
        blurb: "Your two free days are up. From now on you pay for your spot every day, even if it rains and nobody shows up.",
        freeRentBlurb: "You're set up in your own driveway, so rent is $0. Real businesses aren't so lucky, and a free spot usually means fewer people walk by.",
      },
      4: {
        title: "Marketing",
        emoji: "📣",
        blurb: "You can hand out flyers now. They bring more people to the stand. The question is whether they bring in more than they cost.",
      },
      5: {
        title: "Utilities",
        emoji: "💡",
        blurb: "Ice and water aren't free. Small bills like this never go away.",
      },
      6: {
        title: "Equipment",
        emoji: "🔧",
        blurb: "A giant pitcher costs real money today, but you'll use it for weeks. So the P&L spreads the cost out, a little each day. That's called depreciation.",
      },
      7: {
        ...INTEREST_CARD,
        blurb: "Grandma's grace period is over: interest on your loan is due every day now. And when you make a profit, the tax office wants a cut. What's left is the real bottom line.",
      },
    },
  },

  /* ───────────────────────── Burger ───────────────────────── */
  {
    id: "burger",
    name: "Burger Joint",
    emoji: "🍔",
    difficulty: "medium",
    tagline: "High volume, thin margins. Every restaurant's real story.",
    why: "Food and labor eat most of every dollar. Waste kills.",
    unit: { singular: "burger", plural: "burgers", emoji: "🍔", verb: "served", verbBase: "serve" },
    customerNoun: { singular: "customer", plural: "customers" },
    leftVerb: "walked out",
    customers: ["🧑", "👩", "👨", "🧑‍💼", "👷", "🧑‍🎓", "👩‍🦰", "🧔", "👮"],
    ownerEmoji: "👨‍🍳",
    rush: {
      instruction: "TAP CUSTOMERS TO TAKE THEIR ORDER",
      servingEmoji: "🍳",
      doneEmoji: "😋",
      soldOutLabel: "OUT OF PATTIES",
    },
    bonus: { label: "tip", pluralLabel: "tips", pct: 0.5 },
    price: { base: 9, min: 5, max: 16, step: 0.5 },
    unitCost: 3,
    elasticity: 1.5,
    baseDemand: 45,
    serveTime: 2.2,
    dayLength: 55,
    patience: 9,
    slots: 5,
    hasInventory: true,
    perishable: 0.8,
    inventory: { step: 10, max: 200, label: "Patties to prep", noun: "patties", emoji: "🥩" },
    staff: { title: "cook", plural: "cooks", emoji: "👨‍🍳", wage: 80, max: 4 },
    leaseIntro: "Where the restaurant sits decides who walks past the door at lunch.",
    trafficLabel: "Foot traffic",
    leases: [
      { id: "side", name: "Side street", emoji: "🛣️", blurb: "Cheap and quiet.", rentPerDay: 60, demandMult: 0.7 },
      { id: "main", name: "Main street", emoji: "🏙️", blurb: "Solid lunch crowd.", rentPerDay: 140, demandMult: 1 },
      { id: "hall", name: "Food hall stall", emoji: "🏟️", blurb: "Packed. Pricey.", rentPerDay: 280, demandMult: 1.6 },
    ],
    loans: [
      { id: "s", name: "Small loan", amount: 2000, blurb: "Bare-bones kitchen." },
      { id: "m", name: "Standard loan", amount: 5000, blurb: "A real grill and a cook." },
      { id: "l", name: "Big loan", amount: 10000, blurb: "Open with a full crew." },
    ],
    loanRate: 0.005,
    startingCash: 1500,
    utilities: { fixed: 30, perUnit: 0.3, label: "Gas, power & water" },
    marketing: { label: "Instagram ads", scale: 80, maxLift: 0.7, step: 20, max: 300 },
    upgrades: [
      { id: "grill", name: "Flat-top grill", emoji: "🔥", blurb: "Cook 30% faster.", cost: 600, serveMult: 0.7 },
      { id: "screen", name: "Order screen", emoji: "🖥️", blurb: "Customers wait 40% longer.", cost: 400, patienceMult: 1.4 },
      { id: "neon", name: "Neon sign", emoji: "🪩", blurb: "20% more walk-ins.", cost: 500, demandMult: 1.2 },
    ],
    forecasts: [
      { id: "normal", name: "Normal day", emoji: "🌤️", blurb: "The usual lunch crowd.", demandMult: 1, weight: 4 },
      { id: "game", name: "Game night", emoji: "🏈", blurb: "Big crowd after the game.", demandMult: 1.5, weight: 2 },
      { id: "rain", name: "Rain", emoji: "🌧️", blurb: "People stay home.", demandMult: 0.7, weight: 2 },
      { id: "beef", name: "Beef prices spike", emoji: "🐄", blurb: "Patties cost 40% more.", demandMult: 1, unitCostMult: 1.4, weight: 1 },
      { id: "trucks", name: "Food truck rally", emoji: "🚚", blurb: "Competition parked outside.", demandMult: 0.6, weight: 1 },
      { id: "payday", name: "Payday Friday", emoji: "💸", blurb: "Everyone's eating out.", demandMult: 1.3, weight: 1 },
    ],
    benchmarkMargin: 0.1,
    dailyTarget: 60,
    realWorld: [
      { label: "Food", pct: 32 },
      { label: "Labor", pct: 33 },
      { label: "Rent", pct: 9 },
      { label: "Other", pct: 20 },
      { label: "Profit", pct: 6 },
    ],
    taxRate: 0.2,
    unlocks: { wages: 2, rent: 3, utilities: 4, marketing: 5, depreciation: 6, interest: 7, taxes: 7 },
    curriculum: {
      1: {
        title: "Sales & Cost of Goods",
        emoji: "💵",
        blurb: "Every burger brings money in, and every burger cost you a patty, a bun and toppings. What's left is gross profit. Restaurants live and die on this number.",
      },
      2: {
        title: "Wages",
        emoji: "👷",
        blurb: "Nobody runs a kitchen alone. Cooks get more burgers out the window, but you pay them on dead days too. Labor is usually a restaurant's biggest cost.",
      },
      3: {
        title: "Rent",
        emoji: "🏢",
        blurb: "The landlord's free days are up. Rent is the same whether you serve 20 burgers or 200.",
      },
      4: {
        title: "Utilities",
        emoji: "💡",
        blurb: "Gas for the grill, power for the fridges, water for the dishes. The bills just arrived, and they grow a little with every burger.",
      },
      5: {
        title: "Marketing",
        emoji: "📣",
        blurb: "You can run Instagram ads now. More people find you, but every dollar of ads has to come back as burgers sold.",
      },
      6: {
        title: "Equipment",
        emoji: "🔧",
        blurb: "A flat-top grill costs a lot of cash today but lasts for years. The P&L charges a slice per day instead of the whole thing. That's depreciation.",
      },
      7: INTEREST_CARD,
    },
  },

  /* ───────────────────────── Landscaping ───────────────────────── */
  {
    id: "landscaping",
    name: "Landscaping Co.",
    emoji: "🌱",
    difficulty: "medium",
    tagline: "Trucks, mowers, and a crew. Sell time, not stuff.",
    why: "Each job pays well, but a crew is expensive and rain cancels everything.",
    unit: { singular: "lawn job", plural: "lawn jobs", emoji: "🏡", verb: "finished", verbBase: "finish" },
    customerNoun: { singular: "client", plural: "clients" },
    leftVerb: "cancelled",
    customers: ["🏡", "🏠", "🏘️", "🏢", "🏫", "⛪", "🏛️", "🏬"],
    ownerEmoji: "🧑‍🌾",
    rush: {
      instruction: "TAP A JOB TO SEND A CREW",
      servingEmoji: "🚜",
      doneEmoji: "✨",
      soldOutLabel: "NO SUPPLIES",
    },
    bonus: { label: "tip", pluralLabel: "tips", pct: 0.2 },
    price: { base: 55, min: 30, max: 120, step: 5 },
    unitCost: 18,
    elasticity: 1.3,
    baseDemand: 12,
    serveTime: 7.5,
    dayLength: 55,
    patience: 16,
    slots: 4,
    hasInventory: true,
    perishable: 0.3,
    inventory: { step: 2, max: 40, label: "Jobs' worth of fuel & mulch", noun: "fuel and mulch", emoji: "⛽" },
    staff: { title: "crew member", plural: "crew", emoji: "👷", wage: 170, max: 3 },
    leaseIntro: "Where you park the trucks decides how many people see them and call.",
    trafficLabel: "Calls coming in",
    leases: [
      { id: "garage", name: "Your garage", emoji: "🏠", blurb: "Free. Nobody knows you exist.", rentPerDay: 0, demandMult: 0.6 },
      { id: "yard", name: "Storage yard", emoji: "🚧", blurb: "Room for a truck and a trailer.", rentPerDay: 60, demandMult: 1 },
      { id: "lot", name: "Lot with a big sign", emoji: "🪧", blurb: "On the main road. The phone rings.", rentPerDay: 150, demandMult: 1.4 },
    ],
    loans: [
      { id: "s", name: "Used mower loan", amount: 2000, blurb: "One mower, one truck." },
      { id: "m", name: "Crew loan", amount: 5000, blurb: "Hire a crew from day one." },
      { id: "l", name: "Fleet loan", amount: 10000, blurb: "Two trucks, no excuses." },
    ],
    loanRate: 0.006,
    startingCash: 800,
    utilities: { fixed: 60, perUnit: 3, label: "Truck insurance, phone & dump fees" },
    marketing: { label: "Yard signs & door hangers", scale: 60, maxLift: 0.9, step: 20, max: 200 },
    upgrades: [
      { id: "mower", name: "Zero-turn mower", emoji: "🚜", blurb: "Finish jobs 35% faster.", cost: 1800, serveMult: 0.65 },
      { id: "app", name: "Scheduling app", emoji: "📱", blurb: "Clients wait 50% longer for a slot.", cost: 400, patienceMult: 1.5 },
      { id: "wrap", name: "Truck wrap", emoji: "🛻", blurb: "25% more calls.", cost: 1000, demandMult: 1.25 },
    ],
    forecasts: [
      { id: "normal", name: "Clear skies", emoji: "☀️", blurb: "Good mowing weather.", demandMult: 1, weight: 4 },
      { id: "spring", name: "Spring rush", emoji: "🌷", blurb: "Everyone wants their lawn done.", demandMult: 1.5, weight: 2 },
      { id: "rain", name: "Rain all day", emoji: "🌧️", blurb: "Can't mow wet grass. Most jobs cancel.", demandMult: 0.4, weight: 2 },
      { id: "fuel", name: "Fuel price spike", emoji: "⛽", blurb: "Gas costs 50% more.", demandMult: 1, unitCostMult: 1.5, weight: 1 },
      { id: "hoa", name: "HOA contract", emoji: "📋", blurb: "A whole neighborhood signed up.", demandMult: 1.4, weight: 1 },
      { id: "heat", name: "Heat advisory", emoji: "🥵", blurb: "Clients won't wait long for a slot.", demandMult: 1, patienceMult: 0.7, weight: 1 },
    ],
    benchmarkMargin: 0.25,
    dailyTarget: 150,
    realWorld: [
      { label: "Fuel & materials", pct: 15 },
      { label: "Labor", pct: 30 },
      { label: "Trucks & yard", pct: 12 },
      { label: "Other", pct: 13 },
      { label: "Profit", pct: 30 },
    ],
    taxRate: 0.2,
    unlocks: { wages: 2, depreciation: 3, rent: 4, marketing: 5, utilities: 6, interest: 7, taxes: 7 },
    curriculum: {
      1: {
        title: "Sales & Cost of Goods",
        emoji: "💵",
        blurb: "Every lawn job brings money in. Every job burns fuel, mulch and mower blades. What's left is gross profit. You're selling your time, so the stuff is cheap.",
      },
      2: {
        title: "Wages",
        emoji: "👷",
        blurb: "You can hire a crew now. A second person doubles the lawns you can finish in a day, but you pay them rain or shine.",
      },
      3: {
        title: "Equipment",
        emoji: "🔧",
        blurb: "This business runs on machines. A real mower costs thousands, but you'll use it for years, so the P&L spreads that cost over the days you use it. That's depreciation.",
      },
      4: {
        title: "Rent",
        emoji: "🏢",
        blurb: "Time to pay for where the trucks live. Same rent whether you finished 2 jobs or 20.",
        freeRentBlurb: "Your trucks live in your garage, so rent is $0. Just know that a yard on the main road would bring in more calls.",
      },
      5: {
        title: "Marketing",
        emoji: "📣",
        blurb: "Yard signs and door hangers get your phone ringing. Worth it only if the jobs they bring in pay for them.",
      },
      6: {
        title: "Utilities",
        emoji: "💡",
        blurb: "Truck insurance, the phone line, dump fees for the clippings. Boring, and never zero.",
      },
      7: INTEREST_CARD,
    },
  },

  /* ───────────────────────── Gym ───────────────────────── */
  {
    id: "gym",
    name: "Gym",
    emoji: "🏋️",
    difficulty: "hard",
    tagline: "Almost no cost of goods. Almost all fixed costs.",
    why: "Rent and trainers cost a fortune before the first member walks in. You need volume, fast.",
    unit: { singular: "workout pass", plural: "workout passes", emoji: "🎟️", verb: "sold", verbBase: "sell" },
    customerNoun: { singular: "member", plural: "members" },
    leftVerb: "left",
    customers: ["🏃", "🏃‍♀️", "🧘", "🤸", "🧑‍🦱", "👩‍🦳", "🧔", "💪", "🧑‍🎤"],
    ownerEmoji: "🧑‍🏫",
    rush: {
      instruction: "TAP MEMBERS TO CHECK THEM IN",
      servingEmoji: "✅",
      doneEmoji: "💪",
      soldOutLabel: "FULL",
    },
    bonus: { label: "friend joined", pluralLabel: "friends who joined", pct: 1 },
    price: { base: 15, min: 5, max: 40, step: 1 },
    unitCost: 1,
    elasticity: 1.8,
    baseDemand: 50,
    serveTime: 1.8,
    dayLength: 60,
    patience: 7,
    slots: 6,
    hasInventory: false,
    perishable: 0,
    inventory: { step: 0, max: 0, label: "", noun: "towels", emoji: "🧻" },
    staff: { title: "trainer", plural: "trainers", emoji: "🧑‍🏫", wage: 150, max: 4 },
    leaseIntro: "A gym is a big room. Where that room is decides who walks in, and rent is the biggest line you'll see.",
    trafficLabel: "Foot traffic",
    leases: [
      { id: "strip", name: "Strip mall", emoji: "🏬", blurb: "Cheap-ish. Next to a nail salon.", rentPerDay: 250, demandMult: 0.7 },
      { id: "downtown", name: "Downtown", emoji: "🏙️", blurb: "Office workers at lunch.", rentPerDay: 500, demandMult: 1 },
      { id: "tower", name: "Luxury tower", emoji: "🏢", blurb: "Rich neighbors. Brutal rent.", rentPerDay: 900, demandMult: 1.5 },
    ],
    loans: [
      { id: "s", name: "Starter loan", amount: 8000, blurb: "Used equipment, small space." },
      { id: "m", name: "Standard loan", amount: 15000, blurb: "A proper gym." },
      { id: "l", name: "Big loan", amount: 30000, blurb: "Go big. Pay big." },
    ],
    loanRate: 0.005,
    startingCash: 3000,
    utilities: { fixed: 120, perUnit: 0.5, label: "Power, AC & showers" },
    marketing: { label: "Local ads & promos", scale: 150, maxLift: 0.9, step: 50, max: 600 },
    upgrades: [
      { id: "racks", name: "Squat racks", emoji: "🏋️", blurb: "25% more people join.", cost: 3000, demandMult: 1.25 },
      { id: "turnstile", name: "Turnstile check-in", emoji: "🚪", blurb: "Check in 40% faster.", cost: 1500, serveMult: 0.6 },
      { id: "sauna", name: "Sauna", emoji: "🧖", blurb: "Members wait 50% longer.", cost: 4000, patienceMult: 1.5 },
    ],
    forecasts: [
      { id: "normal", name: "Normal day", emoji: "🌤️", blurb: "The regulars.", demandMult: 1, weight: 4 },
      { id: "newyear", name: "New Year's rush", emoji: "🎉", blurb: "Resolutions everywhere.", demandMult: 1.7, weight: 1 },
      { id: "summer", name: "Summer slump", emoji: "🏖️", blurb: "Everyone's outside instead.", demandMult: 0.6, weight: 2 },
      { id: "ac", name: "AC broke", emoji: "🥵", blurb: "Nobody wants to wait in here.", demandMult: 0.9, patienceMult: 0.6, weight: 1 },
      { id: "rival", name: "Rival gym opens", emoji: "🥊", blurb: "Free trials down the block.", demandMult: 0.7, weight: 1 },
      { id: "race", name: "Marathon week", emoji: "🏃", blurb: "Everyone's training.", demandMult: 1.3, weight: 1 },
    ],
    benchmarkMargin: 0.15,
    dailyTarget: 250,
    realWorld: [
      { label: "Supplies", pct: 5 },
      { label: "Staff", pct: 35 },
      { label: "Rent", pct: 25 },
      { label: "Other", pct: 20 },
      { label: "Profit", pct: 15 },
    ],
    taxRate: 0.2,
    unlocks: { rent: 2, wages: 3, utilities: 4, marketing: 5, depreciation: 6, interest: 7, taxes: 7 },
    curriculum: {
      1: {
        title: "Sales & Cost of Goods",
        emoji: "💵",
        blurb: "Every workout pass is almost pure money: a towel and some water is all it costs you. Sounds amazing. Wait until you see the other lines.",
      },
      2: {
        title: "Rent",
        emoji: "🏢",
        blurb: "Here's the gym's real story. Rent is enormous, it's the same on a packed day and an empty one, and it's due starting today. Everything else is about filling the room.",
      },
      3: {
        title: "Wages",
        emoji: "👷",
        blurb: "You can hire trainers now. More trainers check members in faster and keep them happy. They cost a lot whether the gym is full or empty.",
      },
      4: {
        title: "Utilities",
        emoji: "💡",
        blurb: "Power, AC and hot showers for a big room. The bills are in, and they grow a little with every member.",
      },
      5: {
        title: "Marketing",
        emoji: "📣",
        blurb: "Local ads and promos bring in new members. A gym has to fill the room to cover the rent, so ads matter more here than you'd think.",
      },
      6: {
        title: "Equipment",
        emoji: "🔧",
        blurb: "Squat racks and saunas cost serious cash today but last for years. The P&L charges a slice per day. That's depreciation.",
      },
      7: INTEREST_CARD,
    },
  },

  /* ───────────────────────── Streetwear ───────────────────────── */
  {
    id: "streetwear",
    name: "Streetwear Brand",
    emoji: "🧢",
    difficulty: "hard",
    tagline: "Nobody knows you exist until you pay for ads.",
    why: "Orders barely trickle in without ads, and ads get less efficient the more you spend.",
    unit: { singular: "order", plural: "orders", emoji: "📦", verb: "shipped", verbBase: "ship" },
    customerNoun: { singular: "order", plural: "orders" },
    leftVerb: "cancelled",
    customers: ["🧑‍🎤", "👩‍🎨", "🧑‍💻", "🛹", "🎧", "👟", "🕶️", "🧑‍🦱"],
    ownerEmoji: "🧑‍🎨",
    rush: {
      instruction: "TAP ORDERS TO PACK AND SHIP THEM",
      servingEmoji: "📦",
      doneEmoji: "🚚",
      soldOutLabel: "OUT OF STOCK",
    },
    bonus: { label: "add-on", pluralLabel: "add-ons", pct: 0.25 },
    price: { base: 40, min: 15, max: 90, step: 5 },
    unitCost: 18,
    elasticity: 1.4,
    baseDemand: 6,
    serveTime: 2,
    dayLength: 55,
    patience: 8,
    slots: 5,
    hasInventory: true,
    perishable: 0,
    inventory: { step: 5, max: 150, label: "Shirts to print", noun: "shirts", emoji: "👕" },
    staff: { title: "packer", plural: "packers", emoji: "🧑‍🏭", wage: 100, max: 3 },
    leaseIntro: "Orders come in online, so this is about where you print and pack. A real storefront costs a fortune but people find you in person.",
    trafficLabel: "Walk-in buzz",
    leases: [
      { id: "apt", name: "Your apartment", emoji: "🛋️", blurb: "Free. Boxes on the couch.", rentPerDay: 0, demandMult: 0.5 },
      { id: "studio", name: "Shared studio", emoji: "🏭", blurb: "A real print setup.", rentPerDay: 45, demandMult: 1 },
      { id: "popup", name: "SoHo pop-up", emoji: "🛍️", blurb: "Foot traffic, hype, and a scary lease.", rentPerDay: 220, demandMult: 1.8 },
    ],
    loans: [
      { id: "s", name: "Friends & family", amount: 2000, blurb: "A first run of blanks." },
      { id: "m", name: "Small business loan", amount: 5000, blurb: "Inventory and an ad budget." },
      { id: "l", name: "Big loan", amount: 12000, blurb: "Go loud." },
    ],
    loanRate: 0.006,
    startingCash: 1000,
    utilities: { fixed: 40, perUnit: 2, label: "Shopify, packaging & software" },
    marketing: { label: "Meta ads", scale: 150, maxLift: 4.5, step: 25, max: 800 },
    upgrades: [
      { id: "printer", name: "Label printer", emoji: "🖨️", blurb: "Pack 40% faster.", cost: 300, serveMult: 0.6 },
      { id: "photos", name: "Pro photoshoot", emoji: "📸", blurb: "30% more people buy.", cost: 700, demandMult: 1.3 },
      { id: "collab", name: "Influencer collab", emoji: "🌟", blurb: "50% more people buy.", cost: 1500, demandMult: 1.5 },
    ],
    forecasts: [
      { id: "normal", name: "Normal day", emoji: "🌤️", blurb: "Quiet unless you run ads.", demandMult: 1, weight: 4 },
      { id: "drop", name: "Drop day", emoji: "🔥", blurb: "New design, people are waiting.", demandMult: 1.8, weight: 1 },
      { id: "viral", name: "Went viral", emoji: "📈", blurb: "A TikTok blew up overnight.", demandMult: 2.5, weight: 1 },
      { id: "blanks", name: "Blank shirts cost more", emoji: "👕", blurb: "Supplier raised prices 30%.", demandMult: 1, unitCostMult: 1.3, weight: 1 },
      { id: "outage", name: "Ad platform outage", emoji: "📵", blurb: "Ads barely delivering.", demandMult: 0.5, weight: 1 },
      { id: "impatient", name: "Shipping delays", emoji: "🐢", blurb: "Buyers cancel fast if you're slow.", demandMult: 1, patienceMult: 0.6, weight: 1 },
    ],
    benchmarkMargin: 0.12,
    dailyTarget: 250,
    realWorld: [
      { label: "Product & shipping", pct: 42 },
      { label: "Ads", pct: 28 },
      { label: "Labor", pct: 10 },
      { label: "Other", pct: 10 },
      { label: "Profit", pct: 10 },
    ],
    taxRate: 0.2,
    unlocks: { marketing: 2, wages: 3, utilities: 4, rent: 5, depreciation: 6, interest: 7, taxes: 7 },
    curriculum: {
      1: {
        title: "Sales & Cost of Goods",
        emoji: "💵",
        blurb: "Right now your only orders come from friends and followers, about six a day. Each shirt costs you blanks, printing and shipping. What's left is gross profit.",
      },
      2: {
        title: "Marketing",
        emoji: "📣",
        blurb: "This is the whole game. Nobody finds a new brand on their own. Spend on ads and orders show up. Spend too much and the ads cost more than the shirts make.",
      },
      3: {
        title: "Wages",
        emoji: "👷",
        blurb: "Orders are piling up. Hire packers to ship faster. They're paid whether ten orders come in or a hundred.",
      },
      4: {
        title: "Utilities",
        emoji: "💡",
        blurb: "Shopify, packaging, shipping labels, the software stack. Small, and it grows with every order.",
      },
      5: {
        title: "Rent",
        emoji: "🏢",
        blurb: "Time to pay for your workspace. A studio is a real cost. A pop-up store costs a fortune but people find you in person.",
        freeRentBlurb: "You're shipping from your apartment, so rent is $0. It works until the boxes take over the couch. Real brands pay for space eventually.",
      },
      6: {
        title: "Equipment",
        emoji: "🔧",
        blurb: "A label printer or a pro photoshoot costs cash today but pays off over weeks. The P&L spreads the cost out. That's depreciation.",
      },
      7: INTEREST_CARD,
    },
  },
];

export function getBusiness(id: string): BusinessConfig {
  const b = BUSINESSES.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown business ${id}`);
  return b;
}

export const DIFFICULTY_LABEL: Record<Difficulty, { label: string; color: string }> = {
  beginner: { label: "BEGINNER", color: "#5D9C30" },
  medium: { label: "MEDIUM", color: "#E8B030" },
  hard: { label: "HARD", color: "#E05A2B" },
};
