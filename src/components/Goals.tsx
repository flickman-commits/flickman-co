"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Goal {
  label: string;
  description: string;
  current: string;
  target: string;
  progress: number; // 0-100
  icon: string;
  color: string;
  detail?: string;
}

const goals: Goal[] = [
  {
    label: "Sub-3 Marathon",
    description: "Break 3 hours in the marathon",
    current: "3:15",
    target: "2:59:59",
    progress: 42,
    icon: "🏃",
    color: "#4FC3F7",
    detail: "Current PR → Goal",
  },
  {
    label: "Trackstar → $1M ARR",
    description: "Grow Trackstar to $1M in yearly revenue",
    current: "$--k",
    target: "$1M",
    progress: 15,
    icon: "📈",
    color: "#6AAF35",
    detail: "Current ARR → Goal",
  },
  {
    label: "A Friend in Every City",
    description: "Have a friend in each of the top 50 cities by population — someone whose couch I'd crash on",
    current: "0",
    target: "50",
    progress: 0,
    icon: "🌍",
    color: "#FFD700",
    detail: "Cities covered → Goal",
  },
];

function XPBar({ progress, color }: { progress: number; color: string }) {
  return (
    <div
      className="relative h-4 w-full overflow-hidden rounded-sm"
      style={{
        backgroundColor: "rgba(0,0,0,0.15)",
        border: "2px solid rgba(0,0,0,0.1)",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {/* Background grid lines (like MC XP bar segments) */}
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
        className="absolute top-0 left-0 h-full rounded-sm"
        initial={{ width: 0 }}
        whileInView={{ width: `${progress}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        style={{
          backgroundColor: color,
          boxShadow: `inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.15), 0 0 8px ${color}40`,
        }}
      />

      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-[family-name:var(--font-pixel)] text-[7px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
          {progress}%
        </span>
      </div>
    </div>
  );
}

export default function Goals() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section className="py-12 bg-cream/50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="px-3 py-1.5 rounded-sm"
              style={{
                backgroundColor: "#2C2C2C",
                boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.1), inset -2px -2px 4px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.15)",
                border: "2px solid rgba(255,255,255,0.05)",
              }}
            >
              <span className="font-[family-name:var(--font-pixel)] text-[9px] text-cream">
                ⚡ CURRENT QUESTS
              </span>
            </div>
            <div className="flex-1 h-[1px] bg-coal/10" />
          </div>

          {/* Goals grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {goals.map((goal, i) => (
              <motion.div
                key={goal.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="cursor-pointer"
              >
                <div
                  className="p-4 rounded-sm transition-all duration-200 hover:-translate-y-1"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.7)",
                    border: "2px solid rgba(0,0,0,0.06)",
                    boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.5), inset -1px -1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Top row: icon + label */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{goal.icon}</span>
                    <span className="font-bold text-sm text-coal leading-tight">
                      {goal.label}
                    </span>
                  </div>

                  {/* XP bar */}
                  <XPBar progress={goal.progress} color={goal.color} />

                  {/* Current → Target */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-coal/40 font-medium">
                      {goal.detail}
                    </span>
                    <span className="font-[family-name:var(--font-pixel)] text-[8px] text-coal/50">
                      {goal.current} → {goal.target}
                    </span>
                  </div>

                  {/* Expanded description */}
                  {expanded === i && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-xs text-coal/50 mt-3 pt-3 border-t border-coal/10 leading-relaxed"
                    >
                      {goal.description}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
