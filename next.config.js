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
  // Files under /public are otherwise revalidated on every visit. The cursor
  // carries a version in its name (-v1), so it can be cached for a year: to
  // change it, add a new -v2 file and point the code at it, never overwrite
  // the old name.
  async headers() {
    const immutable = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    return [{ source: "/cursors/:path*", headers: immutable }];
  },
  // The home page's book of the day, its largest paint, is fetched through
  // the site's own address (src/lib/covers.ts), so a phone needn't open a
  // second connection, to Cloudinary, before it can draw it. Only cover
  // images, with the transformation the covers use; Cloudinary still sizes,
  // formats and caches them.
  async rewrites() {
    return [
      {
        source: "/cover-image/:transform(f_auto,q_auto,c_lfill,ar_2:3,g_center,w_\\d+)/covers/:file",
        destination: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/:transform/covers/:file`,
      },
    ];
  },
};

module.exports = nextConfig;
