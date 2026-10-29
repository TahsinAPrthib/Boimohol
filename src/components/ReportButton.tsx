"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitReport } from "@/actions/moderation";

type TargetType = "LISTING" | "MESSAGE" | "USER";

const REASONS: { value: "SPAM" | "HARASSMENT" | "SCAM" | "INAPPROPRIATE" | "COPYRIGHT" | "OTHER"; label: string }[] = [
  { value: "SPAM", label: "স্প্যাম" },
  { value: "HARASSMENT", label: "হয়রানি" },
  { value: "SCAM", label: "প্রতারণা" },
  { value: "INAPPROPRIATE", label: "অনুপযুক্ত কনটেন্ট" },
  { value: "COPYRIGHT", label: "কপিরাইট লঙ্ঘন" },
  { value: "OTHER", label: "অন্যান্য" },
];

export default function ReportButton({
  targetType,
  targetId,
  label = "রিপোর্ট করুন",
  className = "",
  variant = "link",
}: {
  targetType: TargetType;
  targetId: string;
  label?: string;
  className?: string;
  // "icon" is for dense contexts like message bubbles: a small always-visible
  // control with a large invisible tap target, so it works without a pointer.
  variant?: "link" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REASONS)[number]["value"]>("SPAM");
  const [details, setDetails] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    setResult(null);
    startTransition(async () => {
      const response = await submitReport(targetType, targetId, reason, details.trim() || undefined);
      setResult({ ok: response.success, message: response.message ?? "" });
      if (response.success) {
        setOpen(false);
        setDetails("");
      }
    });
  }

  if (result?.ok) {
    return <p className={`font-body text-xs text-sage ${className}`}>{result.message}</p>;
  }

  if (!open) {
    return (
      <div className={className}>
        {variant === "icon" ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={label}
            title={label}
            // 36px tap target around a 14px glyph: reachable by touch while
            // staying visually quiet in the thread.
            className="flex h-9 w-9 items-center justify-center rounded-book text-ink/70 transition-colors hover:bg-ink/5 hover:text-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turmeric active:bg-ink/10"
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="font-body text-xs text-ink/70 underline underline-offset-2 hover:text-oxblood"
          >
            {label}
          </button>
        )}
        {result && !result.ok && <p className="mt-1 font-body text-xs text-oxblood">{result.message}</p>}
      </div>
    );
  }

  return (
    // w-full so that in a flex-wrap row (message bubbles) the open form drops
    // to its own line instead of being squeezed beside the bubble.
    <div className={`w-full rounded-book border-2 border-ink/15 bg-paper p-3 ${className}`}>
      <p className="mb-1 font-body text-sm font-semibold text-ink">কী কারণে রিপোর্ট করছেন?</p>
      <p className="mb-2 font-body text-xs text-ink/70">
        কী কী রিপোর্ট করা যায় দেখুন{" "}
        <Link href="/guidelines" className="font-semibold text-cloth hover:underline">
          নীতিমালায়
        </Link>
        ।
      </p>

      <select
        value={reason}
        onChange={(e) => setReason(e.target.value as (typeof REASONS)[number]["value"])}
        className="field-input mb-2 text-sm"
        aria-label="রিপোর্টের কারণ"
      >
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="বিস্তারিত (ঐচ্ছিক)"
        className="field-input mb-2 text-sm"
        aria-label="বিস্তারিত"
      />

      {result && !result.ok && <p className="mb-2 font-body text-xs text-oxblood">{result.message}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending}
          className="rounded-book bg-oxblood px-3 py-1.5 font-body text-xs font-semibold text-paper disabled:opacity-60"
        >
          {pending ? "পাঠানো হচ্ছে..." : "রিপোর্ট পাঠান"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setResult(null);
          }}
          disabled={pending}
          className="rounded-book border-2 border-ink/20 px-3 py-1.5 font-body text-xs font-semibold text-ink disabled:opacity-60"
        >
          বাতিল
        </button>
      </div>
    </div>
  );
}
