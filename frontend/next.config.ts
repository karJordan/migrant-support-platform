import type { NextConfig } from "next";

const cloudflare = require("../cloudflare.config.cjs");

const frontendHost = new URL(cloudflare.frontendUrl).hostname;

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    frontendHost,
  ],

  env: {
    NEXT_PUBLIC_API_URL: cloudflare.backendUrl,
  },
};

export default nextConfig;