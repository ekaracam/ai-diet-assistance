import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Turbopack alias for @shared (Next.js 16 uses Turbopack by default)
  turbopack: {
    resolveAlias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
};

export default nextConfig;
