"use client";

import { motion } from "framer-motion";
import { useBlockBreak } from "./BlockBreaker";

interface Company {
  name: string;
  tags: string[];
  description: string;
  color: string;
  textColor: string;
  url?: string;
}

const companies: Company[] = [
  {
    name: "Trackstar",
    tags: ["E-Commerce", "Running"],
    description:
      "The future of race-day experiences for endurance athletes. Trackstar helps race organizers and brands connect with runners through live tracking and real-time engagement.",
    color: "#7CB342",
    textColor: "#fff",
    url: "https://www.trackstar.art",
  },
  {
    name: "Digital Products",
    tags: ["Templates", "Guides"],
    description:
      "Templates, guides, and digital products I've built. Practical tools for creators and operators.",
    color: "#E91E63",
    textColor: "#fff",
    url: "https://flickman.gumroad.com",
  },
  {
    name: "Your Next Company",
    tags: ["Coming Soon"],
    description:
      "Always exploring new ideas and opportunities. If you're working on something cool, let's chat.",
    color: "#7F8C8D",
    textColor: "#fff",
  },
];

export default function Companies() {
  const spawnParticles = useBlockBreak();

  return (
    <section id="companies" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Flickman & Co. holdco intro */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="inline-block bg-gold text-coal px-3 py-1.5 mb-6 block-border-sm">
            <span className="font-[family-name:var(--font-pixel)] text-[10px]">
              FLICKMAN &amp; CO.
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-coal mb-4">
            What I&apos;m working on
          </h2>

          <div className="max-w-3xl space-y-4 text-coal/70 leading-relaxed mb-8">
            <p>
              <strong className="text-coal">Flickman &amp; Co.</strong> is the umbrella for everything I work on.
              The philosophy is simple: find ideas that are simple and profitable, take them seriously,
              and see how far they can go.
            </p>
            <p>
              I like businesses that solve real problems, don&apos;t require a hundred-person team,
              and can be run by a small crew of people who care. Here&apos;s what&apos;s active right now.
            </p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {companies.map((company, i) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              onClick={spawnParticles}
            >
              <div className="block-border block-hover h-full bg-cream overflow-hidden relative">
                {/* Block-style header bar */}
                <div
                  className="p-6 border-b-4 border-coal"
                  style={{ backgroundColor: company.color }}
                >
                  <h3
                    className="font-[family-name:var(--font-pixel)] text-sm mb-2"
                    style={{ color: company.textColor }}
                  >
                    {company.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {company.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold px-2 py-0.5 bg-black/20 rounded-sm"
                        style={{ color: company.textColor }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
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
