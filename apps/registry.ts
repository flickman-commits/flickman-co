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
    name: "NYC Facts",
    icon: "🗽",
    description: "A new fact about New York City, every day.",
    createdAt: "2025-09-01",
  },
  {
    slug: "resident",
    name: "Resident",
    icon: "🏠",
    description: "A quiet corner of the internet.",
    createdAt: "2025-09-01",
  },
];

export function getApp(slug: string): AppEntry | undefined {
  return apps.find((a) => a.slug === slug);
}

export function appUrl(app: AppEntry): string {
  return app.url ?? `/apps/${app.slug}`;
}
