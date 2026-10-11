"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// A two-step admin button: the first click asks, the second does it. The
// action is a server action already bound to its target (and report), and
// decides everything itself -- including refusing, with a Bangla reason
// that is shown here.
export default function ConfirmAction({
  action,
  label,
  question,
  confirmLabel,
  pendingLabel,
  redirectTo,
  tone = "danger",
}: {
  action: () => Promise<{ success: boolean; message?: string }>;
  label: string;
  question: string;
  confirmLabel: string;
  pendingLabel: string;
  // Where to go after success, when the current page will no longer exist.
  redirectTo?: string;
  tone?: "danger" | "neutral";
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function confirm() {
    setResult(null);
    startTransition(async () => {
      const response = await action();
      setConfirming(false);
      setResult({ ok: response.success, message: response.message ?? "" });
      if (!response.success) return;
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  }

  const danger = tone === "danger";

  return (
    <div className="flex flex-col gap-1">
      {confirming ? (
        <div role="group" aria-label={question} className="flex flex-wrap items-center gap-2">
          <span className="max-w-prose font-body text-xs text-ink/70">{question}</span>
          <button
            type="button"
            disabled={pending}
            onClick={confirm}
            className={`h-9 rounded-book px-3 font-body text-xs font-semibold text-paper disabled:opacity-60 ${
              danger ? "bg-oxblood" : "bg-cloth"
            }`}
          >
            {pending ? pendingLabel : confirmLabel}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirming(false)}
            className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink disabled:opacity-60"
          >
            না
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setResult(null);
            setConfirming(true);
          }}
          className={`h-9 self-start rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink ${
            danger ? "hover:border-oxblood hover:text-oxblood" : "hover:border-cloth hover:text-cloth"
          }`}
        >
          {label}
        </button>
      )}
      {result?.message && (
        <p role="status" className={`max-w-prose font-body text-xs ${result.ok ? "text-sage" : "text-oxblood"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
