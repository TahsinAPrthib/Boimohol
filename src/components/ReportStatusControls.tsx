"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateReportStatus } from "@/actions/admin";

type Status = "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED";

const STATUSES: { value: Status; label: string }[] = [
  { value: "OPEN", label: "খোলা" },
  { value: "REVIEWING", label: "পর্যালোচনায়" },
  { value: "RESOLVED", label: "নিষ্পত্তি" },
  { value: "DISMISSED", label: "বাতিল" },
];

export default function ReportStatusControls({
  reportId,
  currentStatus,
  currentNote,
}: {
  reportId: string;
  currentStatus: Status;
  currentNote?: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(currentStatus);
  const [note, setNote] = useState(currentNote ?? "");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setResult(null);
    startTransition(async () => {
      // Sent verbatim (empty string included): the field is pre-filled with
      // the existing note, so an empty box means the admin cleared it on
      // purpose rather than "no note supplied".
      const response = await updateReportStatus(reportId, status, note.trim());
      setResult({ ok: response.success, message: response.message ?? "" });
      if (response.success) router.refresh();
    });
  }

  return (
    <div className="mt-3 border-t-2 border-ink/10 pt-3">
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="field-label" htmlFor={`status-${reportId}`}>
            অবস্থা
          </label>
          <select
            id={`status-${reportId}`}
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="field-input text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[200px] flex-1">
          <label className="field-label" htmlFor={`note-${reportId}`}>
            অ্যাডমিন নোট (ঐচ্ছিক)
          </label>
          <input
            id={`note-${reportId}`}
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={2000}
            className="field-input text-sm"
          />
          {currentNote && (
            <p className="mt-1 font-body text-xs text-ink/70">
              ঘরটি খালি রেখে সংরক্ষণ করলে নোটটি মুছে যাবে।
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
        >
          {pending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}
        </button>
      </div>

      {result && (
        <p className={`mt-2 font-body text-xs ${result.ok ? "text-sage" : "text-oxblood"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
