"use client";

import { useEffect } from "react";
import "./globals.css";

// The last resort: an error in the site's own layout, so not even the
// navigation could be drawn. It replaces the whole page, <html> included,
// and is kept to plain markup with the site's colours.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="bn">
      <head>
        <title>সমস্যা হয়েছে · বই মহল</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-paper text-ink">
        <main className="mx-auto max-w-2xl px-4 py-16 text-center" role="alert" data-global-error>
          <p className="font-display text-2xl text-cloth">বই মহল</p>
          <h1 className="mt-6 font-display text-3xl text-ink">সাইটটি এই মুহূর্তে খোলা যাচ্ছে না</h1>
          <p className="mx-auto mt-3 max-w-prose font-body text-ink/70">
            আমাদের দিকে একটা সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={reset} className="btn-primary">
              আবার চেষ্টা করুন
            </button>
            {/* A full page load, not client navigation: the layout itself failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="btn-secondary">
              হোম পাতা
            </a>
          </div>
          {error.digest && <p className="mt-8 font-body text-xs text-ink/70">সমস্যার নম্বর: {error.digest}</p>}
        </main>
      </body>
    </html>
  );
}
