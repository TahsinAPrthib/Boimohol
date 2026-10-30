import Link from "next/link";
import BookDownloadButton from "@/components/BookDownloadButton";
import { SOURCE_LABEL, type SourceKind } from "@/lib/book-sources";

type FreeFile = { id: string; publicId: string; fileSizeBytes: number; rightsBasis: string };
type FreeSource = { id: string; kind: SourceKind; url: string; rightsBasis: string };

// The book page's "read it free" box: the PDF hosted here, if there is one,
// and every link to a free copy elsewhere. The caller decides whether the book
// passes the public-domain rule; this only lays them out.
//
// Each copy says why it is free. When they all say the same thing, the note
// is shown once rather than repeated under every button.
//
// A Wikisource work or a Gutenberg book can also be read here (`readHref`,
// the in-site reader; `readFrom`, where its text comes from), which comes
// first. Gutenberg links stay on the ebook's landing page, not its
// read-online HTML: Project Gutenberg asks sites to link there and redirects
// direct links to its files (gutenberg.org/policy/linking.html, checked
// 2026-10-17).
export default function BookFreeCopies({
  file,
  sources,
  readHref = null,
  readFrom = "wikisource",
}: {
  file: FreeFile | null;
  sources: FreeSource[];
  readHref?: string | null;
  readFrom?: "wikisource" | "gutenberg";
}) {
  if (!file && sources.length === 0) return null;

  const notes = [file?.rightsBasis, ...sources.map((s) => s.rightsBasis)].filter((n): n is string => Boolean(n));
  const sharedNote = new Set(notes).size === 1 ? notes[0] : null;
  // Only one primary button in the box.
  const primaryTaken = Boolean(file || readHref);

  return (
    <div className="mt-5 rounded-book border-2 border-sage/50 bg-sage/10 p-4" data-free-copies>
      <ul className="flex flex-col gap-4">
        {readHref && (
          <li>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={readHref} className="btn-primary" data-read-here>
                এখানেই পড়ুন
              </Link>
              <span className="font-body text-sm text-ink/70">
                {readFrom === "gutenberg" ? "বই মহলেই, প্রজেক্ট গুটেনবার্গের লেখা থেকে" : "বই মহলেই, উইকিসংকলনের লেখা থেকে"}
              </span>
            </div>
          </li>
        )}
        {file && (
          <li>
            <BookDownloadButton fileId={file.id} publicId={file.publicId} fileSizeBytes={file.fileSizeBytes} />
            {!sharedNote && <WhyFree note={file.rightsBasis} />}
          </li>
        )}
        {sources.map((s, i) => (
          <li key={s.id}>
            <div className="flex flex-wrap items-center gap-3">
              {/* noreferrer: the other site isn't told which page sent the reader. */}
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${!primaryTaken && i === 0 ? "btn-primary" : "btn-secondary"} inline-flex items-center gap-2`}
              >
                বিনামূল্যে পড়ুন — {SOURCE_LABEL[s.kind]}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 2.5h4.5V7" />
                  <path d="M13.5 2.5 7 9" />
                  <path d="M11.5 9.5v3a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5V6A1.5 1.5 0 0 1 4 4.5h3" />
                </svg>
                <span className="sr-only">(নতুন ট্যাবে খুলবে)</span>
              </a>
              <span className="font-body text-sm text-ink/70">{new URL(s.url).hostname} · নতুন ট্যাবে খুলবে</span>
            </div>
            {!sharedNote && <WhyFree note={s.rightsBasis} />}
          </li>
        ))}
      </ul>
      {sharedNote && <WhyFree note={sharedNote} />}
      {sources.length > 0 && (
        <p className="mt-2 max-w-prose font-body text-xs text-ink/70">
          বাইরের সাইটগুলো বই মহলের নয়; সেখানে তাদের নিজস্ব নিয়ম ও গোপনীয়তা নীতি প্রযোজ্য।
        </p>
      )}
    </div>
  );
}

// Being open about WHY a copy is legally free is worth showing. Understated,
// but present rather than buried.
function WhyFree({ note }: { note: string }) {
  return (
    <p className="mt-3 max-w-prose font-body text-xs text-ink/70">
      <span className="font-semibold text-ink/70">কেন বিনামূল্যে:</span> {note}
    </p>
  );
}
