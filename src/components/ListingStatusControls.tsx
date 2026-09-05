"use client";

import { useState, useTransition } from "react";
import { updateListingStatus } from "@/actions/listings";

type Status = "AVAILABLE" | "RESERVED" | "COMPLETED" | "REMOVED";

const STATUSES: { key: Status; label: string }[] = [
  { key: "RESERVED", label: "রিজার্ভড" },
  { key: "COMPLETED", label: "সম্পন্ন" },
  { key: "REMOVED", label: "সরিয়ে ফেলুন" },
];

export default function ListingStatusControls({
  listingId,
  currentStatus,
}: {
  listingId: string;
  currentStatus: Status;
}) {
  const [status, setStatus] = useState<Status>(currentStatus);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick(next: Status) {
    setError(null);
    const previous = status;
    setStatus(next);
    startTransition(async () => {
      const result = await updateListingStatus(listingId, next);
      if (!result.success) {
        setStatus(previous);
        setError(result.message ?? "কিছু একটা সমস্যা হয়েছে।");
      }
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
