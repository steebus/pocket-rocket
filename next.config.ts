import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets two dev servers run side by side during development (NEXT_DIST_DIR=.next-a).
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
