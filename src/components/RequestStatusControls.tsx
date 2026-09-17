"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateRequestStatus } from "@/actions/requests";

type Status = "OPEN" | "FULFILLED" | "CLOSED";

const STATUSES: { key: Status; label: string }[] = [
  { key: "OPEN", label: "খোলা" },
  { key: "FULFILLED", label: "পেয়ে গেছি" },
  { key: "CLOSED", label: "বন্ধ করুন" },
];

export default function RequestStatusControls({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: Status;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(currentStatus);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick(next: Status) {
    setError(null);
    const previous = status;
    setStatus(next);
    startTransition(async () => {
      const result = await updateRequestStatus(requestId, next);
      if (!result.success) {
        setStatus(previous);
        setError(result.message ?? "কিছু একটা সমস্যা হয়েছে।");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.key}
            type="button"
            disabled={pending}
            onClick={() => handleClick(s.key)}
            className={
              status === s.key
                ? "rounded-book bg-cloth px-4 py-2 font-body text-sm font-semibold text-paper shadow-shelf disabled:opacity-60"
                : "rounded-book border-2 border-ink/20 px-4 py-2 font-body text-sm font-semibold text-ink hover:border-ink/40 disabled:opacity-60"
            }
          >
            {s.label}
          </button>
        ))}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
