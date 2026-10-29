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
  // Link-preview cards (src/lib/share-card.ts) shape text with HarfBuzz and
  // render it with resvg; both load a binary kept beside their own code (a
  // .wasm file, a native addon), so they stay in node_modules rather than the
  // bundle. The fonts the cards are drawn in ship with the card's route.
  serverExternalPackages: ["harfbuzzjs", "@resvg/resvg-js"],
  outputFileTracingIncludes: {
    "/share/books/[id]": ["./assets/fonts/*.ttf"],
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
  // second connection, to Cloudinary, before it can draw it. Only what that
  // cover needs: images in the covers folder (which holds only covers an
  // admin attached to a public-domain book; rejected, replaced and removed
  // ones are deleted from Cloudinary), with the covers' transformation, at
  // the widths of COVER_SIZES.today. Anything else is a 404 here, so the
  // rewrite can't be used to make Cloudinary render other images or sizes.
  //
  // Its caching is set in vercel.json, where Vercel documents it for
  // external rewrites: the project predates Vercel caching them by default,
  // so it opts in (x-vercel-enable-rewrite-caching), and Cloudinary marks its
  // responses "private" (f_auto picks a format per browser), so the CDN's own
  // lifetime is set there (CDN-Cache-Control, a day: the cover's turn on the
  // home page, and how long a removed cover could linger). Vercel keys its
  // cache on Accept, so each browser still gets its own format; the browser
  // keeps Cloudinary's own Cache-Control. `next start` doesn't apply these
  // headers to proxied responses, so they only show on Vercel.
  async rewrites() {
    return [
      {
        source: "/cover-image/:transform(f_auto,q_auto,c_lfill,ar_2:3,g_center,w_(?:220|340|440))/covers/:file",
        destination: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/:transform/covers/:file`,
      },
    ];
  },
};

module.exports = nextConfig;
