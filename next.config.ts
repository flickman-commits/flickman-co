import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [],
  },
  async rewrites() {
    return [
      // /apps/<slug> serves public/apps/<slug>/index.html.
      // The /apps page itself (no slug) is unaffected because Next's
      // file-system routes take precedence over rewrites.
      { source: "/apps/:slug", destination: "/apps/:slug/index.html" },
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
