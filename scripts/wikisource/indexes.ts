// Stage 1: the scans on Bangla Wikisource whose every page is proofread.
//
// ProofreadPage files each index (a scanned book) into percentage categories
// computed from the quality of its pages; "১০০% মুদ্রণ সংশোধিত" (100%
// proofread) and "১০০% বৈধকৃত" (100% validated) mean no page is left
// unproofread. That is the completeness bar: the same one the library's
// uploaded PDFs had to meet.
import { mwQueryAll, WIKISOURCE_API } from "./http";

export const INDEX_NS = 102; // নির্ঘণ্ট
export const PAGE_NS = 104; // পাতা
export const COMPLETE_CATEGORIES = ["বিষয়শ্রেণী:১০০% মুদ্রণ সংশোধিত", "বিষয়শ্রেণী:১০০% বৈধকৃত"];

export type IndexPage = {
  title: string; // নির্ঘণ্ট:File.pdf
  file: string; // File.pdf
  fields: Record<string, string>;
  categories: string[];
};

// The index template's fields: "|Name=value" lines, a value running until the
// next field.
export function parseIndexFields(wikitext: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /\n\|[ \t]*([A-Za-z][\w-]*)[ \t]*=/g;
  const marks: { name: string; start: number; end: number }[] = [];
  for (let m = re.exec(wikitext); m; m = re.exec(wikitext)) marks.push({ name: m[1], start: m.index, end: m.index + m[0].length });
  const close = wikitext.lastIndexOf("}}");
  marks.forEach((mk, i) => {
    // An empty field is followed at once by the next one: stop == end.
    const stop = i + 1 < marks.length ? marks[i + 1].start : close >= mk.end ? close : wikitext.length;
    out[mk.name] = wikitext.slice(mk.end, stop).trim();
  });
  return out;
}

export async function fetchCompleteIndexes(): Promise<IndexPage[]> {
  const byTitle = new Map<string, IndexPage>();
  for (const category of COMPLETE_CATEGORIES) {
    const pages = await mwQueryAll(WIKISOURCE_API, {
      generator: "categorymembers",
      gcmtitle: category,
      gcmnamespace: String(INDEX_NS),
      gcmlimit: "50",
      prop: "revisions|categories",
      rvprop: "content",
      rvslots: "main",
      cllimit: "max",
      clshow: "!hidden",
    });
    for (const p of pages) {
      const title = p.title as string;
      if (byTitle.has(title)) continue;
      const revs = p.revisions as { slots?: { main?: { content?: string } } }[] | undefined;
      const text = revs?.[0]?.slots?.main?.content ?? "";
      byTitle.set(title, {
        title,
        file: title.replace(/^নির্ঘণ্ট:/, ""),
        fields: parseIndexFields(text),
        categories: ((p.categories as { title: string }[] | undefined) ?? []).map((c) => c.title.replace(/^বিষয়শ্রেণী:/, "")),
      });
    }
  }
  return [...byTitle.values()];
}
