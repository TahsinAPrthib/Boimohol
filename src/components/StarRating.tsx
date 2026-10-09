"use client";
import { bn, bnFixed } from "@/lib/bangla";

import { useId, useState } from "react";

const STAR_PATH =
  "M12 2.5l2.9 6.02 6.6.87-4.86 4.63 1.2 6.6L12 17.6l-5.84 3.02 1.2-6.6L2.5 9.39l6.6-.87L12 2.5z";

const SIZE_MAP = { sm: 16, md: 22, lg: 28 } as const;

// Single component, two modes: pass `onChange` for an interactive input
// (whole-star clicks, hover preview); omit it for a read-only display that
// can render fractional fills (e.g. a 3.7 average).
export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: keyof typeof SIZE_MAP;
}) {
  const baseId = useId().replace(/:/g, "");
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  // After a pick, stars up to the chosen one pop in sequence. `picks` keys
  // the star glyphs (not the buttons, so focus stays put) to replay it.
  const [picks, setPicks] = useState(0);
  const [pickedUpTo, setPickedUpTo] = useState(0);
  const interactive = !readOnly && typeof onChange === "function";
  const displayValue = interactive && hoverValue !== null ? hoverValue : value;
  const px = SIZE_MAP[size];

  return (
    <div
      className="inline-flex items-center gap-0.5"
      onMouseLeave={() => interactive && setHoverValue(null)}
      aria-label={interactive ? "রেটিং নির্বাচন করুন" : `রেটিং ${bnFixed(value)} / ৫`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercent = Math.max(0, Math.min(1, displayValue - (star - 1))) * 100;
        const clipId = `${baseId}-star-${star}`;

        const popping = interactive && picks > 0 && star <= pickedUpTo;
        const starEl = (
          <span
            key={popping ? `${star}-${picks}` : star}
            className={`relative inline-block ${popping ? "motion-safe:animate-star-pop" : ""}`}
            style={{ width: px, height: px, animationDelay: popping ? `${(star - 1) * 45}ms` : undefined }}
          >
            <svg viewBox="0 0 24 24" width={px} height={px} className="absolute inset-0">
              <path d={STAR_PATH} fill="none" stroke="#2A2420" strokeOpacity="0.25" strokeWidth="1.5" />
            </svg>
            <svg viewBox="0 0 24 24" width={px} height={px} className="absolute inset-0">
              <defs>
                <clipPath id={clipId}>
                  <rect x="0" y="0" width={24 * (fillPercent / 100)} height="24" />
                </clipPath>
              </defs>
              <path d={STAR_PATH} fill="#C68A1F" clipPath={`url(#${clipId})`} />
            </svg>
          </span>
        );

        if (!interactive) {
          return <span key={star}>{starEl}</span>;
        }

        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverValue(star)}
            onFocus={() => setHoverValue(star)}
            onClick={() => {
              setPicks((n) => n + 1);
              setPickedUpTo(star);
              onChange?.(star);
            }}
            className="rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric"
            aria-label={`${bn(star)} তারা`}
          >
            {starEl}
          </button>
        );
      })}
    </div>
  );
}
