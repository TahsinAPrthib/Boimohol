"use client";

import { useState } from "react";
import { READER_SIZE_COOKIE, READER_SIZES } from "@/lib/wikisource/reader-prefs";

// The text-size control and the text it sizes. The choice is kept in a
// cookie, so the next page is rendered at that size from the start.
export default function ReaderFrame({ initialStep, children }: { initialStep: number; children: React.ReactNode }) {
  const [step, setStep] = useState(initialStep);
  const last = READER_SIZES.length - 1;

  function change(next: number) {
    const value = Math.min(last, Math.max(0, next));
    setStep(value);
    document.cookie = `${READER_SIZE_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
  }

  const button =
    "inline-flex h-11 min-w-11 items-center justify-center rounded-book border-2 border-ink/20 px-3 font-display text-ink transition-colors hover:border-ink/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric disabled:opacity-40";

  return (
    <div>
      <div className="flex items-center justify-end gap-2" role="group" aria-label="লেখার আকার">
        <span className="mr-1 font-body text-sm text-ink/60">লেখার আকার</span>
        <button type="button" className={button} onClick={() => change(step - 1)} disabled={step === 0} aria-label="লেখা ছোট করুন">
          <span className="text-sm" aria-hidden="true">
            অ−
          </span>
        </button>
        <button type="button" className={button} onClick={() => change(step + 1)} disabled={step === last} aria-label="লেখা বড় করুন">
          <span className="text-lg" aria-hidden="true">
            অ+
          </span>
        </button>
      </div>
      <div className="mt-4" style={{ fontSize: `${READER_SIZES[step]}px` }} data-reader-size={step}>
        {children}
      </div>
    </div>
  );
}
