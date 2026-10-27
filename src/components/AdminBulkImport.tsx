"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { importBookBatch, type BatchResult } from "@/actions/admin-books";
import type { CoverJob } from "@/actions/covers";
import { bn } from "@/lib/bangla";
import CoverImportProgress, { useCoverImport } from "@/components/CoverImportProgress";

// A file of tens of thousands of books (a whole catalog) is read here, in the
// browser, and sent to the server a batch at a time (importBookBatch), so no
// request comes near the host's time limit. Each batch is saved whole or not
// at all; after each one the place reached is kept in this browser, so after
// a failure or a closed tab the same file carries on from there. Sending a
// batch twice is harmless: its books are then duplicates.
const BATCH = 250;
const MAX_FILE_BYTES = 80 * 1024 * 1024;
const RETRIES = 2;
const INVALID_SHOWN = 200;
const NO_ANSWER = "সার্ভারের উত্তর আসেনি।";

type Totals = { rows: number; inserted: number; linked: number; updated: number; duplicates: number; invalid: number };
const ZERO: Totals = { rows: 0, inserted: 0, linked: 0, updated: 0, duplicates: 0, invalid: 0 };
type Status = "idle" | "running" | "paused" | "failed" | "done";
type Saved = { next: number; totals: Totals };

const storageKey = (fingerprint: string) => `bulk-import:${fingerprint}`;
function readSaved(fingerprint: string): Saved | null {
  try {
    const raw = localStorage.getItem(storageKey(fingerprint));
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}
function writeSaved(fingerprint: string, saved: Saved | null) {
  try {
    if (saved) localStorage.setItem(storageKey(fingerprint), JSON.stringify(saved));
    else localStorage.removeItem(storageKey(fingerprint));
  } catch {
    /* the import still works; it just can't be resumed after a reload */
  }
}
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function AdminBulkImport() {
  const router = useRouter();
  const rowsRef = useRef<unknown[]>([]);
  const stopRef = useRef(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [mode, setMode] = useState<"check" | "import">("import");
  const [status, setStatus] = useState<Status>("idle");
  const [done, setDone] = useState(0);
  const [totals, setTotals] = useState<Totals>(ZERO);
  const [invalid, setInvalid] = useState<BatchResult["invalid"]>([]);
  const [error, setError] = useState<string | null>(null);
  const cover = useCoverImport();
  const running = status === "running";

  // Closing the page stops the run (it can be resumed); ask first.
  useEffect(() => {
    if (!running) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [running]);

  async function onFile(file: File | undefined) {
    setError(null);
    setStatus("idle");
    setDone(0);
    setTotals(ZERO);
    setInvalid([]);
    rowsRef.current = [];
    setTotal(0);
    setFileName(file?.name ?? null);
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) return setError(`ফাইলটি অনেক বড়; ${bn(80)} মেগাবাইটের কম রাখুন, বা কয়েকটি ফাইলে ভাগ করুন।`);
    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      return setError("ফাইলটি সঠিক JSON নয়।");
    }
    const list = Array.isArray(parsed) ? parsed : null;
    if (!list || list.length === 0) return setError("ফাইলে বইয়ের একটি তালিকা (JSON array) থাকতে হবে।");
    rowsRef.current = list;
    setTotal(list.length);
    const print = `${file.name}|${file.size}|${file.lastModified}|${list.length}`;
    setFingerprint(print);
    setSaved(readSaved(print));
  }

  async function run(runMode: "check" | "import", from: number, start: Totals) {
    const rows = rowsRef.current;
    if (!fingerprint || rows.length === 0) return;
    stopRef.current = false;
    setMode(runMode);
    setStatus("running");
    setError(null);
    setDone(from);
    setTotals(start);
    if (from === 0) setInvalid([]);
    let sum = { ...start };
    const jobs: CoverJob[] = [];
    for (let i = from; i < rows.length; i += BATCH) {
      if (stopRef.current) {
        setStatus("paused");
        return;
      }
      const slice = rows.slice(i, i + BATCH);
      let result: BatchResult | null = null;
      for (let attempt = 0; attempt <= RETRIES; attempt++) {
        try {
          result = await importBookBatch(slice, i + 1, runMode === "check");
        } catch {
          result = null;
        }
        if (result?.ok) break;
        if (attempt < RETRIES) await pause(2000 * (attempt + 1));
      }
      if (!result?.ok) {
        setError(`সারি ${bn(i + 1)} থেকে ${bn(i + slice.length)}: ${result?.message ?? NO_ANSWER} এখান থেকে আবার চালানো যাবে।`);
        setStatus("failed");
        return;
      }
      sum = {
        rows: sum.rows + slice.length,
        inserted: sum.inserted + result.inserted,
        linked: sum.linked + result.linked,
        updated: sum.updated + result.updated,
        duplicates: sum.duplicates + result.duplicates,
        invalid: sum.invalid + result.invalid.length,
      };
      jobs.push(...result.coverJobs);
      const reasons = result.invalid;
      setInvalid((prev) => (prev.length >= INVALID_SHOWN ? prev : [...prev, ...reasons].slice(0, INVALID_SHOWN)));
      setTotals(sum);
      setDone(i + slice.length);
      if (runMode === "import") {
        const next = { next: i + slice.length, totals: sum };
        writeSaved(fingerprint, next);
        setSaved(next);
      }
    }
    setStatus("done");
    if (runMode === "import") {
      writeSaved(fingerprint, null);
      setSaved(null);
      router.refresh();
      if (jobs.length > 0) cover.start(jobs);
    }
  }

  const resumeFrom = status === "failed" || status === "paused" ? done : saved?.next ?? 0;
  const resumeTotals = status === "failed" || status === "paused" ? totals : saved?.totals ?? ZERO;
  const canResume = mode === "import" && resumeFrom > 0 && resumeFrom < total;
  const verb = mode === "check" ? "যোগ হবে" : "যোগ হয়েছে";
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4" data-bulk-import>
      <div>
        <label htmlFor="bulk-import-file" className="field-label">
          বড় JSON ফাইল
        </label>
        <input
          id="bulk-import-file"
          type="file"
          accept="application/json,.json"
          disabled={running}
          onChange={(e) => onFile(e.target.files?.[0])}
          className="field-input text-sm file:mr-3 file:rounded-book file:border-0 file:bg-cloth file:px-3 file:py-1.5 file:font-body file:text-sm file:font-semibold file:text-paper disabled:opacity-60"
        />
        <p className="mt-1 font-body text-xs text-ink/50">
          সর্বোচ্চ {bn(80)} মেগাবাইট। {bn(BATCH)}টি করে সারি পাঠানো হয়; পুরো সময় পাতাটি খোলা রাখুন।
        </p>
      </div>

      {error && <p className="field-error">{error}</p>}

      {total > 0 && (
        <>
          <p className="font-body text-sm text-ink/80">
            <span className="font-semibold text-ink">{fileName}</span>: মোট {bn(total)}টি সারি
            {saved && saved.next > 0 && status === "idle" && <> · আগের বার {bn(saved.next)}টি সারি পর্যন্ত আমদানি হয়েছিল</>}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {running ? (
              <button
                type="button"
                onClick={() => (stopRef.current = true)}
                className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink hover:border-oxblood hover:text-oxblood"
              >
                থামান
              </button>
            ) : (
              <>
                {canResume && (
                  <button type="button" onClick={() => run("import", resumeFrom, resumeTotals)} className="btn-primary text-sm">
                    সারি {bn(resumeFrom + 1)} থেকে আবার চালান
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => run("import", 0, ZERO)}
                  className={canResume ? "h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink hover:border-cloth hover:text-cloth" : "btn-primary text-sm"}
                >
                  {canResume ? "শুরু থেকে আমদানি" : "আমদানি শুরু করুন"}
                </button>
                <button
                  type="button"
                  onClick={() => run("check", 0, ZERO)}
                  className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink hover:border-cloth hover:text-cloth"
                >
                  শুধু যাচাই করুন
                </button>
              </>
            )}
          </div>
        </>
      )}

      {status !== "idle" && (
        <div className="flex flex-col gap-2 rounded-book border-2 border-ink/10 bg-paper p-3" data-bulk-progress>
          <p className="font-body text-sm font-semibold text-ink" aria-live="polite">
            {mode === "check" ? "যাচাই" : "আমদানি"}{" "}
            {status === "running" ? "চলছে" : status === "paused" ? "থামানো আছে" : status === "failed" ? "আটকে গেছে" : "শেষ"}: {bn(done)}/
            {bn(total)} সারি ({bn(percent)}%)
          </p>
          <div
            role="progressbar"
            aria-label="বড় ফাইল আমদানির অগ্রগতি"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={done}
            className="h-2 overflow-hidden rounded-full bg-ink/10"
          >
            <div className="h-full rounded-full bg-cloth transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${percent}%` }} />
          </div>
          <p className="font-body text-xs text-ink/70" data-bulk-totals>
            নতুন বই {verb} {bn(totals.inserted)}টি · আগের বইয়ে লিংক {bn(totals.linked)}টি · হালনাগাদ {bn(totals.updated)}টি · ডুপ্লিকেট{" "}
            {bn(totals.duplicates)}টি · ত্রুটিপূর্ণ {bn(totals.invalid)}টি
          </p>
          {invalid.length > 0 && (
            <details className="rounded-book border-2 border-ink/10 p-2">
              <summary className="font-body text-xs font-semibold text-ink">
                ত্রুটিপূর্ণ সারি{totals.invalid > invalid.length ? ` (প্রথম ${bn(invalid.length)}টি)` : ""}
              </summary>
              <ul className="mt-2 max-h-60 overflow-y-auto pr-2 font-body text-xs text-ink/80">
                {invalid.map((r) => (
                  <li key={r.row} className="border-b border-ink/10 py-1.5">
                    সারি {bn(r.row)}: <span className="font-semibold text-ink">{r.title}</span> —{" "}
                    <span className="text-oxblood">{r.reasons.join("; ")}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {cover.jobs.length > 0 && <CoverImportProgress cover={cover} />}
    </div>
  );
}
