import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
import { blockedIdsFor } from "@/lib/blocks";
import RequestCard from "@/components/RequestCard";

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const selectedSlug = searchParams.category;

  // Same rule as the marketplace grid: anonymous viewers see everything, a
  // signed-in viewer doesn't see requests from people they've blocked.
  const viewerId = await getSessionUserId();
  const blockedIds = viewerId ? await blockedIdsFor(viewerId) : [];

  const requests = await prisma.bookRequest.findMany({
    where: {
      status: "OPEN",
      ...(selectedSlug ? { category: { slug: selectedSlug } } : {}),
      ...(blockedIds.length > 0 ? { requesterId: { notIn: blockedIds } } : {}),
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
      <div className="mb-8 flex flex-col gap-4 border-b-2 border-ink/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">অনুরোধ</h1>
          <p className="mt-2 max-w-prose font-body text-ink/70">
            যে বইটি খুঁজছেন কিন্তু কোথাও পাচ্ছেন না — এখানে জানান। কারও কাছে থাকলে তিনি সাড়া দেবেন।
          </p>
        </div>
        <Link href="/requests/new" className="btn-primary whitespace-nowrap">
          নতুন অনুরোধ করুন
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/requests"
          className={`rounded-book border-2 px-3 py-1.5 font-body text-sm font-semibold ${
            !selectedSlug
              ? "border-cloth bg-cloth text-paper"
              : "border-ink/20 text-ink hover:border-ink/40"
          }`}
        >
          সব বিভাগ
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/requests?category=${cat.slug}`}
            className={`rounded-book border-2 px-3 py-1.5 font-body text-sm font-semibold ${
              selectedSlug === cat.slug
                ? "border-cloth bg-cloth text-paper"
                : "border-ink/20 text-ink hover:border-ink/40"
            }`}
          >
            {cat.nameBangla}
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <p className="font-body text-ink/50">
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
