"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { respondToRequest, deleteResponse } from "@/actions/requests";

export default function RequestResponseForm({
  requestId,
  existingResponse,
}: {
  requestId: string;
  // Present when this user has already responded — the form then edits it.
  existingResponse?: { id: string; message: string } | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState(existingResponse?.message ?? "");
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const response = await respondToRequest(requestId, message);
      setResult({ ok: response.success, text: response.message ?? "" });
      if (response.success) router.refresh();
    });
  }

  function handleDelete() {
    if (!existingResponse) return;
    setResult(null);
    startTransition(async () => {
      const response = await deleteResponse(existingResponse.id);
      setResult({ ok: response.success, text: response.message ?? "" });
      if (response.success) {
        setMessage("");
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-book border-2 border-ink/10 bg-paper-dark p-5"
    >
      <h3 className="font-display text-lg text-ink">
        {existingResponse ? "আপনার সাড়া সম্পাদনা করুন" : "এই বইটি আপনার কাছে আছে?"}
      </h3>
      <p className="font-body text-sm text-ink/70">
        বইটি থাকলে বা কোথায় পাওয়া যেতে পারে জানলে দু-এক লাইন লিখে জানান। আপনার সাড়া অনুরোধকারী
        দেখতে পাবেন।
      </p>

      {result && (
        <div
          className={`rounded-book border-2 px-3 py-2 font-body text-sm ${
            result.ok
              ? "border-sage bg-sage/10 text-sage"
              : "border-oxblood bg-oxblood/10 text-oxblood"
          }`}
        >
          {result.text}
        </div>
      )}

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        maxLength={1000}
        className="field-input"
        placeholder="যেমন: আমার কাছে আছে, ভালো অবস্থায়। ধানমন্ডিতে দিতে পারব।"
        aria-label="আপনার সাড়া"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending || !message.trim()}
          className="btn-primary disabled:opacity-60"
        >
          {pending ? "পাঠানো হচ্ছে..." : existingResponse ? "সাড়া হালনাগাদ করুন" : "সাড়া পাঠান"}
        </button>
        {existingResponse && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="rounded-book border-2 border-ink/20 px-4 py-2 font-body text-sm font-semibold text-ink hover:border-ink/40 disabled:opacity-60"
          >
            সাড়া মুছে ফেলুন
          </button>
        )}
      </div>
    </form>
  );
}
