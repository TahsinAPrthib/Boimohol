// Loading placeholders shaped like what is coming -- book covers on a shelf,
// rather than a spinner -- so a slow database (Neon waking up) reads as the
// page arriving, not as a blank screen. The shimmer lives in globals.css
// (.skeleton) and stops under reduced motion.

function Loading({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">লোড হচ্ছে…</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

export function BookShape({ square = false, className = "" }: { square?: boolean; className?: string }) {
  return (
    <div className={`skeleton rounded-book shadow-shelf ${square ? "aspect-square" : "aspect-[2/3]"} ${className}`}>
      {/* the spine edge, as on the real generated covers */}
      <div className="absolute inset-y-0 left-0 w-2 bg-ink/5" />
    </div>
  );
}

export function Line({ className = "" }: { className?: string }) {
  return <div className={`skeleton h-3 rounded-book ${className}`} />;
}

function Heading() {
  return (
    <>
      <div className="skeleton h-8 w-48 max-w-full rounded-book" />
      <Line className="mt-3 w-80 max-w-full" />
    </>
  );
}

function BookTile({ square = false }: { square?: boolean }) {
  return (
    <div>
      <BookShape square={square} />
      <Line className="mt-3 w-3/4" />
      <Line className="mt-2 w-1/2" />
    </div>
  );
}

// Catalogue-style pages: marketplace, library, a category, the wishlist.
export function ShelfGridSkeleton({ square = false, count = 8 }: { square?: boolean; count?: number }) {
  return (
    <Loading className="mx-auto max-w-5xl px-4 py-10">
      <Heading />
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: count }, (_, i) => (
          <BookTile key={i} square={square} />
        ))}
      </div>
    </Loading>
  );
}

// A single book or listing: cover beside its details.
export function BookDetailSkeleton() {
  return (
    <Loading className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[200px_1fr]">
        <BookShape className="max-w-[200px]" />
        <div>
          <Line className="w-24" />
          <div className="skeleton mt-3 h-9 w-72 max-w-full rounded-book" />
          <Line className="mt-3 w-40" />
          <Line className="mt-8 w-full" />
          <Line className="mt-2 w-11/12" />
          <Line className="mt-2 w-2/3" />
          <div className="mt-8 flex gap-2">
            <div className="skeleton h-10 w-28 rounded-book" />
            <div className="skeleton h-10 w-28 rounded-book" />
          </div>
        </div>
      </div>
    </Loading>
  );
}

// The book page below its header (which arrives with the page's layout): the
// shelf buttons, then the reviews.
export function BookPageRestSkeleton() {
  return (
    <Loading className="mt-5">
      <div className="flex flex-col items-start gap-3">
        <div className="skeleton h-10 w-72 max-w-full rounded-book" />
        <div className="skeleton h-10 w-40 rounded-book" />
      </div>
      <div className="mt-10 border-t-2 border-ink/10 pt-8">
        <Line className="w-48" />
        <div className="skeleton mt-4 h-24 w-full rounded-book" />
      </div>
    </Loading>
  );
}

// The in-site reader: a title, then a page of text.
export function ReaderSkeleton() {
  return (
    <Loading className="mx-auto max-w-2xl px-4 py-8">
      <Line className="w-32" />
      <div className="skeleton mt-4 h-8 w-64 max-w-full rounded-book" />
      <Line className="mt-3 w-40" />
      <div className="mt-10 flex flex-col gap-3">
        {Array.from({ length: 12 }, (_, i) => (
          <Line key={i} className={`h-4 ${i % 5 === 4 ? "w-2/3" : "w-full"}`} />
        ))}
      </div>
    </Loading>
  );
}

// Stacked cards: requests, conversations.
export function CardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Loading className="mx-auto max-w-3xl px-4 py-10">
      <Heading />
      <div className="mt-8 flex flex-col gap-4">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="rounded-book border-2 border-ink/10 p-5">
            <Line className="h-4 w-1/2" />
            <Line className="mt-3 w-1/3" />
            <Line className="mt-4 w-5/6" />
          </div>
        ))}
      </div>
    </Loading>
  );
}

export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <Loading className="mx-auto max-w-2xl px-4 py-10">
      <div className="skeleton h-9 w-56 max-w-full rounded-book" />
      <div className="mt-8 flex flex-col gap-5">
        {Array.from({ length: fields }, (_, i) => (
          <div key={i}>
            <Line className="w-24" />
            <div className="skeleton mt-2 h-10 w-full rounded-book" />
          </div>
        ))}
        <div className="skeleton h-11 w-36 rounded-book" />
      </div>
    </Loading>
  );
}

export function ProfileSkeleton() {
  return (
    <Loading className="mx-auto max-w-4xl px-4 py-10">
      <div className="skeleton h-9 w-56 max-w-full rounded-book" />
      <Line className="mt-3 w-28" />
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="skeleton h-28 rounded-book" />
        <div className="skeleton h-28 rounded-book" />
      </div>
      <div className="skeleton mt-10 h-7 w-40 rounded-book" />
      <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <BookShape key={i} />
        ))}
      </div>
    </Loading>
  );
}

// The home page below the hero, while its sections stream in.
export function HomeSectionsSkeleton() {
  return (
    <Loading className="mx-auto flex max-w-5xl flex-col gap-14 px-4 py-12">
      {[4, 6].map((count, row) => (
        <div key={row}>
          <div className="mb-5 border-b-2 border-ink/10 pb-3">
            <div className="skeleton h-7 w-52 max-w-full rounded-book" />
            <Line className="mt-2 w-72 max-w-full" />
          </div>
          <div className="flex gap-4 overflow-hidden pb-3 pt-2 sm:grid sm:grid-cols-4 sm:gap-5 md:grid-cols-6">
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="w-[38%] shrink-0 sm:w-auto">
                <BookTile square={row === 0} />
              </div>
            ))}
          </div>
          <div className="h-2 rounded-book bg-paper-dark shadow-shelf" />
        </div>
      ))}
    </Loading>
  );
}
