import type { Metadata } from "next";
import { hashSeed } from "@/lib/cover-design";

// Link previews (Open Graph and Twitter cards): what Facebook, Messenger,
// WhatsApp and X show when someone shares a link to the site.
//
// Next replaces a parent's whole `openGraph` (and `twitter`) when a page sets
// its own, so a book's preview repeats the site-wide fields. No site-wide
// og:url: Facebook takes og:url as the page's canonical address, and one
// shared default would fold every page into the home page.

export const SITE_NAME = "বই মহল";
export const SHARE_DESCRIPTION = "বাংলা বইয়ের ঘর — হাজারো বই বিনামূল্যে পড়ুন, আর পাঠকদের হাতে হাতে বই বিক্রি, বিনিময় বা দান করুন।";

// A shot of the living shelf with the wordmark (public/share/boimohol.jpg).
// A new picture needs a new file name: Facebook keeps an image by its address.
export const SITE_SHARE_IMAGE = {
  url: "/share/boimohol.jpg",
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "বই মহলের তাকে সাজানো বই, ওপরে লেখা “বই মহল — বাংলা বইয়ের ঘর”",
};

const LOCALE = "bn_BD";

// Where the site lives, for absolute image and page addresses: the address
// Vercel gives the production deployment, else the local server.
export function siteUrl(): URL {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return new URL(host ? `https://${host}` : (process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
}

export const siteShareMetadata: Pick<Metadata, "openGraph" | "twitter"> = {
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: LOCALE,
    title: SITE_NAME,
    description: SHARE_DESCRIPTION,
    images: [SITE_SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SHARE_DESCRIPTION,
    images: [{ url: SITE_SHARE_IMAGE.url, alt: SITE_SHARE_IMAGE.alt }],
  },
};

// What a book's card draws (src/lib/share-card.ts).
export type CardFields = {
  id: string;
  title: string;
  titleBangla: string | null;
  author: string;
  coverPublicId: string | null;
  category: { slug: string; colorKey: string; nameBangla: string };
};
type SharedBook = CardFields & { description: string };

// Bumped when the card's design changes, so every card gets a new address.
const CARD_DESIGN = 1;

// A version of everything drawn on the card. It is part of the card's
// address, so a corrected title or a new cover reaches Facebook's cache
// instead of the old picture, and the card can be cached for good.
export function cardVersion(book: CardFields): string {
  const { title, titleBangla, author, coverPublicId, category } = book;
  return hashSeed([CARD_DESIGN, title, titleBangla, author, coverPublicId, category.slug, category.colorKey, category.nameBangla].join("\u0000")).toString(36);
}

export function bookCardUrl(book: CardFields): string {
  return `/share/books/${encodeURIComponent(book.id)}?v=${cardVersion(book)}`;
}

// Long descriptions are cut at a word for the preview; the platforms cut
// them anyway, and mid-word.
export function previewText(text: string, max = 220): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 40)).trimEnd()}…`;
}

// A book's preview: its title and author, its description, and a card with
// its cover (src/lib/share-card.ts). `path` is the shared page: the book page
// or a page of its reader.
export function bookShareMetadata(book: SharedBook, path: string): Pick<Metadata, "openGraph" | "twitter"> {
  const name = book.titleBangla || book.title;
  const title = `${name} — ${book.author}`;
  const description = previewText(book.description || SHARE_DESCRIPTION);
  const image = { url: bookCardUrl(book), width: 1200, height: 630, type: "image/jpeg", alt: `${name}, ${book.author} — বইয়ের প্রচ্ছদ` };
  return {
    openGraph: { type: "book", siteName: SITE_NAME, locale: LOCALE, url: path, title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [{ url: image.url, alt: image.alt }] },
  };
}
