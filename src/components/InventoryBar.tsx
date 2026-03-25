"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InventoryItem {
  icon: string;
  label: string;
  href: string;
  color: string;
}

const items: InventoryItem[] = [
  { icon: "👤", label: "About", href: "#about", color: "#4FC3F7" },
  { icon: "🏢", label: "Companies", href: "#companies", color: "#FFD700" },
  { icon: "📝", label: "Letters", href: "#letters", color: "#A0522D" },
  { icon: "🛒", label: "Shop", href: "https://flickman.gumroad.com", color: "#E91E63" },
  { icon: "📸", label: "Instagram", href: "https://instagram.com/flickman", color: "#C13584" },
  { icon: "✉️", label: "Subscribe", href: "https://flickman.substack.com/subscribe", color: "#FF6719" },
  { icon: "💬", label: "Contact", href: "#contact", color: "#7F8C8D" },
];

export default function InventoryBar() {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const handleClick = (item: InventoryItem, index: number) => {
    setActiveSlot(index);
    if (item.href.startsWith("http")) {
      window.open(item.href, "_blank", "noopener,noreferrer");
    } else {
      const el = document.querySelector(item.href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    setTimeout(() => setActiveSlot(null), 300);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-coal/90 text-cream text-xs px-3 py-1.5 whitespace-nowrap border-2 border-cream/20"
            style={{ imageRendering: "pixelated" }}
          >
            <span className="font-[family-name:var(--font-pixel)] text-[8px]">
              {tooltip}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hotbar */}
      <div
        className="flex bg-coal/80 backdrop-blur-sm p-1 gap-0.5"
        style={{
          border: "3px solid #555",
          boxShadow: "inset 0 0 0 1px #222, 0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {items.map((item, i) => (
          <button
            key={item.label}
            onClick={() => handleClick(item, i)}
            onMouseEnter={() => setTooltip(item.label)}
            onMouseLeave={() => setTooltip(null)}
            className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all duration-100"
            style={{
              background: activeSlot === i
                ? "rgba(255,255,255,0.2)"
                : "rgba(80,80,80,0.6)",
              border: activeSlot === i
                ? "2px solid #fff"
                : "2px solid rgba(40,40,40,0.8)",
              boxShadow: activeSlot === i
                ? "inset 0 0 8px rgba(255,255,255,0.3)"
                : "inset 1px 1px 0 rgba(255,255,255,0.05), inset -1px -1px 0 rgba(0,0,0,0.3)",
            }}
          >
            <span className="text-lg sm:text-xl" role="img" aria-label={item.label}>
              {item.icon}
            </span>

            {/* Slot number (like Minecraft) */}
            <span className="absolute bottom-0 right-0.5 font-[family-name:var(--font-pixel)] text-[6px] text-white/30">
              {i + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
