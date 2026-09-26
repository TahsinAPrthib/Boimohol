"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBookFile } from "@/actions/library";

export default function BookFileDeleteButton({ fileId }: { fileId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function remove() {
    setError(null);
    start(async () => {
      const result = await deleteBookFile(fileId);
      if (!result.success) {
        setError(result.message ?? "ফাইলটি মুছে ফেলা যায়নি।");
        return;
      }
      setConfirming(false);
      router.refresh();
    });
  }

  // Deleting destroys the Cloudinary asset as well, so it is not undoable --
  // worth one confirmation step rather than a single stray tap.
  return (
    <div className="flex flex-wrap items-center gap-2">
      {confirming ? (
        <>
          <span className="font-body text-xs text-ink/70">ফাইলটি মুছে ফেলবেন?</span>
          <button
            type="button"
            disabled={pending}
            onClick={remove}
            className="h-9 rounded-book border-2 border-oxblood bg-oxblood/10 px-3 font-body text-xs font-semibold text-oxblood disabled:opacity-60"
          >
            {pending ? "মুছে ফেলা হচ্ছে..." : "হ্যাঁ, মুছুন"}
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
          ফাইল মুছুন
        </button>
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
