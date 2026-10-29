import type { ReactNode } from "react";
import ShelfBooks from "@/components/ShelfBooks";
import type { ShelfBook } from "@/lib/todays-book";

// A shelf of books with one standing in front of it (the `front`): the home
// page's book of the day, and the book page's own cover. The board and the
// front book are part of the page; the books on the shelf are decoration,
// hidden from screen readers, and arrive once the page has loaded
// (ShelfBooks). On the home page they drift (`drifting`); see .shelf-* in
// globals.css.
export default function ShelfStage({
  books,
  front,
  size = "home",
  drifting = false,
  tag,
  className = "",
}: {
  books: ShelfBook[];
  front: ReactNode;
  size?: "home" | "book";
  drifting?: boolean;
  tag?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`shelf-stage ${className}`} data-size={size} data-drifting={drifting || undefined}>
      <div className="shelf-row" aria-hidden="true">
        <ShelfBooks books={books} />
        <div className="shelf-board" />
      </div>
      {tag}
      <div className="shelf-front">{front}</div>
    </div>
  );
}
