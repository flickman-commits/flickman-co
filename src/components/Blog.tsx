"use client";

import { motion } from "framer-motion";

interface Post {
  title: string;
  excerpt: string;
  date: string;
  tag: string;
  tagColor: string;
  url: string;
}

const posts: Post[] = [
  {
    title: "Flickman Media Is Dead",
    excerpt:
      "Why I shut down my freelance videography business and what comes next.",
    date: "2024",
    tag: "LIFE",
    tagColor: "#4FC3F7",
    url: "https://flickman.substack.com/p/flickman-media-is-dead",
  },
  {
    title: "10 Ways to Unf*ck Your Life in Your 20s",
    excerpt:
      "Practical, no-BS advice for getting your life together when everything feels chaotic.",
    date: "2024",
    tag: "ADVICE",
    tagColor: "#7CB342",
    url: "https://flickman.substack.com/p/10-ways-to-unfck-your-life-in-your",
  },
  {
    title: "How to Win Without Luck",
    excerpt:
      "Luck is a skill. Here's how to stack the deck in your favor.",
    date: "2024",
    tag: "MINDSET",
    tagColor: "#FFD700",
    url: "https://flickman.substack.com/p/how-to-win-without-luck",
  },
];

export default function Blog() {
  return (
    <section id="blog" className="py-24 pixel-grid">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block bg-wood text-white px-3 py-1.5 mb-6 block-border-sm">
            <span className="font-[family-name:var(--font-pixel)] text-[10px]">
              BLOG
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-coal mb-4">
                Latest thoughts
              </h2>
              <p className="text-coal/60 max-w-2xl">
                Writing about building, life, and whatever else I find interesting.
              </p>
            </div>
            <a
              href="https://flickman.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#FF6719] text-white px-5 py-2.5 text-sm font-semibold block-border-sm block-hover whitespace-nowrap"
            >
              Read all on Substack &rarr;
            </a>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.a
              key={post.title}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white block-border block-hover p-6 flex flex-col cursor-pointer group"
            >
              <div
                className="inline-block self-start px-2 py-1 mb-4 border-2 border-coal"
                style={{ backgroundColor: post.tagColor }}
              >
                <span className="font-[family-name:var(--font-pixel)] text-[8px] text-coal">
                  {post.tag}
                </span>
              </div>
              <h3 className="font-bold text-lg text-coal mb-2 group-hover:text-grass transition-colors">
                {post.title}
              </h3>
              <p className="text-coal/60 text-sm leading-relaxed flex-1">
                {post.excerpt}
              </p>
              <span className="text-coal/40 text-xs mt-4 font-medium">
                {post.date}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
