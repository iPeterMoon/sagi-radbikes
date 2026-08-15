import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "qqgwvtlmrioczsorbpof.supabase.co",
        port: "",
        pathname: "/**",
      }
    ],
  },
  output: "standalone",
  outputFileTracingIncludes: {
    "/api/print": [
      "./node_modules/@node-escpos/**/*",
      "./node_modules/usb/**/*",
    ],
  },
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  serverExternalPackages: ['node-thermal-printer'],
};

export default nextConfig;
