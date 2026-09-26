"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBookFile, getPdfUploadSignature } from "@/actions/library";
import { MAX_PDF_BYTES } from "@/lib/cloudinary-url";
import { bn } from "@/lib/bangla";

export default function BookFileUploader({
  bookId,
  isPublicDomain,
}: {
  bookId: string;
  isPublicDomain: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rightsBasis, setRightsBasis] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [, startRefresh] = useTransition();

  // The server refuses non-public-domain books anyway; this keeps the UI from
  // offering an action that cannot succeed.
  const blocked = !isPublicDomain;
  const canSubmit = !blocked && !busy && file !== null && rightsBasis.trim().length > 0;

  async function handleUpload() {
    setError(null);
    setDone(null);

    if (!file) {
      setError("একটি পিডিএফ ফাইল বেছে নিন।");
      return;
    }
    // Checked before the upload starts, so a submission that cannot succeed
    // never leaves an orphaned asset in Cloudinary.
    if (!rightsBasis.trim()) {
      setError("কোন ভিত্তিতে বইটি বিনামূল্যে দেওয়া যাচ্ছে তা লিখতে হবে।");
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("শুধু পিডিএফ ফাইল দেওয়া যাবে।");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError(`ফাইলটি ${bn(50)} মেগাবাইটের বেশি বড়।`);
      return;
    }

    setBusy(true);
    try {
      const sig = await getPdfUploadSignature();
      if (!sig.success || !sig.signature) {
        setError(sig.message ?? "আপলোড শুরু করা যায়নি।");
        return;
      }

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sig.apiKey!);
      form.append("timestamp", String(sig.timestamp));
      form.append("signature", sig.signature);
      form.append("folder", sig.folder!);
      form.append("allowed_formats", sig.allowedFormats!);

      // PDFs go to the raw endpoint, not image.
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/raw/upload`,
        { method: "POST", body: form }
      );
      const json = await res.json();
      if (!res.ok || !json.public_id) {
        setError(json?.error?.message ? "আপলোড করা যায়নি।" : "আপলোড করা যায়নি।");
        return;
      }

      const result = await createBookFile(
        bookId,
        json.public_id,
        rightsBasis.trim(),
        sourceUrl.trim() || undefined
      );
      if (!result.success) {
        setError(result.message ?? "ফাইলটি যোগ করা যায়নি।");
        return;
      }

      setDone(result.message ?? "ফাইলটি যোগ করা হয়েছে।");
      setFile(null);
      setRightsBasis("");
      setSourceUrl("");
      if (inputRef.current) inputRef.current.value = "";
      startRefresh(() => router.refresh());
    } catch {
      setError("আপলোডের সময় সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  }

  if (blocked) {
    return (
      <p className="rounded-book border-2 border-dashed border-ink/15 px-3 py-2 font-body text-xs text-ink/60">
        এই বইটি পাবলিক ডোমেইনে নেই, তাই এর ফাইল যোগ করা যাবে না।
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label htmlFor={`pdf-${bookId}`} className="field-label">
          পিডিএফ ফাইল
        </label>
        <input
          ref={inputRef}
          id={`pdf-${bookId}`}
          type="file"
          accept="application/pdf"
          disabled={busy}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="field-input text-sm file:mr-3 file:rounded-book file:border-0 file:bg-cloth file:px-3 file:py-1.5 file:font-body file:text-sm file:font-semibold file:text-paper disabled:opacity-60"
        />
        <p className="mt-1 font-body text-xs text-ink/50">
          সর্বোচ্চ {bn(50)} মেগাবাইট।
        </p>
      </div>

      <div>
        <label htmlFor={`basis-${bookId}`} className="field-label">
          কেন এটি বিনামূল্যে দেওয়া যাচ্ছে <span className="text-oxblood">*</span>
        </label>
        <textarea
          id={`basis-${bookId}`}
          rows={2}
          required
          disabled={busy}
          value={rightsBasis}
          onChange={(e) => setRightsBasis(e.target.value)}
          placeholder="যেমন: লেখক ১৯৪১ সালে মৃত্যুবরণ করেছেন; কপিরাইট মেয়াদোত্তীর্ণ"
          className="field-input text-sm"
        />
      </div>

      <div>
        <label htmlFor={`src-${bookId}`} className="field-label">
          উৎস (ঐচ্ছিক)
        </label>
        <input
          id={`src-${bookId}`}
          type="url"
          disabled={busy}
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://..."
          className="field-input text-sm"
        />
      </div>

      {error && <p className="field-error">{error}</p>}
      {done && <p className="font-body text-xs font-semibold text-sage">{done}</p>}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!canSubmit}
        className="btn-primary self-start text-sm disabled:opacity-50"
      >
        {busy ? "আপলোড হচ্ছে..." : "ফাইল যোগ করুন"}
      </button>
      {!busy && file && !rightsBasis.trim() && (
        <p className="font-body text-xs text-ink/50">
          ভিত্তি না লেখা পর্যন্ত ফাইলটি যোগ করা যাবে না।
        </p>
      )}
    </div>
  );
}
