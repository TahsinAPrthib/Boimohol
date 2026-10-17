"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { parseStoredPosition, readStoredRaw } from "@/lib/wikisource/reader-prefs";
import { readerHref } from "@/lib/wikisource/titles";

type Position = { chapter: string; label: string; progress: number };

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

// The contents page's way in: "carry on where you stopped" when there is a
// place to go back to (from the server for a signed-in reader, from this
// browser otherwise), and "start from the beginning".
export default function ResumeReading({
  bookId,
  signedIn,
  saved,
  startHref,
  singlePage,
}: {
  bookId: string;
  signedIn: boolean;
  saved: Position | null;
  startHref: string | null;
  singlePage: boolean;
}) {
  // This browser's copy, for a reader who isn't signed in. Nothing on the
  // server render; the stored place appears once the page is running.
  const raw = useSyncExternalStore(
    subscribeToStorage,
    () => (signedIn ? null : readStoredRaw(bookId)),
    () => null
  );
  const stored = useMemo(() => parseStoredPosition(raw), [raw]);
  const position: Position | null = signedIn ? saved : stored;

  // On a one-page work the contents page is the text: there is only a
  // place to go back to once they have read some way down it.
  const resumable = position && (position.chapter !== "" || (singlePage && position.progress > 0.02));
  if (!resumable && !startHref) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3" data-resume>
      {resumable && (
        <Link href={`${readerHref(bookId, position.chapter)}?resume=1`} className="btn-primary">
          যেখানে থেমেছিলেন সেখান থেকে পড়ুন
          {position.label && <span className="font-normal opacity-80">— {position.label}</span>}
        </Link>
      )}
      {startHref && (
        <Link href={startHref} className={resumable ? "btn-secondary" : "btn-primary"}>
          {resumable ? "শুরু থেকে পড়ুন" : "পড়া শুরু করুন"}
        </Link>
      )}
    </div>
  );
}
