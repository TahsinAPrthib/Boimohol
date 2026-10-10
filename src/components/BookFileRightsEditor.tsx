"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBookFileRightsBasis } from "@/actions/library";

const EMPTY_MESSAGE = "কোন ভিত্তিতে ফাইলটি বিনামূল্যে দেওয়া যাচ্ছে তা লিখতে হবে।";

// Shows a file's rights-basis note on /admin/books and lets an admin correct
// it in place, without deleting and re-uploading the PDF.
export default function BookFileRightsEditor({ fileId, rightsBasis }: { fileId: string; rightsBasis: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(rightsBasis);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const editButton = useRef<HTMLButtonElement>(null);
  const refocusEdit = useRef(false);

  // Back to the edit button after saving or cancelling, not to the page top.
  useEffect(() => {
    if (!editing && refocusEdit.current) {
      refocusEdit.current = false;
      editButton.current?.focus();
    }
  }, [editing]);

  function close() {
    refocusEdit.current = true;
    setEditing(false);
    setError(null);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) {
      setError(EMPTY_MESSAGE);
      return;
    }
    setError(null);
    start(async () => {
      const result = await updateBookFileRightsBasis(fileId, draft);
      if (!result.success) {
        setError(result.message ?? "ভিত্তি হালনাগাদ করা যায়নি।");
        return;
      }
      // Updates after an await are no longer part of the transition, so close
      // inside a new one: the form then stays "saving" until the refreshed
      // note arrives, instead of flashing the old note for a moment.
      start(() => {
        close();
        router.refresh();
      });
    });
  }

  if (!editing) {
    return (
      <div className="flex flex-col items-start gap-1">
        <p className="max-w-prose font-body text-sm text-ink/70">
          <span className="font-semibold text-ink">ভিত্তি:</span> {rightsBasis}
        </p>
        <button
          ref={editButton}
          type="button"
          onClick={() => {
            setDraft(rightsBasis);
            setEditing(true);
          }}
          className="min-h-9 font-body text-xs font-semibold text-cloth hover:underline"
        >
          ভিত্তি সম্পাদনা করুন
        </button>
      </div>
    );
  }

  const errorId = `basis-edit-error-${fileId}`;
  return (
    <form onSubmit={save} noValidate className="flex max-w-prose flex-col gap-2">
      <label htmlFor={`basis-edit-${fileId}`} className="field-label">
        কেন এটি বিনামূল্যে দেওয়া যাচ্ছে <span className="text-oxblood">*</span>
      </label>
      <textarea
        id={`basis-edit-${fileId}`}
        rows={3}
        required
        maxLength={1000}
        autoFocus
        disabled={pending}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="field-input text-sm"
      />
      {error && (
        <p id={errorId} className="field-error">
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
          onClick={close}
          className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink disabled:opacity-60"
        >
          বাতিল
        </button>
      </div>
    </form>
  );
}
