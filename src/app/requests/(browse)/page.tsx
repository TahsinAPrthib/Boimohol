import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
import { blockedIdsFor } from "@/lib/blocks";
import RequestCard from "@/components/RequestCard";
import SearchBox from "@/components/SearchBox";
import ChipRow from "@/components/ChipRow";
import ExchangeSwitch from "@/components/ExchangeSwitch";
import NoResults from "@/components/NoResults";
import { hrefWith, readQuery, searchFilter } from "@/lib/search";
import { CHIP_OFF, CHIP_ON } from "@/lib/chips";

export default async function RequestsPage(props: {
  searchParams: Promise<{ category?: string; q?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const selectedSlug = searchParams.category;
  const q = readQuery(searchParams.q);
  const search = searchFilter(q);

  // Same rule as the marketplace grid: anonymous viewers see everything, a
  // signed-in viewer doesn't see requests from people they've blocked.
  const viewerId = await getSessionUserId();
  const blockedIds = viewerId ? await blockedIdsFor(viewerId) : [];

  const requests = await prisma.bookRequest.findMany({
    where: {
      status: "OPEN",
      ...(selectedSlug ? { category: { slug: selectedSlug } } : {}),
      ...(blockedIds.length > 0 ? { requesterId: { notIn: blockedIds } } : {}),
      ...search,
    },
    include: {
      category: { select: { nameBangla: true } },
      requester: { select: { username: true } },
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <ExchangeSwitch active="requests" />
      <div className="mb-8 flex flex-col gap-4 border-b-2 border-ink/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">অনুরোধ</h1>
          <p className="mt-2 max-w-prose font-body text-ink/70">
            যে বইটি খুঁজছেন কিন্তু কোথাও পাচ্ছেন না — এখানে জানান। কারও কাছে থাকলে তিনি সাড়া দেবেন।
          </p>
        </div>
        <Link href="/requests/new" className="btn-primary whitespace-nowrap max-lg:hidden">
          নতুন অনুরোধ করুন
        </Link>
      </div>

      <SearchBox label="অনুরোধ খুঁজুন" placeholder="বইয়ের নাম বা লেখক" className="mb-4" />

      <ChipRow as="nav" label="বিভাগ" activeKey={selectedSlug ?? ""} className="mb-6">
        <Link
          href={hrefWith("/requests", { q })}
          aria-current={!selectedSlug ? "true" : undefined}
          className={`rounded-book border-2 px-3 py-1.5 font-body text-sm font-semibold max-lg:flex max-lg:min-h-11 max-lg:shrink-0 max-lg:items-center max-lg:whitespace-nowrap ${
            !selectedSlug
              ? CHIP_ON
              : CHIP_OFF
          }`}
        >
          সব বিভাগ
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={hrefWith("/requests", { category: cat.slug, q })}
            aria-current={selectedSlug === cat.slug ? "true" : undefined}
            className={`rounded-book border-2 px-3 py-1.5 font-body text-sm font-semibold max-lg:flex max-lg:min-h-11 max-lg:shrink-0 max-lg:items-center max-lg:whitespace-nowrap ${
              selectedSlug === cat.slug
                ? CHIP_ON
                : CHIP_OFF
            }`}
          >
            {cat.nameBangla}
          </Link>
        ))}
      </ChipRow>

      {requests.length === 0 && search ? (
        <NoResults query={q} where={selectedSlug ? "এই বিভাগে" : undefined} />
      ) : requests.length === 0 ? (
        <p className="font-body text-ink/70">
          {selectedSlug
            ? "এই বিভাগে এখন কোনো খোলা অনুরোধ নেই।"
            : "এখনো কোনো অনুরোধ করা হয়নি। প্রথমটি আপনিই করুন।"}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              id={request.id}
              title={request.title}
              author={request.author}
              categoryName={request.category?.nameBangla}
              requesterUsername={request.requester.username}
              responseCount={request._count.responses}
              status={request.status}
              location={request.location}
            />
          ))}
        </div>
      )}
    </div>
  );
}
