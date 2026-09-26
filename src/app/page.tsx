import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { bn } from "@/lib/bangla";

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { books: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-12 border-b-2 border-ink/10 pb-10">
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
          বই মহল
        </h1>
        <p className="mt-3 max-w-prose font-body text-ink/70">
          বাংলা বই খুঁজে নেওয়া, পড়া আর পর্যালোচনা লেখার একটা জায়গা। প্রতিটি বিভাগে
          নতুনদের জন্য একটি &ldquo;শুরু করুন এখান থেকে&rdquo; বইও বেছে দেওয়া আছে।
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/register" className="btn-primary">
            সাইন আপ
          </Link>
          <Link href="/login" className="btn-secondary">
            লগইন
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-5 font-display text-2xl text-ink">বিভাগসমূহ</h2>

        {categories.length === 0 ? (
          <p className="font-body text-ink/60">
            এখনো কোনো বিভাগ যোগ করা হয়নি। প্রথমে ডাটাবেস সিড করুন।
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group flex flex-col justify-between rounded-book border-2 border-ink/10 bg-paper-dark p-5 shadow-shelf transition-colors hover:border-cloth"
              >
                <div>
                  <h3 className="font-display text-xl text-ink group-hover:text-cloth">
                    {category.nameBangla}
                  </h3>
                  {category.description && (
                    <p className="mt-2 font-body text-sm text-ink/60">
                      {category.description}
                    </p>
                  )}
                </div>
                <p className="mt-4 font-body text-xs font-semibold text-ink/50">
                  {bn(category._count.books)} টি বই
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
