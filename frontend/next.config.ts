import type { NextConfig } from "next";
import path from "path";

// Monorepo: Vercel fija outputFileTracingRoot en la raíz del repo; turbopack.root debe coincidir.
const repoRoot = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  turbopack: {
    root: repoRoot,
  },
};

export default nextConfig;
