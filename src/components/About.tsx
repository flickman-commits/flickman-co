"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "Companies Built", value: "3+" },
  { label: "Years Creating", value: "10+" },
  { label: "Cups of Coffee", value: "∞" },
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

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Bio */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-coal mb-6">
                A little about me
              </h2>
              <div className="space-y-4 text-coal/70 leading-relaxed">
                <p>
                  I&apos;m Matt Hickman (Flickman) — a builder, creator, and explorer based in the world of
                  startups, e-commerce, and AI. I love making things that people actually use.
                </p>
                <p>
                  I&apos;m currently focused on growing <strong className="text-coal">Trackstar</strong>,
                  and always tinkering with new ideas on the side. I believe the best way to learn
                  is by shipping and iterating in public.
                </p>
                <p>
                  When I&apos;m not working, you&apos;ll probably find me playing Minecraft,
                  exploring new places, or going down a rabbit hole on some random topic.
                </p>
              </div>
            </div>

            {/* Stats blocks */}
            <div className="grid grid-cols-1 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-white p-6 block-border block-hover flex items-center gap-6"
                >
                  <span className="font-[family-name:var(--font-pixel)] text-2xl text-grass">
                    {stat.value}
                  </span>
                  <span className="text-coal/60 font-medium">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
