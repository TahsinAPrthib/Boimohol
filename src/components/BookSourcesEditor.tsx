"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addBookSource, deleteBookSource, updateBookSource } from "@/actions/book-sources";
import { displayUrl, MAX_SOURCE_URL_LENGTH, parseSourceUrl, SOURCE_LABEL, type SourceKind } from "@/lib/book-sources";

export type EditableSource = { id: string; kind: SourceKind; url: string; rightsBasis: string; addedBy: string | null };

const EMPTY_BASIS = "কোন ভিত্তিতে বইটি বিনামূল্যে পড়া যাচ্ছে তা লিখতে হবে।";

// The external free copies of one book on /admin/books: each can be edited or
// removed, and a new one added. The link is checked here for quick feedback
// and again on the server, which also re-checks the public-domain rule.
export default function BookSourcesEditor({
  bookId,
  eligible,
  sources,
}: {
  bookId: string;
  eligible: boolean;
  sources: EditableSource[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <p className="font-body text-sm font-semibold text-ink">বাইরের সাইটে বিনামূল্যের কপি</p>
      {!eligible && (
        <p className="font-body text-xs font-semibold text-oxblood">
          বইটি এখন পাবলিক ডোমেইনের নিয়মে পড়ে না, তাই নিচের লিংকগুলো সাইটে দেখানো হচ্ছে না।
        </p>
      )}
      {sources.length > 0 && (
        <ul className="flex flex-col gap-2">
          {sources.map((s) => (
            <SourceItem key={s.id} source={s} editable={eligible} />
          ))}
        </ul>
      )}
      {eligible &&
        (adding ? (
          <SourceForm
            idPrefix={`new-source-${bookId}`}
            initialUrl=""
            initialBasis=""
            submitLabel="লিংক যোগ করুন"
            onCancel={() => setAdding(false)}
            onSubmit={(url, basis) => addBookSource(bookId, url, basis)}
            onDone={() => setAdding(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="h-9 self-start rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink hover:border-cloth hover:text-cloth"
          >
            {sources.length > 0 ? "আরেকটি লিংক যোগ করুন" : "উইকিসংকলন, গুটেনবার্গ বা আর্কাইভের লিংক যোগ করুন"}
          </button>
        ))}
    </div>
  );
}

function SourceItem({ source, editable }: { source: EditableSource; editable: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function remove() {
    setError(null);
    start(async () => {
      const result = await deleteBookSource(source.id);
      if (!result.success) {
        setError(result.message ?? "লিংকটি সরানো যায়নি।");
        return;
      }
      start(() => router.refresh());
    });
  }

  if (editing) {
    return (
      <li className="rounded-book border-2 border-ink/10 p-3">
        <SourceForm
          idPrefix={`source-${source.id}`}
          initialUrl={displayUrl(source.url)}
          initialBasis={source.rightsBasis}
          submitLabel="সংরক্ষণ করুন"
          onCancel={() => setEditing(false)}
          onSubmit={(url, basis) => updateBookSource(source.id, url, basis)}
          onDone={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1 rounded-book border-2 border-ink/10 p-3" data-book-source>
      <p className="font-body text-sm text-ink/80">
        <span className="font-semibold text-ink">{SOURCE_LABEL[source.kind]}:</span>{" "}
        <a href={source.url} target="_blank" rel="noopener noreferrer" className="break-all text-cloth underline">
          {displayUrl(source.url)}
        </a>
      </p>
      <p className="max-w-prose font-body text-sm text-ink/70">
        <span className="font-semibold text-ink">ভিত্তি:</span> {source.rightsBasis}
      </p>
      {source.addedBy && <p className="font-body text-xs text-ink/70">যোগ করেছেন: @{source.addedBy}</p>}
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {editable && !confirming && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink hover:border-cloth hover:text-cloth"
          >
            সম্পাদনা
          </button>
        )}
        {confirming ? (
          <>
            <span className="font-body text-xs text-ink/70">লিংকটি সরিয়ে ফেলবেন?</span>
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
              onClick={() => setConfirming(false)}
              className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink disabled:opacity-60"
            >
              বাতিল
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink hover:border-oxblood hover:text-oxblood"
          >
            লিংক সরান
          </button>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}
    </li>
  );
}

function SourceForm({
  idPrefix,
  initialUrl,
  initialBasis,
  submitLabel,
  onSubmit,
  onCancel,
  onDone,
}: {
  idPrefix: string;
  initialUrl: string;
  initialBasis: string;
  submitLabel: string;
  onSubmit: (url: string, rightsBasis: string) => Promise<{ success: boolean; message?: string }>;
  onCancel: () => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [basis, setBasis] = useState(initialBasis);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const errorId = `${idPrefix}-error`;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const link = parseSourceUrl(url);
    if (!link.ok) return setError(link.message);
    if (!basis.trim()) return setError(EMPTY_BASIS);
    setError(null);
    start(async () => {
      const result = await onSubmit(url, basis);
      if (!result.success) {
        setError(result.message ?? "লিংকটি সংরক্ষণ করা যায়নি।");
        return;
      }
      // As in BookFileRightsEditor: close in a new transition, so the form
      // stays "saving" until the refreshed list arrives.
      start(() => {
        onDone();
        router.refresh();
      });
    });
  }

  const link = url.trim() ? parseSourceUrl(url) : null;
  return (
    <form onSubmit={submit} noValidate className="flex max-w-prose flex-col gap-2">
      <div>
        <label htmlFor={`${idPrefix}-url`} className="field-label">
          লিংক <span className="text-oxblood">*</span>
        </label>
        <input
          id={`${idPrefix}-url`}
          type="url"
          inputMode="url"
          required
          autoFocus
          maxLength={MAX_SOURCE_URL_LENGTH}
          disabled={pending}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://bn.wikisource.org/wiki/..."
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : `${idPrefix}-hint`}
          className="field-input text-sm"
        />
        <p id={`${idPrefix}-hint`} className="mt-1 font-body text-xs text-ink/70">
          {link?.ok
            ? `সাইট: ${SOURCE_LABEL[link.kind]}`
            : "শুধু উইকিসংকলন (যেকোনো ভাষার), প্রজেক্ট গুটেনবার্গ বা ইন্টারনেট আর্কাইভ।"}
        </p>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-basis`} className="field-label">
          কেন এটি বিনামূল্যে পড়া যাচ্ছে <span className="text-oxblood">*</span>
        </label>
        <textarea
          id={`${idPrefix}-basis`}
          rows={2}
          required
          maxLength={1000}
          disabled={pending}
          value={basis}
          onChange={(e) => setBasis(e.target.value)}
          placeholder="যেমন: লেখক ১৯৪১ সালে মারা গেছেন; কপিরাইটের মেয়াদ শেষ"
          className="field-input text-sm"
        />
      </div>
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
          {pending ? "সংরক্ষণ হচ্ছে..." : submitLabel}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink disabled:opacity-60"
        >
          বাতিল
        </button>
      </div>
    </form>
  );
}
