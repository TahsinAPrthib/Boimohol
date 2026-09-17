import Link from "next/link";

const STATUS_LABEL: Record<string, string> = {
  OPEN: "খোলা",
  FULFILLED: "পাওয়া গেছে",
  CLOSED: "বন্ধ",
};

const STATUS_CLASS: Record<string, string> = {
  OPEN: "bg-sage text-paper",
  FULFILLED: "bg-cloth text-paper",
  CLOSED: "bg-ink/20 text-ink/70",
};

export default function RequestCard({
  id,
  title,
  author,
  categoryName,
  requesterUsername,
  responseCount,
  status,
  location,
}: {
  id: string;
  title: string;
  author: string;
  categoryName?: string | null;
  requesterUsername: string;
  responseCount: number;
  status: "OPEN" | "FULFILLED" | "CLOSED";
  location?: string | null;
}) {
  return (
    <Link
      href={`/requests/${id}`}
      className="group flex flex-col gap-2 rounded-book border-2 border-ink/10 bg-paper-dark p-4 shadow-shelf transition-colors hover:border-cloth"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-lg leading-snug text-ink group-hover:text-cloth">
            {title}
          </p>
          <p className="font-body text-sm text-ink/60">{author}</p>
        </div>
        <span
          className={`shrink-0 rounded-book px-2 py-1 font-body text-xs font-semibold ${STATUS_CLASS[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-xs text-ink/50">
        {categoryName && (
          <span className="rounded-book bg-paper px-2 py-1 font-semibold text-ink/70">
            {categoryName}
          </span>
        )}
        {location && <span>{location}</span>}
        <span>@{requesterUsername}</span>
        <span>
          {responseCount > 0 ? `${responseCount} জন সাড়া দিয়েছেন` : "এখনো কেউ সাড়া দেননি"}
        </span>
      </div>
    </Link>
  );
}
