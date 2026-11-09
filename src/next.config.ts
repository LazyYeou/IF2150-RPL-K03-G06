import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "@node-rs/argon2"],
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
