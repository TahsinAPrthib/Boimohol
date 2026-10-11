import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { bn } from "@/lib/bangla";
import { getSessionUserId } from "@/lib/authz";
import { withCallbackUrl } from "@/lib/safe-redirect";
import RequestStatusControls from "@/components/RequestStatusControls";
import ConfirmAction from "@/components/ConfirmAction";
import { deleteRequest } from "@/actions/requests";

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

export default async function MyRequestsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect(withCallbackUrl("/login", "/requests/mine"));

  const requests = await prisma.bookRequest.findMany({
    where: { requesterId: userId },
    include: {
      category: { select: { nameBangla: true } },
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink/10 pb-6">
        <h1 className="font-display text-3xl text-ink">আমার অনুরোধ</h1>
        <Link href="/requests/new" className="btn-primary whitespace-nowrap">
          নতুন অনুরোধ
        </Link>
      </div>

      {requests.length === 0 ? (
        <p className="font-body text-ink/50">আপনি এখনো কোনো অনুরোধ করেননি।</p>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-book border-2 border-ink/10 bg-paper-dark p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/requests/${request.id}`}
                    className="font-display text-lg text-ink hover:text-cloth"
                  >
                    {request.title}
                  </Link>
                  <p className="font-body text-sm text-ink/50">{request.author}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {request.category && (
                    <span className="rounded-book bg-paper px-2 py-1 font-body text-xs font-semibold text-ink/70">
                      {request.category.nameBangla}
                    </span>
                  )}
                  <span
                    className={`rounded-book px-2 py-1 font-body text-xs font-semibold ${
                      STATUS_CLASS[request.status]
                    }`}
                  >
                    {STATUS_LABEL[request.status]}
                  </span>
                </div>
              </div>

              <p className="mt-2 font-body text-sm text-ink/60">
                {request._count.responses > 0
                  ? `${bn(request._count.responses)} জন সাড়া দিয়েছেন`
                  : "এখনো কেউ সাড়া দেননি"}
              </p>

              <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                <RequestStatusControls requestId={request.id} currentStatus={request.status} />
                <ConfirmAction
                  action={deleteRequest.bind(null, request.id)}
                  label="অনুরোধ মুছে ফেলুন"
                  question="অনুরোধটি, অন্যদের সাড়াসহ, চিরতরে মুছে ফেলবেন?"
                  confirmLabel="হ্যাঁ, মুছুন"
                  pendingLabel="মুছে ফেলা হচ্ছে..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
