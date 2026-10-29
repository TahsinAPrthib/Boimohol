import { prisma } from "@/lib/prisma";
import CategoryGrid from "@/components/CategoryGrid";

// Categories change only when an admin adds one, so this page is built
// statically and refreshed hourly: visitors never wait on the database for
// it, and it needs no loading skeleton. (A loading.tsx here would also wrap
// /categories/[slug] and turn its 404s back into streamed 200s.)
export const revalidate = 3600;

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, nameBangla: true, description: true },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-10 border-b-2 border-ink/10 pb-8">
        <h1 className="font-display text-3xl text-ink">বিভাগসমূহ</h1>
        <p className="mt-2 max-w-prose font-body text-ink/70">
          পছন্দের ধরন বেছে নিন। প্রতিটি বিভাগে নতুনদের জন্য একটি &ldquo;শুরু করুন এখান থেকে&rdquo; বই বেছে
          দেওয়া আছে।
        </p>
      </div>

      {categories.length > 0 ? (
        <CategoryGrid categories={categories} headingLevel="h2" />
      ) : (
        <p className="font-body text-ink/70">এখনো কোনো বিভাগ যোগ করা হয়নি।</p>
      )}
    </div>
  );
}
