"use client";
import { bn } from "@/lib/bangla";

import { useState } from "react";
import { cloudinaryUrl } from "@/lib/cloudinary-url";

export default function ListingPhotoGallery({
  photos,
  title,
}: {
  photos: { id: string; publicId: string }[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (photos.length === 0) return null;

  const active = photos[Math.min(activeIndex, photos.length - 1)];

  return (
    <div>
      <div className="overflow-hidden rounded-book border-2 border-ink/10 bg-paper-dark shadow-shelf">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cloudinaryUrl(active.publicId, { width: 800 })}
          alt={`${title} — ছবি ${bn(activeIndex + 1)}`}
          className="w-full object-contain"
        />
      </div>

      {photos.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {photos.map((photo, i) => {
            const isActive = i === activeIndex;
            return (
              <li key={photo.id}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`ছবি ${bn(i + 1)} দেখুন`}
                  aria-pressed={isActive}
                  className={`overflow-hidden rounded-book border-2 transition-colors ${
                    isActive ? "border-cloth" : "border-ink/15 hover:border-ink/40"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cloudinaryUrl(photo.publicId, { width: 160, square: true })}
                    alt=""
                    className="h-16 w-16 object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
