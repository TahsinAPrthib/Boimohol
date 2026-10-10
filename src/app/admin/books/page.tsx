import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { bn, bnYear } from "@/lib/bangla";
import { getAdminUserId } from "@/lib/authz";
import { formatFileSize, pdfUrl } from "@/lib/cloudinary-url";
import { breaksPublicDomainRule, canBePublicDomain, publicDomainCutoffYear } from "@/lib/public-domain";
import { createBook } from "@/actions/admin-books";
import AdminBookForm from "@/components/AdminBookForm";
import AdminBookImport from "@/components/AdminBookImport";
import AdminBookDeleteButton from "@/components/AdminBookDeleteButton";
import BookFileUploader from "@/components/BookFileUploader";
import BookFileDeleteButton from "@/components/BookFileDeleteButton";
import BookFileRightsEditor from "@/components/BookFileRightsEditor";

export default async function AdminBooksPage() {
  // 404 rather than 403: a non-admin should not learn this route exists.
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  const [books, categories] = await Promise.all([
    prisma.book.findMany({
      include: {
        category: { select: { nameBangla: true } },
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
      },
      orderBy: [{ isPublicDomain: "desc" }, { title: "asc" }],
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, slug: true, nameBangla: true } }),
  ]);

  const cutoff = publicDomainCutoffYear();
  const eligible = books.filter((b) => b.isPublicDomain);
  const withFile = books.filter((b) => b.files.length > 0).length;
  // Books whose stored flag the rule no longer backs up -- e.g. one fixed by
  // the migration everywhere except where a PDF was already attached.
  const ruleBreakers = books.filter((b) => breaksPublicDomainRule(b));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 font-display text-3xl text-ink">বই ও লাইব্রেরি</h1>
      <p className="mb-2 max-w-prose font-body text-ink/70">
        ক্যাটালগে বই যোগ ও সম্পাদনা করুন। শুধু পাবলিক ডোমেইনের বইয়ের পিডিএফ লাইব্রেরিতে যোগ করা যায়, আর প্রতিটি
        ফাইলের সাথে কেন সেটি বিনামূল্যে দেওয়া যাচ্ছে তার ব্যাখ্যা লেখা বাধ্যতামূলক।
      </p>
      <p className="mb-6 border-b-2 border-ink/10 pb-6 font-body text-sm text-ink/50">
        মোট {bn(books.length)}টি বই · পাবলিক ডোমেইন {bn(eligible.length)}টি · ফাইল আছে {bn(withFile)}টিতে
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
                <a href={`#book-${b.id}`} className="font-semibold underline">
                  {b.titleBangla || b.title}
                </a>{" "}
                — {b.authorDeathYear === null ? "লেখকের মৃত্যুর বছর দেওয়া নেই" : `লেখক মারা গেছেন ${bnYear(b.authorDeathYear)} সালে`}
                {b.files.length > 0 ? "; আগে পিডিএফটি মুছে তারপর চিহ্ন তুলে দিন" : "; সম্পাদনা করে চিহ্ন তুলে দিন"}
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
            <code>null</code>। একই লেখকের একই নামের বই (ইংরেজি বা বাংলা নামে) আগে থাকলে সেটি বাদ যাবে।
          </p>
          <AdminBookImport categoryNames={Object.fromEntries(categories.map((c) => [c.slug, c.nameBangla]))} />
        </div>
      </details>

      {books.length === 0 ? (
        <p className="font-body text-ink/50">কোনো বই নেই।</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {books.map((book) => {
            const file = book.files[0];
            const breaksRule = breaksPublicDomainRule(book);
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
                    <p className="font-body text-sm text-ink/50">
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
                      <span className="rounded-book bg-ink/20 px-2 py-1 font-body text-xs font-semibold text-ink/70">
                        কপিরাইটযুক্ত
                      </span>
                    )}
                    {file && (
                      <span className="rounded-book bg-cloth px-2 py-1 font-body text-xs font-semibold text-paper">
                        ফাইল আছে
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
                    । {file ? "আগে পিডিএফটি মুছে ফেলুন, তারপর সম্পাদনা করে চিহ্ন তুলে দিন।" : "সম্পাদনা করে চিহ্ন তুলে দিন।"}
                    {file && " পিডিএফটি এখন সাইটে দেখানো হচ্ছে না।"}
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
                        <p className="break-words font-body text-xs text-ink/50">
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
                    <BookFileUploader
                      bookId={book.id}
                      isPublicDomain={book.isPublicDomain && canBePublicDomain(book.authorDeathYear)}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
