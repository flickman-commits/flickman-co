"use client";

import { motion } from "framer-motion";

interface Post {
  title: string;
  excerpt: string;
  date: string;
  tag: string;
  tagColor: string;
}

const posts: Post[] = [
  {
    title: "Why I'm Building in Public",
    excerpt:
      "Sharing the journey — the wins, the losses, and everything in between. Here's why I think building in public is the way to go.",
    date: "Coming Soon",
    tag: "THOUGHTS",
    tagColor: "#4FC3F7",
  },
  {
    title: "AI-Powered Web Development",
    excerpt:
      "This entire site was built with Claude Code. Here's what I learned about the future of coding with AI.",
    date: "Coming Soon",
    tag: "TECH",
    tagColor: "#7CB342",
  },
  {
    title: "Lessons from Trackstar",
    excerpt:
      "Key lessons from building a company in the endurance sports space — from cold starts to real traction.",
    date: "Coming Soon",
    tag: "BUSINESS",
    tagColor: "#FFD700",
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

          <h2 className="text-3xl sm:text-4xl font-bold text-coal mb-4">
            Latest thoughts
          </h2>
          <p className="text-coal/60 mb-12 max-w-2xl">
            Writing about building, tech, and whatever else I find interesting.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white block-border block-hover p-6 flex flex-col"
            >
              <div
                className="inline-block self-start px-2 py-1 mb-4 border-2 border-coal"
                style={{ backgroundColor: post.tagColor }}
              >
                <span className="font-[family-name:var(--font-pixel)] text-[8px] text-coal">
                  {post.tag}
                </span>
              </div>
              <h3 className="font-bold text-lg text-coal mb-2">{post.title}</h3>
              <p className="text-coal/60 text-sm leading-relaxed flex-1">
                {post.excerpt}
              </p>
              <span className="text-coal/40 text-xs mt-4 font-medium">
                {post.date}
              </span>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
