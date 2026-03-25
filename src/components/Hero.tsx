"use client";

import { motion } from "framer-motion";

function BlockRow({ colors, count = 12 }: { colors: string[]; count?: number }) {
  return (
    <div className="flex">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-8 h-8 sm:w-12 sm:h-12 border border-black/10 flex-shrink-0"
          style={{
            backgroundColor: colors[i % colors.length],
            boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.15), inset -2px -2px 0 rgba(0,0,0,0.15)",
          }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-20">
      {/* Decorative block strip at the very top */}
      <div className="absolute top-16 left-0 right-0 overflow-hidden opacity-40">
        <BlockRow colors={["#7CB342", "#5D8C3E", "#6B8E23", "#7CB342", "#5D8C3E"]} count={40} />
        <BlockRow colors={["#8B6914", "#6B4F0E", "#8B6914", "#A0522D", "#6B4F0E"]} count={40} />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Slogan */}
          <p className="text-sm sm:text-base text-coal/50 tracking-wide uppercase mb-8 font-medium">
            Simple (+ profitable) ideas, taken seriously.
          </p>

          {/* Pixel-style greeting */}
          <div className="inline-block bg-grass text-white px-4 py-2 mb-8 block-border-sm">
            <span className="font-[family-name:var(--font-pixel)] text-xs">
              Hey, I&apos;m Matt
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-coal mb-6 leading-[1.1]">
            I build things
            <br />
            <span className="text-grass">on the internet.</span>
          </h1>

          <p className="text-lg sm:text-xl text-coal/60 max-w-2xl mb-10 leading-relaxed">
            Founder, builder, and creator. I&apos;m exploring what&apos;s possible at the
            intersection of AI, e-commerce, and community. This is my home base.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-4"
        >
          <a
            href="#companies"
            className="inline-block bg-coal text-cream px-6 py-3 font-semibold block-border-sm block-hover"
          >
            See what I&apos;m building &darr;
          </a>
          <a
            href="#contact"
            className="inline-block bg-cream text-coal px-6 py-3 font-semibold block-border-sm block-hover"
          >
            Get in touch
          </a>
        </motion.div>

        {/* Floating blocks decoration */}
        <motion.div
          className="absolute right-8 top-1/3 hidden lg:block"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="grid grid-cols-3 gap-0">
            {[
              "#7CB342", "#5D8C3E", "#7CB342",
              "#8B6914", "#6B4F0E", "#8B6914",
              "#8B6914", "#8B6914", "#6B4F0E",
            ].map((color, i) => (
              <div
                key={i}
                className="w-16 h-16 border border-black/10"
                style={{
                  backgroundColor: color,
                  boxShadow: "inset 3px 3px 0 rgba(255,255,255,0.15), inset -3px -3px 0 rgba(0,0,0,0.15)",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Second floating block cluster */}
        <motion.div
          className="absolute right-32 bottom-20 hidden lg:block"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <div className="grid grid-cols-2 gap-0">
            {["#7F8C8D", "#95A5A6", "#95A5A6", "#7F8C8D"].map((color, i) => (
              <div
                key={i}
                className="w-12 h-12 border border-black/10"
                style={{
                  backgroundColor: color,
                  boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.15), inset -2px -2px 0 rgba(0,0,0,0.15)",
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom block strip */}
      <div className="overflow-hidden opacity-30">
        <BlockRow colors={["#7F8C8D", "#95A5A6", "#7F8C8D", "#6B4F0E", "#8B6914"]} count={40} />
      </div>
    </section>
  );
}
