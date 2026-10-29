// What a search shows when nothing matches. Most misses are a Bangla title
// spelled differently from how we store it, so point to the two spellings
// that don't vary: the English title and the author's name.
export default function NoResults({ query, where }: { query: string; where?: string }) {
  return (
    <div className="rounded-book border-2 border-dashed border-ink/15 px-4 py-8 text-center">
      <p className="font-display text-lg text-ink [overflow-wrap:anywhere]">
        {where ? `${where} ` : ""}“{query}” খুঁজে কিছু পাওয়া যায়নি।
      </p>
      <p className="mx-auto mt-2 max-w-prose font-body text-sm text-ink/70">
        বানানটা আরেকবার দেখে নিন, অথবা বইয়ের ইংরেজি নাম (যেমন Pather Panchali) বা লেখকের নাম লিখে খুঁজুন।
      </p>
    </div>
  );
}
