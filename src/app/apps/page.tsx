import Link from "next/link";
import type { Metadata } from "next";
import { apps, appUrl } from "../../../apps/registry";

export const metadata: Metadata = {
  title: "Apps | Flickman",
  description: "Little apps and tools I've built for myself.",
};

export default function AppsPage() {
  const sorted = [...apps].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <main className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-block font-[family-name:var(--font-pixel)] text-[10px] text-coal/50 hover:text-coal mb-8"
        >
          ← flickman.co
        </Link>

        <div className="inline-block bg-gold text-coal px-3 py-1.5 mb-6 block-border-sm">
          <span className="font-[family-name:var(--font-pixel)] text-[10px]">
            MY APPS
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-coal mb-4">
          Apps
        </h1>
        <p className="text-coal/60 leading-relaxed mb-12 max-w-2xl">
          Personal apps and tools. Most are static one-pagers. Some are private.
          All hosted on flickman.co — built fast, shipped to my phone.
        </p>

        <ul className="divide-y divide-coal/10">
          {sorted.map((app) => (
            <li key={app.slug}>
              <a
                href={appUrl(app)}
                className="flex items-center gap-4 py-4 group"
              >
                <div
                  className="w-14 h-14 flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    border: "2px solid rgba(0,0,0,0.08)",
                    borderRadius: "12px",
                    boxShadow:
                      "inset 2px 2px 4px rgba(255,255,255,0.4), inset -2px -2px 4px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <span className="text-3xl" role="img" aria-label={app.name}>
                    {app.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-coal group-hover:text-grass transition-colors">
                      {app.name}
                    </h2>
                    {app.private && (
                      <span className="text-xs opacity-50">🔒 private</span>
                    )}
                  </div>
                  <p className="text-sm text-coal/60 truncate">
                    {app.description}
                  </p>
                </div>
                <span className="text-coal/30 group-hover:text-grass transition-colors">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
