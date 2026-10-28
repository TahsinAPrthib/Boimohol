"use client";

import { useEffect, useRef } from "react";

// A row of filter chips. On phones (below lg) one line that scrolls
// sideways, running to the screen's edges so a chip is cut off there and a
// short fade marks that there's more; the open chip (aria-current) is
// scrolled into view. From lg up the chips wrap, as they always have.
// Chips inside carry "max-lg:flex max-lg:min-h-11 max-lg:shrink-0
// max-lg:items-center max-lg:whitespace-nowrap": one line, 44px to tap.
export default function ChipRow({
  as: Tag = "div",
  label,
  activeKey,
  className = "",
  children,
}: {
  as?: "div" | "nav";
  label?: string;
  // Changes when another chip opens, so the row scrolls to it again.
  activeKey: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const row = ref.current;
    const active = row?.querySelector<HTMLElement>("[aria-current]");
    if (!row || !active || row.scrollWidth <= row.clientWidth) return;
    // Only the row scrolls, at once (scrollIntoView would move the page too).
    row.scrollLeft = active.offsetLeft - (row.clientWidth - active.offsetWidth) / 2;
  }, [activeKey]);

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      aria-label={label}
      className={`relative -mx-4 flex items-center gap-2 overflow-x-auto px-4 py-1 [mask-image:linear-gradient(to_right,#000_calc(100%-1.5rem),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:py-0 lg:[mask-image:none] ${className}`}
    >
      {children}
    </Tag>
  );
}
