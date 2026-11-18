import type { NextConfig } from "next";

const PROD_API_URL =
  "https://emergency-ambulance-dispatch-system-seven.vercel.app/api/v1";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;
const isProd = Boolean(process.env.VERCEL || process.env.NODE_ENV === "production");
const resolvedApiBase = (
  rawApiUrl && !(isProd && rawApiUrl.includes("localhost"))
    ? rawApiUrl
    : PROD_API_URL
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "@base-ui/react",
      "@tanstack/react-query",
      "@tanstack/react-virtual",
      "lucide-react",
      "recharts",
      "sonner",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${resolvedApiBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
