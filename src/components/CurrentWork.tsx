"use client";

import { motion } from "framer-motion";

type Project = {
  icon: string;
  name: string;
  description: string;
  color: string;
  links: { label: string; href: string; external?: boolean }[];
};

const projects: Project[] = [
  {
    icon: "🏁",
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
              className="p-6 rounded-sm bg-white"
              style={{
                border: "2px solid rgba(0,0,0,0.08)",
                borderTop: `4px solid ${p.color}`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl" aria-hidden="true">
                  {p.icon}
                </span>
                <h3 className="text-2xl font-bold text-coal">{p.name}</h3>
              </div>
              <p className="text-coal/60 leading-relaxed mb-5">{p.description}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {p.links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="text-sm font-semibold text-coal hover:text-grass transition-colors"
                  >
                    {l.label} &rarr;
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
