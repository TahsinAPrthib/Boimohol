"use client";

import { useRef, useState } from "react";
import { getUploadSignature } from "@/actions/photos";

const MAX_PHOTOS = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

// Interpolated counts need Bangla digits, otherwise they sit next to the
// hand-written Bangla numerals as "সর্বোচ্চ 5টি ... ৫ মেগাবাইট".
const bn = (n: number) => n.toLocaleString("bn-BD");

export type PendingPhoto = {
  publicId: string;
  previewUrl: string;
};

// Client-side checks here are UX only — they give an instant Bangla error
// instead of a failed round-trip. The real gate is the signed upload params
// (format) plus server-side verification at attach time (format + size).
function clientReject(file: File): string | null {
  if (!ALLOWED_MIME.includes(file.type)) {
    return `${file.name}: শুধু JPG, PNG বা WEBP ছবি দেওয়া যাবে।`;
  }
  if (file.size > MAX_BYTES) {
    return `${file.name}: ছবিটি ৫ মেগাবাইটের বেশি বড়।`;
  }
  return null;
}

export default function PhotoUploader({
  photos,
  onChange,
  alreadyAttached = 0,
}: {
  photos: PendingPhoto[];
  onChange: (photos: PendingPhoto[]) => void;
  // Photos already saved on the listing (edit mode), which count toward the cap.
  alreadyAttached?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const used = alreadyAttached + photos.length;
  const remaining = Math.max(0, MAX_PHOTOS - used);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setErrors([]);

    const files = Array.from(fileList);
    const problems: string[] = [];
    const accepted: File[] = [];

    for (const file of files) {
      const problem = clientReject(file);
      if (problem) problems.push(problem);
      else accepted.push(file);
    }

    let toUpload = accepted;
    if (accepted.length > remaining) {
      problems.push(
        remaining === 0
          ? `সর্বোচ্চ ${bn(MAX_PHOTOS)}টি ছবি দেওয়া যাবে — আর জায়গা নেই।`
          : `সর্বোচ্চ ${bn(MAX_PHOTOS)}টি ছবি দেওয়া যাবে — প্রথম ${bn(remaining)}টি নেওয়া হয়েছে।`
      );
      toUpload = accepted.slice(0, remaining);
    }

    if (problems.length > 0) setErrors(problems);
    if (toUpload.length === 0) {
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    setProgress({ done: 0, total: toUpload.length });

    try {
      const sig = await getUploadSignature();
      if (!sig.success || !sig.signature) {
        setErrors((e) => [...e, sig.message ?? "আপলোড শুরু করা যায়নি।"]);
        return;
      }

      const uploaded: PendingPhoto[] = [];
      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];
        const form = new FormData();
        form.append("file", file);
        form.append("api_key", sig.apiKey!);
        form.append("timestamp", String(sig.timestamp));
        form.append("signature", sig.signature);
        form.append("folder", sig.folder!);
        form.append("allowed_formats", sig.allowedFormats!);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
          { method: "POST", body: form }
        );
        const json = await res.json();

        if (!res.ok || !json.public_id) {
          setErrors((e) => [...e, `${file.name}: আপলোড করা যায়নি।`]);
        } else {
          uploaded.push({ publicId: json.public_id, previewUrl: json.secure_url });
        }
        setProgress({ done: i + 1, total: toUpload.length });
      }

      if (uploaded.length > 0) onChange([...photos, ...uploaded]);
    } catch {
      setErrors((e) => [...e, "আপলোডের সময় সমস্যা হয়েছে। আবার চেষ্টা করুন।"]);
    } finally {
      setUploading(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(publicId: string) {
    onChange(photos.filter((p) => p.publicId !== publicId));
  }

  return (
    <div>
      <label className="field-label" htmlFor="photo-input">
        ছবি (ঐচ্ছিক)
      </label>
      <p className="mb-2 font-body text-xs text-ink/50">
        বইটির নিজের তোলা ছবি দিন — সর্বোচ্চ {bn(MAX_PHOTOS)}টি, প্রতিটি ৫ মেগাবাইটের কম। JPG, PNG বা
        WEBP।
      </p>

      <input
        ref={inputRef}
        id="photo-input"
        type="file"
        accept="image/*"
        multiple
        disabled={uploading || remaining === 0}
        onChange={(e) => handleFiles(e.target.files)}
        className="field-input text-sm file:mr-3 file:rounded-book file:border-0 file:bg-cloth file:px-3 file:py-1.5 file:font-body file:text-sm file:font-semibold file:text-paper disabled:opacity-60"
      />

      <p className="mt-1 font-body text-xs text-ink/50">
        {bn(used)} / {bn(MAX_PHOTOS)} টি ছবি ব্যবহার করা হয়েছে।
      </p>

      {uploading && progress && (
        <div className="mt-3">
          <p className="font-body text-sm text-ink/70">
            আপলোড হচ্ছে... ({bn(progress.done)} / {bn(progress.total)})
          </p>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-book bg-paper-dark">
            <div
              className="h-full bg-cloth transition-all"
              style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {errors.map((err, i) => (
            <li key={i} className="font-body text-xs text-oxblood">
              {err}
            </li>
          ))}
        </ul>
      )}

      {photos.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-3">
          {photos.map((photo) => (
            <li key={photo.publicId} className="w-24">
              <div className="overflow-hidden rounded-book border-2 border-ink/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt="আপলোড করা ছবি"
                  className="aspect-square w-full object-cover"
                />
              </div>
              {/* Always visible, full-width, 36px tall: reachable by touch,
                  no hover required. */}
              <button
                type="button"
                onClick={() => remove(photo.publicId)}
                className="mt-1 h-9 w-full rounded-book border-2 border-ink/20 font-body text-xs font-semibold text-ink hover:border-oxblood hover:text-oxblood"
              >
                সরান
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
