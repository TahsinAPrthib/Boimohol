import Link from "next/link";

type Category = { id: string; slug: string; nameBangla: string; description: string | null };

// The category cards on the home page and on /categories. Deliberately no
// book counts: with a small catalogue, "২ টি বই" makes the shelves look bare.
// headingLevel keeps the outline right: h3 under the home page's section h2,
// h2 directly under the /categories h1.
export default function CategoryGrid({
  categories,
  headingLevel: Heading,
  compact = false,
}: {
  categories: Category[];
  headingLevel: "h2" | "h3";
  // Two columns of names, no descriptions: the phone search page.
  compact?: boolean;
}) {
  if (compact)
    return (
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="flex min-h-14 items-center rounded-book border-2 border-ink/10 bg-paper-dark px-4 py-3 shadow-shelf transition-colors hover:border-cloth focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric"
          >
            <Heading className="font-display text-lg leading-snug text-ink">{category.nameBangla}</Heading>
          </Link>
        ))}
      </div>
    );
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categories/${category.slug}`}
          className="group flex flex-col justify-between rounded-book border-2 border-ink/10 bg-paper-dark p-5 shadow-shelf transition-colors hover:border-cloth"
        >
          <div>
            <Heading className="font-display text-xl text-ink group-hover:text-cloth">{category.nameBangla}</Heading>
            {category.description && <p className="mt-2 font-body text-sm text-ink/70">{category.description}</p>}
          </div>
          <span className="mt-4 font-body text-xs font-semibold text-cloth">বইগুলো দেখুন →</span>
        </Link>
      ))}
    </div>
  );
}
