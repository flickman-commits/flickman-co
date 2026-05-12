# Personal App Store

flickman.co doubles as a personal "app store" — a place to ship tiny apps to my phone without spinning up new projects.

## Architecture

```
apps/
  registry.ts          ← source of truth: every app listed here
  README.md            ← (this file)

public/apps/
  _shared.css          ← shared styling — opt in via <link>
  <slug>/
    index.html         ← the app
    manifest.json      ← PWA manifest (enables Add to Home Screen)
    icon.png           ← 512x512 icon

src/app/apps/
  page.tsx             ← the full /apps index page
  unlock/[slug]/       ← password prompt for private apps

src/app/api/apps/unlock/
  route.ts             ← POST → set cookie if password matches

src/middleware.ts      ← gates /apps/<slug> for private apps
```

## Workflow: ship a new app

```bash
npm run new-app -- my-slug "My App" 🎯
```

That scaffolds `public/apps/my-slug/` with HTML + manifest. Then:

1. Drop a 512×512 icon at `public/apps/my-slug/icon.png`
2. Add an entry to `apps/registry.ts`
3. Edit `public/apps/my-slug/index.html`
4. `git push` → live at `flickman.co/apps/my-slug` in ~30s

## Two tiers of app

- **Static** (default) → drop HTML/JS/CSS into `public/apps/<slug>/`.
- **Dynamic** (needs backend) → build a Next.js route at `src/app/apps/<slug>/page.tsx` and skip the public folder. Use this when you need API routes, server-side secrets, or a database.

Both work at `flickman.co/apps/<slug>`. Both show up via the registry.

## Shared styling

Apps that want the flickman.co look just include:

```html
<link rel="stylesheet" href="/apps/_shared.css">
```

Override anything by loading your own CSS after it, or by overriding the CSS variables (`--fm-bg`, `--fm-accent`, etc.). Apps don't have to use it.

## Private apps

To gate an app with a password:

1. Set `private: true` in the registry entry.
2. On Vercel, add an env var named `APP_PW_<SLUG_UPPER>` (e.g. `APP_PW_JOURNAL`). Hyphens in slugs become underscores.
3. First visit prompts for password. On success, an HTTP-only cookie lasts 30 days.

Middleware does the gating — see `src/middleware.ts`.

## Database (when you need one)

Not set up yet. When the first app needs persistence, pick:

- **Vercel KV** (Redis) — fastest for simple key/value, counters, lists.
- **Vercel Postgres** — when you need relations or want to query.
- **Upstash Redis** — generous free tier, similar to KV.

Plan: build the dynamic app under `src/app/apps/<slug>/`, install `@vercel/kv` or similar, and put the connection in `src/lib/db.ts` so all apps can share it.

## Make it feel native on your phone

1. Open `flickman.co/apps/<slug>` in Safari on iPhone.
2. Tap the share icon → "Add to Home Screen".
3. Because each app has its own `manifest.json` with `display: "standalone"`, the icon launches without Safari chrome — feels like a native app.
