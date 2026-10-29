"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ShelfBook } from "@/lib/todays-book";

const ShelfTrack = dynamic(() => import("@/components/ShelfTrack"), { ssr: false });

// The books on a shelf are decoration. The server sends only their list; they
// are drawn once the page has finished loading (at once on a page reached
// from inside the site), so they never delay the first paint, the page's main
// image or hydration on a slow phone, and their covers' code loads only then.
export default function ShelfBooks({ books }: { books: ShelfBook[] }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const go = () => (timer = setTimeout(() => setReady(true), 0));
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.removeEventListener("load", go);
      clearTimeout(timer);
    };
  }, []);

  return ready && books.length > 0 ? <ShelfTrack books={books} /> : null;
}
