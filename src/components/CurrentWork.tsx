"use client";

import { motion } from "framer-motion";

type Project = {
  icon: string;
  tag: string;
  name: string;
  description: string;
  color: string;
  links: { label: string; href: string; external?: boolean }[];
};

const projects: Project[] = [
  {
    icon: "🏁",
    tag: "Race posters",
    name: "Trackstar",
    description: "Custom race posters that commemorate every finish line.",
    color: "#6AAF35",
    links: [
      { label: "Visit Trackstar", href: "https://www.trackstar.art", external: true },
      { label: "Instagram", href: "https://www.instagram.com/trackstar_art/", external: true },
    ],
  },
  {
    icon: "📊",
    tag: "The show",
    name: "Topline",
    description:
      "A show that breaks down the P&Ls of real local businesses. 1M+ views in its first month.",
    color: "#FF7F4A",
    links: [
      { label: "Watch on Instagram", href: "https://www.instagram.com/topline_________/", external: true },
      { label: "Money Lunches", href: "/topline" },
    ],
  },
];

export default function CurrentWork() {
  return (
    <section id="current-work" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block bg-gold text-coal px-3 py-1.5 mb-6 block-border-sm">
            <span className="font-[family-name:var(--font-pixel)] text-[10px]">CURRENT WORK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-coal mb-12">
            Simple ideas, <span className="text-grass">taken seriously.</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {projects.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div
                className="h-full overflow-hidden rounded-sm transition-all duration-200 hover:-translate-y-1"
                style={{
                  backgroundColor: "#FFF8F0",
                  border: "2px solid rgba(0,0,0,0.08)",
                  boxShadow:
                    "inset 2px 2px 4px rgba(255,255,255,0.5), inset -1px -1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
                }}
              >
                {/* Header */}
                <div
                  className="p-5"
                  style={{
                    backgroundColor: p.color,
                    boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.15)",
                  }}
                >
                  <span className="font-[family-name:var(--font-pixel)] text-[9px] text-white/80 block mb-1.5 uppercase">
                    {p.tag}
                  </span>
                  <h3 className="font-[family-name:var(--font-pixel)] text-sm text-white drop-shadow-sm flex items-center gap-2">
                    <span aria-hidden="true">{p.icon}</span>
                    {p.name}
                  </h3>
                </div>

                {/* Body */}
                <div className="p-5">
                  <p className="text-coal/70 text-sm leading-relaxed mb-5">{p.description}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    {p.links.map((l, j) => (
                      <a
                        key={l.label}
                        href={l.href}
                        {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className={
                          j === 0
                            ? "inline-block bg-coal text-cream px-3 py-1.5 text-xs font-semibold rounded-sm hover:-translate-y-0.5 transition-transform"
                            : "text-xs font-semibold text-coal/60 hover:text-coal transition-colors"
                        }
                        style={j === 0 ? { boxShadow: "0 2px 6px rgba(0,0,0,0.15)" } : undefined}
                      >
                        {l.label} &rarr;
                      </a>
                    ))}
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
