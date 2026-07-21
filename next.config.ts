import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cejogmlghjrjkiddqdwv.supabase.co",
      },
    ],
  }


};

export default nextConfig;
