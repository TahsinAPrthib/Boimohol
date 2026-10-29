"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getCoverUploadSignature, removeCover, setCoverFromUpload, setCoverFromUrl, type CoverResult } from "@/actions/covers";
import { coverSourceLabel, isAllowedCoverSourceUrl, MAX_COVER_BYTES, parseCoverUrl } from "@/lib/covers";
import { bn } from "@/lib/bangla";
import BookCover from "@/components/BookCover";

export type EditableCover = { publicId: string; sourceUrl: string; rightsBasis: string };

const EMPTY_BASIS = "ছবিটি কেন ব্যবহার করা যায়, তা লিখতে হবে।";
const BASIS_PLACEHOLDER = "যেমন: ১৯১০ সালের সংস্করণের নামপত্র, কমন্সের স্ক্যান থেকে। লেখক ১৯৪১ সালে মারা গেছেন; কপিরাইটের মেয়াদ শেষ।";

// A book's real cover on /admin/books: shown with its source and note, and
// set, replaced or removed. A cover comes from a URL on an allowed source
// (Cloudinary fetches it) or from an uploaded image with the page it came
// from. Everything is checked again on the server, including the
// public-domain rule.
export default function BookCoverEditor({
  bookId,
  eligible,
  cover,
  book,
}: {
  bookId: string;
  eligible: boolean;
  cover: EditableCover | null;
  book: { id: string; categorySlug: string; title: string; titleBangla: string | null; author: string; colorKey: string };
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function remove() {
    setError(null);
    setDone(null);
    start(async () => {
      const result = await removeCover(bookId);
      if (!result.success) {
        setError(result.message);
        return;
      }
      start(() => {
        setConfirming(false);
        setDone(result.message);
        router.refresh();
      });
    });
  }

  if (!eligible && !cover) return null;

  return (
    <div className="flex flex-col gap-2" data-cover-editor>
      <p className="font-body text-sm font-semibold text-ink">আসল প্রচ্ছদ</p>
      {!eligible && (
        <p className="font-body text-xs font-semibold text-oxblood">
          বইটি এখন পাবলিক ডোমেইনের নিয়মে পড়ে না; প্রচ্ছদের ছবিটি সরিয়ে ফেলুন।
        </p>
      )}
      {cover ? (
        <div className="flex items-start gap-3">
          <div className="w-16 shrink-0">
            <BookCover
              bookId={book.id}
              categorySlug={book.categorySlug}
              title={book.title}
              titleBangla={book.titleBangla}
              author={book.author}
              colorKey={book.colorKey}
              coverPublicId={cover.publicId}
              context="small"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="font-body text-sm text-ink/80">
              <span className="font-semibold text-ink">উৎস:</span>{" "}
              <a href={cover.sourceUrl} target="_blank" rel="noopener noreferrer" className="break-all text-cloth underline">
                {coverSourceLabel(cover.sourceUrl)}
              </a>
            </p>
            <p className="max-w-prose font-body text-sm text-ink/70">
              <span className="font-semibold text-ink">ভিত্তি:</span> {cover.rightsBasis}
            </p>
            {!editing && (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {eligible && !confirming && (
                  <button
                    type="button"
                    onClick={() => {
                      setDone(null);
                      setEditing(true);
                    }}
                    className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink hover:border-cloth hover:text-cloth"
                  >
                    প্রচ্ছদ বদলান
                  </button>
                )}
                {confirming ? (
                  <>
                    <span className="font-body text-xs text-ink/70">ছবিটি সরিয়ে তৈরি করা প্রচ্ছদে ফিরবেন?</span>
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
                    onClick={() => {
                      setDone(null);
                      setConfirming(true);
                    }}
                    className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink hover:border-oxblood hover:text-oxblood"
                  >
                    প্রচ্ছদ সরান
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        !editing && (
          <button
            type="button"
            onClick={() => {
              setDone(null);
              setEditing(true);
            }}
            className="h-9 self-start rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink hover:border-cloth hover:text-cloth"
          >
            কমন্স, উইকিসংকলন বা গুটেনবার্গের স্ক্যান থেকে আসল প্রচ্ছদ দিন
          </button>
        )
      )}
      {editing && eligible && (
        <CoverForm
          bookId={bookId}
          initialBasis={cover?.rightsBasis ?? ""}
          submitLabel={cover ? "প্রচ্ছদ বদলান" : "প্রচ্ছদ যোগ করুন"}
          onCancel={() => setEditing(false)}
          onDone={(message) => {
            setEditing(false);
            setDone(message);
          }}
        />
      )}
      {error && <p className="field-error">{error}</p>}
      {done && <p className="font-body text-xs font-semibold text-sage">{done}</p>}
    </div>
  );
}

function CoverForm({
  bookId,
  initialBasis,
  submitLabel,
  onCancel,
  onDone,
}: {
  bookId: string;
  initialBasis: string;
  submitLabel: string;
  onCancel: () => void;
  onDone: (message: string) => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [basis, setBasis] = useState(initialBasis);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const idPrefix = `cover-${bookId}`;
  const errorId = `${idPrefix}-error`;

  // Everything that can be checked here is checked before anything is
  // uploaded, so a submission that cannot succeed leaves nothing behind in
  // Cloudinary.
  function check(): string | null {
    if (mode === "url") {
      const source = parseCoverUrl(url);
      if (!source.ok) return source.error;
    } else {
      if (!file) return "একটি ছবি বেছে নিন।";
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return "শুধু JPG, PNG বা WebP ছবি দেওয়া যাবে।";
      if (file.size > MAX_COVER_BYTES) return `ছবিটি ${bn(10)} মেগাবাইটের বেশি বড়।`;
      if (!isAllowedCoverSourceUrl(sourceUrl)) return "ছবিটি কোন পাতা থেকে নেওয়া, সেই উইকিমিডিয়া, উইকিসংকলন বা গুটেনবার্গের ঠিকানা দিন।";
    }
    if (!basis.trim()) return EMPTY_BASIS;
    return null;
  }

  async function upload(): Promise<CoverResult> {
    const sig = await getCoverUploadSignature();
    if (!sig.success) return { success: false, message: sig.message };
    const form = new FormData();
    form.append("file", file!);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);
    form.append("allowed_formats", sig.allowedFormats);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: "POST", body: form });
    const json = (await res.json().catch(() => null)) as { public_id?: string } | null;
    if (!res.ok || !json?.public_id) return { success: false, message: "ছবিটি আপলোড করা যায়নি।" };
    return setCoverFromUpload(bookId, json.public_id, sourceUrl, basis);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = check();
    if (problem) return setError(problem);
    setError(null);
    start(async () => {
      let result: CoverResult;
      try {
        result = mode === "url" ? await setCoverFromUrl(bookId, url, basis) : await upload();
      } catch {
        result = { success: false, message: "সার্ভারে সমস্যা হয়েছে; আবার চেষ্টা করুন।" };
      }
      if (!result.success) {
        setError(result.message);
        return;
      }
      start(() => {
        onDone(result.message);
        router.refresh();
      });
    });
  }

  const source = mode === "url" && url.trim() ? parseCoverUrl(url) : null;
  return (
    <form onSubmit={submit} noValidate className="flex max-w-prose flex-col gap-2 rounded-book border-2 border-ink/10 p-3">
      <fieldset className="flex flex-wrap gap-4 font-body text-sm text-ink" disabled={pending}>
        <legend className="sr-only">ছবি কোথা থেকে</legend>
        <label className="flex items-center gap-1.5">
          <input type="radio" name={`${idPrefix}-mode`} checked={mode === "url"} onChange={() => setMode("url")} />
          ঠিকানা থেকে
        </label>
        <label className="flex items-center gap-1.5">
          <input type="radio" name={`${idPrefix}-mode`} checked={mode === "upload"} onChange={() => setMode("upload")} />
          ছবি আপলোড
        </label>
      </fieldset>

      {mode === "url" ? (
        <div>
          <label htmlFor={`${idPrefix}-url`} className="field-label">
            ছবির ঠিকানা <span className="text-oxblood">*</span>
          </label>
          <input
            id={`${idPrefix}-url`}
            type="url"
            inputMode="url"
            required
            autoFocus
            maxLength={2000}
            disabled={pending}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://commons.wikimedia.org/wiki/File:...pdf?page=5"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : `${idPrefix}-hint`}
            className="field-input text-sm"
          />
          <p id={`${idPrefix}-hint`} className="mt-1 font-body text-xs text-ink/70">
            {source?.ok
              ? `উৎস: ${coverSourceLabel(source.sourceUrl)}`
              : "কমন্সের ফাইলের পাতা (পিডিএফ বা ডিজেভিইউ হলে ?page= দিয়ে পাতা), upload.wikimedia.org-এর ছবি, বা gutenberg.org-এর প্রচ্ছদের ছবি।"}
          </p>
        </div>
      ) : (
        <>
          <div>
            <label htmlFor={`${idPrefix}-file`} className="field-label">
              ছবি <span className="text-oxblood">*</span>
            </label>
            <input
              id={`${idPrefix}-file`}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={pending}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="field-input text-sm file:mr-3 file:rounded-book file:border-0 file:bg-cloth file:px-3 file:py-1.5 file:font-body file:text-sm file:font-semibold file:text-paper disabled:opacity-60"
            />
            <p className="mt-1 font-body text-xs text-ink/70">JPG, PNG বা WebP, সর্বোচ্চ {bn(10)} মেগাবাইট; খাড়া, বইয়ের মতো।</p>
          </div>
          <div>
            <label htmlFor={`${idPrefix}-src`} className="field-label">
              কোন পাতা থেকে নেওয়া <span className="text-oxblood">*</span>
            </label>
            <input
              id={`${idPrefix}-src`}
              type="url"
              inputMode="url"
              required
              maxLength={2000}
              disabled={pending}
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://commons.wikimedia.org/wiki/File:..."
              className="field-input text-sm"
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor={`${idPrefix}-basis`} className="field-label">
          ছবিটি কেন ব্যবহার করা যায় <span className="text-oxblood">*</span>
        </label>
        <textarea
          id={`${idPrefix}-basis`}
          rows={2}
          required
          maxLength={1000}
          disabled={pending}
          value={basis}
          onChange={(e) => setBasis(e.target.value)}
          placeholder={BASIS_PLACEHOLDER}
          className="field-input text-sm"
        />
        <p className="mt-1 font-body text-xs text-ink/70">
          শুধু পাবলিক ডোমেইনের বইয়ের নিজের স্ক্যানের প্রচ্ছদ বা নামপত্র; আধুনিক প্রকাশকের প্রচ্ছদ বা দোকানের ছবি নয়।
        </p>
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
          {pending ? "ছবি আনা হচ্ছে..." : submitLabel}
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
