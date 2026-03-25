"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Tool {
  name: string;
  icon: string;
  url: string;
  description: string;
}

interface ToolCategory {
  label: string;
  color: string;
  tools: Tool[];
}

const categories: ToolCategory[] = [
  {
    label: "Software",
    color: "#4FC3F7",
    tools: [
      { name: "Claude Code", icon: "🤖", url: "https://claude.ai", description: "AI coding assistant — built this entire site with it" },
      { name: "Cursor", icon: "⌨️", url: "https://cursor.com", description: "AI-native code editor" },
      { name: "Vercel", icon: "▲", url: "https://vercel.com", description: "Hosting & deployment platform" },
      { name: "Figma", icon: "🎨", url: "https://figma.com", description: "Design & prototyping" },
      { name: "Notion", icon: "📓", url: "https://notion.so", description: "Notes, docs, and project management" },
      { name: "Shopify", icon: "🛍️", url: "https://shopify.com", description: "E-commerce platform" },
      { name: "Substack", icon: "✉️", url: "https://substack.com", description: "Newsletter & writing" },
      { name: "Gumroad", icon: "💰", url: "https://gumroad.com", description: "Digital product sales" },
      { name: "Google Workspace", icon: "📧", url: "https://workspace.google.com", description: "Email, docs, sheets" },
      { name: "Slack", icon: "💬", url: "https://slack.com", description: "Team communication" },
      { name: "GitHub", icon: "🐙", url: "https://github.com", description: "Code hosting & version control" },
      { name: "ChatGPT", icon: "💡", url: "https://chat.openai.com", description: "AI brainstorming & research" },
    ],
  },
  {
    label: "Physical",
    color: "#7CB342",
    tools: [
      { name: "MacBook Pro", icon: "💻", url: "https://apple.com/macbook-pro", description: "Daily driver for everything" },
      { name: "AirPods Pro", icon: "🎧", url: "https://apple.com/airpods-pro", description: "Music & calls on the go" },
      { name: "iPhone", icon: "📱", url: "https://apple.com/iphone", description: "Camera, communication, life" },
      { name: "Kindle", icon: "📚", url: "https://amazon.com/kindle", description: "Reading on the go" },
      { name: "Running Shoes", icon: "👟", url: "https://www.trackstar.art", description: "Training for the next race" },
      { name: "Moleskine", icon: "📝", url: "https://moleskine.com", description: "Analog notes & sketching" },
    ],
  },
  {
    label: "Custom Built",
    color: "#FFD700",
    tools: [
      { name: "This Website", icon: "🌐", url: "https://flickman.co", description: "Built with Next.js + Claude Code" },
      { name: "Trackstar", icon: "🏃", url: "https://www.trackstar.art", description: "Race-day experience platform" },
      { name: "Coming Soon", icon: "🔨", url: "#", description: "Always building something new" },
    ],
  },
];

function ToolSlot({ tool, index }: { tool: Tool; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href={tool.url}
      target={tool.url.startsWith("http") ? "_blank" : undefined}
      rel={tool.url.startsWith("http") ? "noopener noreferrer" : undefined}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative group"
    >
      {/* Tooltip */}
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 z-20 bg-coal/95 text-cream px-3 py-2 min-w-[180px] pointer-events-none"
          style={{
            border: "2px solid rgba(255,255,255,0.15)",
            borderRadius: "2px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          <p className="font-[family-name:var(--font-pixel)] text-[8px] text-grass-light mb-1">
            {tool.name}
          </p>
          <p className="text-[10px] text-cream/60 leading-tight">
            {tool.description}
          </p>
        </motion.div>
      )}

      {/* Slot */}
      <div
        className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center transition-all duration-150 cursor-pointer"
        style={{
          backgroundColor: hovered ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
          border: hovered ? "2px solid rgba(93,156,48,0.6)" : "2px solid rgba(0,0,0,0.08)",
          borderRadius: "2px",
          boxShadow: hovered
            ? "inset 2px 2px 6px rgba(255,255,255,0.4), inset -2px -2px 6px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.12)"
            : "inset 2px 2px 4px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.06)",
          transform: hovered ? "translateY(-2px)" : "none",
        }}
      >
        <span className="text-2xl sm:text-3xl" role="img" aria-label={tool.name}>
          {tool.icon}
        </span>
      </div>

      {/* Name below slot */}
      <p className="text-[9px] sm:text-[10px] text-coal/50 text-center mt-1.5 font-medium leading-tight max-w-[80px] mx-auto">
        {tool.name}
      </p>
    </motion.a>
  );
}

export default function ToolsStack() {
  return (
    <section id="tools" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block bg-diamond text-coal px-3 py-1.5 mb-6 block-border-sm">
            <span className="font-[family-name:var(--font-pixel)] text-[10px]">
              INVENTORY
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-coal mb-4">
            Tools &amp; tech stack
          </h2>
          <p className="text-coal/60 max-w-2xl mb-16 leading-relaxed">
            The software, hardware, and custom-built tools I use every day to build businesses
            and stay productive. Hover for details, click to check them out.
          </p>
        </motion.div>

        {/* Categories */}
        <div className="space-y-16">
          {categories.map((category) => (
            <motion.div
              key={category.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              {/* Category header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="px-3 py-1.5 rounded-sm"
                  style={{
                    backgroundColor: category.color,
                    boxShadow: `inset 2px 2px 4px rgba(255,255,255,0.25), inset -2px -2px 4px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`,
                    border: "2px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <span className="font-[family-name:var(--font-pixel)] text-[10px] text-white drop-shadow-sm">
                    {category.label}
                  </span>
                </div>
                <div className="flex-1 h-[2px] bg-coal/5" />
              </div>

              {/* Inventory grid */}
              <div
                className="inline-grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 p-4 rounded-sm"
                style={{
                  backgroundColor: "rgba(0,0,0,0.02)",
                  border: "2px solid rgba(0,0,0,0.05)",
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                {category.tools.map((tool, i) => (
                  <ToolSlot key={tool.name} tool={tool} index={i} />
                ))}

                {/* Empty slots to fill the grid row */}
                {Array.from({ length: (Math.ceil(category.tools.length / 8) * 8) - category.tools.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.02)",
                      border: "2px dashed rgba(0,0,0,0.06)",
                      borderRadius: "2px",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
