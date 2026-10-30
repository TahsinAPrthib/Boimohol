import Link from "next/link";
import { formatFileSize } from "@/lib/cloudinary-url";
import type { ScanFile } from "@/lib/wikisource/api";
import type { TocEntry } from "@/lib/wikisource/reader";
import { readerHref, wikisourceUrl, WIKISOURCE_ORIGIN } from "@/lib/wikisource/titles";
import { gutenbergLanding } from "@/lib/gutenberg/source";
import { bnPlain } from "@/lib/bangla";
import { tocRows } from "@/lib/reader/toc";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

// The grouping is in src/lib/reader/toc.ts (tocRows).
export function ReaderToc({ bookId, entries, current }: { bookId: string; entries: TocEntry[]; current?: string }) {
  const items = tocRows(entries).map((row) => {
    if (row.kind === "group") {
      return (
        <li key={row.key} className="mt-4 font-display text-lg text-ink first:mt-0">
          {row.name}
        </li>
      );
    }
    if (row.kind === "parts") {
      // Each number is named in full for screen readers ("… — অংশ ৩").
      return (
        <li key={row.key} className="px-2 py-1.5">
          {row.title && <p className="font-body text-ink">{row.title}</p>}
          <ol className="mt-1 flex flex-wrap gap-1.5">
            {row.parts.map(({ entry, number }) => {
              const isCurrent = entry.path === current;
              return (
                <li key={entry.path}>
                  <Link
                    href={readerHref(bookId, entry.path)}
                    aria-label={entry.label}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`inline-flex h-11 min-w-11 items-center justify-center rounded-book border-2 px-2 font-body hover:bg-ink/5 ${isCurrent ? "border-ink/30 bg-ink/10 font-semibold text-ink" : "border-ink/10 text-cloth"}`}
                  >
                    {number}
                  </Link>
                </li>
              );
            })}
          </ol>
        </li>
      );
    }
    const isCurrent = row.entry.path === current;
    return (
      <li key={row.entry.path} style={{ paddingLeft: `${row.depth * 1.25}em` }}>
        <Link
          href={readerHref(bookId, row.entry.path)}
          aria-current={isCurrent ? "page" : undefined}
          className={`block rounded-book px-2 py-1.5 font-body hover:bg-ink/5 ${isCurrent ? "bg-ink/10 font-semibold text-ink" : "text-cloth"}`}
        >
          {row.label}
        </Link>
      </li>
    );
  });
  return (
    <nav aria-label="সূচি">
      <ol className="flex flex-col">{items}</ol>
    </nav>
  );
}

export function ReaderNav({
  bookId,
  prev,
  next,
}: {
  bookId: string;
  prev: TocEntry | "contents" | null;
  next: TocEntry | null;
}) {
  return (
    <nav aria-label="অধ্যায়" className="mt-10 grid grid-cols-2 gap-3 border-t-2 border-ink/10 pt-6">
      <div>
        {prev && (
          <Link href={prev === "contents" ? readerHref(bookId, "") : readerHref(bookId, prev.path)} className="btn-secondary h-full w-full flex-col items-start text-left" rel="prev">
            <span className="text-xs font-normal text-ink/70">← আগের</span>
            <span className="line-clamp-2">{prev === "contents" ? "সূচি ও প্রথম পাতা" : prev.label}</span>
          </Link>
        )}
      </div>
      <div>
        {next && (
          <Link href={readerHref(bookId, next.path)} className="btn-primary h-full w-full flex-col items-end text-right" rel="next">
            <span className="text-xs font-normal opacity-80">পরের →</span>
            <span className="line-clamp-2">{next.label}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

// The scanned book the text was transcribed from, when it is a PDF on
// Wikimedia Commons. Its size is shown first: scans run to tens of megabytes.
export function ScanLinks({ scans }: { scans: ScanFile[] }) {
  if (scans.length === 0) return null;
  return (
    <ul className="mt-6 flex flex-col gap-2" data-scans>
      {scans.map((s, i) => (
        <li key={s.url} className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <a href={s.url} {...external} className="btn-secondary">
            মূল স্ক্যান (পিডিএফ){scans.length > 1 ? ` ${i + 1}` : ""}
          </a>
          <span className="font-body text-sm text-ink/70">
            {formatFileSize(s.bytes)} · উইকিমিডিয়া কমন্স · নতুন ট্যাবে খুলবে
          </span>
        </li>
      ))}
    </ul>
  );
}

// Wikisource's transcriptions are CC BY-SA: credit, a link to the page, its
// contributors and the licence, and a note that we changed the layout.
export function ReaderAttribution({ title }: { title: string }) {
  const history = `${WIKISOURCE_ORIGIN}/w/index.php?title=${encodeURIComponent(title.replace(/ /g, "_"))}&action=history`;
  return (
    <footer className="mt-10 rounded-book border-2 border-ink/10 bg-paper-dark/40 p-4 font-body text-sm text-ink/70" data-attribution>
      <p>
        উৎস: বাংলা উইকিসংকলন —{" "}
        <a href={wikisourceUrl(title)} {...external} className="text-cloth underline">
          এই পাতাটি উইকিসংকলনে
        </a>
        । মূল রচনাটির কপিরাইটের মেয়াদ শেষ; উইকিসংকলনের স্বেচ্ছাসেবীদের করা প্রতিলিপি ও সম্পাদনা{" "}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.bn" {...external} className="text-cloth underline">
          ক্রিয়েটিভ কমন্স অ্যাট্রিবিউশন-শেয়ারঅ্যালাইক ৪.০ (CC BY-SA 4.0)
        </a>{" "}
        লাইসেন্সে প্রকাশিত।{" "}
        <a href={history} {...external} className="text-cloth underline">
          যাঁরা লিখেছেন ও সম্পাদনা করেছেন
        </a>
        । বই মহলে পড়ার সুবিধার জন্য বিন্যাস কিছুটা বদলানো হয়েছে।
      </p>
    </footer>
  );
}

// Project Gutenberg's terms: with their licence sections left out, a credit
// with a link in a colophon is not use of their trademark
// (gutenberg.org/policy/license.html), and crediting them needs no
// permission (gutenberg.org/policy/permission.html).
export function GutenbergAttribution({ ebookId, images }: { ebookId: number; images: boolean }) {
  return (
    <footer className="mt-10 rounded-book border-2 border-ink/10 bg-paper-dark/40 p-4 font-body text-sm text-ink/70" data-attribution data-gutenberg-credit>
      <p>
        উৎস: প্রজেক্ট গুটেনবার্গ —{" "}
        <a href={gutenbergLanding(ebookId)} {...external} className="text-cloth underline">
          ইবুক #{bnPlain(ebookId)}, প্রজেক্ট গুটেনবার্গে
        </a>
        । মূল বইটির কপিরাইটের মেয়াদ শেষ। বই মহলে পড়ার সুবিধার জন্য বিন্যাস বদলানো হয়েছে, আর প্রজেক্ট গুটেনবার্গের লাইসেন্সের
        অংশটুকু বাদ দেওয়া হয়েছে{images ? "; বইয়ের ছবিগুলো এখানে দেখানো হয় না" : ""}।
      </p>
    </footer>
  );
}

const UNAVAILABLE = {
  wikisource: {
    missing: "এই অংশটি উইকিসংকলনে এখন আর পাওয়া যাচ্ছে না। হয়তো পাতাটির নাম বদলেছে।",
    down: "উইকিসংকলন থেকে এই অংশটি এখন আনা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন, অথবা সরাসরি উইকিসংকলনে পড়ুন।",
    button: "উইকিসংকলনে পড়ুন",
  },
  gutenberg: {
    missing: "এই বইয়ের লেখা প্রজেক্ট গুটেনবার্গ থেকে এখানে আনা যায় না। বইটি সেখানেই পড়ুন।",
    down: "বইটি প্রজেক্ট গুটেনবার্গ থেকে এখন আনা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন, অথবা সরাসরি গুটেনবার্গে পড়ুন।",
    button: "প্রজেক্ট গুটেনবার্গে পড়ুন",
  },
};

export function ReaderUnavailable({ href, missing = false, source = "wikisource" }: { href: string; missing?: boolean; source?: "wikisource" | "gutenberg" }) {
  const text = UNAVAILABLE[source];
  return (
    <div className="mt-8 rounded-book border-2 border-oxblood/40 bg-oxblood/5 p-5" role="status" data-reader-unavailable>
      <p className="font-body text-ink">{missing ? text.missing : text.down}</p>
      <a href={href} {...external} className="btn-primary mt-4">
        {text.button}
      </a>
    </div>
  );
}
