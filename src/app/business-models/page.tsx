"use client";

import { useState, useEffect } from "react";

type BreakdownBar = {
  label: string;
  pct: number;
  color: string;
};

type BusinessModel = {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  breakdown: BreakdownBar[];
  howYouMakeMoney: string;
  biggestCosts: string[];
  howYouGetCustomers: string;
  flywheel: string;
  pros: string[];
  cons: string[];
  goodFor: string;
};

/* Colors */
const CLR = {
  cost1: "#B8703A",   // dark sienna — biggest cost
  cost2: "#C49A4A",   // gold — mid cost
  cost3: "#D4B870",   // light gold — smaller cost
  cost4: "#DDD0A8",   // pale — minor cost
  profit: "#5C8A5C",  // muted green — profit
};

const MODELS: BusinessModel[] = [
  {
    id: "ecommerce",
    name: "E-commerce Brand",
    emoji: "📦",
    tagline: "You buy products, mark them up, and sell them online.",
    breakdown: [
      { label: "Cost of Goods", pct: 30, color: CLR.cost1 },
      { label: "Paid Advertising", pct: 28, color: CLR.cost2 },
      { label: "Fulfillment & Shipping", pct: 12, color: CLR.cost3 },
      { label: "Platform & Ops", pct: 10, color: CLR.cost4 },
      { label: "Profit", pct: 20, color: CLR.profit },
    ],
    howYouMakeMoney:
      "You buy something for $15 and sell it for $45. That $30 spread is your gross profit. From there you pay for ads, shipping, and overhead. If your numbers are tight, it works. If your ads are inefficient or your margins are thin, it doesn't.",
    biggestCosts: [
      "Paid advertising (usually your #1 cost — Facebook, Instagram, Google)",
      "Cost of goods (what you pay to make or source the product)",
      "Fulfillment and shipping",
      "Platform fees (Shopify, Amazon, etc.)",
    ],
    howYouGetCustomers:
      "Mostly paid ads — you put a product in front of someone on Instagram or Google and hope they buy. Some brands build organic audiences through content, influencers, or SEO, but almost everyone starts with paid. Customer acquisition cost (CAC) is the number you obsess over.",
    flywheel:
      "More sales → better supplier pricing → higher margins → more ad budget → more sales. If you can get a customer to buy twice, your economics get way better. The best e-commerce brands turn one-time buyers into repeat customers through email, subscriptions, or just being really good.",
    pros: [
      "No physical location needed — run it from anywhere",
      "Scales fast once you find a product that works",
      "Tons of data to help you make decisions",
      "Global customer base from day one",
    ],
    cons: [
      "Ads are expensive and getting more expensive every year",
      "Very competitive — someone can copy your product overnight",
      "Inventory risk — you can get stuck holding stuff that won't sell",
      "Thin margins if you're not careful",
    ],
    goodFor:
      "People who are analytical, patient, and comfortable with uncertainty. You need to love testing, iterating, and staring at spreadsheets. It also helps to have a genuine interest in the product category — passion often leads to better marketing.",
  },
  {
    id: "restaurant",
    name: "Restaurant",
    emoji: "🍽️",
    tagline: "You cook food, serve people, and hope the math works out.",
    breakdown: [
      { label: "Labor", pct: 33, color: CLR.cost1 },
      { label: "Food Cost", pct: 32, color: CLR.cost2 },
      { label: "Rent", pct: 9, color: CLR.cost3 },
      { label: "Utilities & Other", pct: 20, color: CLR.cost4 },
      { label: "Profit", pct: 6, color: CLR.profit },
    ],
    howYouMakeMoney:
      "Customers pay for food and drinks. A plate that costs you $8 to make sells for $28 — that's your gross margin. The problem is after rent, labor, and everything else, most restaurants keep 3–9% of revenue as profit. It's a hard business, but when it works, it's a beautiful one.",
    biggestCosts: [
      "Food cost (28–35% of revenue is the target)",
      "Labor (30–35% of revenue, often the #1 cost)",
      "Rent (8–10% of revenue is the goal)",
      "Equipment, utilities, insurance",
    ],
    howYouGetCustomers:
      "Location is everything. People walk by, they come in. After that: Google Maps reviews, Yelp, Instagram, word of mouth. The best restaurants have regulars who come back every week. Once you're established, the community feeds itself.",
    flywheel:
      "Great food and service → good reviews → more foot traffic → you can invest in better ingredients and staff → even better food and service. The compounding here is slow but powerful. Bad reviews work the same way in reverse.",
    pros: [
      "Cash business — money hits your register every day",
      "Strong community ties and loyal regulars",
      "Creative and expressive — your menu is your art",
      "Real, tangible thing you build in a neighborhood",
    ],
    cons: [
      "Brutally thin margins — one bad month can sink you",
      "Labor-intensive and hard to manage at scale",
      "Completely location-dependent",
      "High failure rate, especially in the first two years",
    ],
    goodFor:
      "People who are genuinely hospitality-driven — you have to love feeding people, not just running a business. Great operators are organized, calm under pressure, and have high standards. If you're doing it for the love of food and people, it can be one of the most rewarding businesses there is.",
  },
  {
    id: "agency",
    name: "Marketing Agency",
    emoji: "💡",
    tagline: "You help other businesses market themselves, and charge for it.",
    breakdown: [
      { label: "Labor & Contractors", pct: 55, color: CLR.cost1 },
      { label: "Overhead & Admin", pct: 8, color: CLR.cost2 },
      { label: "Tools & Software", pct: 5, color: CLR.cost3 },
      { label: "Biz Dev & Sales", pct: 5, color: CLR.cost4 },
      { label: "Profit", pct: 27, color: CLR.profit },
    ],
    howYouMakeMoney:
      "Clients pay you a monthly retainer (say $5,000–$20,000/month) or a project fee to run their ads, manage their social media, build their brand, or create content. Your main cost is the people doing the work. If you keep your team lean and your clients happy, margins can be great.",
    biggestCosts: [
      "Salaries and contractor fees (usually 50–70% of revenue)",
      "Software tools (design, analytics, scheduling platforms)",
      "Overhead (office if you have one, insurance, admin)",
    ],
    howYouGetCustomers:
      "Almost always referrals in the beginning. You do good work for one client, they tell a friend. Over time: LinkedIn, cold outreach, a strong case study portfolio, speaking at events, or running ads for yourself (which doubles as proof you know what you're doing).",
    flywheel:
      "Great results for clients → case studies → easier to sell to new clients → you can afford better talent → even better results. The trap is chasing new clients instead of retaining existing ones. Retention is everything.",
    pros: [
      "Low startup costs — you can start with a laptop and one client",
      "High margins if you keep the team lean",
      "Recurring revenue from monthly retainers",
      "You build skills and a network fast",
    ],
    cons: [
      "Feast-or-famine — losing one big client can hurt badly",
      "Clients can be demanding and churn unexpectedly",
      "Hard to scale because it's people-dependent",
      "You're always trading time for money unless you productize",
    ],
    goodFor:
      "Relationship-builders who are good communicators and genuinely curious about business. You need to enjoy problem-solving for others and be comfortable with ambiguity. If you love strategy, storytelling, and variety — different client, different challenge every day — this can be a great fit.",
  },
  {
    id: "lawn",
    name: "Lawn Mowing Company",
    emoji: "🌿",
    tagline: "You mow lawns. People pay you every week to do it.",
    breakdown: [
      { label: "Labor", pct: 30, color: CLR.cost1 },
      { label: "Equipment & Fuel", pct: 15, color: CLR.cost2 },
      { label: "Vehicle & Transport", pct: 7, color: CLR.cost3 },
      { label: "Insurance & Admin", pct: 8, color: CLR.cost4 },
      { label: "Profit", pct: 40, color: CLR.profit },
    ],
    howYouMakeMoney:
      "You charge $50–$150 per lawn, or sell monthly subscriptions. The magic is density — if you can get 10 lawns on the same street, your drive time drops to zero and profit per hour goes way up. A tight route with loyal customers is a genuinely good small business.",
    biggestCosts: [
      "Equipment (mowers, trimmers, trailer — big upfront but lasts)",
      "Fuel and vehicle costs",
      "Labor if you hire",
      "Insurance",
    ],
    howYouGetCustomers:
      "Door-to-door flyers in neighborhoods you want to work. Yard signs in customers' yards. Nextdoor and local Facebook groups. Word of mouth from neighbors who see you every week. It's a local game — visibility in the right zip codes is everything.",
    flywheel:
      "More customers in the same neighborhood → less driving between jobs → more lawns per day → higher revenue with the same time → you can offer competitive pricing → more customers. Geographic concentration compounds over time.",
    pros: [
      "Simple business — no complicated product or technology",
      "Recurring revenue (lawns grow back every week)",
      "Low barrier to entry — you can start with one mower",
      "Predictable, seasonal cash flow",
    ],
    cons: [
      "Seasonal — winters can be slow unless you add snow removal",
      "Physical and weather-dependent",
      "Hard to scale without hiring, and hiring adds complexity",
      "Low status, which can affect your motivation long-term",
    ],
    goodFor:
      "Reliable, self-motivated people who enjoy physical work and being outside. Great for someone who wants simple ownership — no complicated tech, no inventory, just show up and do the work. Also a fantastic first business for a teenager or someone learning the basics of operations.",
  },
  {
    id: "franchise",
    name: "Food Franchise",
    emoji: "🏪",
    tagline: "You buy the right to run a proven restaurant brand.",
    breakdown: [
      { label: "Labor", pct: 30, color: CLR.cost1 },
      { label: "Food Cost", pct: 30, color: CLR.cost2 },
      { label: "Rent", pct: 10, color: CLR.cost3 },
      { label: "Royalties & Fees", pct: 8, color: CLR.cost4 },
      { label: "Other Ops", pct: 10, color: CLR.cost4 },
      { label: "Profit", pct: 12, color: CLR.profit },
    ],
    howYouMakeMoney:
      "You operate a location of an established brand (Chick-fil-A, Subway, Dunkin', etc.) and keep the profits after paying royalties. Revenue comes from food sales just like any restaurant, but you're running a proven playbook instead of inventing one.",
    biggestCosts: [
      "Franchise fee upfront (can be $10,000–$50,000+)",
      "Royalties to the franchisor (usually 4–8% of gross revenue, forever)",
      "Build-out and equipment (often $200K–$1M+ to open)",
      "Food, labor, and rent — same as any restaurant",
    ],
    howYouGetCustomers:
      "The franchisor handles national marketing. You benefit from brand recognition the moment you open. Locally, you might do community events or local ads, but the heavy lifting of brand-building is done for you. This is one of the biggest advantages of the model.",
    flywheel:
      "The franchisor's brand gets stronger as more locations open → your location benefits from that recognition → your royalties fund more franchisor marketing → brand gets stronger. You're buying into a machine that's already spinning.",
    pros: [
      "Proven system — you don't have to figure everything out from scratch",
      "Brand recognition from day one",
      "Training and ongoing support from the franchisor",
      "Easier to get financing (banks understand franchise models)",
    ],
    cons: [
      "You don't own the brand or the system — you're a licensee",
      "Royalties eat into profit permanently",
      "Less creative freedom than an independent business",
      "Expensive to start, and you can lose your investment if it fails",
    ],
    goodFor:
      "Strong operators and executors — people who thrive following a system rather than inventing one. If you're the type who wants to focus on running a tight ship (great staff, clean location, happy customers) rather than building something from scratch, franchising can be very rewarding.",
  },
  {
    id: "lawfirm",
    name: "Law Firm",
    emoji: "⚖️",
    tagline: "You sell legal expertise by the hour — or by the outcome.",
    breakdown: [
      { label: "Attorney Salaries", pct: 45, color: CLR.cost1 },
      { label: "Office & Admin", pct: 12, color: CLR.cost2 },
      { label: "Malpractice Insurance", pct: 8, color: CLR.cost3 },
      { label: "Marketing", pct: 5, color: CLR.cost4 },
      { label: "Profit", pct: 30, color: CLR.profit },
    ],
    howYouMakeMoney:
      "Three main models: hourly billing (you charge $200–$800/hour for your time), flat fees (a set price for a specific service like drafting a contract), or contingency (you get paid a percentage — typically 33% — only if you win the case). Most firms do a mix.",
    biggestCosts: [
      "Attorney salaries (your biggest cost by far)",
      "Malpractice insurance (required and expensive)",
      "Office space and admin staff",
      "Legal research tools and software",
    ],
    howYouGetCustomers:
      "Referrals are king. Other lawyers send you cases. Past clients recommend you. Building a reputation in a specific area of law — personal injury, real estate, corporate — compounds over time. Google search is increasingly important for consumer-facing practices.",
    flywheel:
      "Win cases → build reputation → attract better clients with more complex (and higher-paying) cases → earn more → invest in better attorneys → win more cases. In law, reputation is everything. It takes years to build and it sticks.",
    pros: [
      "High billing rates — skilled attorneys command serious fees",
      "Relatively recession-resistant (people always need legal help)",
      "Deep specialization creates a real moat",
      "Strong referral networks once established",
    ],
    cons: [
      "Requires significant education and bar exam just to start",
      "Slow to build — reputation takes years to compound",
      "High stress, especially in litigation",
      "Hard to scale because it's deeply expertise-dependent",
    ],
    goodFor:
      "Detail-oriented people who love research, logic, and advocacy. You need high emotional intelligence — clients are often stressed or scared. If you genuinely love the law and enjoy problem-solving under pressure, it can be an incredibly fulfilling practice. Patience is non-negotiable.",
  },
  {
    id: "school",
    name: "School",
    emoji: "🎓",
    tagline: "You build a place where people learn something valuable.",
    breakdown: [
      { label: "Teacher Salaries", pct: 50, color: CLR.cost1 },
      { label: "Facilities", pct: 15, color: CLR.cost2 },
      { label: "Marketing & Enrollment", pct: 10, color: CLR.cost3 },
      { label: "Curriculum & Tech", pct: 8, color: CLR.cost4 },
      { label: "Profit", pct: 17, color: CLR.profit },
    ],
    howYouMakeMoney:
      "Tuition. Students (or their parents) pay to attend. This can be a traditional school, a coding bootcamp, a music academy, an online course business, or anything in between. The model is the same: you create a learning experience, and people pay to access it.",
    biggestCosts: [
      "Teachers and instructors (your most important investment)",
      "Facilities or technology platform",
      "Curriculum development",
      "Marketing and enrollment costs",
    ],
    howYouGetCustomers:
      "Word of mouth from successful students is the most powerful channel. Parents talk to other parents. Alumni refer friends. SEO and community presence matter a lot for local schools. For online schools, content marketing and social proof (testimonials, outcomes data) do the heavy lifting.",
    flywheel:
      "Strong student outcomes → better reputation → more enrollment → more revenue → better teachers and facilities → even better outcomes. The schools that win are the ones that take outcomes seriously. When your graduates succeed, it sells the next cohort for you.",
    pros: [
      "Mission-driven — you're genuinely changing people's lives",
      "Recurring tuition revenue if you have ongoing programs",
      "Strong community around shared learning",
      "Once reputation is built, it's hard to replicate",
    ],
    cons: [
      "Heavy regulation, especially for accredited programs",
      "Slow to build — reputation compounds over years, not months",
      "Completely dependent on enrollment numbers",
      "Hard to raise prices without hurting access",
    ],
    goodFor:
      "Patient, mission-driven people who care deeply about other people's growth. You have to genuinely love teaching and believe in what you're building. Great school operators are community-minded, long-term thinkers who find meaning in the outcome, not just the revenue.",
  },
  {
    id: "media",
    name: "Media Company",
    emoji: "🎙️",
    tagline: "You build an audience and then monetize their attention.",
    breakdown: [
      { label: "Content Creation", pct: 40, color: CLR.cost1 },
      { label: "Sales & Marketing", pct: 15, color: CLR.cost2 },
      { label: "Distribution & Tech", pct: 10, color: CLR.cost3 },
      { label: "Admin & Overhead", pct: 8, color: CLR.cost4 },
      { label: "Profit", pct: 27, color: CLR.profit },
    ],
    howYouMakeMoney:
      "Multiple streams: advertising (brands pay to reach your audience), sponsorships (a brand pays to be associated with your content), subscriptions (readers or viewers pay directly), and licensing (others pay to use your content). Most media companies mix several of these.",
    biggestCosts: [
      "Content creation (the biggest one — writers, editors, producers, gear)",
      "Distribution and platform costs",
      "Sales and marketing to grow the audience",
      "Admin and operations",
    ],
    howYouGetCustomers:
      "You have two customers: the audience and the advertisers. For the audience: consistency, quality, SEO, social media, and word of mouth. For advertisers: once you have a sizable audience, they come to you. The audience comes first — everything else follows.",
    flywheel:
      "More content → bigger audience → more valuable to advertisers → more revenue → better content budget → even more content and better quality. The compounding in media is real but slow. The accounts and publications you see everywhere usually took 3–7 years of consistent work to get there.",
    pros: [
      "Once the audience is built, it scales without proportional cost",
      "Multiple monetization options — not dependent on one revenue stream",
      "Builds real influence and relationships over time",
      "Content assets keep working long after they're created",
    ],
    cons: [
      "Slow to monetize — you need an audience before you can sell anything",
      "Algorithm-dependent on platforms you don't control",
      "Constant content demand — the treadmill never stops",
      "Hard to predict what resonates",
    ],
    goodFor:
      "Creative, patient people who are comfortable with ambiguity and genuinely enjoy the content they're making. The best media operators are obsessed with their audience — they think about what their readers or viewers actually need. If you're doing it just for the money, the audience will sense it.",
  },
];

/* ── Animated bar chart ─────────────────────────────────────────── */

function BarChart({ items }: { items: BreakdownBar[] }) {
  const [go, setGo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGo(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => (
        <div key={i}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            <span style={{ fontSize: 12, color: "#5C3D00", fontWeight: 500 }}>
              {item.label}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2C1A00" }}>
              {item.pct}%
            </span>
          </div>
          <div
            style={{
              height: 12,
              background: "#EDE0BE",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: go ? `${item.pct}%` : "0%",
                background: item.color,
                borderRadius: 3,
                transition: `width 520ms cubic-bezier(0.4, 0, 0.2, 1) ${i * 70}ms`,
              }}
            />
          </div>
        </div>
      ))}
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
              padding: 0;
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
              max-height: 88vh;
              overflow-y: auto;
              border-radius: 12px 12px 0 0;
              border-top: 3px solid #8B6914;
              animation: bm-slide-up 240ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
              padding: 28px 24px 48px;
            }
            @media (min-width: 640px) {
              .bm-modal {
                border-radius: 12px;
                max-height: 82vh;
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
            .bm-section-label {
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 1.8px;
              text-transform: uppercase;
              color: #8B6914;
              margin: 0 0 6px;
              font-family: ui-sans-serif, system-ui, sans-serif;
            }
            .bm-section-body {
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
            .bm-divider {
              border: none;
              border-top: 1px dashed #D4C09A;
              margin: 0 0 24px;
            }
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
              When you're getting started in business, one of the most important things you can do is understand the model underneath what you're building. You cannot change the fundamentals of how certain businesses are set up — even if you're the best operator in the world. The economics, the customer dynamics, the grind required — it's all baked in. So before you pick a path, know the game you're signing up to play.
            </p>
          </div>

          {/* Drawer label */}
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

          {/* Folders grid */}
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

            <hr className="bm-divider" />

            {/* Bar chart */}
            <p className="bm-section-label">Where the money goes (% of revenue)</p>
            <div style={{ marginBottom: 8 }}>
              <BarChart items={open.breakdown} />
            </div>
            {/* Legend */}
            <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: CLR.cost1 }} />
                <span style={{ fontSize: 11, color: "#7A5A2A", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>Costs</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: CLR.profit }} />
                <span style={{ fontSize: 11, color: "#7A5A2A", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>Profit</span>
              </div>
            </div>

            <hr className="bm-divider" />

            <p className="bm-section-label">How you make money</p>
            <p className="bm-section-body">{open.howYouMakeMoney}</p>

            <p className="bm-section-label">Your biggest costs</p>
            <ul className="bm-list">
              {open.biggestCosts.map((c, i) => <li key={i}>{c}</li>)}
            </ul>

            <p className="bm-section-label">How you get customers</p>
            <p className="bm-section-body">{open.howYouGetCustomers}</p>

            <p className="bm-section-label">The flywheel</p>
            <p className="bm-section-body">{open.flywheel}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <div>
                <p className="bm-section-label" style={{ marginBottom: 8 }}>The pros</p>
                <ul className="bm-list" style={{ marginBottom: 0 }}>
                  {open.pros.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div>
                <p className="bm-section-label" style={{ marginBottom: 8 }}>The cons</p>
                <ul className="bm-list" style={{ marginBottom: 0 }}>
                  {open.cons.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            </div>

            <hr className="bm-divider" />

            <p className="bm-section-label">Who it's good for</p>
            <p className="bm-section-body" style={{ marginBottom: 0 }}>{open.goodFor}</p>
          </div>
        </div>
      )}
    </>
  );
}
