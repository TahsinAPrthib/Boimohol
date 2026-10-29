"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { blockUser, unblockUser } from "@/actions/moderation";

export default function BlockButton({
  userId,
  isBlocked,
  username,
}: {
  userId: string;
  isBlocked: boolean;
  username?: string;
}) {
  const router = useRouter();
  const [blocked, setBlocked] = useState(isBlocked);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ success: boolean; message?: string }>, nextState: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.message ?? "কিছু একটা সমস্যা হয়েছে।");
        return;
      }
      setBlocked(nextState);
      setConfirming(false);
      router.refresh();
    });
  }

  if (blocked) {
    return (
      <div>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => unblockUser(userId), false)}
          className="rounded-book border-2 border-ink/20 px-3 py-1.5 font-body text-xs font-semibold text-ink hover:border-ink/40 disabled:opacity-60"
        >
          {pending ? "অপেক্ষা করুন..." : "ব্লক তুলে নিন"}
        </button>
        {error && <p className="field-error">{error}</p>}
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="rounded-book border-2 border-oxblood/40 bg-oxblood/5 p-3">
        <p className="font-body text-sm font-semibold text-ink">
          {username ? `@${username} কে ব্লক করবেন?` : "এই ব্যবহারকারীকে ব্লক করবেন?"}
        </p>
        <ul className="mt-2 flex flex-col gap-1 font-body text-xs text-ink/70">
          <li>তাদের তালিকাগুলো আপনার বিনিময় পাতায় আর দেখাবে না।</li>
          <li>কোনো পক্ষই আর নতুন বার্তা পাঠাতে পারবে না।</li>
          <li>আগের আলাপগুলো পড়া যাবে, মুছে যাবে না।</li>
        </ul>
        {error && <p className="field-error">{error}</p>}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => blockUser(userId), true)}
            className="rounded-book bg-oxblood px-3 py-1.5 font-body text-xs font-semibold text-paper disabled:opacity-60"
          >
            {pending ? "ব্লক হচ্ছে..." : "হ্যাঁ, ব্লক করুন"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setConfirming(false);
              setError(null);
            }}
            className="rounded-book border-2 border-ink/20 px-3 py-1.5 font-body text-xs font-semibold text-ink disabled:opacity-60"
          >
            বাতিল
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="font-body text-xs text-ink/70 underline underline-offset-2 hover:text-oxblood"
      >
        ব্লক করুন
      </button>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
