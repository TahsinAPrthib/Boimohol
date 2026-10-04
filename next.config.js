/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // The image optimizer is switched OFF. Listing photos are already served by
    // Cloudinary with f_auto/q_auto and an explicit width applied (see
    // src/lib/cloudinary-url.ts), and the app renders them with plain <img> --
    // nothing uses next/image. Leaving the optimizer on would only expose the
    // /_next/image endpoint, which has a history of advisories (including remote
    // code execution) with no fix on the 14.2 line. With this set, that endpoint
    // returns 404.
    unoptimized: true,
    // Inert while unoptimized is true. Kept so that if the optimizer is ever
    // re-enabled, its allow-list is already narrowed to Cloudinary rather than
    // being widened in a hurry.
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
