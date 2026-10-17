"use client";

import { useEffect } from "react";
import { saveReadingPosition } from "@/actions/reader";
import { readStoredPosition, writeStoredPosition } from "@/lib/wikisource/reader-prefs";

const FIRST_SAVE_MS = 4000; // a glance at a page isn't reading it
const SERVER_EVERY_MS = 20000;

// Keeps the reader's place: on the server for a signed-in reader (which
// also counts toward their reading streak), in this browser otherwise.
// With ?resume=1 it first scrolls back to where they stopped on this page.
export default function ReaderProgress({
  bookId,
  chapter,
  label,
  signedIn,
  resume,
  savedProgress,
}: {
  bookId: string;
  chapter: string;
  label: string;
  signedIn: boolean;
  resume: boolean;
  savedProgress: number | null; // the server's, for a signed-in reader on this page
}) {
  useEffect(() => {
    const fraction = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    if (resume) {
      const stored = signedIn ? null : readStoredPosition(bookId);
      const target = signedIn ? savedProgress : stored?.chapter === chapter ? stored.progress : null;
      if (target && target > 0.01) {
        requestAnimationFrame(() => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: target * max });
        });
      }
    }

    let lastSent = -1;
    let lastSentAt = 0;
    const sendToServer = () => {
      const p = Math.round(fraction() * 1000) / 1000;
      if (lastSent >= 0 && Math.abs(p - lastSent) < 0.02) return;
      lastSent = p;
      lastSentAt = Date.now();
      saveReadingPosition(bookId, chapter, p).catch(() => {});
    };
    const keepLocally = () => writeStoredPosition(bookId, { chapter, label, progress: fraction(), at: Date.now() });
    const save = signedIn ? sendToServer : keepLocally;

    const first = window.setTimeout(save, FIRST_SAVE_MS);
    let pending: number | undefined;
    const onScroll = () => {
      if (pending !== undefined) return;
      pending = window.setTimeout(() => {
        pending = undefined;
        if (!signedIn) keepLocally();
        else if (Date.now() - lastSentAt >= SERVER_EVERY_MS) sendToServer();
      }, 1000);
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") save();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(pending);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [bookId, chapter, label, signedIn, resume, savedProgress]);

  return null;
}
