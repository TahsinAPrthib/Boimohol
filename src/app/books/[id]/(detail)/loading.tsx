import { BookPageRestSkeleton } from "@/components/Skeletons";
import ScrollAnchor from "./scroll-anchor";

// Only the part below the header: the header (cover, title, the free copies)
// is in the layout above this, so it arrives with the prefetch.
export default function Loading() {
  return (
    <>
      <ScrollAnchor />
      <BookPageRestSkeleton />
    </>
  );
}
