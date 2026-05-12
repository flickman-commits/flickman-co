#!/usr/bin/env node
/**
 * Scaffold a new app under public/apps/<slug>/.
 *
 * Usage:
 *   npm run new-app -- my-slug "My App Name" 🎯
 *
 * After running:
 *   1. Add the slug to apps/registry.ts
 *   2. Edit public/apps/<slug>/index.html
 *   3. git push → live at flickman.co/apps/<slug>
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

const [, , slugRaw, nameRaw, iconRaw] = process.argv;

if (!slugRaw) {
  console.error("Usage: npm run new-app -- <slug> [\"Name\"] [icon]");
  process.exit(1);
}

const slug = slugRaw.toLowerCase().replace(/[^a-z0-9-]/g, "-");
const name = nameRaw ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const icon = iconRaw ?? "✨";

const dir = join(process.cwd(), "public", "apps", slug);

try {
  await access(dir);
  console.error(`✘ public/apps/${slug} already exists`);
  process.exit(1);
} catch {}

await mkdir(dir, { recursive: true });

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="${name}">
  <meta name="theme-color" content="#FFF8F0">
  <link rel="manifest" href="/apps/${slug}/manifest.json">
  <link rel="apple-touch-icon" href="/apps/${slug}/icon.png">
  <link rel="stylesheet" href="/apps/_shared.css">
  <title>${name}</title>
  <style>
    /* App-specific overrides go here */
    .hero { text-align: center; padding: 48px 0; }
    .hero .icon { font-size: 64px; }
    .hero h1 { margin: 16px 0 8px; }
    .hero p { color: rgba(0,0,0,0.6); margin: 0; }
  </style>
</head>
<body>
  <div class="fm-container">
    <a href="/" class="fm-back">← flickman.co</a>
    <div class="hero">
      <div class="icon">${icon}</div>
      <h1>${name}</h1>
      <p>Hello from your new app.</p>
    </div>
  </div>
  <script>
    // Your code here.
  </script>
</body>
</html>
`;

const manifest = {
  name,
  short_name: name,
  start_url: `/apps/${slug}/`,
  scope: `/apps/${slug}/`,
  display: "standalone",
  background_color: "#FFF8F0",
  theme_color: "#FFF8F0",
  icons: [
    { src: `/apps/${slug}/icon.png`, sizes: "192x192", type: "image/png" },
    { src: `/apps/${slug}/icon.png`, sizes: "512x512", type: "image/png" },
  ],
};

await writeFile(join(dir, "index.html"), html);
await writeFile(join(dir, "manifest.json"), JSON.stringify(manifest, null, 2));

console.log(`✓ Created public/apps/${slug}/`);
console.log(`  - index.html`);
console.log(`  - manifest.json`);
console.log("");
console.log("Next steps:");
console.log(`  1. Drop a 512x512 icon at public/apps/${slug}/icon.png`);
console.log(`  2. Add this to apps/registry.ts:`);
console.log("");
console.log(`     {`);
console.log(`       slug: "${slug}",`);
console.log(`       name: "${name}",`);
console.log(`       icon: "${icon}",`);
console.log(`       description: "TODO",`);
console.log(`       createdAt: "${new Date().toISOString().slice(0, 10)}",`);
console.log(`     },`);
console.log("");
console.log(`  3. npm run dev → http://localhost:3000/apps/${slug}`);
