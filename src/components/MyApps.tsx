"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { apps, appUrl, type AppEntry } from "../../apps/registry";

function AppSlot({ app, index }: { app: AppEntry; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href={appUrl(app)}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative group"
    >
      {/* Tooltip */}
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 z-20 bg-coal/95 text-cream px-3 py-2 min-w-[180px] pointer-events-none"
          style={{
            border: "2px solid rgba(255,255,255,0.15)",
            borderRadius: "2px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          <p className="font-[family-name:var(--font-pixel)] text-[8px] text-grass-light mb-1">
            {app.name}
            {app.private && " 🔒"}
          </p>
          <p className="text-[10px] text-cream/60 leading-tight">
            {app.description}
          </p>
        </motion.div>
      )}

      {/* Slot */}
      <div
        className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center transition-all duration-150 cursor-pointer"
        style={{
          backgroundColor: hovered ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
          border: hovered ? "2px solid rgba(93,156,48,0.6)" : "2px solid rgba(0,0,0,0.08)",
          borderRadius: "2px",
          boxShadow: hovered
            ? "inset 2px 2px 6px rgba(255,255,255,0.4), inset -2px -2px 6px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.12)"
            : "inset 2px 2px 4px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.06)",
          transform: hovered ? "translateY(-2px)" : "none",
        }}
      >
        <span className="text-2xl sm:text-3xl" role="img" aria-label={app.name}>
          {app.icon}
        </span>
      </div>

      {/* Name below slot */}
      <p className="text-[9px] sm:text-[10px] text-coal/50 text-center mt-1.5 font-medium leading-tight max-w-[80px] mx-auto">
        {app.name}
      </p>
    </motion.a>
  );
}

export default function MyApps() {
  const visible = apps.filter((a) => !a.hideFromHome);

  // Fill out the row to keep grid visually balanced
  const slotsPerRow = 8;
  const emptyCount = (Math.ceil(visible.length / slotsPerRow) * slotsPerRow) - visible.length;

  return (
    <section id="apps" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block bg-gold text-coal px-3 py-1.5 mb-6 block-border-sm">
            <span className="font-[family-name:var(--font-pixel)] text-[10px]">
              MY APPS
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-coal mb-4">
            Solutions to niche problems
          </h2>
          <p className="text-coal/60 max-w-2xl mb-16 leading-relaxed">
            Tiny apps I built to solve problems I kept running into. Hover for details,
            click to launch. On iPhone, &ldquo;Add to Home Screen&rdquo; to keep any of
            them one tap away.{" "}
            <a href="/apps" className="text-grass hover:underline font-medium">
              See all →
            </a>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {/* Category header */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="px-3 py-1.5 rounded-sm"
              style={{
                backgroundColor: "#FFD700",
                boxShadow: `inset 2px 2px 4px rgba(255,255,255,0.25), inset -2px -2px 4px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`,
                border: "2px solid rgba(0,0,0,0.1)",
              }}
            >
              <span className="font-[family-name:var(--font-pixel)] text-[10px] text-white drop-shadow-sm">
                Apps
              </span>
            </div>
            <div className="flex-1 h-[2px] bg-coal/5" />
          </div>

          {/* Inventory grid */}
          <div
            className="inline-grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 p-4 rounded-sm"
            style={{
              backgroundColor: "rgba(0,0,0,0.02)",
              border: "2px solid rgba(0,0,0,0.05)",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            {visible.map((app, i) => (
              <AppSlot key={app.slug} app={app} index={i} />
            ))}

            {/* Empty slots to fill the row */}
            {Array.from({ length: emptyCount }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20"
                style={{
                  backgroundColor: "rgba(0,0,0,0.02)",
                  border: "2px dashed rgba(0,0,0,0.06)",
                  borderRadius: "2px",
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
