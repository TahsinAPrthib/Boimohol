import Link from "next/link";
import { hrefWith } from "@/lib/search";
import { LANGUAGE_FILTERS, languageParam, type LanguageFilter } from "@/lib/book-language";
import ChipRow from "@/components/ChipRow";

// বাংলা / অন্যান্য ভাষা / সব, keeping the page's other filters (category, search)
// and starting again at page 1.
export default function LanguageChips({
  path,
  params,
  active,
  className = "",
}: {
  path: string;
  params: Record<string, string | null | undefined>;
  active: LanguageFilter;
  className?: string;
}) {
  return (
    <ChipRow as="nav" label="ভাষা" activeKey={active} className={className}>
      <span className="font-body text-sm text-ink/70 max-lg:shrink-0 max-lg:whitespace-nowrap">ভাষা:</span>
      {LANGUAGE_FILTERS.map((option) => {
        const current = option.value === active;
        return (
          <Link
            key={option.value}
            href={hrefWith(path, { ...params, lang: languageParam(option.value) })}
            aria-current={current ? "true" : undefined}
            className={`rounded-book border-2 px-3 py-1 font-body text-sm font-semibold max-lg:flex max-lg:min-h-11 max-lg:shrink-0 max-lg:items-center max-lg:whitespace-nowrap ${
              current ? "border-ink bg-ink text-paper" : "border-ink/20 text-ink hover:border-ink/40"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </ChipRow>
  );
}
