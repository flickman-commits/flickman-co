"use client";

import { motion } from "framer-motion";

const socialLinks = [
  { label: "Twitter / X", href: "https://twitter.com/flickman_" },
  { label: "LinkedIn", href: "https://linkedin.com/in/mattflickinger" },
  { label: "GitHub", href: "https://github.com/flickman" },
];

function BlockRow({ colors, count = 60 }: { colors: string[]; count?: number }) {
  return (
    <div className="flex">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-8 h-8 flex-shrink-0"
          style={{
            backgroundColor: colors[i % colors.length],
            boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.1), inset -2px -2px 0 rgba(0,0,0,0.1)",
          }}
        />
      ))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer id="contact" className="bg-coal text-cream">
      {/* Grass/dirt transition blocks */}
      <div className="overflow-hidden">
        <BlockRow colors={["#7CB342", "#5D8C3E", "#6B8E23", "#7CB342", "#5D8C3E"]} />
        <BlockRow colors={["#8B6914", "#6B4F0E", "#8B6914", "#A0522D", "#6B4F0E"]} />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid md:grid-cols-2 gap-12">
            {/* CTA / Newsletter */}
            <div>
              <h2 className="font-[family-name:var(--font-pixel)] text-lg mb-4 text-grass-light">
                Let&apos;s connect
              </h2>
              <p className="text-cream/60 mb-6 leading-relaxed max-w-md">
                I&apos;m always down to meet new people, hear about cool projects, or just chat.
                Drop your email and I&apos;ll keep you in the loop on what I&apos;m building.
              </p>

              {/* Newsletter signup placeholder */}
              <div className="flex gap-2 max-w-md">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-cream/10 border-3 border-cream/20 px-4 py-3 text-cream placeholder:text-cream/30 focus:outline-none focus:border-grass"
                />
                <button className="bg-grass text-white px-6 py-3 font-semibold block-border-sm block-hover whitespace-nowrap">
                  Subscribe
                </button>
              </div>
              <p className="text-cream/30 text-xs mt-2">
                No spam. Unsubscribe anytime.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-col items-start md:items-end gap-6">
              <div className="flex flex-col gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cream/60 hover:text-grass-light transition-colors text-sm"
                  >
                    {link.label} &rarr;
                  </a>
                ))}
              </div>

              <a
                href="mailto:matt@flickman.co"
                className="text-cream/60 hover:text-grass-light transition-colors text-sm"
              >
                matt@flickman.co
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-6 border-t border-cream/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="font-[family-name:var(--font-pixel)] text-xs text-cream/40">
              flickman.co
            </span>
            <span className="text-cream/30 text-xs">
              &copy; {new Date().getFullYear()} Matt Flickinger. Built with Claude Code.
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
