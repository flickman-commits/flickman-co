"use client";

import { motion } from "framer-motion";
import Image from "next/image";

function Cloud({ className, delay = 0, duration = 30 }: { className?: string; delay?: number; duration?: number }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{ x: ["0%", "100%"] }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    >
      <div className="relative">
        {/* Chunky cloud made of rounded blocks */}
        <div className="flex items-end gap-0">
          <div className="w-8 h-8 bg-white/80 rounded-sm" />
          <div className="w-12 h-14 bg-white/90 rounded-sm -ml-2" />
          <div className="w-16 h-10 bg-white/85 rounded-sm -ml-3" />
          <div className="w-10 h-12 bg-white/80 rounded-sm -ml-2" />
          <div className="w-6 h-6 bg-white/70 rounded-sm -ml-1" />
        </div>
        {/* Soft shadow beneath */}
        <div className="absolute -bottom-1 left-2 right-2 h-2 bg-black/5 rounded-full blur-sm" />
      </div>
    </motion.div>
  );
}

function RealisticBlock({ color, highlight, shadow, size = "w-12 h-12 sm:w-16 sm:h-16" }: {
  color: string;
  highlight: string;
  shadow: string;
  size?: string;
}) {
  return (
    <div
      className={`${size} relative`}
      style={{
        backgroundColor: color,
        borderRadius: "2px",
        boxShadow: `
          inset 3px 3px 6px ${highlight},
          inset -3px -3px 6px ${shadow},
          0 2px 8px rgba(0,0,0,0.15)
        `,
      }}
    >
      {/* Subtle texture noise */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='1' height='1' fill='%23000'/%3E%3Crect x='2' y='1' width='1' height='1' fill='%23000'/%3E%3Crect x='1' y='3' width='1' height='1' fill='%23000'/%3E%3Crect x='3' y='2' width='1' height='1' fill='%23000'/%3E%3C/svg%3E")`,
          backgroundSize: "4px 4px",
        }}
      />
    </div>
  );
}

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden">
      {/* Sky gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #87CEEB 0%, #B8DEF0 35%, #D4ECFA 55%, #E8F4FD 75%, #FFF8F0 100%)",
        }}
      />

      {/* Animated clouds */}
      <Cloud className="top-[8%] -left-[20%]" delay={0} duration={45} />
      <Cloud className="top-[15%] -left-[40%]" delay={8} duration={55} />
      <Cloud className="top-[5%] -left-[60%]" delay={15} duration={50} />
      <Cloud className="top-[22%] -left-[10%]" delay={22} duration={40} />
      <Cloud className="top-[12%] -left-[70%]" delay={30} duration={48} />

      {/* Floating block clusters (realistic style) */}
      <motion.div
        className="absolute right-8 sm:right-16 top-1/4 hidden md:block"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="grid grid-cols-3 gap-[2px] rotate-[8deg]">
          <RealisticBlock color="#6AAF35" highlight="rgba(255,255,255,0.25)" shadow="rgba(0,0,0,0.2)" />
          <RealisticBlock color="#5D9C30" highlight="rgba(255,255,255,0.2)" shadow="rgba(0,0,0,0.25)" />
          <RealisticBlock color="#78BF44" highlight="rgba(255,255,255,0.3)" shadow="rgba(0,0,0,0.15)" />
          <RealisticBlock color="#8B6914" highlight="rgba(255,255,255,0.15)" shadow="rgba(0,0,0,0.3)" />
          <RealisticBlock color="#7A5C12" highlight="rgba(255,255,255,0.12)" shadow="rgba(0,0,0,0.3)" />
          <RealisticBlock color="#96741A" highlight="rgba(255,255,255,0.18)" shadow="rgba(0,0,0,0.25)" />
          <RealisticBlock color="#7A5C12" highlight="rgba(255,255,255,0.1)" shadow="rgba(0,0,0,0.35)" />
          <RealisticBlock color="#8B6914" highlight="rgba(255,255,255,0.15)" shadow="rgba(0,0,0,0.3)" />
          <RealisticBlock color="#6E5010" highlight="rgba(255,255,255,0.1)" shadow="rgba(0,0,0,0.35)" />
        </div>
      </motion.div>

      <motion.div
        className="absolute right-24 sm:right-40 bottom-36 hidden md:block"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      >
        <div className="grid grid-cols-2 gap-[2px] -rotate-[5deg]">
          <RealisticBlock color="#808080" highlight="rgba(255,255,255,0.2)" shadow="rgba(0,0,0,0.25)" size="w-10 h-10 sm:w-14 sm:h-14" />
          <RealisticBlock color="#909090" highlight="rgba(255,255,255,0.25)" shadow="rgba(0,0,0,0.2)" size="w-10 h-10 sm:w-14 sm:h-14" />
          <RealisticBlock color="#909090" highlight="rgba(255,255,255,0.22)" shadow="rgba(0,0,0,0.22)" size="w-10 h-10 sm:w-14 sm:h-14" />
          <RealisticBlock color="#787878" highlight="rgba(255,255,255,0.18)" shadow="rgba(0,0,0,0.3)" size="w-10 h-10 sm:w-14 sm:h-14" />
        </div>
      </motion.div>

      {/* Grass/dirt ground at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        {/* Grass layer */}
        <div className="flex">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={`grass-${i}`}
              className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-10"
              style={{
                backgroundColor: i % 3 === 0 ? "#6AAF35" : i % 3 === 1 ? "#5D9C30" : "#78BF44",
                boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.15)",
              }}
            />
          ))}
        </div>
        {/* Dirt layer */}
        <div className="flex">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={`dirt-${i}`}
              className="flex-shrink-0 w-8 h-6 sm:w-12 sm:h-8"
              style={{
                backgroundColor: i % 3 === 0 ? "#8B6914" : i % 3 === 1 ? "#7A5C12" : "#96741A",
                boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.1), inset -2px -2px 4px rgba(0,0,0,0.2)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
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
            <div
              className="inline-block px-4 py-2 mb-6 rounded-sm"
              style={{
                backgroundColor: "#5D9C30",
                boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.2), 0 3px 10px rgba(0,0,0,0.15)",
                border: "2px solid rgba(0,0,0,0.15)",
              }}
            >
              <span className="font-[family-name:var(--font-pixel)] text-xs text-white drop-shadow-sm">
                Hey, I&apos;m Matt
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-coal mb-6 leading-[1.1]" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
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
                className="inline-block bg-coal text-cream px-6 py-3 font-semibold rounded-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.2), inset 1px 1px 0 rgba(255,255,255,0.1)" }}
              >
                See what I&apos;m working on &darr;
              </a>
              <a
                href="#contact"
                className="inline-block bg-white/80 backdrop-blur-sm text-coal px-6 py-3 font-semibold rounded-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.1), inset 1px 1px 0 rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.08)" }}
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
            <div
              className="overflow-hidden w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-sm"
              style={{
                boxShadow: "0 8px 30px rgba(0,0,0,0.2), inset 3px 3px 6px rgba(255,255,255,0.2), inset -3px -3px 6px rgba(0,0,0,0.15)",
                border: "3px solid rgba(0,0,0,0.12)",
              }}
            >
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
    </section>
  );
}
