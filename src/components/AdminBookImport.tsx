"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importBooks, previewImport, type ImportPreview } from "@/actions/admin-books";
import { bn } from "@/lib/bangla";
import { SOURCE_LABEL } from "@/lib/book-sources";

const MAX_FILE_BYTES = 1_000_000;

// Pick a JSON file -> the server checks every row and shows what would
// happen -> "import" sends the same file again; the server re-checks it from
// scratch and saves only the rows that are still valid.
export default function AdminBookImport({ categoryNames }: { categoryNames: Record<string, string> }) {
  const router = useRouter();
  const [fileText, setFileText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Separate, so the import button says "adding" only while adding -- not
  // while a preview is still settling.
  const [previewing, startPreview] = useTransition();
  const [importing, startImport] = useTransition();
  const pending = previewing || importing;

  async function onFile(file: File | undefined) {
    setPreview(null);
    setResult(null);
    setError(null);
    setFileText(null);
    setFileName(file?.name ?? null);
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setError("ফাইলটি অনেক বড়; ১ মেগাবাইটের কম রাখুন।");
      return;
    }
    const text = await file.text();
    setFileText(text);
    startPreview(async () => {
      setPreview(await previewImport(text));
    });
  }

  function runImport() {
    if (!fileText) return;
    setError(null);
    startImport(async () => {
      const done = await importBooks(fileText);
      setResult(done);
      setPreview(null);
      if (done.ok) router.refresh();
    });
  }

  const shown = result ?? preview;
  const linkCount = shown?.valid.reduce((n, r) => n + r.sources.length, 0) ?? 0;
  const linkedCount = shown?.linked.length ?? 0;
  const actionable = (shown?.valid.length ?? 0) + linkedCount;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="import-file" className="field-label">
          বইয়ের তালিকার JSON ফাইল
        </label>
        <input
          id="import-file"
          type="file"
          accept="application/json,.json"
          disabled={pending}
          onChange={(e) => onFile(e.target.files?.[0])}
          className="field-input text-sm file:mr-3 file:rounded-book file:border-0 file:bg-cloth file:px-3 file:py-1.5 file:font-body file:text-sm file:font-semibold file:text-paper disabled:opacity-60"
        />
        <p className="mt-1 font-body text-xs text-ink/50">
          একটি ফাইলে সর্বোচ্চ ৫০০টি বই। কিছু সংরক্ষণের আগে পুরো ফাইলটি যাচাই করে দেখানো হবে।
        </p>
      </div>

      {previewing && !shown && <p className="font-body text-sm text-ink/60">যাচাই করা হচ্ছে…</p>}
      {error && <p className="field-error">{error}</p>}

      {shown && !shown.ok && shown.total === 0 && (
        <p className="rounded-book border-2 border-oxblood bg-oxblood/10 px-3 py-2 font-body text-sm text-oxblood">{shown.message}</p>
      )}

      {shown && shown.total > 0 && (
        <div className="flex flex-col gap-4" data-import-summary>
          {result ? (
            <p className={`rounded-book border-2 px-3 py-2 font-body text-sm ${result.ok ? "border-sage bg-sage/10 text-sage" : "border-oxblood bg-oxblood/10 text-oxblood"}`}>
              {result.message}
            </p>
          ) : (
            <p className="font-body text-sm text-ink/80">
              <span className="font-semibold text-ink">{fileName}</span>: মোট {bn(shown.total)}টি সারি ·{" "}
              <span className="font-semibold text-sage">যোগ হবে {bn(shown.valid.length)}টি</span> · ডুপ্লিকেট বাদ যাবে{" "}
              {bn(shown.duplicates.length)}টি · ত্রুটিপূর্ণ {bn(shown.invalid.length)}টি
              {linkCount > 0 && <> · নতুন বইয়ে বাইরের সাইটে বিনামূল্যে পড়ার লিংক {bn(linkCount)}টি</>}
              {linkedCount > 0 && <> · ক্যাটালগের আগের বইয়ে লিংক যোগ হবে {bn(linkedCount)}টিতে</>}
            </p>
          )}

          {!result && (
            <button
              type="button"
              onClick={runImport}
              disabled={pending || actionable === 0}
              className="btn-primary self-start disabled:opacity-50"
            >
              {importing
                ? "যোগ করা হচ্ছে..."
                : linkedCount > 0
                  ? `${bn(shown.valid.length)}টি বই যোগ করুন, ${bn(linkedCount)}টি আগের বইয়ে লিংক দিন`
                  : `${bn(shown.valid.length)}টি বই যোগ করুন`}
            </button>
          )}

          {shown.invalid.length > 0 && (
            <ReportList title={`ত্রুটিপূর্ণ সারি (${bn(shown.invalid.length)}টি) — যোগ হবে না`} open>
              {shown.invalid.map((r) => (
                <li key={r.row} className="border-b border-ink/10 py-2">
                  <span className="font-semibold text-ink">সারি {bn(r.row)}: {r.title}</span>
                  <ul className="mt-1 list-disc pl-5 text-oxblood">
                    {r.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ReportList>
          )}

          {linkedCount > 0 && (
            <ReportList title={`ক্যাটালগের আগের বইয়ে লিংক ${result ? "যোগ হয়েছে" : "যোগ হবে"} (${bn(linkedCount)}টি) — বই নতুন করে যোগ হবে না`}>
              {shown.linked.map((r) => (
                <li key={r.row} className="flex flex-wrap justify-between gap-x-3 border-b border-ink/10 py-2" data-linked-row>
                  <span>
                    সারি {bn(r.row)}: <span className="font-semibold text-ink">{r.title}</span> — {r.author}
                  </span>
                  <span className="text-ink/60">লিংক যোগ: {r.sources.map((k) => SOURCE_LABEL[k]).join(", ")}</span>
                </li>
              ))}
            </ReportList>
          )}

          {shown.duplicates.length > 0 && (
            <ReportList title={`ডুপ্লিকেট (${bn(shown.duplicates.length)}টি) — বাদ যাবে`}>
              {shown.duplicates.map((r) => (
                <li key={r.row} className="border-b border-ink/10 py-2">
                  সারি {bn(r.row)}: <span className="font-semibold text-ink">{r.title}</span> — {r.author} ({r.reason})
                </li>
              ))}
            </ReportList>
          )}

          {shown.valid.length > 0 && (
            <ReportList title={`${result ? "যোগ হয়েছে" : "যোগ হবে"} (${bn(shown.valid.length)}টি)`}>
              {shown.valid.map((r) => (
                <li key={r.row} className="flex flex-wrap justify-between gap-x-3 border-b border-ink/10 py-2">
                  <span>
                    সারি {bn(r.row)}: <span className="font-semibold text-ink">{r.titleBangla || r.title}</span> — {r.author}
                  </span>
                  <span className="text-ink/60">
                    {categoryNames[r.category] ?? r.category}
                    {r.isPublicDomain ? " · পাবলিক ডোমেইন" : ""}
                    {r.sources.map((k) => ` · ${SOURCE_LABEL[k]}`).join("")}
                  </span>
                </li>
              ))}
            </ReportList>
          )}
        </div>
      )}
    </div>
  );
}

function ReportList({ title, open = false, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="rounded-book border-2 border-ink/10 bg-paper p-3">
      <summary className="font-body text-sm font-semibold text-ink">{title}</summary>
      <ul className="mt-2 max-h-80 overflow-y-auto pr-2 font-body text-sm text-ink/80">{children}</ul>
    </details>
  );
}
