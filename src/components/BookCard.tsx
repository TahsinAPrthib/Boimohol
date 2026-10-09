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
  averageRating = 0,
  reviewCount = 0,
}: {
  id: string;
  title: string;
  titleBangla?: string | null;
  author: string;
  colorKey?: string;
  averageRating?: number;
  reviewCount?: number;
}) {
  return (
    <Link href={`/books/${id}`} className="group flex flex-col">
      <BookCover title={title} author={author} colorKey={colorKey} className="book-lift" />
      <p className="mt-2 font-display text-base leading-snug text-ink group-hover:text-cloth">
        {titleBangla || title}
      </p>
      <p className="font-body text-xs text-ink/50">{author}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <StarRating value={averageRating} readOnly size="sm" />
        {reviewCount > 0 && <span className="font-body text-xs text-ink/40">({bn(reviewCount)})</span>}
      </div>
    </Link>
  );
}
