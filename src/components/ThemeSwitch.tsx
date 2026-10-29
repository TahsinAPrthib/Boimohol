"use client";

import { useState } from "react";
import { applyTheme, nightShowing, type ThemeChoice } from "@/lib/theme";

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </svg>
  );
}

// The reader's switch: one button that names the other palette. Which label
// shows is decided by CSS (--when-day / --when-night in globals.css), so the
// server and the first client render agree whatever the device or cookie
// says, and the hidden label is out of the accessibility tree too.
export function ThemeToggle({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={() => applyTheme(nightShowing() ? "light" : "dark")} className={className}>
      <span className="items-center gap-1.5" style={{ display: "var(--when-day)" }}>
        <MoonIcon />
        রাতের রং
      </span>
      <span className="items-center gap-1.5" style={{ display: "var(--when-night)" }}>
        <SunIcon />
        দিনের রং
      </span>
    </button>
  );
}

const OPTIONS: { value: ThemeChoice; label: string; hint: string }[] = [
  { value: "system", label: "ডিভাইসের মতো", hint: "ফোন বা কম্পিউটারে ডার্ক মোড চালু থাকলে রাতের রং, নইলে দিনের রং।" },
  { value: "light", label: "সবসময় দিনের রং", hint: "কাগজের মতো হালকা পাতা, গাঢ় লেখা।" },
  { value: "dark", label: "সবসময় রাতের রং", hint: "অন্ধকারে চোখের আরামের জন্য গাঢ় পাতা, হালকা লেখা।" },
];

// Settings: the same choice, all three ways. The page passes the cookie it
// was sent, so the right option is checked from the first render.
export function ThemeChooser({ initial }: { initial: ThemeChoice }) {
  const [choice, setChoice] = useState(initial);
  return (
    <fieldset>
      <legend className="sr-only">পাতার রং</legend>
      <div className="flex flex-col gap-2">
        {OPTIONS.map((o) => (
          <label
            key={o.value}
            className={`flex cursor-pointer items-start gap-3 rounded-book border-2 px-3 py-2.5 focus-within:ring-2 focus-within:ring-turmeric ${
              choice === o.value ? "border-cloth" : "border-ink/10"
            }`}
          >
            <input
              type="radio"
              name="theme"
              value={o.value}
              checked={choice === o.value}
              onChange={() => {
                setChoice(o.value);
                applyTheme(o.value);
              }}
              className="mt-1.5 h-4 w-4 shrink-0 accent-cloth focus:outline-none"
            />
            <span>
              <span className="block font-body font-semibold text-ink">{o.label}</span>
              <span className="block font-body text-sm text-ink/70">{o.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
