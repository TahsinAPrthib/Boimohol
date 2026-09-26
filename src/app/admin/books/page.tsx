import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { bn } from "@/lib/bangla";
import { getAdminUserId } from "@/lib/authz";
import { formatFileSize, pdfUrl } from "@/lib/cloudinary-url";
import BookFileUploader from "@/components/BookFileUploader";
import BookFileDeleteButton from "@/components/BookFileDeleteButton";

export default async function AdminBooksPage() {
  // 404 rather than 403: a non-admin should not learn this route exists.
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  const books = await prisma.book.findMany({
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
  });

  const eligible = books.filter((b) => b.isPublicDomain);
  const withFile = books.filter((b) => b.files.length > 0).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 font-display text-3xl text-ink">লাইব্রেরির ফাইল</h1>
      <p className="mb-2 max-w-prose font-body text-ink/70">
        শুধু পাবলিক ডোমেইনের বইয়ের পিডিএফ এখানে যোগ করা যায়। প্রতিটি ফাইলের সাথে কেন সেটি
        বিনামূল্যে দেওয়া যাচ্ছে তার ব্যাখ্যা লেখা বাধ্যতামূলক।
      </p>
      <p className="mb-6 border-b-2 border-ink/10 pb-6 font-body text-sm text-ink/50">
        মোট {bn(books.length)}টি বই · পাবলিক ডোমেইন{" "}
        {bn(eligible.length)}টি · ফাইল আছে{" "}
        {bn(withFile)}টিতে
      </p>

      {books.length === 0 ? (
        <p className="font-body text-ink/50">কোনো বই নেই।</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {books.map((book) => {
            const file = book.files[0];
            return (
              <li
                key={book.id}
                className="rounded-book border-2 border-ink/10 bg-paper-dark p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/books/${book.id}`}
                      className="font-display text-lg text-ink hover:text-cloth"
                    >
                      {book.titleBangla || book.title}
                    </Link>
                    <p className="font-body text-sm text-ink/50">{book.author}</p>
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
                      <p className="max-w-prose font-body text-sm text-ink/70">
                        <span className="font-semibold text-ink">ভিত্তি:</span> {file.rightsBasis}
                      </p>
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
                    <BookFileUploader bookId={book.id} isPublicDomain={book.isPublicDomain} />
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
