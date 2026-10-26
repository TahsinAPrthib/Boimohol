import Link from "next/link";
import { bn } from "@/lib/bangla";
import BookCover from "@/components/BookCover";
import StarRating from "@/components/StarRating";

export default function BookCard({
  id,
  title,
  titleBangla,
  author,
  colorKey = "cloth",
  categorySlug,
  coverPublicId,
  averageRating = 0,
  reviewCount = 0,
  tags = [],
}: {
  id: string;
  title: string;
  titleBangla?: string | null;
  author: string;
  colorKey?: string;
  categorySlug?: string | null;
  // The real cover, if the book has one (null: the generated cover).
  coverPublicId: string | null;
  averageRating?: number;
  reviewCount?: number;
  // Small labels under the rating, e.g. where a free copy is (the library).
  tags?: { label: string; external?: boolean }[];
}) {
  return (
    <Link href={`/books/${id}`} className="group flex flex-col">
      <BookCover
        bookId={id}
        categorySlug={categorySlug}
        title={title}
        titleBangla={titleBangla}
        author={author}
        colorKey={colorKey}
        coverPublicId={coverPublicId}
        context="card"
        className="book-lift"
      />
      <p className="mt-2 font-display text-base leading-snug text-ink group-hover:text-cloth">
        {titleBangla || title}
      </p>
      <p className="font-body text-xs text-ink/50">{author}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <StarRating value={averageRating} readOnly size="sm" />
        {reviewCount > 0 && <span className="font-body text-xs text-ink/40">({bn(reviewCount)})</span>}
      </div>
      {tags.length > 0 && (
        <ul className="mt-1.5 flex flex-wrap gap-1">
          {tags.map((t) => (
            <li
              key={t.label}
              className={`rounded-book px-1.5 py-0.5 font-body text-xs font-semibold leading-tight ${
                t.external ? "bg-ink/10 text-ink/70" : "bg-sage/15 text-sage"
              }`}
            >
              {t.label}
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}
