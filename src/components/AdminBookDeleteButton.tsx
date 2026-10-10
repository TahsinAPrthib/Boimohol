"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBook } from "@/actions/admin-books";

// Two steps, like the file delete button. The server decides: a book with
// anything attached is refused with a Bangla explanation shown here.
export default function AdminBookDeleteButton({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteBook(bookId);
      setConfirming(false);
      if (!result.success) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-1">
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-body text-xs text-ink/70">বইটি মুছে ফেলবেন?</span>
          <button
            type="button"
            disabled={pending}
            onClick={remove}
            className="h-9 rounded-book bg-oxblood px-3 font-body text-xs font-semibold text-paper disabled:opacity-60"
          >
            {pending ? "মুছে ফেলা হচ্ছে..." : "হ্যাঁ, মুছুন"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirming(false)}
            className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink disabled:opacity-60"
          >
            না
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
          className="h-9 self-start rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink hover:border-oxblood hover:text-oxblood"
        >
          বই মুছুন
        </button>
      )}
      {error && <p className="max-w-prose font-body text-xs text-oxblood">{error}</p>}
    </div>
  );
}
