import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "পাতাটি পাওয়া যায়নি · বই মহল",
  robots: { index: false },
};

// Every notFound() on the site, and every address that matches no page,
// ends here -- inside the site's own layout, with a 404 status (when the
// notFound() comes before anything has been streamed: see the layouts).
export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center" data-not-found>
      <p className="font-display text-7xl leading-none text-ink/15" aria-hidden="true">
        ৪০৪
      </p>
      <h1 className="mt-4 font-display text-3xl text-ink">এই পাতাটি পাওয়া যায়নি</h1>
      <p className="mx-auto mt-3 max-w-prose font-body text-ink/70">
        ঠিকানায় হয়তো কোনো ভুল আছে, অথবা পাতাটি সরিয়ে ফেলা হয়েছে। যা খুঁজছিলেন তা নিচে খুঁজে দেখুন, অথবা অন্য
        কোথাও যান।
      </p>
      <form action="/search" method="get" role="search" className="mx-auto mt-8 flex max-w-md gap-2">
        <label htmlFor="not-found-q" className="sr-only">
          বই মহলে খুঁজুন
        </label>
        <input id="not-found-q" name="q" type="search" className="field-input min-w-0 flex-1" placeholder="বই, লেখক বা এলাকা" />
        <button type="submit" className="btn-primary">
          খুঁজুন
        </button>
      </form>
      <nav aria-label="অন্য কোথাও যান" className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-secondary">
          হোম পাতা
        </Link>
        <Link href="/library" className="btn-secondary">
          লাইব্রেরি
        </Link>
        <Link href="/search" className="btn-secondary">
          খোঁজার পাতা
        </Link>
      </nav>
    </div>
  );
}
