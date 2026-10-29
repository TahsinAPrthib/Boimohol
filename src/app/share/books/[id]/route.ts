import { prisma } from "@/lib/prisma";
import { bookCardSvg, renderJpeg } from "@/lib/share-card";
import { bookCardUrl, cardVersion, SITE_SHARE_IMAGE } from "@/lib/share";

// A book's link-preview card (src/lib/share-card.ts), at the address its
// page's og:image gives (bookCardUrl). The address carries a version of
// everything drawn on the card, so the CDN keeps a card for a year, and any
// other version is sent to the current one -- a made-up `v` can't make every
// request draw a new card.
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const book = await prisma.book.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      titleBangla: true,
      author: true,
      coverPublicId: true,
      category: { select: { slug: true, colorKey: true, nameBangla: true } },
    },
  });
  if (!book) return new Response("Not found", { status: 404 });
  if (new URL(request.url).searchParams.get("v") !== cardVersion(book)) {
    return new Response(null, { status: 307, headers: { Location: bookCardUrl(book), "Cache-Control": "public, max-age=300" } });
  }
  try {
    const { svg, complete } = await bookCardSvg(book);
    const jpeg = await renderJpeg(svg);
    return new Response(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        // A card drawn while its real cover couldn't be fetched is tried again soon.
        "Cache-Control": complete ? "public, max-age=86400, s-maxage=31536000, immutable" : "public, max-age=300, s-maxage=300",
      },
    });
  } catch (err) {
    console.error(`[share] the card for ${id} couldn't be drawn: ${err instanceof Error ? err.message : err}`);
    // The site's own picture rather than none.
    return new Response(null, { status: 307, headers: { Location: SITE_SHARE_IMAGE.url, "Cache-Control": "no-store" } });
  }
}
