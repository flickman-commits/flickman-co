"use client";

import { motion } from "framer-motion";

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
          <div className="space-y-4 text-coal/70 leading-relaxed max-w-2xl">
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
        </motion.div>
      </div>
    </section>
  );
}
