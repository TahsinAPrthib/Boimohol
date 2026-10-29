import Link from "next/link";
import { formatFileSize } from "@/lib/cloudinary-url";
import type { ScanFile } from "@/lib/wikisource/api";
import type { TocEntry } from "@/lib/wikisource/reader";
import { readerHref, wikisourceUrl, WIKISOURCE_ORIGIN } from "@/lib/wikisource/titles";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

// "প্রথম খণ্ড — এক" under the heading "প্রথম খণ্ড" reads as "এক".
export function shortLabel(label: string, group: string | null): string {
  if (!group || !label.startsWith(group)) return label;
  const rest = label.slice(group.length).replace(/^[\s—–\-:,।]+/, "");
  return rest || label;
}

// A volume or part that has no page of its own ("প্রথম খণ্ড") appears as a
// heading over its chapters; one that has a page is an entry like any other,
// its chapters indented below it.
export function ReaderToc({ bookId, entries, current }: { bookId: string; entries: TocEntry[]; current?: string }) {
  const paths = new Set(entries.map((e) => e.path));
  let lastGroup: string | null = null;
  const items: React.ReactNode[] = [];
  for (const e of entries) {
    const segments = e.path.split("/");
    const parent = segments.slice(0, -1).join("/");
    const group = parent && !paths.has(parent) ? parent : null;
    if (group && group !== lastGroup) {
      items.push(
        <li key={`g:${group}:${e.path}`} className="mt-4 font-display text-lg text-ink first:mt-0">
          {group.split("/").pop()}
        </li>
      );
    }
    lastGroup = group;
    // Indented once for each enclosing part that is an entry itself.
    const depth = segments.slice(0, -1).filter((_, i) => paths.has(segments.slice(0, i + 1).join("/"))).length;
    const isCurrent = e.path === current;
    items.push(
      <li key={e.path} style={{ paddingLeft: `${depth * 1.25}em` }}>
        <Link
          href={readerHref(bookId, e.path)}
          aria-current={isCurrent ? "page" : undefined}
          className={`block rounded-book px-2 py-1.5 font-body hover:bg-ink/5 ${isCurrent ? "bg-ink/10 font-semibold text-ink" : "text-cloth"}`}
        >
          {shortLabel(e.label, group ? group.split("/").pop()! : null)}
        </Link>
      </li>
    );
  }
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

export function ReaderUnavailable({ href, missing = false }: { href: string; missing?: boolean }) {
  return (
    <div className="mt-8 rounded-book border-2 border-oxblood/40 bg-oxblood/5 p-5" role="status" data-reader-unavailable>
      <p className="font-body text-ink">
        {missing
          ? "এই অংশটি উইকিসংকলনে এখন আর পাওয়া যাচ্ছে না। হয়তো পাতাটির নাম বদলেছে।"
          : "উইকিসংকলন থেকে এই অংশটি এখন আনা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন, অথবা সরাসরি উইকিসংকলনে পড়ুন।"}
      </p>
      <a href={href} {...external} className="btn-primary mt-4">
        উইকিসংকলনে পড়ুন
      </a>
    </div>
  );
}
