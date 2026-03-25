"use client";

import { motion } from "framer-motion";

interface Venture {
  name: string;
  year: string;
  description: string;
  color: string;
}

const ventures: Venture[] = [
  { name: "Venture 1", year: "20XX", description: "Description coming soon.", color: "#7CB342" },
  { name: "Venture 2", year: "20XX", description: "Description coming soon.", color: "#4FC3F7" },
  { name: "Venture 3", year: "20XX", description: "Description coming soon.", color: "#FFD700" },
  { name: "Venture 4", year: "20XX", description: "Description coming soon.", color: "#E91E63" },
  { name: "Venture 5", year: "20XX", description: "Description coming soon.", color: "#A0522D" },
  { name: "Venture 6", year: "20XX", description: "Description coming soon.", color: "#9C27B0" },
];

export default function About() {
  return (
    <section id="about" className="py-24 pixel-grid">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          {/* Section label */}
          <div className="inline-block bg-diamond text-coal px-3 py-1.5 mb-6 block-border-sm">
            <span className="font-[family-name:var(--font-pixel)] text-[10px]">
              ABOUT
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-coal mb-6">
            A little about me
          </h2>
          <div className="space-y-4 text-coal/70 leading-relaxed max-w-2xl mb-16">
            <p>
              I&apos;m Matt — I love working on businesses and projects, reading, running &amp; exploring
              NYC with my girlfriend, and trying to do new things I haven&apos;t done in the past.
            </p>
            <p>
              Right now I&apos;m focused on growing <strong className="text-coal">Trackstar</strong> and
              always tinkering with new ideas on the side. I believe the best way to learn
              is by shipping and iterating in public.
            </p>
          </div>

          {/* A history of ventures */}
          <h3 className="text-2xl sm:text-3xl font-bold text-coal mb-8">
            A history of ventures
          </h3>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ventures.map((venture, i) => (
              <motion.div
                key={venture.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white block-border block-hover overflow-hidden"
              >
                {/* Color bar header */}
                <div
                  className="px-4 py-3 border-b-3 border-coal flex items-center justify-between"
                  style={{ backgroundColor: venture.color }}
                >
                  <span className="font-[family-name:var(--font-pixel)] text-[10px] text-white">
                    {venture.name}
                  </span>
                  <span className="font-[family-name:var(--font-pixel)] text-[8px] text-white/60">
                    {venture.year}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-coal/50 text-sm leading-relaxed">
                    {venture.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
