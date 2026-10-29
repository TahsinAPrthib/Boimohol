// The first element of the book page and of its loading state, pinned to the
// top of the header layout. Next scrolls a navigation to the first element of
// the segment that arrived; without this, that is the part below the header
// (the header comes with the prefetch), and a tapped book would open scrolled
// down to its shelf buttons. Starting with an element at the top of the
// layout, the page opens at its top, as it always did.
export default function ScrollAnchor() {
  return <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px" />;
}
