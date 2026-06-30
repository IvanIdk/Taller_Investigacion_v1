import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Evita conflicto cuando existe package.json en la raíz del monorepo
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
