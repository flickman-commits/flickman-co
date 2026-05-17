/**
 * App registry — the source of truth for flickman.co's personal "app store".
 *
 * To add a new app:
 *   1. Run `npm run new-app <slug>` (scaffolds public/apps/<slug>/)
 *   2. Add an entry below.
 *   3. Push to main. Vercel deploys. Done.
 *
 * Private apps:
 *   Set `private: true` and add an env var on Vercel named APP_PW_<SLUG_UPPER>.
 *   Visitors will be prompted for a password before the app loads. The cookie
 *   lasts 30 days per app.
 */

export type AppEntry = {
  slug: string;
  name: string;
  icon: string; // emoji or single character
  description: string;
  /** Where the app lives. Defaults to `/apps/<slug>`. Override for external links. */
  url?: string;
  /** If true, gated by APP_PW_<SLUG_UPPER> env var via middleware. */
  private?: boolean;
  /** Hide from the homepage grid but still accessible via /apps. */
  hideFromHome?: boolean;
  /** When you built it — used for sort order on /apps. */
  createdAt: string; // YYYY-MM-DD
};

export const apps: AppEntry[] = [
  {
    slug: "nyc",
    name: "What Happened Here?",
    icon: "🗽",
    description:
      "Pings you with hyperlocal NYC history as you walk past it.",
    createdAt: "2025-09-01",
  },
  {
    slug: "resident",
    name: "Resident",
    icon: "🏠",
    description: "A quiet corner of the internet.",
    createdAt: "2025-09-01",
  },
  {
    slug: "handwriting",
    name: "My Handwriting Font",
    icon: "✍️",
    description: "Turn your handwriting into a real, downloadable font.",
    createdAt: "2026-05-11",
  },
  {
    slug: "crepes",
    name: "Crepe Sundays",
    icon: "🥞",
    description:
      "Book a seat at Matt & Nat's Sunday morning crepe bar.",
    url: "/crepes",
    createdAt: "2026-05-12",
  },
];

export function getApp(slug: string): AppEntry | undefined {
  return apps.find((a) => a.slug === slug);
}

export function appUrl(app: AppEntry): string {
  return app.url ?? `/apps/${app.slug}`;
}
