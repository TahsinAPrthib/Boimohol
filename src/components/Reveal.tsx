"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Fades a section up the first time it scrolls into view, then leaves it alone.
//
// The server renders it fully visible, so nothing is hidden without
// JavaScript, before hydration, or from crawlers. Only on mount, and only for
// a section that is still below the fold, does it hide the section until it
// is reached. Anything already on screen is never hidden and re-shown, so
// this cannot delay the first paint or move anything. Reduced motion: no-op.
export default function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.classList.add("reveal-pending");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.replace("reveal-pending", "reveal-in");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
