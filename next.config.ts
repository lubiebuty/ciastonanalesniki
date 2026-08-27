import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Dockerfile copies .next/standalone — without this the image build fails.
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
