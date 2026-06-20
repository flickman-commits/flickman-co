import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  images: {
    domains: [],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async rewrites() {
    return [
      // /apps/<slug> serves public/apps/<slug>/index.html.
      // The /apps page itself (no slug) is unaffected because Next's
      // file-system routes take precedence over rewrites.
      { source: "/apps/:slug", destination: "/apps/:slug/index.html" },
      // /content serves public/content/index.html (Nat content knowledge base).
      { source: "/content", destination: "/content/index.html" },
    ];
  },
  async redirects() {
    return [
      // Legacy URLs for apps that moved into /apps/<slug>.
      { source: "/nyc", destination: "/apps/nyc", permanent: true },
      { source: "/nyc/:path*", destination: "/apps/nyc/:path*", permanent: true },
      { source: "/resident", destination: "/apps/resident", permanent: true },
      { source: "/resident/:path*", destination: "/apps/resident/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
