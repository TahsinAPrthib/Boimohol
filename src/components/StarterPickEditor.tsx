"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeStarterPick, setStarterPick } from "@/actions/admin-categories";
import { bn } from "@/lib/bangla";
import { MAX_STARTER_NOTE } from "@/lib/starter-pick";

type Option = { id: string; label: string };

// Choose, change or remove one category's "start here" book on
// /admin/categories. The server checks the book belongs to the category.
export default function StarterPickEditor({
  categoryId,
  categoryName,
  books,
  current,
}: {
  categoryId: string;
  categoryName: string;
  books: Option[];
  current: { bookId: string; note: string } | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [bookId, setBookId] = useState(current?.bookId ?? "");
  const [note, setNote] = useState(current?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const ids = { book: `starter-book-${categoryId}`, note: `starter-note-${categoryId}`, error: `starter-error-${categoryId}` };

  function open() {
    setBookId(current?.bookId ?? "");
    setNote(current?.note ?? "");
    setError(null);
    setEditing(true);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!bookId) return setError("একটি বই বেছে নিন।");
    if (!note.trim()) return setError("কেন এটি ভালো প্রথম বই, তা লিখুন।");
    setError(null);
    start(async () => {
      const result = await setStarterPick(categoryId, bookId, note);
      if (!result.success) {
        setError(result.message ?? "সংরক্ষণ করা যায়নি।");
        return;
      }
      // Close in a new transition so the form stays "saving" until the
      // refreshed pick arrives (as in BookFileRightsEditor).
      start(() => {
        setEditing(false);
        router.refresh();
      });
    });
  }

  function remove() {
    setError(null);
    start(async () => {
      const result = await removeStarterPick(categoryId);
      if (!result.success) {
        setError(result.message ?? "সরানো যায়নি।");
        return;
      }
      start(() => {
        setConfirmingRemove(false);
        router.refresh();
      });
    });
  }

  if (books.length === 0) {
    return <p className="font-body text-sm text-ink/70">এই বিভাগে এখনো কোনো বই নেই, তাই শুরুর বই বাছাই করা যাবে না।</p>;
  }

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={open}
          className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink hover:border-cloth hover:text-cloth"
        >
          {current ? "শুরুর বই বা নোট বদলান" : "শুরুর বই বাছাই করুন"}
        </button>
        {current &&
          (confirmingRemove ? (
            <>
              <span className="font-body text-xs text-ink/70">শুরুর বইটি সরিয়ে ফেলবেন?</span>
              <button
                type="button"
                disabled={pending}
                onClick={remove}
                className="h-9 rounded-book border-2 border-oxblood bg-oxblood/10 px-3 font-body text-xs font-semibold text-oxblood disabled:opacity-60"
              >
                {pending ? "সরানো হচ্ছে..." : "হ্যাঁ, সরান"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setConfirmingRemove(false)}
                className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink disabled:opacity-60"
              >
                বাতিল
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingRemove(true)}
              className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink hover:border-oxblood hover:text-oxblood"
            >
              শুরুর বই সরান
            </button>
          ))}
        {error && <p className="field-error w-full">{error}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={save} noValidate className="flex max-w-prose flex-col gap-3" data-starter-form>
      <div>
        <label htmlFor={ids.book} className="field-label">
          {categoryName} বিভাগের শুরুর বই <span className="text-oxblood">*</span>
        </label>
        <select
          id={ids.book}
          required
          disabled={pending}
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          className="field-input text-sm"
        >
          <option value="">— একটি বই বেছে নিন —</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={ids.note} className="field-label">
          কেন এটি ভালো প্রথম বই <span className="text-oxblood">*</span>
        </label>
        <textarea
          id={ids.note}
          rows={3}
          required
          maxLength={MAX_STARTER_NOTE}
          disabled={pending}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="যেমন: ছোট ও সহজ ভাষায় লেখা, তাই এই ধরনের বই পড়া শুরু করার জন্য ভালো।"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? ids.error : undefined}
          className="field-input text-sm"
        />
        <p className="mt-1 font-body text-xs text-ink/70">
          {bn(note.length)}/{bn(MAX_STARTER_NOTE)} অক্ষর · বিভাগের পাতায় বইটির পাশে দেখানো হবে।
        </p>
      </div>
      {error && (
        <p id={ids.error} className="field-error">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-book border-2 border-cloth bg-cloth px-3 font-body text-xs font-semibold text-paper disabled:opacity-60"
        >
          {pending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setEditing(false)}
          className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink disabled:opacity-60"
        >
          বাতিল
        </button>
      </div>
    </form>
  );
}
