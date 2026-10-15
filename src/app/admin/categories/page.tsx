import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { bn } from "@/lib/bangla";
import { getAdminUserId } from "@/lib/authz";
import StarterPickEditor from "@/components/StarterPickEditor";

// Each category's "শুরু করুন এখান থেকে" book: the one its page puts first,
// with a note on why it's a good first read.
export default async function AdminCategoriesPage() {
  // 404 rather than 403: a non-admin should not learn this route exists.
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      books: { select: { id: true, title: true, titleBangla: true, author: true } },
      starterPicks: {
        orderBy: { rank: "asc" },
        include: { book: { select: { id: true, title: true, titleBangla: true, author: true, categoryId: true } } },
      },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 font-display text-3xl text-ink">বিভাগ ও শুরুর বই</h1>
      <p className="mb-6 max-w-prose border-b-2 border-ink/10 pb-6 font-body text-ink/70">
        প্রতিটি বিভাগের পাতায় একটি বই “শুরু করুন এখান থেকে” হিসেবে সবার আগে দেখানো হয়, সঙ্গে একটি ছোট নোট — কেন এটি
        এই বিভাগে পড়া শুরু করার জন্য ভালো। শুধু ওই বিভাগের বই থেকেই বাছাই করা যায়।{" "}
        <Link href="/admin/books" className="font-semibold text-cloth hover:underline">
          বই ও লাইব্রেরি →
        </Link>
      </p>

      <ul className="flex flex-col gap-4">
        {categories.map((category) => {
          const pick = category.starterPicks[0];
          const options = category.books
            .map((b) => ({ id: b.id, label: `${b.titleBangla || b.title} — ${b.author}` }))
            .sort((a, b) => a.label.localeCompare(b.label, "bn"));
          // A pick whose book has since moved to another category: the page
          // still shows it, but it should be replaced.
          const stray = pick && pick.book.categoryId !== category.id;
          return (
            <li
              key={category.id}
              id={`category-${category.slug}`}
              className="rounded-book border-2 border-ink/10 bg-paper-dark p-4"
              data-category={category.slug}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-xl text-ink">{category.nameBangla}</h2>
                <p className="font-body text-xs text-ink/50">
                  {category.slug} · {bn(category.books.length)}টি বই ·{" "}
                  <Link href={`/categories/${category.slug}`} className="font-semibold text-cloth hover:underline">
                    বিভাগের পাতা
                  </Link>
                </p>
              </div>

              <div className="mt-3 rounded-book border-2 border-ink/10 bg-paper p-3" data-current-pick>
                {pick ? (
                  <>
                    <p className="font-body text-sm text-ink/80">
                      <span className="font-semibold text-ink">শুরুর বই:</span>{" "}
                      <Link href={`/books/${pick.book.id}`} className="font-semibold text-cloth hover:underline">
                        {pick.book.titleBangla || pick.book.title}
                      </Link>{" "}
                      — {pick.book.author}
                    </p>
                    <p className="mt-1 max-w-prose font-body text-sm text-ink/70">
                      <span className="font-semibold text-ink">নোট:</span> {pick.note}
                    </p>
                    {stray && (
                      <p className="mt-2 font-body text-xs font-semibold text-oxblood">
                        এই বইটি এখন অন্য বিভাগে আছে; এই বিভাগের একটি বই বাছাই করুন।
                      </p>
                    )}
                  </>
                ) : (
                  <p className="font-body text-sm text-ink/50">এখনো কোনো শুরুর বই বাছাই করা হয়নি।</p>
                )}
                <div className="mt-3">
                  <StarterPickEditor
                    categoryId={category.id}
                    categoryName={category.nameBangla}
                    books={options}
                    current={pick && !stray ? { bookId: pick.book.id, note: pick.note } : pick ? { bookId: "", note: pick.note } : null}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
