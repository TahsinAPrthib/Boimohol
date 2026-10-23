"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { importCovers, type CoverJob, type CoverJobResult } from "@/actions/covers";
import { bn } from "@/lib/bangla";

// After an import, the covers its rows named are fetched from their sources
// into Cloudinary, two per server call, so every call ends well inside the
// host's time limit however many covers there are. One failure never stops
// the rest; failures can be tried again, and covers not yet fetched (the
// page was closed, or the run was paused) are fetched by importing the same
// file again, since covers already in place are skipped.
const PER_CALL = 2;
const NO_ANSWER = "সার্ভারের উত্তর আসেনি; আবার চেষ্টা করুন।";

export function useCoverImport() {
  const router = useRouter();
  const [jobs, setJobs] = useState<CoverJob[]>([]);
  // One per job, by position: undefined until that job has been tried.
  const [results, setResults] = useState<(CoverJobResult | undefined)[]>([]);
  const [running, setRunning] = useState(false);
  const stopRef = useRef(false);

  async function run(all: CoverJob[], indexes: number[]) {
    if (indexes.length === 0) return;
    stopRef.current = false;
    setRunning(true);
    setResults((prev) => prev.map((r, i) => (indexes.includes(i) ? undefined : r)));
    for (let at = 0; at < indexes.length && !stopRef.current; at += PER_CALL) {
      const batch = indexes.slice(at, at + PER_CALL);
      let answers: CoverJobResult[];
      try {
        const res = await importCovers(batch.map((i) => all[i]));
        answers = res.ok ? res.results : batch.map((i) => ({ bookId: all[i].bookId, ok: false, message: res.message ?? NO_ANSWER }));
        if (!res.ok) stopRef.current = true;
      } catch {
        answers = batch.map((i) => ({ bookId: all[i].bookId, ok: false, message: NO_ANSWER }));
      }
      setResults((prev) => {
        const next = [...prev];
        batch.forEach((i, k) => (next[i] = answers[k] ?? { bookId: all[i].bookId, ok: false, message: NO_ANSWER }));
        return next;
      });
    }
    setRunning(false);
    router.refresh();
  }

  return {
    jobs,
    results,
    running,
    start(all: CoverJob[]) {
      setJobs(all);
      setResults(all.map(() => undefined));
      void run(
        all,
        all.map((_, i) => i)
      );
    },
    retryFailed() {
      void run(
        jobs,
        results.flatMap((r, i) => (r && !r.ok ? [i] : []))
      );
    },
    resume() {
      void run(
        jobs,
        results.flatMap((r, i) => (r ? [] : [i]))
      );
    },
    stop() {
      stopRef.current = true;
    },
  };
}

export default function CoverImportProgress({ cover }: { cover: ReturnType<typeof useCoverImport> }) {
  const { jobs, results, running } = cover;
  const total = jobs.length;
  const tried = results.filter(Boolean).length;
  const failed = results.flatMap((r, i) => (r && !r.ok ? [{ job: jobs[i], message: r.message }] : []));
  const succeeded = tried - failed.length;
  const left = total - tried;

  // Closing the page stops the run; ask first.
  useEffect(() => {
    if (!running) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [running]);

  if (total === 0) return null;
  const state = running ? "আনা হচ্ছে" : left > 0 ? "থেমে আছে" : "শেষ";
  return (
    <div className="flex flex-col gap-2 rounded-book border-2 border-ink/10 bg-paper p-3" data-cover-progress>
      <p className="font-body text-sm font-semibold text-ink" aria-live="polite">
        আসল প্রচ্ছদ {state}: {bn(tried)}/{bn(total)}
      </p>
      <div
        role="progressbar"
        aria-label="প্রচ্ছদ আনার অগ্রগতি"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={tried}
        className="h-2 overflow-hidden rounded-full bg-ink/10"
      >
        <div
          className="h-full rounded-full bg-cloth transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${(tried / total) * 100}%` }}
        />
      </div>
      <p className="font-body text-xs text-ink/60">
        সফল {bn(succeeded)}টি · ব্যর্থ {bn(failed.length)}টি
        {left > 0 && <> · বাকি {bn(left)}টি</>}
        {running && <> · শেষ না হওয়া পর্যন্ত পাতাটি খোলা রাখুন</>}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {running ? (
          <button
            type="button"
            onClick={cover.stop}
            className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink hover:border-oxblood hover:text-oxblood"
          >
            থামান
          </button>
        ) : (
          left > 0 && (
            <button
              type="button"
              onClick={cover.resume}
              className="h-9 rounded-book border-2 border-cloth bg-cloth px-3 font-body text-xs font-semibold text-paper"
            >
              বাকি {bn(left)}টি আনুন
            </button>
          )
        )}
        {!running && failed.length > 0 && (
          <button
            type="button"
            onClick={cover.retryFailed}
            className="h-9 rounded-book border-2 border-ink/20 px-3 font-body text-xs font-semibold text-ink hover:border-cloth hover:text-cloth"
          >
            ব্যর্থ {bn(failed.length)}টি আবার চেষ্টা করুন
          </button>
        )}
      </div>
      {failed.length > 0 && (
        <ul className="max-h-60 overflow-y-auto pr-2 font-body text-sm text-ink/80" data-cover-failures>
          {failed.map(({ job, message }) => (
            <li key={job.bookId + job.url} className="border-b border-ink/10 py-2">
              <span className="font-semibold text-ink">{job.title}</span>: <span className="text-oxblood">{message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
