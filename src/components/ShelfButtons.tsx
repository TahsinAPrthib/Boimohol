"use client";

import { useRef, useState, useTransition } from "react";
import { removeFromShelf, updateShelfStatus } from "@/actions/shelf";

type Status = "WANT" | "READING" | "FINISHED";

const STATUSES: { key: Status; label: string }[] = [
  { key: "WANT", label: "পড়তে চাই" },
  { key: "READING", label: "পড়ছি" },
  { key: "FINISHED", label: "পড়া শেষ" },
];

export default function ShelfButtons({
  bookId,
  initialStatus,
}: {
  bookId: string;
  initialStatus: Status | null;
}) {
  const [status, setStatus] = useState<Status | null>(initialStatus);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // The button the reader just pressed settles into place; one already
  // active on page load doesn't animate.
  const [justChosen, setJustChosen] = useState<Status | null>(null);
  const first = useRef<HTMLButtonElement>(null);

  // `next` null takes the book off the shelf. Its button then goes, so the
  // keyboard focus moves to the first shelf button. While a change is being
  // saved the buttons ignore presses but stay focusable (aria-disabled, not
  // disabled): a focused button that is disabled drops the focus.
  function handleClick(next: Status | null) {
    if (pending) return;
    setError(null);
    const previous = status;
    setStatus(next);
    setJustChosen(next);
    if (next === null) first.current?.focus();
    startTransition(async () => {
      const result = next ? await updateShelfStatus(bookId, next) : await removeFromShelf(bookId);
      if (!result.success) {
        setStatus(previous);
        setError(result.message ?? "কিছু একটা সমস্যা হয়েছে।");
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s, i) => (
          <button
            key={s.key}
            ref={i === 0 ? first : undefined}
            type="button"
            aria-disabled={pending}
            aria-pressed={status === s.key}
            onClick={() => handleClick(s.key)}
            className={`transition-colors duration-300 ${
              status === s.key
                ? "rounded-book bg-cloth px-4 py-2 font-body text-sm font-semibold text-paper shadow-shelf aria-disabled:opacity-60"
                : "rounded-book border-2 border-ink/20 px-4 py-2 font-body text-sm font-semibold text-ink hover:border-ink/40 aria-disabled:opacity-60"
            }${status === s.key && justChosen === s.key ? " motion-safe:animate-settle" : ""}`}
          >
            {s.label}
          </button>
        ))}
        {status && (
          <button
            type="button"
            aria-disabled={pending}
            onClick={() => handleClick(null)}
            className="min-h-11 rounded-book px-3 py-2 font-body text-sm text-ink/70 underline underline-offset-4 hover:text-oxblood aria-disabled:opacity-60"
          >
            তাক থেকে সরান
          </button>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
