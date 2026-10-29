"use client";

import Link from "next/link";
import { useEffect } from "react";

// An unexpected error while rendering a page: shown inside the site's layout
// in place of the page. The details stay in the server log; the reader gets
// a way to try again and the error's reference number, if there is one.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center" role="alert" data-error-page>
      <h1 className="font-display text-3xl text-ink">কিছু একটা গোলমাল হয়ে গেছে</h1>
      <p className="mx-auto mt-3 max-w-prose font-body text-ink/70">
        পাতাটি দেখাতে গিয়ে আমাদের দিকে একটা সমস্যা হয়েছে — আপনার কোনো ভুল নয়। একটু পরে আবার চেষ্টা করুন।
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          আবার চেষ্টা করুন
        </button>
        <Link href="/" className="btn-secondary">
          হোম পাতা
        </Link>
      </div>
      {error.digest && <p className="mt-8 font-body text-xs text-ink/70">সমস্যার নম্বর: {error.digest}</p>}
    </div>
  );
}
