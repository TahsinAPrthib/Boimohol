import Link from "next/link";
import { PlusIcon } from "@/components/AppIcons";

// The top of the বিনিময় tab on phones: a switch between the books on offer
// and readers' requests, and a "+" for whichever side is open. From lg up
// the navbar links both pages and each page has its own button.
export default function ExchangeSwitch({ active }: { active: "listings" | "requests" }) {
  const side = (key: "listings" | "requests", href: string, label: string) => (
    <Link
      href={href}
      aria-current={active === key ? "page" : undefined}
      className={`flex h-11 flex-1 items-center justify-center rounded-book px-2 font-body text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric ${
        active === key ? "bg-cloth text-paper shadow-shelf" : "text-ink/70 hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <div className="mb-6 flex items-center gap-2 lg:hidden">
      <nav aria-label="বিনিময়ের পাতা" className="flex min-w-0 flex-1 gap-1 rounded-book border-2 border-ink/15 bg-paper-dark p-1">
        {side("listings", "/marketplace", "বইয়ের তালিকা")}
        {side("requests", "/requests", "অনুরোধ")}
      </nav>
      <Link
        href={active === "listings" ? "/marketplace/new" : "/requests/new"}
        aria-label={active === "listings" ? "নতুন তালিকা যোগ করুন" : "নতুন অনুরোধ করুন"}
        className="btn-primary h-14 shrink-0 gap-1 px-3"
      >
        <PlusIcon className="h-6 w-6" />
        <span aria-hidden="true">{active === "listings" ? "বই দিন" : "অনুরোধ"}</span>
      </Link>
    </div>
  );
}
