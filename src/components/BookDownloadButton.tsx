"use client";

import { recordDownload } from "@/actions/library";
import { formatFileSize, pdfUrl } from "@/lib/cloudinary-url";

export default function BookDownloadButton({
  fileId,
  publicId,
  fileSizeBytes,
}: {
  fileId: string;
  publicId: string;
  fileSizeBytes: number;
}) {
  // A real anchor, so the browser opens or downloads the PDF itself. The count
  // is fired without awaiting: a slow or failed write must not delay -- or
  // block -- the download the reader asked for.
  function count() {
    void recordDownload(fileId);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={pdfUrl(publicId)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={count}
        className="btn-primary inline-flex items-center gap-2"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M8 1.5v8" />
          <path d="M4.5 6.5 8 10l3.5-3.5" />
          <path d="M2 11.5v1.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-1.5" />
        </svg>
        বিনামূল্যে পড়ুন
      </a>
      <span className="font-body text-sm text-ink/60">
        পিডিএফ · {formatFileSize(fileSizeBytes)}
      </span>
    </div>
  );
}
