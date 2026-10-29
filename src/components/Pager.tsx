import Link from "next/link";
import { bn } from "@/lib/bangla";
import { hrefWith } from "@/lib/search";

// Previous / next for a long list of books. Nothing when it fits on one page.
export default function Pager({
  path,
  params,
  page,
  pages,
}: {
  path: string;
  params: Record<string, string | null | undefined>;
  page: number;
  pages: number;
}) {
  if (pages <= 1) return null;
  const href = (p: number) => hrefWith(path, { ...params, page: p > 1 ? String(p) : undefined });
  const link = "rounded-book border-2 border-ink/20 px-4 py-2 font-body text-sm font-semibold text-ink hover:border-cloth hover:text-cloth";
  return (
    <nav aria-label="পাতা" className="mt-10 flex flex-wrap items-center justify-center gap-3">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={link}>
          ← আগের পাতা
        </Link>
      ) : (
        <span aria-hidden="true" className={`${link} invisible`}>
          ← আগের পাতা
        </span>
      )}
      <span className="font-body text-sm text-ink/70" aria-current="page">
        পাতা {bn(page)} / {bn(pages)}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} rel="next" className={link}>
          পরের পাতা →
        </Link>
      ) : (
        <span aria-hidden="true" className={`${link} invisible`}>
          পরের পাতা →
        </span>
      )}
    </nav>
  );
}
