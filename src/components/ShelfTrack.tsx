"use client";

import BookCover from "@/components/BookCover";
import type { ShelfBook } from "@/lib/todays-book";

// The row of books on a shelf (ShelfStage). Loaded and drawn only after the
// page has finished loading (ShelfBooks), so it is no part of the first paint.
export default function ShelfTrack({ books }: { books: ShelfBook[] }) {
  return (
    <div className="shelf-arrive">
      <div className="shelf-track">
        {books.map((b) => (
          <div key={b.id} className="shelf-book">
            <BookCover
              bookId={b.id}
              categorySlug={b.category.slug}
              title={b.title}
              titleBangla={b.titleBangla}
              author={b.author}
              colorKey={b.category.colorKey}
              coverPublicId={b.coverPublicId}
              context="shelf"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
