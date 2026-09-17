import type { ReactNode } from "react";

// Shared chrome for the policy pages so the three stay visually consistent.
// Content lives in each page file, not here.

export function PolicyPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl text-ink">{title}</h1>
      {intro && <p className="mt-3 max-w-prose font-body text-ink/70">{intro}</p>}
      {updated && (
        <p className="mt-2 font-body text-xs text-ink/40">সর্বশেষ হালনাগাদ: {updated}</p>
      )}
      <div className="mt-10 flex flex-col gap-9">{children}</div>
    </div>
  );
}

export function PolicySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl text-ink">{title}</h2>
      <div className="flex max-w-prose flex-col gap-3 font-body leading-relaxed text-ink/80">
        {children}
      </div>
    </section>
  );
}

export function PolicyList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-ink/30">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

// Visible on the page on purpose: these are placeholders the site owner
// still has to fill in before launch.
export function TodoNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-book border-2 border-dashed border-oxblood/50 bg-oxblood/5 px-4 py-3 font-body text-sm text-oxblood">
      {children}
    </p>
  );
}
