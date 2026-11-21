import { existsSync } from "node:fs";
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (
  process.env.NODE_ENV === "development" &&
  existsSync("./freebuff.wrangler.jsonc") &&
  existsSync("./freebuff-sites-build/entry.js")
) {
  void initOpenNextCloudflareForDev({ configPath: "./freebuff.wrangler.jsonc" });
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  async redirects() {
    return [
      { source: "/checkout", destination: "/order-request", permanent: false },
      {
        source: "/order/:path*",
        destination: "/order-request",
        permanent: false,
      },
      {
        source: "/account/orders/:path*",
        destination: "/account",
        permanent: false,
      },
      {
        source: "/admin/orders/:path*",
        destination: "/admin",
        permanent: false,
      },
    ];
  },
  images: {
    // Next's server-side image optimiser needs native sharp, which workerd
    // cannot load. The catalogue images are already pre-sized WebP files.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
