"use client";

import { motion } from "framer-motion";
import Image from "next/image";

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
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Left: text content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1"
          >
            {/* Pixel-style greeting */}
            <div className="inline-block bg-grass text-white px-4 py-2 mb-6 block-border-sm">
              <span className="font-[family-name:var(--font-pixel)] text-xs">
                Hey, I&apos;m Matt
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-coal mb-6 leading-[1.1]">
              Simple ideas,
              <br />
              <span className="text-grass">taken seriously.</span>
            </h1>

            <p className="text-lg sm:text-xl text-coal/60 max-w-lg mb-10 leading-relaxed">
              I&apos;m Matt Hickman — I work on businesses and projects, write letters,
              and try to do new things I haven&apos;t done before. Welcome to my corner of the internet.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#companies"
                className="inline-block bg-coal text-cream px-6 py-3 font-semibold block-border-sm block-hover"
              >
                See what I&apos;m working on &darr;
              </a>
              <a
                href="#contact"
                className="inline-block bg-cream text-coal px-6 py-3 font-semibold block-border-sm block-hover"
              >
                Get in touch
              </a>
            </div>
          </motion.div>

          {/* Right: profile photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-shrink-0"
          >
            <div className="block-border overflow-hidden w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64">
              <Image
                src="/matt.png"
                alt="Matt Hickman"
                width={256}
                height={256}
                className="w-full h-full object-cover object-top"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom block strip */}
      <div className="overflow-hidden opacity-30">
        <BlockRow colors={["#7F8C8D", "#95A5A6", "#7F8C8D", "#6B4F0E", "#8B6914"]} count={40} />
      </div>
    </section>
  );
}
