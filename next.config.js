/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Listing photos are served straight from Cloudinary with f_auto/q_auto
    // and an explicit width already applied (see src/lib/cloudinary.ts), so
    // the app renders them with plain <img> rather than next/image — running
    // them through a second optimizer would be redundant work.
    // This pattern is declared so next/image works if anything switches to it.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
