"use client";

import type { ImgHTMLAttributes } from "react";

// A page's main image, rendered from a client component on purpose. React's
// server renderer turns every eager <img> in a Server Component into a
// preload hint in the RSC payload, and Next prefetches the book page's header
// for every book link on screen: each card's cover would then download at
// full size before anyone tapped it. From here the image is still in the
// page's HTML, eager and first in line, but a prefetch carries only this
// component's props, so nothing downloads until the page is shown.
export default function PriorityImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- Cloudinary sizes and formats it (src/lib/covers.ts); alt comes with the props
  return <img {...props} />;
}
