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
              <h2 className="font-[family-name:var(--font-pixel)] text-lg mb-4 text-grass-light">
                Let&apos;s connect
              </h2>
              <p className="text-cream/60 mb-6 leading-relaxed max-w-md">
                Subscribe for more letters on business &amp; life.
              </p>

              <a
                href="https://flickman.substack.com/subscribe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#FF6719] text-white px-6 py-3 font-semibold rounded-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Subscribe on Substack &rarr;
              </a>
            </div>

            {/* Right: Links */}
            <div className="flex flex-col items-start md:items-end gap-4">
              <a
                href="https://instagram.com/flickman"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/60 hover:text-grass-light transition-colors text-sm"
              >
                Instagram &rarr;
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
          <div className="mt-16 pt-6 border-t border-cream/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="font-[family-name:var(--font-pixel)] text-xs text-cream/40">
              Flickman &amp; Co.
            </span>
            <span className="text-cream/30 text-xs">
              &copy;2026 Flickman LLC. All rights reserved.
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
