"use client";

import { motion } from "framer-motion";

function RealisticBlockRow({ colors, count = 60 }: { colors: { bg: string; hl: string; sh: string }[]; count?: number }) {
  return (
    <div className="flex">
      {Array.from({ length: count }).map((_, i) => {
        const c = colors[i % colors.length];
        return (
          <div
            key={i}
            className="w-8 h-8 flex-shrink-0"
            style={{
              backgroundColor: c.bg,
              boxShadow: `inset 2px 2px 4px ${c.hl}, inset -2px -2px 4px ${c.sh}`,
            }}
          />
        );
      })}
    </div>
  );
}

const grassColors = [
  { bg: "#6AAF35", hl: "rgba(255,255,255,0.2)", sh: "rgba(0,0,0,0.15)" },
  { bg: "#5D9C30", hl: "rgba(255,255,255,0.18)", sh: "rgba(0,0,0,0.18)" },
  { bg: "#78BF44", hl: "rgba(255,255,255,0.25)", sh: "rgba(0,0,0,0.12)" },
];

const dirtColors = [
  { bg: "#8B6914", hl: "rgba(255,255,255,0.12)", sh: "rgba(0,0,0,0.25)" },
  { bg: "#7A5C12", hl: "rgba(255,255,255,0.1)", sh: "rgba(0,0,0,0.28)" },
  { bg: "#96741A", hl: "rgba(255,255,255,0.15)", sh: "rgba(0,0,0,0.2)" },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-coal text-cream">
      {/* Grass/dirt transition blocks */}
      <div className="overflow-hidden">
        <RealisticBlockRow colors={grassColors} />
        <RealisticBlockRow colors={dirtColors} />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left: CTA */}
            <div>
              <h2 className="font-[family-name:var(--font-pixel)] text-lg text-grass-light">
                Let&apos;s connect
              </h2>
            </div>

            {/* Right: Links */}
            <div className="flex flex-col items-start md:items-end gap-4">
              <a
                href="https://www.instagram.com/flickman/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/60 hover:text-grass-light transition-colors text-sm"
              >
                Flickman IG &rarr;
              </a>
              <a
                href="https://www.instagram.com/trackstar_art/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/60 hover:text-grass-light transition-colors text-sm"
              >
                Trackstar IG &rarr;
              </a>
              <a
                href="https://flickman.substack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/60 hover:text-grass-light transition-colors text-sm"
              >
                Substack &rarr;
              </a>
              <a
                href="mailto:matt@flickmanmedia.com"
                className="text-cream/60 hover:text-grass-light transition-colors text-sm"
              >
                Email me &rarr;
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-6 border-t border-cream/10 flex justify-center sm:justify-end">
            <span className="text-cream/30 text-xs">
              &copy;2026 Flickman LLC. All rights reserved.
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
