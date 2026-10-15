"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MAX_QUERY_LENGTH } from "@/lib/search";

const DEBOUNCE_MS = 300;

export function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className={className}>
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M12.5 12.5 17 17" />
    </svg>
  );
}

// A search box whose state lives in the URL (?q=). Typing updates the
// results after a short pause; Enter updates them at once. Other query
// parameters (a category filter, say) are kept.
//
// `path` sends the search somewhere else (the navbar box goes to /search).
// There, `minLengthToLeave` keeps a single typed letter from whisking the
// reader off the page they're on; Enter always goes.
export default function SearchBox({
  label,
  placeholder,
  path,
  autoFocus = false,
  minLengthToLeave = 0,
  size = "md",
  className = "",
}: {
  label: string;
  placeholder: string;
  path?: string;
  autoFocus?: boolean;
  minLengthToLeave?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const target = path ?? pathname;
  const onTarget = pathname === target;
  const urlQuery = onTarget ? searchParams.get("q") ?? "" : "";

  const [value, setValue] = useState(urlQuery);
  const [pending, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = useId();

  // Back/forward or a link changed ?q=. Follow it -- but never while the
  // reader is typing, when the URL may still be catching up with them.
  useEffect(() => {
    if (document.activeElement !== input.current) setValue(urlQuery);
  }, [urlQuery]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function go(raw: string, leaving: boolean) {
    clearTimeout(timer.current);
    const q = raw.trim().slice(0, MAX_QUERY_LENGTH);
    if (onTarget && q === urlQuery.trim()) return;
    if (!onTarget && !leaving) return;
    const params = new URLSearchParams(onTarget ? searchParams.toString() : "");
    if (q) params.set("q", q);
    else params.delete("q");
    // A new query starts at its first page of results.
    params.delete("page");
    const qs = params.toString();
    const url = qs ? `${target}?${qs}` : target;
    startTransition(() => {
      // Refining a search replaces the entry, so Back leaves the search
      // rather than stepping through every keystroke.
      if (onTarget) router.replace(url, { scroll: false });
      else router.push(url);
    });
  }

  function onChange(next: string) {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => go(next, next.trim().length >= minLengthToLeave && next.trim().length > 0), DEBOUNCE_MS);
  }

  const small = size === "sm";
  return (
    <form
      role="search"
      className={`relative ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        go(value, true);
      }}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span className={`pointer-events-none absolute inset-y-0 left-0 flex items-center text-ink/45 ${small ? "pl-2.5" : "pl-3"}`}>
        <SearchIcon className={small ? "h-4 w-4" : "h-5 w-5"} />
      </span>
      <input
        ref={input}
        id={id}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        maxLength={MAX_QUERY_LENGTH}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.preventDefault();
            setValue("");
            go("", false);
          }
        }}
        placeholder={placeholder}
        className={`w-full rounded-book border-2 border-ink/15 bg-paper font-body text-ink placeholder:text-ink/40 focus:border-cloth focus:outline-none [&::-webkit-search-cancel-button]:appearance-none ${
          small ? "h-9 pl-8 pr-8 text-sm" : "h-11 pl-10 pr-10"
        }`}
      />
      <span className={`absolute inset-y-0 right-0 flex items-center ${small ? "pr-1.5" : "pr-2"}`}>
        {pending ? (
          <span role="status" className="flex h-7 w-7 items-center justify-center">
            <span className="sr-only">খোঁজা হচ্ছে…</span>
            <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full border-2 border-ink/20 border-t-cloth motion-safe:animate-spin" />
          </span>
        ) : value ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              go("", false);
              input.current?.focus();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-book text-ink/50 hover:bg-ink/5 hover:text-ink"
            aria-label="খোঁজা মুছুন"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="h-4 w-4">
              <path d="M5 5l10 10M15 5 5 15" />
            </svg>
          </button>
        ) : null}
      </span>
    </form>
  );
}
