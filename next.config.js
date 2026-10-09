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
  // Files under /public are otherwise revalidated on every visit. The hero
  // poster/video and the cursor carry a version in their names (-v1), so they
  // can be cached for a year: to change one, add a new -v2 file and point the
  // code at it, never overwrite the old name.
  async headers() {
    const immutable = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    return [
      { source: "/media/:path*", headers: immutable },
      { source: "/cursors/:path*", headers: immutable },
    ];
  },
};

module.exports = nextConfig;
