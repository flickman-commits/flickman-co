"use client";

import { motion } from "framer-motion";

interface Company {
  name: string;
  role: string;
  description: string;
  color: string;
  textColor: string;
  url?: string;
}

const companies: Company[] = [
  {
    name: "Trackstar",
    role: "Founder & CEO",
    description:
      "Building the future of race-day experiences for endurance athletes. Trackstar helps race organizers and brands connect with runners through live tracking and real-time engagement.",
    color: "#7CB342",
    textColor: "#fff",
    url: "https://trackstar.com",
  },
  {
    name: "Your Next Company",
    role: "Coming Soon",
    description:
      "Always exploring new ideas and opportunities. If you're building something cool, let's chat.",
    color: "#7F8C8D",
    textColor: "#fff",
  },
];

export default function Companies() {
  return (
    <section id="companies" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block bg-gold text-coal px-3 py-1.5 mb-6 block-border-sm">
            <span className="font-[family-name:var(--font-pixel)] text-[10px]">
              COMPANIES
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-coal mb-4">
            What I&apos;m building
          </h2>
          <p className="text-coal/60 mb-12 max-w-2xl">
            The companies and projects I&apos;m currently working on or involved with.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {companies.map((company, i) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
            >
              <div className="block-border block-hover h-full bg-cream overflow-hidden">
                {/* Block-style header bar */}
                <div
                  className="p-6 border-b-4 border-coal"
                  style={{ backgroundColor: company.color }}
                >
                  <h3
                    className="font-[family-name:var(--font-pixel)] text-sm mb-1"
                    style={{ color: company.textColor }}
                  >
                    {company.name}
                  </h3>
                  <span
                    className="text-xs opacity-80"
                    style={{ color: company.textColor }}
                  >
                    {company.role}
                  </span>
                </div>

                {/* Body */}
                <div className="p-6">
                  <p className="text-coal/70 leading-relaxed mb-4">
                    {company.description}
                  </p>
                  {company.url && (
                    <a
                      href={company.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-coal text-cream px-4 py-2 text-sm font-semibold block-border-sm block-hover"
                    >
                      Visit &rarr;
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
