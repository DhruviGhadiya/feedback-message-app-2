import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
  },
};

export default nextConfig;
