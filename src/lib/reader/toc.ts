import type { TocEntry } from "@/lib/wikisource/reader";

// The reader's contents (ReaderToc in src/components/reader/ReaderParts.tsx)
// as rows, so its grouping is testable.

// "প্রথম খণ্ড — এক" under the heading "প্রথম খণ্ড" reads as "এক"; an entry
// named just like its heading is that part's opening.
export const OPENING = "সূচনা";
export function shortLabel(label: string, group: string | null): string {
  if (!group || !label.startsWith(group)) return label;
  if (label === group) return OPENING;
  const rest = label.slice(group.length).replace(/^[\s—–\-:,।]+/, "");
  return rest || label;
}

// One of the parts a long Gutenberg section is cut into by size
// (src/lib/gutenberg/parse.ts): "INTRODUCTION — অংশ ৩", or "অংশ ৩" in a book
// without headings.
const SIZE_PART = /^(?:(.+) — )?অংশ ([০-৯]+)$/;

export type TocRow =
  | { kind: "group"; key: string; name: string }
  | { kind: "entry"; entry: TocEntry; label: string; depth: number }
  | { kind: "parts"; key: string; title: string | null; parts: { entry: TocEntry; number: string }[] };

// A volume or part that has no page of its own ("প্রথম খণ্ড") appears as a
// heading over its chapters; one that has a page is an entry like any other,
// its chapters indented below it. A Gutenberg book's parts come as each
// entry's `group` instead, and a section it cut into parts by size shows its
// title once, then the parts' numbers in one row.
export function tocRows(entries: TocEntry[]): TocRow[] {
  const paths = new Set(entries.map((e) => e.path));
  const rows: TocRow[] = [];
  let lastGroup: string | null = null;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const segments = e.path.split("/");
    const parent = segments.slice(0, -1).join("/");
    const group = e.group !== undefined ? e.group : parent && !paths.has(parent) ? parent : null;
    const groupName = e.group !== undefined ? e.group : (group?.split("/").pop() ?? null);
    if (group && group !== lastGroup) rows.push({ kind: "group", key: `g:${group}:${e.path}`, name: groupName ?? group });
    lastGroup = group;

    const first = e.group !== undefined ? e.label.match(SIZE_PART) : null;
    if (first) {
      const title = first[1] ?? null;
      const parts: { entry: TocEntry; number: string }[] = [];
      for (let j = i; j < entries.length; j++) {
        const m = entries[j].label.match(SIZE_PART);
        if (!m || (m[1] ?? null) !== title || entries[j].group !== e.group) break;
        parts.push({ entry: entries[j], number: m[2] });
      }
      if (parts.length > 1) {
        // The heading above already names it when it is the section itself.
        rows.push({ kind: "parts", key: `p:${e.path}`, title: title === groupName ? null : title, parts });
        i += parts.length - 1;
        continue;
      }
    }

    // Indented once for each enclosing part that is an entry itself.
    const depth = segments.slice(0, -1).filter((_, k) => paths.has(segments.slice(0, k + 1).join("/"))).length;
    rows.push({ kind: "entry", entry: e, label: shortLabel(e.label, groupName), depth });
  }
  return rows;
}
