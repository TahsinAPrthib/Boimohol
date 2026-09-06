"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startOrGetConversation } from "@/actions/messages";

export default function ContactSellerButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await startOrGetConversation(listingId);
      if (!result.success || !result.conversationId) {
        setError(result.message ?? "কিছু একটা সমস্যা হয়েছে।");
        return;
      }
      router.push(`/messages/${result.conversationId}`);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="btn-primary disabled:opacity-60"
      >
        {pending ? "অপেক্ষা করুন..." : "বার্তা পাঠান"}
      </button>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
