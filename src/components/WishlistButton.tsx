"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleWishlist } from "@/actions/wishlist";
import { withCallbackUrl } from "@/lib/safe-redirect";

export default function WishlistButton({
  bookId,
  initialWishlisted,
  isLoggedIn,
}: {
  bookId: string;
  initialWishlisted: boolean;
  isLoggedIn: boolean;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Logged-out visitors get a link to sign in rather than a button that
  // would just fail on click.
  if (!isLoggedIn) {
    return (
      <Link
        href={withCallbackUrl("/login", `/books/${bookId}`)}
        className="inline-flex items-center gap-2 rounded-book border-2 border-ink/20 px-4 py-2 font-body text-sm font-semibold text-ink hover:border-ink/40"
      >
        <BookmarkIcon filled={false} />
        উইশলিস্টে রাখতে লগইন করুন
      </Link>
    );
  }

  function handleClick() {
    setError(null);
    const previous = wishlisted;
    setWishlisted(!previous);
    startTransition(async () => {
      const result = await toggleWishlist(bookId);
      if (!result.success) {
        setWishlisted(previous);
        setError(result.message ?? "কিছু একটা সমস্যা হয়েছে।");
        return;
      }
      if (typeof result.wishlisted === "boolean") setWishlisted(result.wishlisted);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={wishlisted}
        className={
          wishlisted
            ? "inline-flex items-center gap-2 rounded-book bg-turmeric px-4 py-2 font-body text-sm font-semibold text-ink shadow-shelf disabled:opacity-60"
            : "inline-flex items-center gap-2 rounded-book border-2 border-ink/20 px-4 py-2 font-body text-sm font-semibold text-ink hover:border-ink/40 disabled:opacity-60"
        }
      >
        <BookmarkIcon filled={wishlisted} />
        {wishlisted ? "উইশলিস্টে আছে" : "উইশলিস্টে রাখুন"}
      </button>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
