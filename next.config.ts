import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["ucarecdn.com"],
  },
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
