import type { NextConfig } from "next";
import { env } from "env";

const nextConfig: NextConfig = {
    output: "export",
    distDir: "out",
    trailingSlash: true,
    images: {
    unoptimized: true,
  },
};

export default nextConfig;
