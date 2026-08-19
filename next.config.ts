import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  outputFileTracingIncludes: {
    "/api/orders/[id]/invoice": ["./public/images/logo.png", "./src/assets/logo.png"],
    "/api/admin/orders/[id]/checklist": ["./public/images/logo.png", "./src/assets/logo.png"],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;
