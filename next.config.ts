import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v1.screenshot.11ty.dev',
      },
      {
        protocol: 'https',
        hostname: 'spup.edu.ph',
      },
    ],
  },
  experimental: {
    // Required for SSE/streaming on Vercel
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
