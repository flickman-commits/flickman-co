"use client";

import { useState, useEffect } from "react";

type BreakdownBar = {
  label: string;
  pct: number;
  color: string;
};

type KeyTerm = {
  term: string;
  definition: string;
};

type Example = {
  name: string;
  stat: string;
  summary: string;
  url: string;
  urlLabel: string;
};

type Selling = {
  overview: string;
  buyers: string;
  valuation: string;
  keyDrivers: string[];
};

type BusinessModel = {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  breakdown: BreakdownBar[];
  keyTerms: KeyTerm[];
  howYouMakeMoney: string;
  biggestCosts: string[];
  howYouGetCustomers: string;
  flywheel: string;
  pros: string[];
  cons: string[];
  goodFor: string;
  examples: Example[];
  selling: Selling;
};

const C = {
  a: "#B8703A",
  b: "#C49A4A",
  c: "#8B7355",
  d: "#D4B870",
  e: "#A09070",
  profit: "#5C8A5C",
};

const MODELS: BusinessModel[] = [
  {
    id: "ecommerce",
    name: "E-commerce Brand",
    emoji: "📦",
    tagline: "You buy products, mark them up, and sell them online.",
    breakdown: [
      { label: "Cost of Goods", pct: 30, color: C.a },
      { label: "Paid Advertising", pct: 28, color: C.b },
      { label: "Fulfillment & Shipping", pct: 12, color: C.c },
      { label: "Platform & Ops", pct: 10, color: C.d },
      { label: "Profit", pct: 20, color: C.profit },
    ],
    keyTerms: [
      { term: "Gross Margin", definition: "Revenue minus cost of goods, before operating expenses. A 60% gross margin means you keep $60 of every $100 sold before paying for ads and overhead." },
      { term: "Customer Acquisition Cost (CAC)", definition: "How much you spend to get one new customer. If you spend $10,000 on ads and get 200 customers, your CAC is $50." },
      { term: "Lifetime Value (LTV)", definition: "Total revenue a customer generates over their entire relationship with you. If CAC is $50 and LTV is $200, you have a healthy business." },
      { term: "Return on Ad Spend (ROAS)", definition: "Revenue generated for every dollar spent on advertising. A 3x ROAS means you made $3 in revenue for every $1 in ads." },
      { term: "Conversion Rate", definition: "The percentage of website visitors who actually buy. A 2% conversion rate means 2 out of every 100 visitors make a purchase." },
    ],
    howYouMakeMoney:
      "You buy something for $15 and sell it for $45. That $30 spread is your gross profit. From there you pay for ads, shipping, and overhead. If your numbers are tight, it works. If your ads are inefficient or your margins are thin, it does not.",
    biggestCosts: [
      "Paid advertising (usually the number one cost: Facebook, Instagram, Google)",
      "Cost of goods (what you pay to make or source the product)",
      "Fulfillment and shipping",
      "Platform fees (Shopify, Amazon, etc.)",
    ],
    howYouGetCustomers:
      "Mostly paid ads. You put a product in front of someone on Instagram or Google and hope they buy. Some brands build organic audiences through content, influencers, or SEO, but almost everyone starts with paid. Customer acquisition cost (CAC) is the number you obsess over.",
    flywheel:
      "More sales lead to better supplier pricing, which means higher margins, which means more ad budget, which means more sales. If you can get a customer to buy twice, your economics get way better. The best brands turn one-time buyers into repeat customers through email, subscriptions, or just being really good.",
    pros: [
      "No physical location needed: run it from anywhere",
      "Scales fast once you find a product that works",
      "Tons of data to help you make decisions",
      "Global customer base from day one",
    ],
    cons: [
      "Ads are expensive and getting more expensive every year",
      "Very competitive: someone can copy your product overnight",
      "Inventory risk: you can get stuck holding stuff that will not sell",
      "Thin margins if you are not careful",
    ],
    goodFor:
      "People who are analytical, patient, and comfortable with uncertainty. You need to love testing, iterating, and staring at spreadsheets. It also helps to have a genuine interest in the product category, because passion often leads to better marketing.",
    examples: [
      {
        name: "Warby Parker",
        stat: "$670M revenue, 54.5% gross margin, -$63M net income (2023)",
        summary: "Warby Parker shows how strong a DTC brand's gross margin can be (54.5%), while also showing that physical store expansion and ongoing investment can keep even a $670M brand unprofitable at the bottom line.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=WRBY&type=10-K",
        urlLabel: "Warby Parker 10-K (SEC EDGAR)",
      },
      {
        name: "Chewy",
        stat: "$11.15B revenue, 28.4% gross margin, $39.6M net income (FY2023)",
        summary: "Chewy does $11B in online pet supply sales but keeps only 28% gross margin, squeezed by low-margin consumables and shipping costs. It took enormous scale to turn even a small net profit, illustrating why margin quality matters more than revenue size.",
        url: "https://investor.chewy.com/news-and-events/news/news-details/2024/Chewy-Announces-Fiscal-Fourth-Quarter-and-Full-Year-2023-Financial-Results/default.aspx",
        urlLabel: "Chewy FY2023 Earnings (Investor Relations)",
      },
      {
        name: "Allbirds",
        stat: "$254M revenue, 45% gross margin, -$100M net loss (2022)",
        summary: "Allbirds is a cautionary example of what happens when customer acquisition costs exceed lifetime value. Despite a 45% gross margin, aggressive expansion burned through cash fast. The company has been restructuring ever since.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=BIRD&type=10-K",
        urlLabel: "Allbirds 10-K (SEC EDGAR)",
      },
    ],
    selling: {
      overview: "Most e-commerce brand exits are asset sales handled through M&A brokers or direct strategic outreach. The buyer acquires the brand, customer list, inventory, supplier relationships, and ad accounts. Deals under $5M are common on marketplaces like Acquire.com. Larger exits use advisors like Quiet Light or FE International.",
      buyers: "Strategic CPG companies looking to buy brand equity instead of building it, e-commerce aggregators (Thrasio and similar roll-up operators), and PE firms building brand portfolios. Profitable subscription-box brands attract particularly strong buyer interest.",
      valuation: "Smaller brands typically sell for 2 to 4x annual revenue. Profitable, growing brands with strong repeat purchase rates can get 8 to 15x EBITDA. Subscription revenue commands a significant premium over one-time purchase revenue because of its predictability.",
      keyDrivers: [
        "Repeat purchase rate and LTV: buyers pay a lot more when customers come back",
        "Revenue growth trend: an accelerating brand is worth far more than a flat one",
        "Ad account health and diversification: over-reliance on one platform is a red flag",
        "Supplier concentration: one factory that can be cut off tanks a deal",
        "Owner dependence: if the brand is your face, it is hard to sell",
      ],
    },
  },
  {
    id: "restaurant",
    name: "Restaurant",
    emoji: "🍽️",
    tagline: "You cook food, serve people, and hope the math works out.",
    breakdown: [
      { label: "Labor", pct: 33, color: C.a },
      { label: "Food Cost", pct: 32, color: C.b },
      { label: "Rent", pct: 9, color: C.c },
      { label: "Utilities & Other", pct: 20, color: C.d },
      { label: "Profit", pct: 6, color: C.profit },
    ],
    keyTerms: [
      { term: "Food Cost Percentage", definition: "Cost of ingredients divided by menu price. Target is 28 to 35%. If your $28 plate costs $10 to make, your food cost is 35.7%." },
      { term: "Prime Cost", definition: "Food cost plus labor combined. This should be under 65% of revenue for a restaurant to survive. Most struggling restaurants have prime costs above 70%." },
      { term: "Average Check", definition: "The average amount a customer spends per visit. Increasing average check size (through upsells, specials, drinks) is one of the best ways to improve restaurant economics." },
      { term: "Table Turns", definition: "How many times a table is used during a single service. A table that turns 3 times at dinner generates 3x the revenue of one that sits all night." },
      { term: "Break-Even Point", definition: "The minimum monthly revenue needed to cover all fixed and variable costs. Knowing this number keeps you from running out of cash slowly without realizing it." },
    ],
    howYouMakeMoney:
      "Customers pay for food and drinks. A plate that costs you $8 to make sells for $28. That gap is your gross margin. The problem is after rent, labor, and everything else, most restaurants keep 3 to 9% of revenue as profit. It is a hard business, but when it works, it is a beautiful one.",
    biggestCosts: [
      "Food cost (28 to 35% of revenue is the target)",
      "Labor (30 to 35% of revenue, often the number one cost)",
      "Rent (8 to 10% of revenue is the goal)",
      "Equipment, utilities, insurance",
    ],
    howYouGetCustomers:
      "Location is everything. People walk by and come in. After that: Google Maps reviews, Yelp, Instagram, word of mouth. The best restaurants have regulars who come back every week. Once you are established, the community feeds itself.",
    flywheel:
      "Great food and service lead to good reviews, which bring more foot traffic, which lets you invest in better ingredients and staff, which leads to even better food and service. The compounding here is slow but powerful. Bad reviews work the same way in reverse.",
    pros: [
      "Cash business: money hits your register every day",
      "Strong community ties and loyal regulars",
      "Creative and expressive: your menu is your art",
      "Real, tangible thing you build in a neighborhood",
    ],
    cons: [
      "Brutally thin margins: one bad month can sink you",
      "Labor-intensive and hard to manage at scale",
      "Completely location-dependent",
      "High failure rate, especially in the first two years",
    ],
    goodFor:
      "People who are genuinely hospitality-driven. You have to love feeding people, not just running a business. Great operators are organized, calm under pressure, and hold high standards. If you are doing it for the love of food and people, it can be one of the most rewarding businesses there is.",
    examples: [
      {
        name: "Chipotle",
        stat: "$9.9B revenue, 26.2% restaurant-level margin, $1.23B net income (2023)",
        summary: "Chipotle's 3,437 locations averaged over $3M in annual sales each in 2023, with restaurant-level margins of 26.2%, among the best in fast casual. A great example of what happens when operations are obsessively standardized.",
        url: "https://ir.chipotle.com/2024-02-06-CHIPOTLE-ANNOUNCES-FOURTH-QUARTER-AND-FULL-YEAR-2023-RESULTS",
        urlLabel: "Chipotle FY2023 Results (Investor Relations)",
      },
      {
        name: "Shake Shack",
        stat: "$1.09B revenue, 19.9% shack-level margin, $19.8M net income (2023)",
        summary: "Shake Shack crossed $1B in revenue for the first time in 2023 and turned a small profit after years of losses. Its 19.9% shack-level margin is solid but trails Chipotle by 6+ points, showing how brand and format affect unit economics.",
        url: "https://investor.shakeshack.com/press-releases/press-release-details/2024/Shake-Shack-Announces-Fourth-Quarter-and-Fiscal-Year-2023-Financial-Results/default.aspx",
        urlLabel: "Shake Shack FY2023 Earnings (Investor Relations)",
      },
      {
        name: "Sweetgreen",
        stat: "$727M revenue, 18.2% restaurant-level margin, -$155M net loss (2023)",
        summary: "Sweetgreen shows the challenge of growing a premium fast-casual concept. Despite a fast-growing brand and improving unit economics, the company still lost $155M in 2023, mostly due to corporate overhead and expansion costs that outpace restaurant-level profits.",
        url: "https://investors.sweetgreen.com/news-releases",
        urlLabel: "Sweetgreen Investor Relations",
      },
    ],
    selling: {
      overview: "Single-location restaurants usually sell through local business brokers or direct private transactions. Multi-location groups attract M&A advisors and institutional buyers. The process is slow and heavily dependent on lease transferability, since without a good lease there is often nothing to sell.",
      buyers: "Individual operators and entrepreneurs for single locations, PE firms and restaurant groups for chains, and sometimes a competitor buying you out to take your location. Corporate buyers are rare for independents.",
      valuation: "Independent restaurants typically sell for 2 to 3x SDE (Seller's Discretionary Earnings, which is profit plus the owner's salary). Profitable multi-unit chains trade at 5 to 8x EBITDA. A strong lease in a great location can be worth more than the business itself.",
      keyDrivers: [
        "Lease terms and transferability: a short lease or difficult landlord kills a deal",
        "Whether the business can run without the founder day-to-day",
        "Revenue trend: buyers discount a declining business heavily",
        "Staff stability: a restaurant where everyone leaves with the owner is hard to sell",
        "Brand attachment to the owner personally vs. the location itself",
      ],
    },
  },
  {
    id: "agency",
    name: "Marketing Agency",
    emoji: "💡",
    tagline: "You help other businesses market themselves and charge for it.",
    breakdown: [
      { label: "Labor & Contractors", pct: 55, color: C.a },
      { label: "Overhead & Admin", pct: 8, color: C.b },
      { label: "Tools & Software", pct: 5, color: C.c },
      { label: "Biz Dev & Sales", pct: 5, color: C.d },
      { label: "Profit", pct: 27, color: C.profit },
    ],
    keyTerms: [
      { term: "Retainer", definition: "A fixed monthly fee a client pays for ongoing services. Retainers are the gold standard in agency economics because they create predictable, recurring revenue." },
      { term: "Utilization Rate", definition: "The percentage of total staff hours that are actually billable to clients. A 75% utilization rate means your team spends 75% of their time on client work and 25% on internal stuff." },
      { term: "Scope Creep", definition: "When client work expands beyond what was originally agreed without additional compensation. This is the number one margin killer at agencies." },
      { term: "Client Churn", definition: "When a client ends their contract. A single client canceling a large retainer can meaningfully hurt monthly revenue, which is why retention is more important than new business." },
      { term: "Revenue Per Head", definition: "Total agency revenue divided by headcount. Healthy boutique agencies typically target $150K to $250K+ in revenue per employee as a measure of team efficiency." },
    ],
    howYouMakeMoney:
      "Clients pay you a monthly retainer (say $5,000 to $20,000 per month) or a project fee to run their ads, manage their social media, build their brand, or create content. Your main cost is the people doing the work. If you keep your team lean and your clients happy, margins can be great.",
    biggestCosts: [
      "Salaries and contractor fees (usually 50 to 70% of revenue)",
      "Software tools (design, analytics, scheduling platforms)",
      "Overhead: office if you have one, insurance, admin",
    ],
    howYouGetCustomers:
      "Almost always referrals in the beginning. You do good work for one client and they tell a friend. Over time: LinkedIn, cold outreach, a strong case study portfolio, speaking at events, or running ads for yourself (which doubles as proof you know what you are doing).",
    flywheel:
      "Great results for clients lead to case studies, which make it easier to sell to new clients. With more revenue you can afford better talent, which produces even better results. The trap is chasing new clients instead of retaining existing ones. Retention is everything.",
    pros: [
      "Low startup costs: you can start with a laptop and one client",
      "High margins if you keep the team lean",
      "Recurring revenue from monthly retainers",
      "You build skills and a network fast",
    ],
    cons: [
      "Feast or famine: losing one big client can hurt badly",
      "Clients can be demanding and churn unexpectedly",
      "Hard to scale because it is people-dependent",
      "You are always trading time for money unless you productize",
    ],
    goodFor:
      "Relationship-builders who are good communicators and genuinely curious about business. You need to enjoy problem-solving for others and be comfortable with ambiguity. If you love strategy, storytelling, and variety, this can be a great fit.",
    examples: [
      {
        name: "Omnicom Group",
        stat: "$14.69B revenue, 14.3% operating margin, 4.1% organic growth (2023)",
        summary: "Omnicom is one of the world's largest agency holding companies. Its 14.3% operating margin on nearly $15B in revenue shows the structural ceiling for large agency businesses: you can scale but margins stay in the low-to-mid teens because the product is human talent.",
        url: "https://investor.omnicomgroup.com/news/news-details/2024/Omnicom-Reports-Fourth-Quarter-and-Full-Year-2023-Results/default.aspx",
        urlLabel: "Omnicom FY2023 Earnings (Investor Relations)",
      },
      {
        name: "WPP",
        stat: "~14.8B GBP revenue, ~15% operating margin (2023)",
        summary: "WPP, the world's largest agency group by revenue, has spent years restructuring to improve margins. Even at massive scale, its operating margin hovers around 15%, a reminder that agencies do not get more profitable just by getting bigger.",
        url: "https://www.wpp.com/investors/results-reports-presentations",
        urlLabel: "WPP Annual Results (Investor Relations)",
      },
      {
        name: "Publicis Groupe",
        stat: "14.77B EUR revenue, ~18% operating margin, 6.3% organic growth (2023)",
        summary: "Publicis is the outlier among big agency holding companies, consistently posting 18%+ operating margins by investing early in data and technology platforms. It shows that agencies can improve economics when they productize part of their offering.",
        url: "https://www.publicisgroupe.com/en/investors/financial-results",
        urlLabel: "Publicis Financial Results (Investor Relations)",
      },
    ],
    selling: {
      overview: "Agencies are sold through M&A advisors or via direct outreach from larger firms. Many exits are acqui-hires where the buyer wants your team and client relationships more than a financial return. The process typically takes 6 to 12 months and involves detailed client contract review.",
      buyers: "Holding companies (WPP, Publicis, Omnicom, IPG), PE-backed agency roll-ups building geographic or capability coverage, and independent agencies looking to acquire a specialization. Strategic buyers are far more common than financial buyers for agencies under $10M in revenue.",
      valuation: "Small agencies under $3M in revenue typically sell for 0.5 to 1x revenue. Agencies with strong retainer bases and low client concentration can achieve 4 to 8x EBITDA. The multiple expands significantly when recurring retainer revenue is above 70% of total revenue.",
      keyDrivers: [
        "Client concentration: if one client is more than 20% of revenue, buyers discount heavily",
        "Retainer percentage vs. project work: retainers are far more valuable",
        "Team retention post-close: if talent walks, the deal falls apart",
        "Whether client relationships live with the agency or with the founder personally",
        "Revenue growth trend and pipeline visibility",
      ],
    },
  },
  {
    id: "lawn",
    name: "Lawn Mowing Company",
    emoji: "🌿",
    tagline: "You mow lawns. People pay you every week to do it.",
    breakdown: [
      { label: "Labor", pct: 30, color: C.a },
      { label: "Equipment & Fuel", pct: 15, color: C.b },
      { label: "Vehicle & Transport", pct: 7, color: C.c },
      { label: "Insurance & Admin", pct: 8, color: C.d },
      { label: "Profit", pct: 40, color: C.profit },
    ],
    keyTerms: [
      { term: "Route Density", definition: "How many jobs you have clustered in one geographic area. High density means less driving between jobs, which is the core variable that separates profitable lawn companies from ones that just break even." },
      { term: "Recurring Revenue", definition: "Income that comes in automatically on a set schedule. Weekly mowing contracts are the holy grail because you do not have to re-sell the same customer every week." },
      { term: "Upsell", definition: "Offering additional services to existing clients: fertilizing, aeration, holiday lighting, snow removal. Upsells dramatically improve revenue per customer without any new acquisition cost." },
      { term: "Seasonal Cash Flow", definition: "The natural ebb and flow of income tied to the time of year. Lawn businesses peak in spring and summer and slow in winter, which means you need to plan cash reserves or add off-season services." },
      { term: "Customer Lifetime Value", definition: "Total revenue from one customer across all years they use you. A customer paying $150 per week for 20 weeks over 5 years is worth $15,000 in lifetime revenue." },
    ],
    howYouMakeMoney:
      "You charge $50 to $150 per lawn, or sell monthly subscriptions. The magic is density: if you can get 10 lawns on the same street, your drive time drops to zero and profit per hour goes way up. A tight route with loyal customers is a genuinely good small business.",
    biggestCosts: [
      "Equipment (mowers, trimmers, trailer: big upfront but lasts)",
      "Fuel and vehicle costs",
      "Labor if you hire",
      "Insurance",
    ],
    howYouGetCustomers:
      "Door-to-door flyers in neighborhoods you want to work. Yard signs in customers' yards. Nextdoor and local Facebook groups. Word of mouth from neighbors who see you every week. It is a local game, and visibility in the right zip codes is everything.",
    flywheel:
      "More customers in the same neighborhood means less driving between jobs, which means more lawns per day, which means higher revenue with the same time investment, which lets you offer competitive pricing, which brings in more customers in that neighborhood.",
    pros: [
      "Simple business: no complicated product or technology",
      "Recurring revenue (lawns grow back every week)",
      "Low barrier to entry: you can start with one mower",
      "Predictable, seasonal cash flow",
    ],
    cons: [
      "Seasonal: winters can be slow unless you add snow removal",
      "Physical and weather-dependent",
      "Hard to scale without hiring, and hiring adds complexity",
      "Low perceived status, which can affect motivation long-term",
    ],
    goodFor:
      "Reliable, self-motivated people who enjoy physical work and being outside. Great for someone who wants simple ownership with no complicated tech or inventory. Also a fantastic first business for a teenager or someone learning the basics of operations.",
    examples: [
      {
        name: "Rollins, Inc. (Orkin)",
        stat: "$3.07B revenue, 22.7% EBITDA margin, $435M net income (2023)",
        summary: "Rollins (which owns Orkin) is the publicly traded benchmark for recurring home services. Pest control and lawn care share the same economics: regular visits, loyal customers, and route density. Rollins has compounded at 15%+ annually for decades.",
        url: "https://www.prnewswire.com/news-releases/rollins-inc-reports-fourth-quarter-and-full-year-2023-financial-results-302062269.html",
        urlLabel: "Rollins FY2023 Earnings Release",
      },
      {
        name: "BrightView Holdings",
        stat: "$2.77B revenue, ~$45M operating income (FY2023)",
        summary: "BrightView is the largest commercial landscaping company in the US and the closest public comp to a scaled lawn mowing operation. Despite $2.8B in revenue, thin operating margins show how labor-intensive this business remains even at scale.",
        url: "https://ir.brightviewlandscapes.com/financial-information/press-releases",
        urlLabel: "BrightView Investor Relations",
      },
      {
        name: "FirstService Corporation",
        stat: "~$4.3B CAD revenue, ~$385M adjusted EBITDA (2023)",
        summary: "FirstService provides residential property services across North America. It is a good example of what recurring home services look like at scale, with disciplined acquisition of local operators and strong retention economics.",
        url: "https://ir.firstservice.com/news-releases",
        urlLabel: "FirstService Investor Relations",
      },
    ],
    selling: {
      overview: "Route-based home service businesses are extremely attractive to PE firms running consolidation plays. Many founders get approached by roll-up buyers without ever listing for sale. Deals under $1M SDE often transact privately or through a business broker. Larger operations use M&A advisors.",
      buyers: "PE-backed home services roll-ups (one of the most active acquisition sectors in private equity right now), larger regional operators looking to expand territory, and individuals buying a cash-flowing business. Strategic roll-ups often pay premiums because adding routes to an existing operation is almost pure profit.",
      valuation: "Typically 3 to 6x EBITDA for well-run operations, with top-tier route-dense businesses with high contract penetration hitting 7 to 8x. Recurring contract revenue gets priced at a meaningfully higher multiple than one-off job revenue.",
      keyDrivers: [
        "Percentage of revenue on recurring annual contracts vs. one-off jobs",
        "Route density: more jobs per square mile means higher margins and a more defensible business",
        "Customer churn rate: low churn signals strong service quality",
        "Owner dependence: buyers discount heavily if the owner is doing most of the work",
        "Equipment condition and fleet age",
      ],
    },
  },
  {
    id: "franchise",
    name: "Food Franchise",
    emoji: "🏪",
    tagline: "You buy the right to run a proven restaurant brand.",
    breakdown: [
      { label: "Labor", pct: 30, color: C.a },
      { label: "Food Cost", pct: 30, color: C.b },
      { label: "Rent", pct: 10, color: C.c },
      { label: "Royalties & Fees", pct: 8, color: C.d },
      { label: "Other Ops", pct: 10, color: C.e },
      { label: "Profit", pct: 12, color: C.profit },
    ],
    keyTerms: [
      { term: "Franchise Fee", definition: "The upfront payment you make for the right to use the brand and operating system. This is separate from royalties and is paid once when you sign the franchise agreement." },
      { term: "Royalty", definition: "An ongoing percentage of your gross revenue paid to the franchisor, typically 4 to 8%, every month, forever. This is the price of using the brand and system." },
      { term: "FDD (Franchise Disclosure Document)", definition: "The legal document every franchisor must provide before you sign. It contains 23 items including the franchisor's financial history, litigation history, and any Item 19 financial performance data." },
      { term: "AUV (Average Unit Volume)", definition: "Average annual sales per location across the franchise system. This is the key metric for comparing franchises. Chick-fil-A's AUV of $8M+ is double most competitors." },
      { term: "Item 19", definition: "The section of the FDD where franchisors can (but are not required to) disclose actual franchisee financial performance. Always ask for Item 19. If a franchisor does not have one, be cautious." },
    ],
    howYouMakeMoney:
      "You operate a location of an established brand and keep the profits after paying royalties. Revenue comes from food sales just like any restaurant, but you are running a proven playbook instead of inventing one.",
    biggestCosts: [
      "Franchise fee upfront (can be $10,000 to $50,000+)",
      "Royalties to the franchisor (usually 4 to 8% of gross revenue, forever)",
      "Build-out and equipment (often $200K to $1M+ to open)",
      "Food, labor, and rent: same as any restaurant",
    ],
    howYouGetCustomers:
      "The franchisor handles national marketing. You benefit from brand recognition the moment you open. Locally, you might do community events or local ads, but the heavy lifting of brand-building is done for you. This is one of the biggest advantages of the model.",
    flywheel:
      "The franchisor's brand gets stronger as more locations open. Your location benefits from that recognition. Your royalties fund more franchisor marketing. The brand gets even stronger. You are buying into a machine that is already spinning.",
    pros: [
      "Proven system: you do not have to figure everything out from scratch",
      "Brand recognition from day one",
      "Training and ongoing support from the franchisor",
      "Easier to get financing (banks understand franchise models)",
    ],
    cons: [
      "You do not own the brand or the system: you are a licensee",
      "Royalties eat into profit permanently",
      "Less creative freedom than an independent business",
      "Expensive to start, and you can lose your investment if it fails",
    ],
    goodFor:
      "Strong operators and executors: people who thrive following a system rather than inventing one. If you want to focus on running a tight ship (great staff, clean location, happy customers) rather than building something from scratch, franchising can be very rewarding.",
    examples: [
      {
        name: "McDonald's",
        stat: "$25.5B revenue, 46% operating margin, $11.6B operating income (2023)",
        summary: "McDonald's 46% operating margin is extraordinary for a food company because 95% of its 44,000+ locations are franchisee-owned. McDonald's collects rent and royalties from franchisees rather than running restaurants itself, which is why its margins look more like a real estate company than a fast food chain.",
        url: "https://corporate.mcdonalds.com/corpmcd/investors.html",
        urlLabel: "McDonald's Investor Relations",
      },
      {
        name: "Domino's Pizza",
        stat: "$4.48B revenue, $914.9M in franchisee royalties, 20,591 locations (2023)",
        summary: "Domino's $4.48B in reported revenue understates its real scale: its franchised stores generate $18.3B in global retail sales that flow mostly to franchisees, while Domino's collects $915M in royalties plus $2.7B from selling dough and ingredients to those same franchisees.",
        url: "https://ir.dominos.com/news-releases/news-release-details/dominos-pizzar-announces-fourth-quarter-and-fiscal-2023",
        urlLabel: "Domino's FY2023 Earnings (Investor Relations)",
      },
      {
        name: "Yum! Brands (KFC, Taco Bell, Pizza Hut)",
        stat: "$7.08B revenue, 38% operating margin, 54,000+ locations (2023)",
        summary: "Yum! Brands shows the franchise model at global scale. With 54,000 locations across three brands and a 38% operating margin, it is one of the most profitable restaurant companies in the world, almost entirely because it franchises rather than operates restaurants.",
        url: "https://www.yum.com/wps/portal/yumbrands/Yumbrands/investors/financial-results",
        urlLabel: "Yum! Brands Investor Relations",
      },
    ],
    selling: {
      overview: "You are selling your operating license and the physical assets of your location, not the brand itself. The franchisor must approve any transfer, and most franchise agreements include a right of first refusal giving the franchisor the option to buy the location back before you can sell to a third party. The process typically takes 3 to 9 months.",
      buyers: "Other franchisees within the same system (multi-unit operators looking to expand), PE firms building multi-location franchise groups, and individuals entering the franchise system for the first time. The franchisor vets all buyers before approving the transfer.",
      valuation: "Well-run franchise locations typically sell for 3 to 5x EBITDA, though it varies significantly by brand. A McDonald's location commands a major premium over a lower-AUV brand. Buyers are essentially paying for a cash-flowing operating business with a proven brand attached.",
      keyDrivers: [
        "Brand strength and AUV: a high-volume brand sells at a higher multiple",
        "Lease terms and how many years remain",
        "Whether a mandatory remodel is coming (can cost hundreds of thousands of dollars)",
        "Franchisee relationship history with the franchisor: violations lower the price",
        "Health of the overall franchise system (is the brand growing or shrinking systemwide)",
      ],
    },
  },
  {
    id: "lawfirm",
    name: "Law Firm",
    emoji: "⚖️",
    tagline: "You sell legal expertise by the hour, or by the outcome.",
    breakdown: [
      { label: "Attorney Salaries", pct: 45, color: C.a },
      { label: "Office & Admin", pct: 12, color: C.b },
      { label: "Malpractice Insurance", pct: 8, color: C.c },
      { label: "Marketing", pct: 5, color: C.d },
      { label: "Profit", pct: 30, color: C.profit },
    ],
    keyTerms: [
      { term: "Billable Hour", definition: "The unit of sale for most law firms. Attorneys track time in 6-minute increments and bill clients at rates ranging from $200 (small firm, junior associate) to $2,000+ per hour at elite firms." },
      { term: "Realization Rate", definition: "The percentage of billed hours that clients actually pay. A 90% realization rate means clients pay 90 cents of every dollar billed. Big firms target 90%+. Slipping below 85% is a warning sign." },
      { term: "Profits Per Partner (PPP)", definition: "The benchmark for comparing law firm profitability. The Am Law 100 rankings are largely sorted by PPP. It is calculated by dividing total partner profits by the number of equity partners." },
      { term: "Leverage", definition: "The ratio of associates to equity partners. More associates per partner means more billable hours generated per partner, which is a core driver of PPP at large firms." },
      { term: "Origination Credit", definition: "The internal credit an attorney receives for bringing in a new client. At most firms, whoever originates the client gets a percentage of fees generated, creating strong incentives to build a book of business." },
    ],
    howYouMakeMoney:
      "Three main models: hourly billing (you charge $200 to $800 per hour for your time), flat fees (a set price for a specific service like drafting a contract), or contingency (you get paid a percentage, typically 33%, only if you win the case). Most firms do a mix.",
    biggestCosts: [
      "Attorney salaries (the biggest cost by far)",
      "Malpractice insurance (required and expensive)",
      "Office space and admin staff",
      "Legal research tools and software",
    ],
    howYouGetCustomers:
      "Referrals are king. Other lawyers send you cases. Past clients recommend you. Building a reputation in a specific area of law, whether personal injury, real estate, or corporate, compounds over time. Google search is increasingly important for consumer-facing practices.",
    flywheel:
      "Win cases, build reputation, attract better clients with more complex and higher-paying cases, earn more, invest in better attorneys, win more cases. In law, reputation is everything. It takes years to build and it sticks.",
    pros: [
      "High billing rates: skilled attorneys command serious fees",
      "Relatively recession-resistant (people always need legal help)",
      "Deep specialization creates a real moat",
      "Strong referral networks once established",
    ],
    cons: [
      "Requires significant education and bar passage just to start",
      "Slow to build: reputation takes years to compound",
      "High stress, especially in litigation",
      "Hard to scale because it is deeply expertise-dependent",
    ],
    goodFor:
      "Detail-oriented people who love research, logic, and advocacy. You need high emotional intelligence because clients are often stressed or scared. If you genuinely love the law and enjoy problem-solving under pressure, it can be an incredibly fulfilling practice.",
    examples: [
      {
        name: "Kirkland & Ellis",
        stat: "$7.2B gross revenue, $7.96M profits per equity partner, $2.05M revenue per lawyer (2023)",
        summary: "Kirkland topped the Am Law 100 in 2023 with $7.2B in gross revenue and paid each equity partner nearly $8M. At $2.05M in revenue per lawyer, it generates more revenue per attorney than almost any other professional services firm on earth.",
        url: "https://www.law.com/americanlawyer/am-law-100/",
        urlLabel: "Am Law 100 Rankings (The American Lawyer)",
      },
      {
        name: "Latham & Watkins",
        stat: "~$5.7B gross revenue, $5.5M profits per equity partner (2023)",
        summary: "Latham ranked second in the Am Law 100 with $5.7B in revenue and $5.5M in PPP. Its 2024 results jumped to $7B, showing how quickly BigLaw profits surge when M&A and capital markets activity rebounds.",
        url: "https://www.law.com/americanlawyer/am-law-100/",
        urlLabel: "Am Law 100 Rankings (The American Lawyer)",
      },
      {
        name: "Cravath, Swaine & Moore",
        stat: "~$900M gross revenue, ~$7M profits per equity partner (2023)",
        summary: "Cravath is one of the oldest and most prestigious firms in the country. Despite being much smaller than Kirkland, its profits per partner rival the very top of BigLaw, a result of extreme selectivity, very high billing rates, and a lockstep compensation system that keeps the partnership focused on firm-wide performance.",
        url: "https://www.law.com/americanlawyer/am-law-100/",
        urlLabel: "Am Law 100 Rankings (The American Lawyer)",
      },
    ],
    selling: {
      overview: "Law firms almost never sell in the traditional sense. The typical exit is a merger, where two firms combine and partners exchange stakes in the new entity. Individual attorneys exit by moving their book of business to another firm, taking their clients with them. True third-party acquisitions are rare and mostly involve non-law legal services businesses.",
      buyers: "Larger law firms absorbing smaller ones for geographic expansion, practice area depth, or lateral talent. Private equity has recently started entering legal services through alternative business structures in some states, but this is still early and limited.",
      valuation: "Merged firms are valued based on revenue per lawyer and profits per partner relative to the acquiring firm's benchmarks. An individual partner's book of business, when moving laterally, is typically worth 1 to 2x annual billings as a guarantee negotiated with the new firm.",
      keyDrivers: [
        "Portability of client relationships: how many clients follow the attorney personally vs. staying with the firm",
        "Practice area demand: transactional work (M&A, finance) commands more than some litigation areas",
        "Partner age and succession planning: a retiring partner's book is harder to value",
        "Geographic and practice overlap with the acquirer",
        "Conflicts of interest between the merging firms' client bases",
      ],
    },
  },
  {
    id: "school",
    name: "School",
    emoji: "🎓",
    tagline: "You build a place where people learn something valuable.",
    breakdown: [
      { label: "Teacher Salaries", pct: 50, color: C.a },
      { label: "Facilities", pct: 15, color: C.b },
      { label: "Marketing & Enrollment", pct: 10, color: C.c },
      { label: "Curriculum & Tech", pct: 8, color: C.d },
      { label: "Profit", pct: 17, color: C.profit },
    ],
    keyTerms: [
      { term: "Enrollment", definition: "The number of paying students. Enrollment is the core revenue driver for every school. Falling enrollment is the early warning sign for every school in financial trouble." },
      { term: "Retention Rate", definition: "The percentage of students who continue from one year or semester to the next. A school with 90% retention needs to replace only 10% of students each year, which is a much easier marketing job than starting from scratch." },
      { term: "Cost Per Enrolled Student", definition: "Total operating cost divided by enrollment. Tracking this over time tells you whether the school is becoming more or less efficient as it grows." },
      { term: "Accreditation", definition: "Official recognition from a governing body that validates the quality of your education. Accreditation unlocks access to federal financial aid and is a prerequisite for most students to attend." },
      { term: "Net Tuition Revenue", definition: "Tuition income after scholarships and financial aid are subtracted. This is the real revenue number, not the sticker price, and it is what matters when projecting a school's finances." },
    ],
    howYouMakeMoney:
      "Tuition. Students (or their parents) pay to attend. This can be a traditional school, a coding bootcamp, a music academy, an online course business, or anything in between. The model is the same: you create a learning experience and people pay to access it.",
    biggestCosts: [
      "Teachers and instructors (your most important investment)",
      "Facilities or technology platform",
      "Curriculum development",
      "Marketing and enrollment costs",
    ],
    howYouGetCustomers:
      "Word of mouth from successful students is the most powerful channel. Parents talk to other parents. Alumni refer friends. SEO and community presence matter a lot for local schools. For online schools, content marketing and social proof (testimonials, outcomes data) do the heavy lifting.",
    flywheel:
      "Strong student outcomes lead to a better reputation, which brings more enrollment, which generates more revenue, which allows you to hire better teachers and build better facilities, which leads to even better outcomes. The schools that win take outcomes seriously. When your graduates succeed, it sells the next cohort for you.",
    pros: [
      "Mission-driven: you are genuinely changing people's lives",
      "Recurring tuition revenue if you have ongoing programs",
      "Strong community around shared learning",
      "Once reputation is built, it is hard to replicate",
    ],
    cons: [
      "Heavy regulation, especially for accredited programs",
      "Slow to build: reputation compounds over years, not months",
      "Completely dependent on enrollment numbers",
      "Hard to raise prices without hurting access",
    ],
    goodFor:
      "Patient, mission-driven people who care deeply about other people's growth. You have to genuinely love teaching and believe in what you are building. Great school operators are community-minded, long-term thinkers who find meaning in the outcome, not just the revenue.",
    examples: [
      {
        name: "Grand Canyon Education",
        stat: "$961M revenue, 25.9% operating margin, 117,279 enrolled students (2023)",
        summary: "Grand Canyon Education manages Grand Canyon University and shows that education as a service can be highly profitable at scale. A 25.9% operating margin on nearly $1B in revenue, driven by online enrollment growth, makes it one of the most efficient education businesses in the country.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=LOPE&type=10-K",
        urlLabel: "Grand Canyon Education 10-K (SEC EDGAR)",
      },
      {
        name: "Stride, Inc.",
        stat: "$1.84B revenue, $165.5M operating income, record enrollment (FY2023)",
        summary: "Stride runs online public and private schools in 31 states. Its $1.84B in FY2023 revenue, a record, shows how online delivery can dramatically expand a school's reach beyond any single physical location, while government funding provides relatively stable revenue.",
        url: "https://investors.stridelearning.com/news/news-details/2023/Stride-Reports-Record-Revenue-and-Earnings/default.aspx",
        urlLabel: "Stride FY2023 Earnings (Investor Relations)",
      },
      {
        name: "Duolingo",
        stat: "$531M revenue, 73% gross margin, 26.9M daily active users (2023)",
        summary: "Duolingo is the most profitable per-user language learning platform ever built. Its 73% gross margin is possible because the core product is software, not teachers. Freemium drives massive top-of-funnel while paid subscriptions convert at high margins.",
        url: "https://investor.duolingo.com/financial-information/press-releases",
        urlLabel: "Duolingo Investor Relations",
      },
    ],
    selling: {
      overview: "Education businesses are sold through M&A advisors or industry-specific brokers. Accreditation status is the single most important factor: losing accreditation can make a school essentially unsellable overnight. Deals typically take 9 to 18 months to close because of regulatory review and enrollment due diligence.",
      buyers: "PE firms running education roll-ups, larger education companies looking for geographic or program expansion, and individual operators. Strategic buyers pay more because they can eliminate duplicated overhead and cross-sell programs to their existing student base.",
      valuation: "Established accredited schools with stable enrollment trade at 6 to 12x EBITDA. Enrollment trend matters more than any single year's numbers. A school declining 10% per year trades at a steep discount regardless of current profitability.",
      keyDrivers: [
        "Accreditation status and any pending regulatory reviews",
        "Enrollment growth or decline over the prior 3 years",
        "Student completion and outcomes data (graduation rates, job placement)",
        "Regulatory compliance history: violations create legal liability for buyers",
        "Whether the brand is tied to the founder or to the institution itself",
      ],
    },
  },
  {
    id: "media",
    name: "Media Company",
    emoji: "🎙️",
    tagline: "You build an audience and then monetize their attention.",
    breakdown: [
      { label: "Content Creation", pct: 40, color: C.a },
      { label: "Sales & Marketing", pct: 15, color: C.b },
      { label: "Distribution & Tech", pct: 10, color: C.c },
      { label: "Admin & Overhead", pct: 8, color: C.d },
      { label: "Profit", pct: 27, color: C.profit },
    ],
    keyTerms: [
      { term: "CPM (Cost Per Mille)", definition: "The rate advertisers pay per 1,000 ad impressions. A $20 CPM means an advertiser pays $20 for every 1,000 times their ad is shown. CPM is the fundamental unit of advertising economics." },
      { term: "Monthly Active Users (MAU)", definition: "The number of unique people who engage with your content each month. MAU is the core metric for audience size, and it is what advertisers and sponsors pay for." },
      { term: "Subscriber Churn", definition: "The percentage of subscribers who cancel each month. At 5% monthly churn, you lose 60% of subscribers per year. Keeping churn low is more important than growing new subscribers." },
      { term: "ARPU (Average Revenue Per User)", definition: "Total revenue divided by total users. This tells you how well you are monetizing your audience. Growing ARPU without growing the audience is a sign of a maturing, healthy media business." },
      { term: "Programmatic Advertising", definition: "Automated, algorithmic buying and selling of ad inventory. Most digital ad revenue today runs programmatically, which is efficient but gives individual media companies less pricing power than direct ad sales." },
    ],
    howYouMakeMoney:
      "Multiple streams: advertising (brands pay to reach your audience), sponsorships (a brand pays to be associated with your content), subscriptions (readers or viewers pay directly), and licensing (others pay to use your content). Most media companies mix several of these.",
    biggestCosts: [
      "Content creation (the biggest one: writers, editors, producers, gear)",
      "Distribution and platform costs",
      "Sales and marketing to grow the audience",
      "Admin and operations",
    ],
    howYouGetCustomers:
      "You have two customers: the audience and the advertisers. For the audience: consistency, quality, SEO, social media, and word of mouth. For advertisers: once you have a sizable audience, they come to you. The audience comes first and everything else follows.",
    flywheel:
      "More content leads to a bigger audience, which makes you more valuable to advertisers, which generates more revenue, which funds a better content budget, which produces even more and better content. The compounding in media is real but slow. The outlets you see everywhere usually took 3 to 7 years of consistent work to get there.",
    pros: [
      "Once the audience is built, it scales without proportional cost",
      "Multiple monetization options: not dependent on one revenue stream",
      "Builds real influence and relationships over time",
      "Content assets keep working long after they are created",
    ],
    cons: [
      "Slow to monetize: you need an audience before you can sell anything",
      "Algorithm-dependent on platforms you do not control",
      "Constant content demand: the treadmill never stops",
      "Hard to predict what will resonate",
    ],
    goodFor:
      "Creative, patient people who are comfortable with ambiguity and genuinely enjoy the content they are making. The best media operators are obsessed with their audience. They think constantly about what their readers or viewers actually need. If you are doing it just for the money, the audience will sense it.",
    examples: [
      {
        name: "The New York Times",
        stat: "$2.43B revenue, $1.09B digital subscription revenue, 9.7M digital subscribers, 12% operating margin (2023)",
        summary: "The Times became the first newspaper to cross $1B in digital subscription revenue in 2023. It proves that a media brand can rebuild itself as a subscription software business, with 9.7M paying digital subscribers providing recurring revenue that advertising alone never could.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=NYT&type=10-K",
        urlLabel: "New York Times 10-K (SEC EDGAR)",
      },
      {
        name: "Spotify",
        stat: "13.25B EUR revenue, 87% from subscriptions, 26.4% gross margin, 602M monthly active users (2023)",
        summary: "Spotify has 602M users and $14B+ in revenue but still struggles with gross margins around 26%, because record labels take the majority of every dollar in licensing fees. It illustrates how a media platform can be enormous in scale but structurally constrained by content owners who set the terms.",
        url: "https://newsroom.spotify.com/2024-02-06/spotify-reports-fourth-quarter-2023-earnings/",
        urlLabel: "Spotify Q4 2023 Earnings (Newsroom)",
      },
      {
        name: "BuzzFeed",
        stat: "$414M revenue, -$223M net loss, shut down BuzzFeed News (2022)",
        summary: "BuzzFeed went public via SPAC in 2021 at a $1.5B valuation, then shut down its flagship BuzzFeed News operation just 18 months later. It is the clearest recent case study in the dangers of building a media company almost entirely on advertising revenue from platforms you do not control.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=BZFD&type=10-K",
        urlLabel: "BuzzFeed 10-K (SEC EDGAR)",
      },
    ],
    selling: {
      overview: "Media businesses are often sold to strategic buyers who want the audience, not just the cash flow. Ad-dependent businesses are genuinely difficult to sell because buyers are skeptical of revenue tied to platform algorithms. Subscription-first businesses command a significant premium and attract a much wider buyer pool.",
      buyers: "Larger media companies looking to add audience or content capabilities, tech platforms buying owned content, PE firms building media portfolios, and occasionally individual buyers or family offices. Creator-led brands sometimes sell to the creator themselves through a management buyout.",
      valuation: "Ad-supported digital media can sell for just 1 to 2x revenue because of the fragility of the model. Subscription-first businesses get 3 to 6x revenue or 10 to 15x EBITDA. The New York Times trades at a premium multiple because subscriptions are more than 60% of revenue and growing.",
      keyDrivers: [
        "Subscription percentage vs. advertising percentage: subscriptions are worth dramatically more",
        "Audience engagement depth vs. raw scale: 100K highly engaged readers is worth more than 1M passives",
        "Platform diversification: revenue spread across multiple channels is more defensible",
        "Whether the brand is tied to one creator or is a true institutional voice",
        "Email list size and direct audience relationships the buyer inherits",
      ],
    },
  },
  {
    id: "saas",
    name: "SaaS Company",
    emoji: "💻",
    tagline: "You build software once and charge customers to use it every month.",
    breakdown: [
      { label: "R&D / Engineering", pct: 28, color: C.a },
      { label: "Sales & Marketing", pct: 30, color: C.b },
      { label: "G&A", pct: 12, color: C.c },
      { label: "Cost of Revenue", pct: 10, color: C.d },
      { label: "Profit", pct: 20, color: C.profit },
    ],
    keyTerms: [
      { term: "ARR (Annual Recurring Revenue)", definition: "The annualized value of all active subscriptions. ARR is the core metric investors and buyers use to size a SaaS business. Growing ARR fast while keeping churn low is the primary job of every SaaS CEO." },
      { term: "Churn Rate", definition: "The percentage of customers or revenue lost each month. A 2% monthly churn means you lose about 22% of your customer base every year. Churn is the biggest silent killer in SaaS." },
      { term: "NRR (Net Revenue Retention)", definition: "How much revenue you retain from existing customers after accounting for upgrades, downgrades, and cancellations. Above 100% means your existing base is growing even without new sales. Best-in-class SaaS companies hit 120%+." },
      { term: "CAC Payback Period", definition: "How many months it takes to recover the cost of acquiring a customer from that customer's gross profit. Under 12 months is good. Above 24 months means you are funding customers you will not profit from for two years." },
      { term: "Rule of 40", definition: "Revenue growth rate plus profit margin should equal 40 or higher. A company growing 50% with -10% margins scores 40. A company growing 10% with 30% margins also scores 40. Both are considered healthy by most investors." },
    ],
    howYouMakeMoney: "Customers pay a monthly or annual fee to access your software. The economics are powerful because once you build the product, delivering it to one more customer costs almost nothing. Every dollar of ARR you retain flows almost entirely to the bottom line, which is why churn is everything.",
    biggestCosts: [
      "Engineering and product salaries (the biggest by far)",
      "Sales and marketing spend to acquire customers",
      "Cloud infrastructure (AWS, Google Cloud, Azure)",
      "Customer success and support to reduce churn",
    ],
    howYouGetCustomers: "Outbound sales (your sales team reaches out directly), inbound content marketing (you rank on Google for the problem your software solves), product-led growth (users sign up free before upgrading), and partnerships. Enterprise SaaS is almost always outbound. SMB SaaS often works best product-led.",
    flywheel: "More customers fund more engineering, which improves the product, which reduces churn and drives upgrades, which funds even more engineering. At scale, customer success stories become case studies that bring in new customers without ad spend. The best SaaS businesses get cheaper to sell as they get bigger.",
    pros: [
      "Recurring revenue: you do not start each month from zero",
      "Gross margins of 70 to 90% once you hit scale",
      "Extremely scalable: one more customer costs almost nothing marginal",
      "Predictable cash flow makes planning and hiring easier",
    ],
    cons: [
      "Expensive to build and slow to monetize early on",
      "Customer success and churn management are ongoing forever",
      "Requires technical talent that is expensive and hard to hire",
      "Enterprise sales cycles can take 6 to 18 months",
    ],
    goodFor: "Technical founders or people who partner closely with technical talent. The best SaaS entrepreneurs are obsessed with solving a specific, painful problem for a specific type of customer. Patience is essential: it typically takes 2 to 4 years to reach meaningful ARR.",
    examples: [
      {
        name: "Salesforce",
        stat: "$34.9B revenue, 75.8% subscription gross margin, $4.8B operating income (FY2024)",
        summary: "Salesforce invented modern B2B SaaS. Its 75%+ subscription gross margins show what the model looks like at scale: once the platform is built, each additional seat costs almost nothing to deliver. Operating income reached $4.8B in FY2024 after years of heavy investment in growth.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=CRM&type=10-K",
        urlLabel: "Salesforce 10-K (SEC EDGAR)",
      },
      {
        name: "HubSpot",
        stat: "$2.17B revenue, 84.3% subscription gross margin, $361M non-GAAP operating income (2023)",
        summary: "HubSpot's 84% subscription gross margin shows what best-in-class SaaS unit economics look like. The company was unprofitable on a GAAP basis as it continued investing in growth, but non-GAAP operating income of $361M shows the real cash-generating power of the model.",
        url: "https://ir.hubspot.com/financial-information/press-releases",
        urlLabel: "HubSpot Investor Relations",
      },
      {
        name: "Zoom Video",
        stat: "$4.39B revenue, 75.9% gross margin, $1.41B operating income (FY2024)",
        summary: "Zoom grew from $623M in FY2020 to $4.4B in FY2024, one of the fastest revenue ramps in software history, driven by the pandemic. Its 75.9% gross margin and $1.41B operating income in FY2024 show what a mature SaaS P&L looks like once the sales investment settles.",
        url: "https://investors.zoom.us/financial-information/press-releases",
        urlLabel: "Zoom Investor Relations",
      },
    ],
    selling: {
      overview: "SaaS is the most actively acquired technology category in M&A. Buyers range from strategic acquirers (companies buying a complementary product) to PE firms running software roll-ups. Most deals are structured around ARR and NRR rather than traditional EBITDA multiples, because the value is the recurring revenue base.",
      buyers: "Strategic tech companies (Salesforce, Microsoft, Alphabet buy dozens of SaaS companies per year), PE firms with dedicated software platforms (Thoma Bravo, Vista Equity, Francisco Partners), and larger SaaS companies buying adjacent tools to bundle into their platform.",
      valuation: "SaaS companies with high growth (40%+) and strong retention (NRR above 110%) can sell for 8 to 15x ARR. Slower-growing but profitable businesses trade at 4 to 7x ARR. PE buyers typically target 3 to 5x ARR for businesses they plan to optimize and resell. Churn is the most common reason a deal is repriced.",
      keyDrivers: [
        "NRR above 110%: existing customers spending more over time is the clearest signal of product-market fit",
        "Customer concentration: one customer over 15% of ARR makes buyers nervous",
        "Logo churn vs. revenue churn: losing large customers hurts far more than losing small ones",
        "Contract length and renewal timing: multi-year contracts reduce risk significantly",
        "Quality of the engineering team: buyers often value the talent as much as the product",
      ],
    },
  },
  {
    id: "rental-property",
    name: "Rental Property",
    emoji: "🏠",
    tagline: "You own a property, rent it out, and let tenants pay down your mortgage.",
    breakdown: [
      { label: "Mortgage & Debt Service", pct: 40, color: C.a },
      { label: "Property Taxes", pct: 12, color: C.b },
      { label: "Maintenance & Repairs", pct: 8, color: C.c },
      { label: "Insurance & Management", pct: 5, color: C.d },
      { label: "Profit / Equity Build", pct: 35, color: C.profit },
    ],
    keyTerms: [
      { term: "Cap Rate", definition: "Net Operating Income divided by property value. A 6% cap rate on a $500K property means it generates $30K per year in NOI before debt service. Cap rate is how real estate investors compare properties the way stock investors use P/E ratios." },
      { term: "NOI (Net Operating Income)", definition: "Gross rent minus operating expenses, before debt service. NOI is the cleanest measure of a property's earning power, independent of how it was financed." },
      { term: "Cash-on-Cash Return", definition: "Annual cash flow divided by the total cash you invested. If you put $100K down and collect $8K per year after all expenses and mortgage payments, your cash-on-cash return is 8%." },
      { term: "DSCR (Debt Service Coverage Ratio)", definition: "NOI divided by annual mortgage payments. Lenders want this above 1.25, meaning the property earns 25% more than its debt payments. Banks use this to decide whether to lend." },
      { term: "Vacancy Rate", definition: "Percentage of units not generating rent. A 5% vacancy rate is normal in most markets. Above 10% usually signals a pricing or condition problem." },
    ],
    howYouMakeMoney: "Tenants pay rent every month. Ideally that rent covers the mortgage, taxes, insurance, and maintenance, and leaves you with cash flow. The real wealth creation is the appreciation of the property over time plus the mortgage principal your tenants are effectively paying down for you.",
    biggestCosts: [
      "Mortgage payments (the biggest by far if leveraged)",
      "Property taxes (set by local government, not negotiable)",
      "Maintenance and repairs (budget 1 to 2% of property value per year)",
      "Property management fees if you hire a manager (typically 8 to 10% of rent)",
    ],
    howYouGetCustomers: "Zillow, Apartments.com, and Craigslist listings. Word of mouth and referrals from current tenants. Location does most of the work: a well-priced unit in a good area fills fast. A great property manager handles leasing for you if you want passive income.",
    flywheel: "More equity builds over time as the mortgage is paid down and the property appreciates. That equity can be borrowed against to buy the next property. Each property generates rent that pays its own debt and builds more equity. This is the classic wealth compounding loop of real estate.",
    pros: [
      "Tenants pay down your mortgage with their rent",
      "Real estate appreciates over time in most markets",
      "Tax advantages: depreciation lets you shelter income on paper",
      "Leverage: you can control a $500K asset with $100K down",
    ],
    cons: [
      "Illiquid: you cannot sell a piece of your property in a day",
      "Tenants, maintenance, and vacancies require active management",
      "Interest rate risk: rising rates compress returns and slam valuations",
      "One bad tenant or a broken roof can wipe out a year of cash flow",
    ],
    goodFor: "Patient, detail-oriented people who understand math and are comfortable with illiquidity. The best landlords treat it like a business: they screen tenants carefully, respond to maintenance promptly, and track every expense.",
    examples: [
      {
        name: "AvalonBay Communities",
        stat: "$2.75B revenue, 65.4% NOI margin, $1.50B NOI (2023)",
        summary: "AvalonBay owns 88,000+ apartment homes across the US and shows residential rental at institutional scale. Its 65% NOI margin means most of every rent dollar flows through to operating profit before debt service. The catch is massive upfront capital to get there.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AVB&type=10-K",
        urlLabel: "AvalonBay 10-K (SEC EDGAR)",
      },
      {
        name: "Invitation Homes",
        stat: "$2.33B revenue, 68% core NOI margin, $290M net income (2023)",
        summary: "Invitation Homes owns 80,000+ single-family rental homes across the Sun Belt and is the public benchmark for the single-family rental model. Its 68% NOI margin is possible because single-family homes carry less overhead per unit than apartment complexes.",
        url: "https://ir.invitationhomes.com/news-releases",
        urlLabel: "Invitation Homes Investor Relations",
      },
      {
        name: "American Homes 4 Rent",
        stat: "$1.50B revenue, 62.5% core NOI margin, 58,000+ homes (2023)",
        summary: "AMH runs a similar single-family rental playbook as Invitation Homes. Together these two REITs illustrate how even large corporate landlords operate at 60 to 70% NOI margins, leaving 30 to 40% of rents covering debt, management, and capital expenditures.",
        url: "https://ir.americanhomes4rent.com/news-releases",
        urlLabel: "American Homes 4 Rent Investor Relations",
      },
    ],
    selling: {
      overview: "Residential rental properties are among the most liquid real estate assets because the buyer pool is enormous: other landlords, first-time homebuyers, flippers, and institutions all compete. Most transactions happen through real estate agents. Commercial residential properties (multifamily) go through commercial brokers.",
      buyers: "Individual landlords and real estate investors, institutional buyers like Invitation Homes for single-family, multifamily syndicates and REITs for apartment buildings, and 1031 exchange buyers who need to reinvest proceeds from another sale without triggering capital gains tax.",
      valuation: "Residential investment properties are valued on cap rate (NOI divided by purchase price), comparable sales, and gross rent multiplier. A typical single-family rental in a growing market might sell at a 4 to 6% cap rate. Multifamily trades at 4.5 to 6.5% cap rates depending on market and quality.",
      keyDrivers: [
        "Location: the single biggest driver of value and appreciation trajectory",
        "Vacancy rate and lease terms at time of sale",
        "Age and condition of major systems (roof, HVAC, plumbing)",
        "Rent growth potential: how far below market are current rents",
        "Local supply/demand dynamics and rent control regulation",
      ],
    },
  },
  {
    id: "staffing",
    name: "Staffing Agency",
    emoji: "👥",
    tagline: "You match people to jobs and take a cut of their wages.",
    breakdown: [
      { label: "Contractor Wages", pct: 65, color: C.a },
      { label: "Recruiter Salaries", pct: 12, color: C.b },
      { label: "Benefits & Payroll Tax", pct: 8, color: C.c },
      { label: "Overhead & Admin", pct: 5, color: C.d },
      { label: "Profit", pct: 10, color: C.profit },
    ],
    keyTerms: [
      { term: "Bill Rate", definition: "What you charge the client company per hour for a placed worker. If you bill $50 per hour for a contractor, that is your bill rate." },
      { term: "Pay Rate", definition: "What you actually pay the worker per hour. If you pay $38 and bill $50, your $12 spread is your gross profit per hour." },
      { term: "Spread / Gross Margin", definition: "The difference between bill rate and pay rate, expressed as a dollar amount or percentage. Most temporary staffing operates on a 20 to 40% gross margin. Specialty staffing commands the higher end." },
      { term: "Fill Rate", definition: "The percentage of job openings you successfully fill with a qualified candidate. A high fill rate is your core proof of value to clients." },
      { term: "Temp-to-Perm", definition: "A placement that starts temporary and converts to a permanent hire. Clients pay a conversion fee, typically 10 to 20% of annual salary, when they hire the temp directly." },
    ],
    howYouMakeMoney: "You put people to work and charge their employers more than you pay the workers. The spread is your gross profit. For contract staffing, you might bill $50 per hour and pay the worker $38, keeping $12. For direct placements, you charge a one-time fee of 15 to 25% of the placed employee's first-year salary.",
    biggestCosts: [
      "Contractor wages (60 to 70% of revenue, by far the biggest)",
      "Benefits and payroll taxes on contractors you employ",
      "Recruiter salaries and commissions",
      "Applicant tracking software and job posting fees",
    ],
    howYouGetCustomers: "Cold outreach to HR departments and hiring managers. Referrals from placed candidates and satisfied clients. Trade shows in your specialty. The best staffing agencies specialize (tech, healthcare, finance) because deep niche expertise commands higher bill rates.",
    flywheel: "Successful placements build trust with clients, who give you more exclusive job orders. More placements build a larger candidate database, which means you fill roles faster, which makes clients trust you more. Strong recruiters attract other strong recruiters, which compounds placement capacity over time.",
    pros: [
      "Low startup capital: you can begin with a phone, a laptop, and a niche",
      "Recurring revenue from clients with ongoing hiring needs",
      "Scales with headcount: as you hire more recruiters, you fill more roles",
      "Demand is countercyclical in some sectors during uncertainty",
    ],
    cons: [
      "Very cyclical: hiring freezes in recessions cut revenue fast",
      "Thin margins: 10 to 15% net margin is typical",
      "Talent-dependent: losing one great recruiter can cost real revenue",
      "High competition and commoditization in non-specialized segments",
    ],
    goodFor: "High-energy relationship builders who are comfortable with rejection and motivated by results. Great staffing entrepreneurs love people, move fast, and are obsessive about their niche. Specialization is the path to better margins and stickier client relationships.",
    examples: [
      {
        name: "Robert Half International",
        stat: "$6.31B revenue, 40.5% gross margin, $487M operating income (2023)",
        summary: "Robert Half is the public benchmark for professional staffing. Its 40% gross margin is on the high end of the industry because it specializes in skilled professional roles (accounting, finance, tech), where bill rates are higher and the spread per hour is wider than general temp work.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=RHI&type=10-K",
        urlLabel: "Robert Half 10-K (SEC EDGAR)",
      },
      {
        name: "ManpowerGroup",
        stat: "$18.9B revenue, 18.0% gross margin, $351M operating income (2023)",
        summary: "ManpowerGroup shows what large-scale generalist staffing looks like: enormous revenue but thin 18% gross margins because most placements are in lower-skilled roles where bill rates are competitive. Even at $19B in revenue, operating margins are in the low single digits.",
        url: "https://ir.manpowergroup.com/financial-information/press-releases",
        urlLabel: "ManpowerGroup Investor Relations",
      },
      {
        name: "Kforce Inc.",
        stat: "$1.43B revenue, 29.6% gross margin, $68M operating income (2023)",
        summary: "Kforce focuses on technology and finance staffing, which is why its gross margin of 29.6% sits between generalist firms (18%) and pure professional firms like Robert Half (40%). Specialization is the lever that expands margins in staffing.",
        url: "https://ir.kforce.com/financial-information/press-releases",
        urlLabel: "Kforce Investor Relations",
      },
    ],
    selling: {
      overview: "Staffing agencies sell through M&A processes run by investment banks or business brokers. The buyer universe is large because larger staffing firms constantly acquire smaller ones to add geography, specialty, or recruiter headcount. Strategic buyers dominate, though PE-backed staffing roll-ups are active too.",
      buyers: "Larger staffing firms executing roll-up acquisitions, PE firms building specialty staffing platforms, and tech companies buying staffing businesses to add a human-services layer to their software.",
      valuation: "Staffing companies typically trade at 5 to 8x EBITDA, with specialty firms commanding the upper end. Higher gross margins and niche specialization push multiples up. Businesses with heavy reliance on a few large clients sell at a discount because of concentration risk.",
      keyDrivers: [
        "Gross margin: specialty staffing at 35%+ is worth much more than generalist at 18%",
        "Client concentration: one client over 20% of revenue is a red flag for buyers",
        "Recruiter retention: if top billers walk at close, the deal falls apart",
        "Niche expertise and defensibility: deep specialization creates a real moat",
        "Mix of contract (recurring) vs. direct placement (one-time) revenue",
      ],
    },
  },
  {
    id: "car-dealership",
    name: "Car Dealership",
    emoji: "🚗",
    tagline: "You buy cars from manufacturers and sell them at a markup, plus everything around the car.",
    breakdown: [
      { label: "Vehicle Cost (COGS)", pct: 82, color: C.a },
      { label: "Staff & Commissions", pct: 8, color: C.b },
      { label: "Facility & Ops", pct: 4, color: C.c },
      { label: "Advertising", pct: 2, color: C.d },
      { label: "Profit", pct: 4, color: C.profit },
    ],
    keyTerms: [
      { term: "Front-End Gross", definition: "The profit on the vehicle sale itself, before finance and insurance add-ons. Front-end gross has been shrinking for years as internet pricing has made it harder to markup new cars significantly." },
      { term: "Back-End Gross (F&I)", definition: "Profit from Finance and Insurance products sold after the vehicle deal: extended warranties, GAP insurance, credit life insurance. F&I is often more profitable per vehicle than the vehicle sale itself." },
      { term: "Floor Plan Financing", definition: "The credit line dealers use to finance their inventory. A dealer does not own their inventory outright: they borrow from a bank to stock the lot and pay interest until each car sells." },
      { term: "Dealer Invoice Price", definition: "What the dealer actually paid the manufacturer for the vehicle, before holdback. This is publicly available on sites like Edmunds, which is why front-end margins are thin on new cars." },
      { term: "Holdback", definition: "A percentage of MSRP (typically 2 to 3%) that the manufacturer pays back to the dealer after the vehicle sells. Holdback is invisible to customers but meaningful to dealership profitability." },
    ],
    howYouMakeMoney: "Four profit centers: new vehicle sales (thin margins, 1 to 3%), used vehicle sales (better margins, 5 to 10%), the service and parts department (highest margin at 40 to 50%+), and finance and insurance. Most dealership profit actually comes from service and F&I, not car sales.",
    biggestCosts: [
      "Cost of vehicles (82 to 85% of new car revenue goes back to the manufacturer)",
      "Floor plan interest on unsold inventory",
      "Staff: salespeople on commission, service technicians, F&I managers",
      "Facility costs: lot space, showroom, service bays",
    ],
    howYouGetCustomers: "Online listings (Cars.com, AutoTrader, dealer websites), manufacturer national advertising, service retention (bringing back car buyers for oil changes), and reputation from previous customers. Dealerships in good locations with strong franchise brands need less active marketing.",
    flywheel: "Sell a car, then win the service business for the life of that car. A loyal service customer comes back 4 to 5 times per year at 40%+ margins, far better than the original sale. Satisfied service customers buy their next car from the same dealer. Service is both the most profitable department and the best retention tool.",
    pros: [
      "Manufacturer floor plan makes inventory financing accessible",
      "Multiple profit centers: sales, service, parts, and F&I diversify revenue",
      "Service revenue is recurring and grows as the vehicle fleet ages",
      "Strong franchise brands drive predictable foot traffic",
    ],
    cons: [
      "Extremely capital-intensive: you are financing a lot full of cars",
      "Margin pressure on new vehicles has been relentless for decades",
      "Manufacturer relationship risk: OEMs can add requirements or pull franchises",
      "EV transition is disrupting the service revenue model for legacy dealers",
    ],
    goodFor: "Sales-driven, relationship-oriented operators who can manage complexity across multiple profit centers. The best dealers obsess over service retention. Understanding financing, insurance products, and manufacturer incentive programs is essential.",
    examples: [
      {
        name: "AutoNation",
        stat: "$26.9B revenue, 16.5% gross margin, $1.01B net income (2023)",
        summary: "AutoNation is the largest US auto retailer with over 300 locations. Its 16.5% blended gross margin is driven largely by F&I and service, since the new vehicle segment contributes only 2 to 3% gross margin. The $1B net income shows what strong service and F&I operations can do at scale.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AN&type=10-K",
        urlLabel: "AutoNation 10-K (SEC EDGAR)",
      },
      {
        name: "Lithia Motors",
        stat: "$34.3B revenue, 15.4% gross margin, $1.14B net income (2023)",
        summary: "Lithia has grown from a single Oregon dealership in 1946 to a $34B revenue group through aggressive acquisition. Its strategy of buying rural and suburban dealerships with lower competition, then optimizing F&I and service, has consistently delivered strong returns.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=LAD&type=10-K",
        urlLabel: "Lithia Motors 10-K (SEC EDGAR)",
      },
      {
        name: "Penske Automotive Group",
        stat: "$29.6B revenue, 15.8% gross margin, $1.53B net income (2023)",
        summary: "Penske shows how geographic diversification (US and UK operations) and a focus on luxury and premium brands (higher F&I and service margins) can drive net income above 5% on a volume dealership model, which is exceptional for this industry.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=PAG&type=10-K",
        urlLabel: "Penske Automotive 10-K (SEC EDGAR)",
      },
    ],
    selling: {
      overview: "Dealerships sell through specialized auto retail M&A advisors. The manufacturer must approve any ownership transfer and can block sales to unapproved buyers. Sellers typically engage advisors 12 to 24 months before a planned sale to get the business in the best shape for buyers.",
      buyers: "Publicly traded dealer groups (AutoNation, Lithia, Penske, Group 1) run aggressive acquisition programs. Private PE-backed groups and successful independent operators looking to expand are also active buyers. Family succession is common when the next generation is ready.",
      valuation: "Dealerships are valued at a multiple of earnings (EBITDA) plus adjusted book value of inventory and real estate. Blue chip franchise dealerships (Toyota, Honda, Mercedes) sell at 3 to 5x EBITDA plus real estate. Weaker franchise brands trade at lower multiples. Real estate often represents 30 to 50% of total transaction value.",
      keyDrivers: [
        "Franchise brand: Toyota and Honda dealerships command significant premiums over weaker brands",
        "Real estate ownership: owning vs. leasing the property matters enormously to buyers",
        "Service department profitability and customer retention rate",
        "F&I penetration and profit per vehicle retailed",
        "Market demographics and competition in the dealership's trade area",
      ],
    },
  },
  {
    id: "construction",
    name: "Homebuilder",
    emoji: "🏗️",
    tagline: "You buy land, build homes, and sell them. The margin is in the execution.",
    breakdown: [
      { label: "Construction Costs", pct: 58, color: C.a },
      { label: "Land & Lots", pct: 18, color: C.b },
      { label: "S&A Expenses", pct: 9, color: C.c },
      { label: "Other Ops", pct: 5, color: C.d },
      { label: "Profit", pct: 10, color: C.profit },
    ],
    keyTerms: [
      { term: "Spec Build", definition: "Building a home before a buyer is identified, betting you will sell it when complete. Spec builds are riskier but faster to sell. Most builders mix presales and specs to balance risk and volume." },
      { term: "Contract Backlog", definition: "Homes sold but not yet delivered. Backlog is the clearest forward revenue indicator for a homebuilder. A large backlog means predictable future revenue and is the primary metric buyers use to forecast earnings." },
      { term: "Absorption Rate", definition: "How many homes are sold per community per month. A 3-per-month rate means your 30-home community sells out in 10 months. Low absorption signals a pricing or product mismatch." },
      { term: "Gross Margin on Homes", definition: "Home sale revenue minus land cost and construction cost. Public homebuilders target 20 to 30%. Below 15% means the business is barely covering overhead." },
      { term: "Lot Pipeline", definition: "The land under control (owned or optioned) that will become future communities. A strong lot pipeline is proof the company can sustain its growth rate. Running out of lots is the most common growth constraint." },
    ],
    howYouMakeMoney: "You buy or option land, entitle it (get permits), build homes, and sell them at a markup over total cost. A home that costs $350K in land and construction might sell for $450K, generating $100K in gross profit. The challenge is speed and execution: carrying half-built homes costs capital, and markets can shift before you finish.",
    biggestCosts: [
      "Construction costs: framing, trades, materials (55 to 65% of price)",
      "Land and lot acquisition",
      "Permits, entitlement, and infrastructure",
      "Selling, general, and administrative expenses",
    ],
    howYouGetCustomers: "Model homes in planned communities drive most traffic. Real estate agents bring buyers and earn a co-op commission (typically 2 to 3%). Online listings on Zillow and Realtor.com. Referrals from past buyers. The product is visible on the jobsite, so marketing spend is relatively modest compared to other businesses.",
    flywheel: "Building more homes generates capital to buy more land, which enables more communities, which builds brand recognition with buyers and subcontractors. Scale lets you negotiate better material prices and attract top trade partners who prefer consistent volume.",
    pros: [
      "Enormous market: US housing demand is structurally under-supplied",
      "Strong unit economics when margins are maintained",
      "Land optioning lets you control lots without full upfront capital",
      "Housing will always exist as a business",
    ],
    cons: [
      "Deeply cyclical: interest rates can cut demand in half quickly",
      "Capital-intensive: lots of cash tied up in land and work-in-progress",
      "Dependent on subcontractor availability (labor shortages kill timelines)",
      "Regulatory hurdles: entitlement can take years in many markets",
    ],
    goodFor: "Operationally disciplined people who can manage complex projects, suppliers, and timelines. The best builders think in systems: standardized plans, reliable subcontractors, and tight cost controls. Patience through market cycles is non-negotiable.",
    examples: [
      {
        name: "D.R. Horton",
        stat: "$35.5B revenue, 21.9% gross margin, $4.78B net income (FY2023)",
        summary: "D.R. Horton is the largest US homebuilder by volume. Its focus on affordable entry-level homes gives it the broadest demand base, and its 21.9% gross margin in FY2023 shows strong execution even with elevated interest rates. Net income of $4.78B on $35.5B revenue is impressive for a capital-intensive business.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=DHI&type=10-K",
        urlLabel: "D.R. Horton 10-K (SEC EDGAR)",
      },
      {
        name: "Lennar Corporation",
        stat: "$34.2B revenue, 23.4% gross margin, $3.94B net income (FY2023)",
        summary: "Lennar is the second-largest US homebuilder and follows a land-light strategy of optioning land rather than owning it outright, which reduces capital intensity. Its 23.4% gross margin and diversified product mix from entry-level to luxury gives it resilience across interest rate environments.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=LEN&type=10-K",
        urlLabel: "Lennar 10-K (SEC EDGAR)",
      },
      {
        name: "PulteGroup",
        stat: "$15.9B revenue, 29.3% gross margin, $2.63B net income (2023)",
        summary: "PulteGroup targets first-time buyers, move-up buyers, and active adults, giving it three distinct demand pools. Its 29.3% gross margin is among the best in the industry, driven by a disciplined land strategy and focus on communities where it has real pricing power.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=PHM&type=10-K",
        urlLabel: "PulteGroup 10-K (SEC EDGAR)",
      },
    ],
    selling: {
      overview: "Most homebuilding businesses sell through M&A processes handled by investment banks or real estate M&A advisors. The primary assets are the lot pipeline, brand relationships, and community backlog. Strategic acquirers (other homebuilders) are the dominant buyers because they can immediately activate the land pipeline.",
      buyers: "Larger homebuilders looking to enter new markets or acquire backlog, PE firms building regional builders into national platforms, and family succession. Acquisitions of smaller private builders happen constantly as the industry consolidates.",
      valuation: "Public homebuilders trade at 1 to 1.5x book value during normal cycles. Private builders typically sell for 5 to 8x EBITDA, with the lot pipeline valued separately. Land under control is often the biggest variable in total transaction value.",
      keyDrivers: [
        "Size and quality of the lot pipeline: the biggest driver of deal value",
        "Geographic markets: high-growth Sun Belt markets command premiums over stagnant markets",
        "Backlog at time of sale: strong contracted backlog de-risks future earnings for buyers",
        "Local entitlement expertise and subcontractor relationships",
        "Management depth: can the business run without the founder",
      ],
    },
  },
  {
    id: "gym",
    name: "Gym / Fitness Studio",
    emoji: "💪",
    tagline: "People pay monthly to use your space and equipment, often regardless of whether they show up.",
    breakdown: [
      { label: "Staff & Trainers", pct: 35, color: C.a },
      { label: "Rent & Facilities", pct: 25, color: C.b },
      { label: "Equipment & Maintenance", pct: 10, color: C.c },
      { label: "Marketing", pct: 10, color: C.d },
      { label: "Profit", pct: 20, color: C.profit },
    ],
    keyTerms: [
      { term: "Attrition / Churn Rate", definition: "The percentage of members who cancel each month. Most gyms lose 3 to 5% of members monthly. The entire gym business model depends on signing up members faster than they cancel." },
      { term: "EFT (Electronic Funds Transfer)", definition: "Automated monthly billing that pulls dues from members' accounts. EFT revenue is the backbone of gym economics: predictable, recurring, and the foundation of the business model." },
      { term: "Dues Revenue", definition: "Monthly membership fee income. This is the core recurring revenue line. Personal training, retail, and guest fees sit on top as secondary income streams." },
      { term: "Personal Training Revenue", definition: "Revenue from one-on-one coaching sessions. PT is typically 10 to 30% of total gym revenue and carries much higher margins because trainers are paid per session, not salaried." },
      { term: "Member Retention Rate", definition: "The inverse of churn: what percentage of members stay month-to-month. Above 90% monthly retention (below 10% monthly churn) is considered excellent." },
    ],
    howYouMakeMoney: "Monthly membership dues paid automatically. A basic gym might charge $30 to $60 per month. A premium boutique studio might charge $200+. On top of dues: personal training, retail, guest passes, class packs, and corporate memberships. Many members pay but do not show up, which means your actual capacity can be far lower than your membership count.",
    biggestCosts: [
      "Rent (often 20 to 30% of revenue, non-negotiable once you sign a long lease)",
      "Staff: front desk, trainers, group fitness instructors",
      "Equipment purchase and maintenance",
      "Marketing to continuously replace churning members",
    ],
    howYouGetCustomers: "January is the biggest month: everyone signs up after New Year's. Beyond that: referral programs (current members bringing friends), local advertising, social media, influencer partnerships for boutique studios, and proximity (people go to the gym closest to their home or office).",
    flywheel: "More members fund better equipment and facilities, which improves the member experience, which reduces churn and drives referrals, which brings in more members. Boutique studios specifically use social pressure and community-building to dramatically improve retention over traditional gyms.",
    pros: [
      "Recurring monthly revenue that comes in automatically",
      "High capacity utilization: many members pay but show up rarely",
      "Multiple revenue streams: dues, PT, retail, corporate",
      "Strong community can create very sticky retention",
    ],
    cons: [
      "High fixed cost base: rent and equipment do not flex with membership swings",
      "January-heavy revenue with summer and holiday slowdowns",
      "High churn: most gyms replace most of their membership each year",
      "Market saturation in many metropolitan areas",
    ],
    goodFor: "People who are genuinely passionate about fitness and hospitality. The best gym operators are obsessed with member experience: clean facilities, motivated staff, and programming that produces real results.",
    examples: [
      {
        name: "Planet Fitness",
        stat: "$1.07B revenue, 63.5% gross margin, $127.3M net income (2023)",
        summary: "Planet Fitness runs the most successful low-cost gym model in history. At $10 per month for most memberships, volume is everything: its 2,400+ locations averaged nearly $2M in system-wide dues revenue each. Its 63.5% gross margin is possible because of minimal staff, basic equipment, and no pools or group classes at most locations.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=PLNT&type=10-K",
        urlLabel: "Planet Fitness 10-K (SEC EDGAR)",
      },
      {
        name: "Life Time Group Holdings",
        stat: "$2.31B revenue, 47.1% gross margin, $74.1M net income (2023)",
        summary: "Life Time is the premium opposite of Planet Fitness: 5-star athletic country clubs with pools, spas, and premium amenities at $100 to $300+ per month. Its 47% gross margin shows that premium positioning can generate strong unit economics, though the real estate and capex requirements are enormous.",
        url: "https://ir.lt.life/news-releases/news-release-details",
        urlLabel: "Life Time Group Investor Relations",
      },
      {
        name: "Xponential Fitness",
        stat: "$296.4M revenue, 67.3% franchise segment gross margin (2023)",
        summary: "Xponential owns boutique studio brands including Club Pilates, CycleBar, and Row House. Its franchise model generates 67% gross margins on royalties and fees without owning the real estate risk. It shows how franchising a fitness concept, rather than operating studios directly, dramatically improves the economics.",
        url: "https://ir.xponential.com/news-releases",
        urlLabel: "Xponential Fitness Investor Relations",
      },
    ],
    selling: {
      overview: "Gym sales are handled through business brokers or M&A advisors depending on size. Small independent studios often sell privately. Multi-location operators typically work with middle-market advisors. The lease is the pivotal document: if the landlord will not transfer it, there is often no deal.",
      buyers: "Larger fitness operators and franchise groups looking for geographic expansion, PE firms building regional or national gym platforms, and individual operators buying their first or second location.",
      valuation: "Single-location gyms typically sell for 2 to 4x EBITDA. Multi-location groups with consistent operations and transferable leases can achieve 5 to 7x EBITDA. Boutique franchise-based gyms with proven systems trade at a premium over independent operations.",
      keyDrivers: [
        "Lease terms and landlord transferability: a short or difficult lease is often a deal killer",
        "Member count and monthly EFT revenue at time of sale",
        "Churn rate trend over the prior 12 months",
        "Quality and transferability of the trainer and staff team",
        "Proximity to residential density and competition within 1 mile",
      ],
    },
  },
  {
    id: "hotel",
    name: "Hotel",
    emoji: "🏨",
    tagline: "You rent the same room over and over again, every night.",
    breakdown: [
      { label: "Labor", pct: 33, color: C.a },
      { label: "Operating Expenses", pct: 25, color: C.b },
      { label: "Fixed Costs & Debt", pct: 18, color: C.c },
      { label: "OTA Commissions", pct: 10, color: C.d },
      { label: "Profit", pct: 14, color: C.profit },
    ],
    keyTerms: [
      { term: "RevPAR (Revenue Per Available Room)", definition: "Total room revenue divided by total available room nights. RevPAR is the single most important KPI in hospitality. It combines occupancy rate and average daily rate into one metric." },
      { term: "ADR (Average Daily Rate)", definition: "Average revenue per occupied room per night. ADR times occupancy rate equals RevPAR. Luxury hotels push ADR. Budget hotels push occupancy." },
      { term: "Occupancy Rate", definition: "Percentage of available rooms sold on a given night. Industry-wide occupancy typically runs 60 to 70%. During peak season or high-demand markets, properties can hit 90%+." },
      { term: "GOPPAR (Gross Operating Profit Per Available Room)", definition: "Total hotel profit from all revenue sources (rooms, F&B, spa, parking) divided by available rooms. A more complete measure than RevPAR because it includes all revenue streams and operating costs." },
      { term: "OTA Commission", definition: "The fee paid to Online Travel Agencies like Booking.com and Expedia for bookings they generate. OTA commissions typically run 15 to 25% of booking revenue, which is why hotels push hard for direct bookings." },
    ],
    howYouMakeMoney: "Room revenue is the core: guests pay per night. But full-service hotels make significant money from food and beverage, event space, parking, spa services, and resort fees. Economy hotels are almost purely room revenue. The highest-margin business in a hotel is a direct booking from a loyalty member, because no OTA commission is owed.",
    biggestCosts: [
      "Labor (housekeeping, front desk, food service, maintenance): 30 to 40% of revenue",
      "OTA commissions if third-party bookings are heavy",
      "Utilities, insurance, and property taxes",
      "Capital expenditure and brand-mandated property improvement plans",
    ],
    howYouGetCustomers: "Brand affiliation (Marriott, Hilton, IHG) brings loyalty program traffic. OTAs (Booking.com, Expedia) drive significant volume at a cost. Corporate contracts bring reliable business travelers. Direct website bookings via SEO and loyalty programs are the highest-margin channel and the one every hotel fights to grow.",
    flywheel: "Better reviews lead to higher search ranking on OTAs, which drives more bookings, which generates revenue to invest in property improvement, which drives better reviews. Loyalty programs create their own flywheel: stays earn points that motivate return stays, reducing acquisition cost over time.",
    pros: [
      "Rooms reset every night: if you have demand, you can raise rates dynamically",
      "Revenue diversification: rooms, F&B, events, and parking all compound",
      "Brand affiliation provides marketing and distribution you could not build alone",
      "Real estate appreciation on top of operating income",
    ],
    cons: [
      "Heavily capital-intensive to build and renovate",
      "OTA dependency is expensive and getting more expensive",
      "Extremely cyclical: recessions and pandemics can cut occupancy in half overnight",
      "Labor management is complex across many departments",
    ],
    goodFor: "Hospitality-obsessed operators who care deeply about guest experience. The best hotel operators track every detail: check-in times, cleanliness scores, TripAdvisor rankings. If you love creating memorable experiences and can manage complexity across many simultaneous guests, this is a great business.",
    examples: [
      {
        name: "Marriott International",
        stat: "$23.7B revenue, 37.4% adjusted EBITDA margin, $3.08B net income (2023)",
        summary: "Marriott operates 8,700+ properties worldwide under 30 brands, mostly under an asset-light management and franchise model. It manages hotels on behalf of owners and collects fees, which is why its margins are exceptional: 37%+ EBITDA without owning most of the real estate. RevPAR was a record $143 globally in 2023.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=MAR&type=10-K",
        urlLabel: "Marriott 10-K (SEC EDGAR)",
      },
      {
        name: "Hilton Worldwide",
        stat: "$10.2B revenue, 31.2% adjusted EBITDA margin, $1.14B net income (2023)",
        summary: "Hilton runs 7,530+ properties across 22 brands in 123 countries, almost entirely as an asset-light manager and franchisor. Its Hilton Honors loyalty program has 173M members, one of the most powerful direct booking engines in hospitality, reducing OTA dependency for its properties.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=HLT&type=10-K",
        urlLabel: "Hilton 10-K (SEC EDGAR)",
      },
      {
        name: "Host Hotels & Resorts",
        stat: "$5.58B revenue, 28.6% EBITDA margin, $1.35B net income (2023)",
        summary: "Host is the largest hotel REIT in the US and represents the opposite side of the asset-light model: it actually owns the real estate (100 luxury and upper-upscale hotels) and contracts with Marriott and Hyatt to manage them. RevPAR of $225 across its premium portfolio shows the power of location and brand in hotel economics.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=HST&type=10-K",
        urlLabel: "Host Hotels 10-K (SEC EDGAR)",
      },
    ],
    selling: {
      overview: "Hotel transactions are among the most complex real estate deals: you are selling both operating business value and real property. Most deals go through specialized hotel M&A brokers (CBRE Hotels, JLL Hotels). Branded properties must receive franchisor approval on the buyer, and sometimes a property improvement plan is required as a condition of sale.",
      buyers: "Hotel REITs, institutional real estate investors, PE firms with hospitality platforms, high-net-worth individual investors, and other hotel operators. Foreign capital is a significant buyer of US hotel assets.",
      valuation: "Hotels are valued on a per-key (per room) basis and as a multiple of EBITDA or NOI. A limited-service hotel might sell for $80K to $150K per key. A luxury urban hotel can exceed $500K to $1M per key. EBITDA multiples range from 10 to 18x for well-located, well-branded properties. RevPAR growth trajectory is the primary valuation driver.",
      keyDrivers: [
        "Location quality: downtown urban, resort destination, airport, or suburban",
        "Brand affiliation: Marriott and Hilton properties sell at premiums to independent hotels",
        "RevPAR trend vs. the competitive set (is the hotel gaining or losing market share)",
        "Age of the property and size of any upcoming capital expenditure or improvement plan",
        "Whether the hotel has food and beverage and event space (adds income and complexity)",
      ],
    },
  },
  {
    id: "insurance-brokerage",
    name: "Insurance Brokerage",
    emoji: "🛡️",
    tagline: "You help clients find and buy insurance, and the insurer pays you a commission.",
    breakdown: [
      { label: "Broker Salaries & Commissions", pct: 55, color: C.a },
      { label: "G&A & Technology", pct: 15, color: C.b },
      { label: "Marketing", pct: 10, color: C.c },
      { label: "Compliance & E&O Insurance", pct: 8, color: C.d },
      { label: "Profit", pct: 12, color: C.profit },
    ],
    keyTerms: [
      { term: "Commission Rate", definition: "The percentage of the insurance premium the carrier pays you for placing the business. Personal lines (home, auto) commissions run 5 to 15%. Commercial lines run 10 to 20%. Specialty lines can go higher." },
      { term: "Contingency Commission", definition: "A bonus payment from an insurance carrier based on your total book of business with them: volume, profitability, and growth. Contingencies can add 2 to 8% to revenue and are a major profit driver for larger agencies." },
      { term: "Retention Rate", definition: "The percentage of insurance policies you retain at renewal each year. A 90% retention rate means clients renew almost automatically, which is the hallmark of a strong book of business." },
      { term: "Book of Business", definition: "The total portfolio of insurance policies you manage. This is the core asset of a brokerage. When an agency sells, it sells its book of business at a multiple of its annual revenue." },
      { term: "E&O Insurance (Errors and Omissions)", definition: "Professional liability insurance protecting the agency if a client suffers a loss due to a placement mistake. E&O is mandatory in the industry and a fixed cost every agency carries." },
    ],
    howYouMakeMoney: "Insurance carriers pay you a commission every time a policy is placed or renewed. The client pays the premium, the carrier keeps the bulk, and you earn a percentage for placing the business and servicing the relationship. Renewals are the engine: a well-managed book renews at 90%+ without you having to resell. You build once, then collect annually.",
    biggestCosts: [
      "Broker and producer salaries and commissions (the biggest cost)",
      "G&A including technology, office, and compliance systems",
      "E&O insurance (mandatory professional liability)",
      "Marketing and lead generation to grow the book",
    ],
    howYouGetCustomers: "Referrals from existing clients and referral partners (accountants, lawyers, financial advisors). Outbound prospecting by producers to businesses in your target niche. The best brokerages specialize in an industry vertical (construction, healthcare, technology) and become the go-to expert in that space.",
    flywheel: "A larger book of business makes you a more important trading partner to carriers, which earns better commission terms and contingency bonuses. Better carrier relationships mean better coverage options for clients, which improves retention. Higher retention means lower replacement cost, which improves margins without new sales.",
    pros: [
      "Recurring revenue: renewals come in every year without reselling",
      "Relatively low capital requirements to start",
      "High client retention rates in specialized niches",
      "Carrier commission structures create leverage as your book grows",
    ],
    cons: [
      "Heavily regulated at the state level in the US",
      "Producer-dependent: key brokers leaving can take clients with them",
      "Commission compression as carriers and direct platforms compete",
      "Complex E&O exposure if a placement error leaves a client uninsured at the wrong moment",
    ],
    goodFor: "Relationship-driven people who enjoy complexity and are comfortable selling in a regulated environment. The best insurance brokers become deeply specialized in one industry and are seen as trusted advisors rather than salespeople. Long-term client focus is the core characteristic.",
    examples: [
      {
        name: "Marsh McLennan",
        stat: "$22.7B revenue, 25.2% adjusted operating margin, $3.09B net income (2023)",
        summary: "Marsh McLennan is the world's largest insurance brokerage and risk advisory firm. Its 25% operating margin on $22.7B in revenue shows what the model looks like at massive scale: a recurring commission stream from an enormous global book of business, with nearly all revenue recurring at renewal.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=MMC&type=10-K",
        urlLabel: "Marsh McLennan 10-K (SEC EDGAR)",
      },
      {
        name: "Aon PLC",
        stat: "$13.4B revenue, 28.8% operating margin, $2.99B net income (2023)",
        summary: "Aon competes with Marsh at the top of global commercial brokerage. Its 28.8% operating margin is slightly better because of its heavy mix of consulting and analytics revenue, which carries higher margins than pure brokerage. Together Marsh and Aon broker a meaningful share of all commercial insurance placed globally.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AON&type=10-K",
        urlLabel: "Aon 10-K (SEC EDGAR)",
      },
      {
        name: "Arthur J. Gallagher & Co.",
        stat: "$9.34B revenue, 18.7% EBITDA margin, $860M net income (2023)",
        summary: "Gallagher is the mid-market leader in brokerage, growing primarily through acquisitions of regional and specialty agencies. It shows how roll-up strategies work in insurance: acquire agencies with sticky books of business, retain the producers, and generate expanding contingency commissions as the combined book grows.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AJG&type=10-K",
        urlLabel: "Arthur J. Gallagher 10-K (SEC EDGAR)",
      },
    ],
    selling: {
      overview: "Insurance brokerages sell through specialized M&A advisors who know the industry. The core asset is the book of business. Most deals include earnout provisions tied to client retention post-close, because clients have the right to move their insurance to a different agency at renewal.",
      buyers: "Large brokers like Gallagher, Brown & Brown, Hub International, and Acrisure that are executing roll-up strategies. PE-backed platforms have been among the most aggressive acquirers in the past decade.",
      valuation: "Independent insurance agencies with strong retention typically sell for 1.5 to 2.5x revenue, or 8 to 12x EBITDA. Specialty and niche agencies with very high retention (92%+) and strong contingency commissions can reach 2.5 to 3.5x revenue. Earnout structures are common to align incentives around retention.",
      keyDrivers: [
        "Retention rate of the book: the closer to 95%, the higher the multiple",
        "Whether client relationships live with the agency or individual producers",
        "Mix of commercial vs. personal lines: commercial is more valuable and sticky",
        "Specialty niche expertise and carrier relationships",
        "Producer employment agreements: non-solicitation and non-compete terms matter enormously",
      ],
    },
  },
  {
    id: "consulting",
    name: "Management Consulting",
    emoji: "📊",
    tagline: "You help organizations solve hard problems and charge a lot to do it.",
    breakdown: [
      { label: "Consultant Salaries & Comp", pct: 60, color: C.a },
      { label: "Overhead & Admin", pct: 10, color: C.b },
      { label: "Travel & Expenses", pct: 8, color: C.c },
      { label: "Biz Dev", pct: 7, color: C.d },
      { label: "Profit", pct: 15, color: C.profit },
    ],
    keyTerms: [
      { term: "Engagement", definition: "A consulting project, defined by scope, deliverables, and timeline. An engagement might last 6 weeks or 2 years. Revenue is organized around engagements rather than clients, since one client might have multiple simultaneous projects." },
      { term: "Utilization Rate", definition: "The percentage of a consultant's time that is billable to clients. Target utilization at most firms is 75 to 85%. Non-billable time goes toward business development, training, and internal projects. Low utilization is the primary margin killer." },
      { term: "Revenue Per Consultant", definition: "Total revenue divided by total headcount. This is the efficiency metric for consulting. McKinsey and Bain generate over $500K per employee. Mid-market consulting firms typically run $200K to $400K." },
      { term: "Up-or-Out", definition: "The career model at major consulting firms: if you do not get promoted within a certain number of years, you leave. This structure maintains a pyramid of junior staff generating billable hours while relatively few partners manage clients." },
      { term: "Statement of Work (SOW)", definition: "The contract document defining scope, deliverables, timeline, and fees for an engagement. A well-written SOW protects both parties. Scope creep happens when the project expands beyond the SOW without adjusting the fee." },
    ],
    howYouMakeMoney: "Clients pay project fees or daily rates for consultants to work on their problems. A junior consultant bills at $3,000 to $5,000 per day. A senior partner's time might bill at $10,000 to $30,000 per day. A major strategy engagement at a top firm can run $1M to $10M+. The business scales by adding consultants who generate billing while the partner handles client relationships.",
    biggestCosts: [
      "Consultant compensation including salaries, bonuses, and benefits (55 to 65% of revenue)",
      "Travel and expenses (clients expect consultants on-site, and that is expensive)",
      "Overhead: office, IT, training, and knowledge management systems",
      "Business development: proposals, conferences, and relationship cultivation",
    ],
    howYouGetCustomers: "Reputation and relationships are everything. Work gets referred from one executive to another. Thought leadership (white papers, published research, conference speaking) builds credibility at scale. Junior consultants who move into industry often bring their former firm back for projects. The top firms spend heavily on recruiting from elite universities, because the people are the product.",
    flywheel: "Strong work leads to case studies and referrals, which bring in more clients. More clients fund better analyst programs, which attract stronger talent, which produces better work. Firm reputation compounds over decades. McKinsey's brand moat is over 100 years old.",
    pros: [
      "Very high billing rates for expertise clients cannot easily access otherwise",
      "Relatively low capital requirements: you are selling brains, not widgets",
      "Deep exposure to many industries builds generalist strategic value fast",
      "Exit opportunities are exceptional: alumni networks open many doors",
    ],
    cons: [
      "Extremely people-dependent: the product walks out the door every night",
      "Travel-heavy culture burns out consultants and increases turnover",
      "Hard to productize: each engagement tends to be custom",
      "Business development is expensive and slow-moving at the high end",
    ],
    goodFor: "Highly analytical, curious people who enjoy variety and can synthesize information quickly under pressure. The best consultants have strong structured thinking, communicate clearly to executives, and genuinely enjoy problem-solving in unfamiliar industries. It is one of the best training grounds for future business leaders.",
    examples: [
      {
        name: "Accenture",
        stat: "$64.1B revenue, 14.6% operating margin, $6.87B operating income (FY2023)",
        summary: "Accenture sits at the scale extreme of consulting, blending management consulting, technology services, and outsourcing. Its 14.6% operating margin on $64B in revenue is lower than pure strategy firms but higher than IT services companies, reflecting its hybrid positioning. It is the world's largest consulting firm by headcount.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=ACN&type=10-K",
        urlLabel: "Accenture 10-K (SEC EDGAR)",
      },
      {
        name: "Booz Allen Hamilton",
        stat: "$9.26B revenue, 8.8% adjusted EBITDA margin, $640M net income (FY2023)",
        summary: "Booz Allen focuses almost exclusively on government and defense consulting, which gives it predictable contract revenue but lower margins than commercial consulting. Over 95% of its revenue comes from US government clients, illustrating how a consulting firm can dominate a sector by going all-in on niche expertise.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=BAH&type=10-K",
        urlLabel: "Booz Allen Hamilton 10-K (SEC EDGAR)",
      },
      {
        name: "Huron Consulting Group",
        stat: "$1.41B revenue, 18.1% adjusted EBITDA margin, $100M net income (2023)",
        summary: "Huron is a mid-market consulting firm specializing in healthcare and education, two sectors with complex regulatory and financial challenges. Its 18% adjusted EBITDA margin shows what sector specialization can do: deeper expertise commands better rates and stronger retention than generalist work.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=HURN&type=10-K",
        urlLabel: "Huron Consulting 10-K (SEC EDGAR)",
      },
    ],
    selling: {
      overview: "Consulting firms rarely sell in a traditional sense. The typical exit is a merger with or acquisition by a larger consulting or professional services firm. The challenge is that the core asset is people: consulting relationships are personal and can walk out the door at close.",
      buyers: "Larger consulting firms buying specialization or sector depth. Tech companies (Accenture, IBM, Cognizant) acquiring consulting capabilities to bundle with technology services. PE firms have entered management consulting roll-ups with mixed success.",
      valuation: "Independent consulting firms typically sell for 0.5 to 1.5x revenue or 5 to 10x EBITDA, depending on specialization and client stickiness. Firms with government contracts are more valuable because contracts are transferable. Purely relationship-driven firms trade at steep discounts because of key-man risk.",
      keyDrivers: [
        "Key-man risk: how much of the business depends on one or two individuals",
        "Contractual vs. relationship-based revenue: contracts survive leadership changes, relationships often do not",
        "Sector specialization depth and brand recognition in the niche",
        "Team retention post-close: without retaining partners, there is nothing to buy",
        "Backlog and pipeline visibility at time of close",
      ],
    },
  },
  {
    id: "cpg",
    name: "CPG Brand",
    emoji: "🛒",
    tagline: "You make a product, get it on store shelves, and sell millions of units.",
    breakdown: [
      { label: "COGS (Materials & Mfg)", pct: 45, color: C.a },
      { label: "Marketing & Trade Spend", pct: 25, color: C.b },
      { label: "Distribution & Logistics", pct: 10, color: C.c },
      { label: "Admin & Overhead", pct: 8, color: C.d },
      { label: "Profit", pct: 12, color: C.profit },
    ],
    keyTerms: [
      { term: "Trade Spend", definition: "Money paid to retailers to secure shelf space, run promotions, and display your product. Trade spend typically runs 15 to 25% of gross revenue and is the biggest hidden cost for CPG brands. Every major retailer requires significant trade investment." },
      { term: "Velocity", definition: "How many units of your product sell per store per week. Retailers track velocity obsessively because slow-moving products get delisted. A new brand needs to demonstrate strong velocity to maintain shelf space and expand distribution." },
      { term: "Distribution Points", definition: "The number of store locations carrying your product. Each retailer and each SKU counts separately. Growing distribution (into more stores) and velocity (selling more per store) are the two levers of CPG revenue growth." },
      { term: "MSRP", definition: "Manufacturer's Suggested Retail Price. The consumer price you recommend. Price too high and velocity suffers; price too low and margins collapse. Pricing strategy is one of the most consequential decisions in CPG." },
      { term: "Slotting Fee", definition: "An upfront fee paid to a retailer for shelf space when a new product is introduced. Slotting fees can run thousands to tens of thousands of dollars per SKU per retailer, making retail distribution very expensive for small brands." },
    ],
    howYouMakeMoney: "You manufacture (or contract-manufacture) a product, sell it to retailers or distributors at wholesale, who mark it up and sell it to consumers. A bag of chips you sell to Walmart for $1.50 ends up on shelf for $2.99. Your revenue is the $1.50. The math works if your production cost plus trade spend plus overhead stays below $1.50.",
    biggestCosts: [
      "Cost of goods (ingredients, packaging, manufacturing, co-manufacturing fees)",
      "Trade spend to get and keep shelf space at retailers",
      "Distribution and logistics (getting product from factory to retail shelf)",
      "Marketing to drive consumer awareness and trial",
    ],
    howYouGetCustomers: "Two customers: retailers (who carry your product) and consumers (who buy it). Getting into retail requires calling on buyers, offering slotting fees and trade support, and demonstrating consumer demand. Building consumer demand requires sampling, social media, influencer marketing, and grassroots community building. The brands that win do both simultaneously.",
    flywheel: "Higher consumer demand drives better velocity in existing stores, which makes it easier to get into more stores, which increases total distribution, which funds more marketing to drive more demand. Scale gives you negotiating leverage with manufacturers to lower COGS, which improves margins, which funds more distribution expansion.",
    pros: [
      "Billions of potential consumers through retail distribution",
      "Brand equity compounds: a trusted brand is hard to displace on shelf",
      "Can be capital-light if you use contract manufacturing",
      "Potential for significant scale and strategic acquisition by large CPG companies",
    ],
    cons: [
      "Trade spend is relentless and expensive",
      "Retail relationships are power-asymmetric: Walmart can delist you overnight",
      "Velocity pressure means underperforming SKUs get cut quickly",
      "Working capital requirements are heavy: you pay for inventory before retailers pay you",
    ],
    goodFor: "Entrepreneurial people who understand both operations and brand-building. The best CPG founders obsess over the consumer, not just the product. You need patience to build retail relationships, discipline to manage trade spend, and creativity to build a brand that stands out on a crowded shelf.",
    examples: [
      {
        name: "Procter & Gamble",
        stat: "$84.0B revenue, 47.8% gross margin, $14.6B net income (FY2023)",
        summary: "P&G is the template for what CPG looks like at full maturity: 65 brands across personal care, household, and health products, with a 47.8% gross margin powered by brand pricing power that decades of investment have built. Its 17.4% net margin shows how efficiently a scaled CPG machine operates.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=PG&type=10-K",
        urlLabel: "P&G 10-K (SEC EDGAR)",
      },
      {
        name: "Celsius Holdings",
        stat: "$1.32B revenue, 51.1% gross margin, $269M net income (2023)",
        summary: "Celsius grew from $314M to $1.32B in revenue in a single year, one of the fastest CPG scaling stories in recent history. Its 51% gross margin on a beverage product is exceptional, achieved through premium positioning and a strategic distribution partnership with PepsiCo. It shows what the upside of a breakout CPG brand looks like.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=CELH&type=10-K",
        urlLabel: "Celsius Holdings 10-K (SEC EDGAR)",
      },
      {
        name: "Oatly Group",
        stat: "$793M revenue, 25.2% gross margin, -$121M net loss (2023)",
        summary: "Oatly created the oat milk category and IPO'd at a $10B valuation. But its 25% gross margin is far below what premium CPG should achieve, squeezed by high production costs and aggressive trade investment. It is a cautionary tale about the gap between brand love and financial performance.",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=OTLY&type=10-K",
        urlLabel: "Oatly 10-K (SEC EDGAR)",
      },
    ],
    selling: {
      overview: "CPG exits are typically strategic acquisitions by large CPG companies looking to buy growth and brand equity rather than build it. The acquirer buys the brand, the formulations, the retail relationships, and the consumer loyalty. Deals under $50M often involve M&A advisors or direct outreach. Larger deals involve investment banks.",
      buyers: "Major CPG companies (P&G, Unilever, Nestle, General Mills, PepsiCo) that run brand acquisition programs. PE firms building CPG brand portfolios. Strategic roll-ups in specific categories. Individual operators looking to buy established brands.",
      valuation: "Growing CPG brands with distribution momentum typically sell for 2 to 5x revenue. Profitable brands with strong margins and retail relationships can achieve 8 to 15x EBITDA. The best exits happen when multiple strategic buyers compete, which happens when velocity data is strong and the category is growing.",
      keyDrivers: [
        "Velocity in key retail accounts: the clearest proof of consumer demand",
        "Gross margin before trade: buyers want to see margin before the trade spend",
        "Retail distribution quality and depth (national chains vs. regional accounts)",
        "Brand differentiation and defensibility against private label substitution",
        "Working capital health: clean inventory management makes acquisitions easier",
      ],
    },
  },
];

/* ── Stacked bar ────────────────────────────────────────────────── */

function StackedBar({ items }: { items: BreakdownBar[] }) {
  const [go, setGo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGo(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      <div
        style={{
          display: "flex",
          height: 32,
          borderRadius: 6,
          overflow: "hidden",
          background: "#EDE0BE",
          gap: 2,
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            title={`${item.label}: ${item.pct}%`}
            style={{
              width: go ? `${item.pct}%` : "0%",
              background: item.color,
              flexShrink: 0,
              transition: `width 700ms cubic-bezier(0.4, 0, 0.2, 1) ${i * 55}ms`,
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px 16px",
          marginTop: 10,
        }}
      >
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: item.color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 12,
                color: "#5C3D00",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
              }}
            >
              {item.label} ({item.pct}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */

export default function BusinessModelsPage() {
  const [open, setOpen] = useState<BusinessModel | null>(null);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body { margin: 0; padding: 0; }
            * { box-sizing: border-box; }
            .bm-folder {
              background: #F0D49A;
              border: 2px solid #8B6914;
              border-radius: 2px 8px 2px 2px;
              cursor: pointer;
              position: relative;
              transition: transform 180ms ease, box-shadow 180ms ease;
              box-shadow: 2px 3px 0 #6B4E10;
            }
            .bm-folder:hover {
              transform: translateY(-6px);
              box-shadow: 2px 9px 0 #6B4E10;
            }
            .bm-folder::before {
              content: "";
              position: absolute;
              top: -14px;
              left: 16px;
              width: 80px;
              height: 14px;
              background: #E8C97A;
              border: 2px solid #8B6914;
              border-bottom: none;
              border-radius: 4px 4px 0 0;
            }
            .bm-modal-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0,0,0,0.72);
              display: flex;
              align-items: flex-end;
              justify-content: center;
              z-index: 100;
              animation: bm-fade-in 160ms ease both;
            }
            @keyframes bm-fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .bm-modal {
              background: #FFFDF5;
              width: 100%;
              max-width: 680px;
              max-height: 90vh;
              overflow-y: auto;
              border-radius: 12px 12px 0 0;
              border-top: 3px solid #8B6914;
              animation: bm-slide-up 240ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
              padding: 28px 24px 56px;
            }
            @media (min-width: 640px) {
              .bm-modal {
                border-radius: 12px;
                max-height: 86vh;
                margin-bottom: 48px;
              }
              .bm-modal-overlay {
                align-items: center;
              }
            }
            @keyframes bm-slide-up {
              from { transform: translateY(40px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .bm-label {
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 1.8px;
              text-transform: uppercase;
              color: #8B6914;
              margin: 0 0 8px;
              font-family: ui-sans-serif, system-ui, sans-serif;
            }
            .bm-body {
              font-size: 15px;
              line-height: 1.65;
              color: #2C1F0E;
              margin: 0 0 24px;
              font-family: ui-sans-serif, system-ui, sans-serif;
            }
            .bm-list {
              margin: 0 0 24px;
              padding: 0;
              list-style: none;
            }
            .bm-list li {
              font-size: 15px;
              line-height: 1.55;
              color: #2C1F0E;
              padding: 5px 0 5px 20px;
              position: relative;
              font-family: ui-sans-serif, system-ui, sans-serif;
            }
            .bm-list li::before {
              content: "→";
              position: absolute;
              left: 0;
              color: #8B6914;
              font-size: 12px;
              top: 7px;
            }
            .bm-hr {
              border: none;
              border-top: 1px dashed #D4C09A;
              margin: 0 0 24px;
            }
            .bm-example-link {
              font-size: 12px;
              color: #8B6914;
              text-decoration: underline;
              font-family: ui-sans-serif, system-ui, sans-serif;
            }
            .bm-example-link:hover { color: #5C3D00; }
          `,
        }}
      />

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #1E1E1E 0%, #2A2A2A 100%)",
          padding: "0 0 80px",
        }}
      >
        {/* Cabinet top bar */}
        <div
          style={{
            background: "linear-gradient(180deg, #3C3C3C, #2E2E2E)",
            borderBottom: "3px solid #111",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#8A8A8A",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.6)",
            }}
          />
          <div
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 11,
              letterSpacing: 3,
              color: "#7A7A7A",
              textTransform: "uppercase",
            }}
          >
            Business Models 101 — Cabinet No. 1
          </div>
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px" }}>
          {/* Intro */}
          <div
            style={{
              margin: "48px 0 40px",
              padding: "24px 26px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6,
            }}
          >
            <div
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 10,
                letterSpacing: 2.5,
                color: "#C4A84A",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Before you start
            </div>
            <p
              style={{
                fontFamily: "ui-serif, Georgia, serif",
                fontSize: "clamp(17px, 3vw, 20px)",
                lineHeight: 1.6,
                color: "#E8DEC8",
                margin: 0,
              }}
            >
              When you are getting started in business, one of the most important things you can do is understand the model underneath what you are building. You cannot change the fundamentals of how certain businesses are set up, even if you are the best operator in the world. The economics, the customer dynamics, the grind required: it is all baked in. So before you pick a path, know the game you are signing up to play.
            </p>
          </div>

          {/* Folders grid */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 28,
            }}
          >
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            <div
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 10,
                letterSpacing: 2,
                color: "#666",
                textTransform: "uppercase",
              }}
            >
              Click a folder to open it
            </div>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "28px 24px",
              paddingTop: 16,
            }}
          >
            {MODELS.map((model) => (
              <div
                key={model.id}
                className="bm-folder"
                onClick={() => setOpen(model)}
                style={{ padding: "18px 20px 18px" }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -13,
                    left: 20,
                    width: 76,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 8,
                    letterSpacing: 0.5,
                    color: "#4A3000",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: "12px",
                  }}
                >
                  {model.name.toUpperCase()}
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ fontSize: 28, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>
                    {model.emoji}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "ui-serif, Georgia, serif",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#2C1A00",
                        lineHeight: 1.2,
                        marginBottom: 5,
                      }}
                    >
                      {model.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "ui-sans-serif, system-ui, sans-serif",
                        fontSize: 13,
                        color: "#5C3D00",
                        lineHeight: 1.45,
                      }}
                    >
                      {model.tagline}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    borderTop: "1px dashed #C4A050",
                    paddingTop: 10,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      fontSize: 9,
                      color: "#8B6914",
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                    }}
                  >
                    Open file →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="bm-modal-overlay" onClick={() => setOpen(null)}>
          <div className="bm-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 20,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 10,
                    letterSpacing: 2,
                    color: "#8B6914",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Business Model
                </div>
                <h2
                  style={{
                    fontFamily: "ui-serif, Georgia, serif",
                    fontSize: "clamp(24px, 5vw, 30px)",
                    fontWeight: 700,
                    color: "#2C1A00",
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  {open.emoji} {open.name}
                </h2>
                <p
                  style={{
                    fontFamily: "ui-sans-serif, system-ui, sans-serif",
                    fontSize: 15,
                    color: "#6B4E10",
                    margin: "8px 0 0",
                    fontStyle: "italic",
                  }}
                >
                  {open.tagline}
                </p>
              </div>
              <button
                onClick={() => setOpen(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#8B6914",
                  fontSize: 22,
                  lineHeight: 1,
                  padding: "2px 4px",
                  marginLeft: 12,
                  flexShrink: 0,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <hr className="bm-hr" />

            {/* Stacked bar */}
            <p className="bm-label">Where the money goes (% of revenue)</p>
            <div style={{ marginBottom: 28 }}>
              <StackedBar items={open.breakdown} />
            </div>

            <hr className="bm-hr" />

            {/* Key terms */}
            <p className="bm-label">Terms to know</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {open.keyTerms.map((t, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 14px",
                    background: "#FBF3DC",
                    border: "1px solid #E8D5A3",
                    borderRadius: 5,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "ui-sans-serif, system-ui, sans-serif",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#2C1A00",
                      marginBottom: 3,
                    }}
                  >
                    {t.term}
                  </div>
                  <div
                    style={{
                      fontFamily: "ui-sans-serif, system-ui, sans-serif",
                      fontSize: 13,
                      color: "#5C3D00",
                      lineHeight: 1.55,
                    }}
                  >
                    {t.definition}
                  </div>
                </div>
              ))}
            </div>

            <hr className="bm-hr" />

            <p className="bm-label">How you make money</p>
            <p className="bm-body">{open.howYouMakeMoney}</p>

            <p className="bm-label">Your biggest costs</p>
            <ul className="bm-list">
              {open.biggestCosts.map((c, i) => <li key={i}>{c}</li>)}
            </ul>

            <p className="bm-label">How you get customers</p>
            <p className="bm-body">{open.howYouGetCustomers}</p>

            <p className="bm-label">The flywheel</p>
            <p className="bm-body">{open.flywheel}</p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                marginBottom: 28,
              }}
            >
              <div>
                <p className="bm-label" style={{ marginBottom: 8 }}>The pros</p>
                <ul className="bm-list" style={{ marginBottom: 0 }}>
                  {open.pros.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div>
                <p className="bm-label" style={{ marginBottom: 8 }}>The cons</p>
                <ul className="bm-list" style={{ marginBottom: 0 }}>
                  {open.cons.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            </div>

            <hr className="bm-hr" />

            {/* Real examples */}
            <p className="bm-label">Real examples with public numbers</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
              {open.examples.map((ex, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 16px",
                    background: "#FBF3DC",
                    border: "1px solid #E8D5A3",
                    borderRadius: 5,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "ui-sans-serif, system-ui, sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#2C1A00",
                      }}
                    >
                      {ex.name}
                    </div>
                    <a
                      href={ex.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bm-example-link"
                      style={{ flexShrink: 0 }}
                    >
                      Source →
                    </a>
                  </div>
                  <div
                    style={{
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      fontSize: 11,
                      color: "#8B6914",
                      marginBottom: 6,
                      lineHeight: 1.4,
                    }}
                  >
                    {ex.stat}
                  </div>
                  <div
                    style={{
                      fontFamily: "ui-sans-serif, system-ui, sans-serif",
                      fontSize: 13,
                      color: "#5C3D00",
                      lineHeight: 1.6,
                    }}
                  >
                    {ex.summary}
                  </div>
                </div>
              ))}
            </div>

            <hr className="bm-hr" />

            <p className="bm-label">Who it is good for</p>
            <p className="bm-body">{open.goodFor}</p>

            <hr className="bm-hr" />

            {/* Selling section */}
            <div
              style={{
                background: "#1E1A14",
                borderRadius: 8,
                padding: "20px 20px 24px",
                marginBottom: 0,
              }}
            >
              <div
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 10,
                  letterSpacing: 2,
                  color: "#C4A84A",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                How this business sells
              </div>

              <p
                style={{
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  color: "#8A7A54",
                  margin: "0 0 6px",
                }}
              >
                How it typically sells
              </p>
              <p
                style={{
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "#D4C8A8",
                  margin: "0 0 18px",
                }}
              >
                {open.selling.overview}
              </p>

              <p
                style={{
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  color: "#8A7A54",
                  margin: "0 0 6px",
                }}
              >
                Who buys it
              </p>
              <p
                style={{
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "#D4C8A8",
                  margin: "0 0 18px",
                }}
              >
                {open.selling.buyers}
              </p>

              <p
                style={{
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  color: "#8A7A54",
                  margin: "0 0 6px",
                }}
              >
                Valuation and multiples
              </p>
              <p
                style={{
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "#D4C8A8",
                  margin: "0 0 18px",
                }}
              >
                {open.selling.valuation}
              </p>

              <p
                style={{
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  color: "#8A7A54",
                  margin: "0 0 10px",
                }}
              >
                What drives value up or down
              </p>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {open.selling.keyDrivers.map((d, i) => (
                  <li
                    key={i}
                    style={{
                      fontFamily: "ui-sans-serif, system-ui, sans-serif",
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: "#D4C8A8",
                      paddingLeft: 18,
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        color: "#C4A84A",
                        fontSize: 11,
                        top: 3,
                      }}
                    >
                      →
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
