import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The app accepts photos up to 5 MB; the extra megabyte covers multipart fields.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
