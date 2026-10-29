import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { bn, bnYear } from "@/lib/bangla";
import { getAdminUserId } from "@/lib/authz";
import { formatFileSize, pdfUrl } from "@/lib/cloudinary-url";
import { breaksPublicDomainRule, canBePublicDomain, publicDomainCutoffYear } from "@/lib/public-domain";
import { readPage } from "@/lib/book-language";
import { createBook } from "@/actions/admin-books";
import AdminBookForm from "@/components/AdminBookForm";
import AdminBookImport from "@/components/AdminBookImport";
import AdminBulkImport from "@/components/AdminBulkImport";
import Pager from "@/components/Pager";
import AdminBookDeleteButton from "@/components/AdminBookDeleteButton";
import BookFileUploader from "@/components/BookFileUploader";
import BookFileDeleteButton from "@/components/BookFileDeleteButton";
import BookFileRightsEditor from "@/components/BookFileRightsEditor";
import BookSourcesEditor from "@/components/BookSourcesEditor";
import BookCoverEditor from "@/components/BookCoverEditor";
import SearchBox from "@/components/SearchBox";
import NoResults from "@/components/NoResults";
import { hrefWith, readQuery, searchFilter } from "@/lib/search";

// ?filter=needs-pdf: books that may carry a library PDF but don't yet --
// marked public domain, passing the death-year rule, and with no file.
// ?filter=needs-cover: the same, for a real cover.
const NEEDS_PDF = "needs-pdf";
const NEEDS_COVER = "needs-cover";
// The catalog runs to tens of thousands of books: one page at a time.
const ADMIN_PAGE = 50;

// Setting a cover waits for Cloudinary to fetch the image, and an import's
// covers are fetched a few per call from this page (src/actions/covers.ts).
export const maxDuration = 60;

export default async function AdminBooksPage(props: {
  searchParams: Promise<{ q?: string | string[]; filter?: string; page?: string | string[] }>;
}) {
  // 404 rather than 403: a non-admin should not learn this route exists.
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  // Search and the filter narrow the list below; the totals and the
  // rule-breaker warning above it stay about the whole catalog.
  const searchParams = await props.searchParams;
  const q = readQuery(searchParams.q);
  const search = searchFilter(q);
  const needsPdf = searchParams.filter === NEEDS_PDF;
  const needsCover = searchParams.filter === NEEDS_COVER;
  const narrowed = Boolean(search) || needsPdf || needsCover;
  const cutoff = publicDomainCutoffYear();
  const eligible = { isPublicDomain: true, authorDeathYear: { lte: cutoff } };
  const where: Prisma.BookWhereInput = {
    ...search,
    ...(needsPdf ? { ...eligible, files: { none: {} } } : {}),
    ...(needsCover ? { ...eligible, coverPublicId: null } : {}),
  };

  const [total, markedPublicDomain, withFile, withSource, withCover, ruleBreakers, matching, categories] = await Promise.all([
    prisma.book.count(),
    prisma.book.count({ where: { isPublicDomain: true } }),
    prisma.book.count({ where: { files: { some: {} } } }),
    prisma.book.count({ where: { sources: { some: {} } } }),
    prisma.book.count({ where: { coverPublicId: { not: null } } }),
    // Books whose stored flag the rule no longer backs up -- e.g. one fixed by
    // the migration everywhere except where a PDF was already attached.
    prisma.book.findMany({
      where: { isPublicDomain: true, OR: [{ authorDeathYear: null }, { authorDeathYear: { gt: cutoff } }] },
      select: { id: true, title: true, titleBangla: true, authorDeathYear: true, coverPublicId: true, _count: { select: { files: true, sources: true } } },
      orderBy: { title: "asc" },
    }),
    prisma.book.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, slug: true, nameBangla: true } }),
  ]);
  const pages = Math.max(1, Math.ceil(matching / ADMIN_PAGE));
  const page = Math.min(readPage(searchParams.page), pages);
  const books = await prisma.book.findMany({
      where,
      skip: (page - 1) * ADMIN_PAGE,
      take: ADMIN_PAGE,
      include: {
        category: { select: { nameBangla: true, colorKey: true, slug: true } },
        files: {
          select: {
            id: true,
            publicId: true,
            fileSizeBytes: true,
            rightsBasis: true,
            sourceUrl: true,
            downloadCount: true,
            uploadedBy: { select: { username: true } },
          },
        },
        sources: {
          select: { id: true, kind: true, url: true, rightsBasis: true, addedBy: { select: { username: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [{ isPublicDomain: "desc" }, { title: "asc" }, { id: "asc" }],
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 font-display text-3xl text-ink">বই ও লাইব্রেরি</h1>
      <p className="mb-2 max-w-prose font-body text-ink/70">
        ক্যাটালগে বই যোগ ও সম্পাদনা করুন। শুধু পাবলিক ডোমেইনের বইয়ের পিডিএফ লাইব্রেরিতে যোগ করা যায়, কিংবা
        উইকিসংকলন, প্রজেক্ট গুটেনবার্গ বা ইন্টারনেট আর্কাইভে থাকা বিনামূল্যের কপির লিংক। প্রতিটির সাথে কেন সেটি
        বিনামূল্যে দেওয়া যাচ্ছে তার ব্যাখ্যা লেখা বাধ্যতামূলক।
      </p>
      <p className="mb-6 border-b-2 border-ink/10 pb-6 font-body text-sm text-ink/70">
        মোট {bn(total)}টি বই · পাবলিক ডোমেইন {bn(markedPublicDomain)}টি · ফাইল আছে {bn(withFile)}টিতে · বাইরের কপির
        লিংক আছে {bn(withSource)}টিতে · আসল প্রচ্ছদ আছে {bn(withCover)}টিতে ·{" "}
        <Link href="/admin/categories" className="font-semibold text-cloth hover:underline">
          বিভাগের শুরুর বই →
        </Link>
      </p>

      {ruleBreakers.length > 0 && (
        <div role="alert" className="mb-6 rounded-book border-2 border-oxblood bg-oxblood/10 p-4 font-body text-sm text-oxblood">
          <p className="font-semibold">
            {bn(ruleBreakers.length)}টি বই পাবলিক ডোমেইন হিসেবে চিহ্নিত, কিন্তু নিয়ম অনুযায়ী তা হতে পারে না (এখন কেবল{" "}
            {bnYear(cutoff)} বা তার আগে মারা যাওয়া লেখকের বই):
          </p>
          <ul className="mt-2 list-disc pl-5">
            {ruleBreakers.map((b) => (
              <li key={b.id}>
                <a href={`${hrefWith("/admin/books", { q: b.title })}#book-${b.id}`} className="font-semibold underline">
                  {b.titleBangla || b.title}
                </a>{" "}
                — {b.authorDeathYear === null ? "লেখকের মৃত্যুর বছর দেওয়া নেই" : `লেখক মারা গেছেন ${bnYear(b.authorDeathYear)} সালে`}
                {b._count.files + b._count.sources > 0 || b.coverPublicId
                  ? "; আগে পিডিএফ, বাইরের লিংক ও আসল প্রচ্ছদ সরিয়ে তারপর চিহ্ন তুলে দিন"
                  : "; সম্পাদনা করে চিহ্ন তুলে দিন"}
              </li>
            ))}
          </ul>
        </div>
      )}

      <details className="mb-4 rounded-book border-2 border-ink/10 bg-paper-dark p-4">
        <summary className="cursor-pointer font-display text-xl text-ink">নতুন বই যোগ করুন</summary>
        <div className="mt-4">
          <AdminBookForm
            action={createBook}
            mode="create"
            cutoffYear={cutoff}
            categories={categories.map((c) => ({ id: c.id, nameBangla: c.nameBangla }))}
          />
        </div>
      </details>

      <details className="mb-8 rounded-book border-2 border-ink/10 bg-paper-dark p-4">
        <summary className="cursor-pointer font-display text-xl text-ink">JSON ফাইল থেকে অনেক বই একসাথে যোগ করুন</summary>
        <div className="mt-4 flex flex-col gap-4">
          <p className="max-w-prose font-body text-sm text-ink/70">
            প্রতিটি বইয়ের ঘর: <code>title</code>, <code>titleBangla</code>, <code>author</code>, <code>category</code>{" "}
            (বিভাগের slug: {categories.map((c) => c.slug).join(", ")}), <code>description</code>, <code>language</code>,{" "}
            <code>publishYear</code>, <code>authorDeathYear</code>, <code>isPublicDomain</code>। অজানা বছর{" "}
            <code>null</code>। ঐচ্ছিক <code>translator</code> (অনূদিত বা পুনর্কথিত বইয়ের অনুবাদক, বইয়ের পাতায় দেখানো হয়) ও{" "}
            <code>searchAliases</code> (খোঁজার জন্য লুকানো বিকল্প নামের তালিকা)। একই লেখকের একই নামের বই (ইংরেজি বা বাংলা
            নামে) আগে থাকলে সেটি বাদ যাবে।
          </p>
          <p className="max-w-prose font-body text-sm text-ink/70">
            পাবলিক ডোমেইনের বইয়ে ঐচ্ছিক <code>sources</code>: বাইরের সাইটে বিনামূল্যের কপির তালিকা, প্রতিটিতে{" "}
            <code>url</code> (শুধু wikisource.org, gutenberg.org বা archive.org) ও <code>rightsBasis</code>, যেমন{" "}
            <code>{`"sources": [{ "url": "https://bn.wikisource.org/wiki/...", "rightsBasis": "লেখক ১৯৪১ সালে মারা গেছেন; কপিরাইটের মেয়াদ শেষ" }]`}</code>
            । বইটি ক্যাটালগে আগে থেকেই থাকলে নতুন করে যোগ হবে না, তবে তার নতুন লিংকগুলো আগের বইটিতে যোগ হবে — যদি
            সেটি পাবলিক ডোমেইন হিসেবে চিহ্নিত থাকে।
          </p>
          <p className="max-w-prose font-body text-sm text-ink/70">
            আগে থেকে থাকা বই সংশোধনের সারি: <code>match</code> (বইটির <code>title</code>, <code>titleBangla</code>,{" "}
            <code>author</code>), সঙ্গে <code>set</code> (শুধু <code>author</code>, <code>translator</code>,{" "}
            <code>titleBangla</code>, <code>searchAliases</code>, <code>language</code> বা <code>description</code>;{" "}
            <code>translator</code> ও <code>titleBangla</code>-এ <code>null</code> দিলে মুছে যায়) এবং/অথবা{" "}
            <code>sources</code> — আগের লিংকের <code>rightsBasis</code> বদলায়, নতুন লিংক যোগ হয়। লিংক সরাতে হয় বইয়ের
            নিচের “লিংক সরান” দিয়ে। যাচাইয়ে এগুলো “হালনাগাদ হবে” হিসেবে দেখানো হয়।
          </p>
          <p className="max-w-prose font-body text-sm text-ink/70">
            পাবলিক ডোমেইনের বইয়ে (নতুন বা সংশোধনের সারিতে) ঐচ্ছিক <code>cover</code>: আসল প্রচ্ছদের ছবি,{" "}
            <code>url</code> (upload.wikimedia.org-এর ছবি, পিডিএফ বা ডিজেভিইউ স্ক্যানের একটি পাতার ছবি, কমন্সের ফাইলের
            পাতা, বা gutenberg.org-এর প্রচ্ছদ) ও <code>rightsBasis</code>। বইগুলো সংরক্ষণের পর ছবিগুলো কয়েকটি করে আনা হয়;
            কোনোটি না এলে বাকিগুলো থামে না, আর ব্যর্থগুলো আবার চেষ্টা করা যায়।
          </p>
          <AdminBookImport categoryNames={Object.fromEntries(categories.map((c) => [c.slug, c.nameBangla]))} />
        </div>
      </details>

      <details className="mb-8 rounded-book border-2 border-ink/10 bg-paper-dark p-4">
        <summary className="cursor-pointer font-display text-xl text-ink">বড় ফাইল থেকে আমদানি (পুরো ক্যাটালগ)</summary>
        <div className="mt-4 flex flex-col gap-4">
          <p className="max-w-prose font-body text-sm text-ink/70">
            হাজার হাজার বইয়ের ফাইলের জন্য, যেমন প্রজেক্ট গুটেনবার্গের পুরো ক্যাটালগ (<code>data/gutenberg-all-*.json</code>)।
            সারিগুলো ওপরের আমদানির মতোই, যাচাইও একই: একই ঘর, একই ডুপ্লিকেট-যাচাই, প্রতিটি লিংকের সাথে “কেন বিনামূল্যে” নোট।
            ফাইলটি আপনার ব্রাউজারেই পড়া হয় আর {bn(250)}টি করে সারি সার্ভারে যায়; প্রতিটি ভাগ পুরোটা সংরক্ষিত হয়, নয়তো কিছুই না।
            মাঝপথে থেমে গেলে একই ফাইল আবার বেছে নিয়ে যেখানে থেমেছিল সেখান থেকে চালানো যায়।
          </p>
          <p className="max-w-prose font-body text-sm text-ink/70">
            এভাবে আনা বই “কিউরেট করা” নয়: হোম পেজ, লাইব্রেরি ও বিভাগের পাতায় বাছাই করা বইগুলো আগে আসে, এগুলো পরে; খোঁজায় সব বই
            সমানভাবে আসে।
          </p>
          <AdminBulkImport />
        </div>
      </details>

      <div className="mb-6 flex flex-col gap-3 border-t-2 border-ink/10 pt-6">
        <SearchBox label="ক্যাটালগে বই খুঁজুন" placeholder="বইয়ের নাম বা লেখক" />
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "সব বই", filter: undefined },
            { label: "পাবলিক ডোমেইন, পিডিএফ নেই", filter: NEEDS_PDF },
            { label: "পাবলিক ডোমেইন, আসল প্রচ্ছদ নেই", filter: NEEDS_COVER },
          ].map((chip) => {
            const active = chip.filter === (needsPdf ? NEEDS_PDF : needsCover ? NEEDS_COVER : undefined);
            return (
              <Link
                key={chip.label}
                href={hrefWith("/admin/books", { q, filter: chip.filter })}
                aria-current={active ? "true" : undefined}
                className={`rounded-book border-2 px-3 py-1.5 font-body text-sm font-semibold ${
                  active ? "border-cloth bg-cloth text-paper" : "border-ink/20 text-ink hover:border-ink/40"
                }`}
              >
                {chip.label}
              </Link>
            );
          })}
          {narrowed && <span className="font-body text-sm text-ink/70">{bn(matching)}টি বই মিলেছে</span>}
        </div>
      </div>

      {books.length === 0 && search ? (
        <NoResults
          query={q}
          where={needsPdf ? "পিডিএফ ছাড়া পাবলিক ডোমেইনের বইয়ে" : needsCover ? "আসল প্রচ্ছদ ছাড়া পাবলিক ডোমেইনের বইয়ে" : undefined}
        />
      ) : books.length === 0 ? (
        <p className="font-body text-ink/70">
          {needsPdf ? "পাবলিক ডোমেইনের সব বইয়েই পিডিএফ আছে।" : needsCover ? "পাবলিক ডোমেইনের সব বইয়েই আসল প্রচ্ছদ আছে।" : "কোনো বই নেই।"}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {books.map((book) => {
            const file = book.files[0];
            const breaksRule = breaksPublicDomainRule(book);
            const hasFreeCopy = Boolean(file) || book.sources.length > 0 || Boolean(book.coverPublicId);
            const eligible = book.isPublicDomain && canBePublicDomain(book.authorDeathYear);
            return (
              <li
                key={book.id}
                id={`book-${book.id}`}
                className={`scroll-mt-24 rounded-book border-2 bg-paper-dark p-4 ${breaksRule ? "border-oxblood" : "border-ink/10"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/books/${book.id}`} className="font-display text-lg text-ink hover:text-cloth">
                      {book.titleBangla || book.title}
                    </Link>
                    <p className="font-body text-sm text-ink/70">
                      {book.author} ·{" "}
                      {book.authorDeathYear === null ? "মৃত্যুর বছর নেই" : `মৃত্যু ${bnYear(book.authorDeathYear)}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-book bg-paper px-2 py-1 font-body text-xs font-semibold text-ink/70">
                      {book.category.nameBangla}
                    </span>
                    {book.isPublicDomain ? (
                      <span className="rounded-book bg-sage px-2 py-1 font-body text-xs font-semibold text-paper">
                        পাবলিক ডোমেইন
                      </span>
                    ) : (
                      <span className="rounded-book bg-ink/20 px-2 py-1 font-body text-xs font-semibold text-ink">
                        কপিরাইটযুক্ত
                      </span>
                    )}
                    {!book.curated && (
                      <span className="rounded-book border border-ink/20 px-2 py-1 font-body text-xs font-semibold text-ink/70">
                        বড় ফাইল থেকে আমদানি
                      </span>
                    )}
                    {file && (
                      <span className="rounded-book bg-cloth px-2 py-1 font-body text-xs font-semibold text-paper">
                        ফাইল আছে
                      </span>
                    )}
                    {book.sources.length > 0 && (
                      <span className="rounded-book bg-cloth/15 px-2 py-1 font-body text-xs font-semibold text-cloth">
                        বাইরের কপি {bn(book.sources.length)}টি
                      </span>
                    )}
                  </div>
                </div>

                {breaksRule && (
                  <p className="mt-3 rounded-book bg-oxblood/10 px-3 py-2 font-body text-sm font-semibold text-oxblood">
                    সতর্কতা: পাবলিক ডোমেইনের চিহ্নটি নিয়মের সাথে মেলে না —{" "}
                    {book.authorDeathYear === null
                      ? "লেখকের মৃত্যুর বছর দেওয়া নেই"
                      : `লেখক মারা গেছেন ${bnYear(book.authorDeathYear)} সালে`}
                    ।{" "}
                    {hasFreeCopy
                      ? "আগে পিডিএফ, বাইরের লিংক ও আসল প্রচ্ছদ সরিয়ে ফেলুন, তারপর সম্পাদনা করে চিহ্ন তুলে দিন। পিডিএফ ও লিংক এখন সাইটে দেখানো হচ্ছে না।"
                      : "সম্পাদনা করে চিহ্ন তুলে দিন।"}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-start gap-3">
                  <Link
                    href={`/admin/books/${book.id}/edit`}
                    className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold leading-8 text-ink hover:border-cloth hover:text-cloth"
                  >
                    সম্পাদনা
                  </Link>
                  <AdminBookDeleteButton bookId={book.id} />
                </div>

                <div className="mt-3 rounded-book border-2 border-ink/10 bg-paper p-3">
                  {file ? (
                    <div className="flex flex-col gap-2">
                      <p className="font-body text-sm text-ink/80">
                        <span className="font-semibold text-ink">আকার:</span>{" "}
                        {formatFileSize(file.fileSizeBytes)} ·{" "}
                        <span className="font-semibold text-ink">ডাউনলোড:</span>{" "}
                        {bn(file.downloadCount)}
                        {file.uploadedBy && (
                          <>
                            {" "}· <span className="font-semibold text-ink">যোগ করেছেন:</span>{" "}
                            @{file.uploadedBy.username}
                          </>
                        )}
                      </p>
                      <BookFileRightsEditor fileId={file.id} rightsBasis={file.rightsBasis} />
                      {file.sourceUrl && (
                        <p className="break-words font-body text-xs text-ink/70">
                          উৎস: {file.sourceUrl}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        {file.publicId && (
                          <a
                            href={pdfUrl(file.publicId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold leading-8 text-ink hover:border-cloth hover:text-cloth"
                          >
                            ফাইল দেখুন
                          </a>
                        )}
                        <BookFileDeleteButton fileId={file.id} />
                      </div>
                    </div>
                  ) : (
                    <BookFileUploader bookId={book.id} isPublicDomain={eligible} />
                  )}
                  {(eligible || book.sources.length > 0) && (
                    <div className="mt-3 border-t-2 border-ink/10 pt-3">
                      <BookSourcesEditor
                        bookId={book.id}
                        eligible={eligible}
                        sources={book.sources.map((s) => ({
                          id: s.id,
                          kind: s.kind,
                          url: s.url,
                          rightsBasis: s.rightsBasis,
                          addedBy: s.addedBy?.username ?? null,
                        }))}
                      />
                    </div>
                  )}
                  {(eligible || book.coverPublicId) && (
                    <div className="mt-3 border-t-2 border-ink/10 pt-3">
                      <BookCoverEditor
                        bookId={book.id}
                        eligible={eligible}
                        book={{ id: book.id, categorySlug: book.category.slug, title: book.title, titleBangla: book.titleBangla, author: book.author, colorKey: book.category.colorKey }}
                        cover={
                          book.coverPublicId && book.coverSourceUrl
                            ? { publicId: book.coverPublicId, sourceUrl: book.coverSourceUrl, rightsBasis: book.coverRightsBasis ?? "" }
                            : null
                        }
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-8">
        <Pager path="/admin/books" params={{ q, filter: searchParams.filter }} page={page} pages={pages} />
      </div>
    </div>
  );
}
