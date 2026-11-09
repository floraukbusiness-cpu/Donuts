import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Formats modernes servis automatiquement selon le navigateur
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
};

export default nextConfig;
