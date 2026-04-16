"use client";

import { motion } from "framer-motion";
import { useBlockBreak } from "./BlockBreaker";

interface LifeWorkCompany {
  honoree: string; // who it's for (Mom, Dad, etc.)
  name: string; // company name or "Locked"
  status: "active" | "locked";
  progress: number; // progress toward $10M ARR, 0-100
  currentRev?: string; // display label, e.g. "$--k"
  targetRev: string; // "$10M"
  yearsLeft: number; // out of 5
  description?: string;
  color: string;
  url?: string;
}

const lifeWork: LifeWorkCompany[] = [
  {
    honoree: "For Mom",
    name: "Trackstar",
    status: "active",
    progress: 8,
    currentRev: "$--k",
    targetRev: "$10M",
    yearsLeft: 5,
    description:
      "The future of race-day experiences for endurance athletes. Connecting race organizers and brands with runners through live tracking and real-time engagement.",
    color: "#6AAF35",
    url: "https://www.trackstar.art",
  },
  {
    honoree: "For Dad",
    name: "Locked",
    status: "locked",
    progress: 0,
    targetRev: "$10M",
    yearsLeft: 5,
    color: "#4FC3F7",
  },
  {
    honoree: "For Sister",
    name: "Locked",
    status: "locked",
    progress: 0,
    targetRev: "$10M",
    yearsLeft: 5,
    color: "#E91E63",
  },
  {
    honoree: "For Grandpa",
    name: "Locked",
    status: "locked",
    progress: 0,
    targetRev: "$10M",
    yearsLeft: 5,
    color: "#A0522D",
  },
  {
    honoree: "For Grandma",
    name: "Locked",
    status: "locked",
    progress: 0,
    targetRev: "$10M",
    yearsLeft: 5,
    color: "#FFD700",
  },
  {
    honoree: "For My Girl",
    name: "Locked",
    status: "locked",
    progress: 0,
    targetRev: "$10M",
    yearsLeft: 5,
    color: "#9C27B0",
  },
];

function ProgressBar({ progress, color, locked }: { progress: number; color: string; locked: boolean }) {
  return (
    <div
      className="relative h-3 w-full overflow-hidden rounded-sm"
      style={{
        backgroundColor: "rgba(0,0,0,0.15)",
        border: "2px solid rgba(0,0,0,0.1)",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.12)",
      }}
    >
      {/* Segmented overlay like Minecraft XP */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 border-r border-black/5 last:border-r-0"
          />
        ))}
      </div>

      {/* Fill */}
      <motion.div
        className="absolute top-0 left-0 h-full"
        initial={{ width: 0 }}
        whileInView={{ width: `${progress}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        style={{
          backgroundColor: locked ? "rgba(120,120,120,0.5)" : color,
          boxShadow: locked
            ? "inset 0 2px 4px rgba(255,255,255,0.1)"
            : `inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.15), 0 0 8px ${color}40`,
        }}
      />
    </div>
  );
}

export default function Companies() {
  const spawnParticles = useBlockBreak();

  return (
    <section id="companies" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Life's Work intro */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="inline-block bg-gold text-coal px-3 py-1.5 mb-6 block-border-sm">
            <span className="font-[family-name:var(--font-pixel)] text-[10px]">
              LIFE&apos;S WORK
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-coal mb-4">
            Six companies. Six people. One lifetime.
          </h2>

          <div className="max-w-3xl space-y-4 text-coal/70 leading-relaxed">
            <p>
              My life&apos;s work is to build a company in honor of each of the people
              who shaped me — my mom, dad, sister, grandpa, grandma, and future wife.
            </p>
            <p>
              Each one is built around someone I love, inspired by who they are and what they taught me.
              The rule: <strong className="text-coal">5 years to get each to $10M in yearly revenue</strong>.
              Trackstar is the first, built for my mom. The rest are under wraps — for now.
            </p>
          </div>
        </motion.div>

        {/* Grid of life's work */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {lifeWork.map((company, i) => (
            <motion.div
              key={company.honoree}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              onClick={spawnParticles}
            >
              <div
                className="h-full overflow-hidden rounded-sm transition-all duration-200 hover:-translate-y-1"
                style={{
                  backgroundColor: company.status === "locked" ? "rgba(245,240,230,0.5)" : "#FFF8F0",
                  border: "2px solid rgba(0,0,0,0.08)",
                  boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.5), inset -1px -1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
                }}
              >
                {/* Header */}
                <div
                  className="p-5 relative overflow-hidden"
                  style={{
                    backgroundColor: company.status === "locked" ? "#7F7F7F" : company.color,
                    boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.15)",
                  }}
                >
                  {/* Locked pattern overlay */}
                  {company.status === "locked" && (
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(0,0,0,0.3) 6px, rgba(0,0,0,0.3) 12px)",
                      }}
                    />
                  )}

                  <div className="relative">
                    <span className="font-[family-name:var(--font-pixel)] text-[9px] text-white/70 block mb-1.5">
                      {company.honoree}
                    </span>
                    <h3 className="font-[family-name:var(--font-pixel)] text-sm text-white drop-shadow-sm flex items-center gap-2">
                      {company.status === "locked" && <span>🔒</span>}
                      {company.name}
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  {company.description ? (
                    <p className="text-coal/70 text-sm leading-relaxed mb-5">
                      {company.description}
                    </p>
                  ) : (
                    <p className="text-coal/40 text-sm leading-relaxed mb-5 italic">
                      Company locked. Details to be revealed when active.
                    </p>
                  )}

                  {/* Progress to $10M */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-coal/50 font-medium uppercase tracking-wide">
                        Progress to $10M
                      </span>
                      <span className="font-[family-name:var(--font-pixel)] text-[8px] text-coal/60">
                        {company.progress}%
                      </span>
                    </div>
                    <ProgressBar
                      progress={company.progress}
                      color={company.color}
                      locked={company.status === "locked"}
                    />
                    <div className="flex items-center justify-between mt-2 text-[10px] text-coal/40">
                      <span>{company.currentRev || "—"}</span>
                      <span>{company.targetRev}</span>
                    </div>
                  </div>

                  {/* Years remaining chip */}
                  <div className="flex items-center justify-between">
                    <div
                      className="inline-block px-2 py-1 rounded-sm"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.05)",
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                    >
                      <span className="font-[family-name:var(--font-pixel)] text-[8px] text-coal/60">
                        ⏱ {company.yearsLeft} YRS LEFT
                      </span>
                    </div>

                    {company.url && (
                      <a
                        href={company.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-coal text-cream px-3 py-1.5 text-xs font-semibold rounded-sm hover:-translate-y-0.5 transition-transform"
                        style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}
                      >
                        Visit &rarr;
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
