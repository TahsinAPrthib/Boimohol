import { notFound } from "next/navigation";
import Link from "next/link";
import { loadRequest } from "@/lib/loaders";
import { bn } from "@/lib/bangla";
import { getSessionUserId } from "@/lib/authz";
import { blockedIdsFor } from "@/lib/blocks";
import { withCallbackUrl } from "@/lib/safe-redirect";
import RequestResponseForm from "@/components/RequestResponseForm";
import RequestStatusControls from "@/components/RequestStatusControls";
import ReportButton from "@/components/ReportButton";

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

export default async function RequestDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const request = await loadRequest(params.id);

  if (!request) notFound();

  const viewerId = await getSessionUserId();
  const isRequester = viewerId === request.requesterId;

  // Responses from people the viewer has blocked are hidden from them.
  const blockedIds = viewerId ? await blockedIdsFor(viewerId) : [];
  const visibleResponses = request.responses.filter((r) => !blockedIds.includes(r.responderId));

  const myResponse = viewerId
    ? request.responses.find((r) => r.responderId === viewerId) ?? null
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/requests" className="font-body text-sm font-semibold text-cloth hover:underline">
        ← সব অনুরোধ
      </Link>

      <div className="mt-4 rounded-book border-2 border-ink/10 bg-paper-dark p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl text-ink">{request.title}</h1>
            <p className="mt-1 font-body text-ink/70">{request.author}</p>
          </div>
          <span
            className={`shrink-0 rounded-book px-2 py-1 font-body text-xs font-semibold ${
              STATUS_CLASS[request.status]
            }`}
          >
            {STATUS_LABEL[request.status]}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 font-body text-sm text-ink/60">
          {request.category && (
            <Link
              href={`/requests?category=${request.category.slug}`}
              className="rounded-book bg-paper px-2 py-1 text-xs font-semibold text-ink/70 hover:text-cloth"
            >
              {request.category.nameBangla}
            </Link>
          )}
          {request.location && <span>{request.location}</span>}
          <span>
            অনুরোধ করেছেন <span className="font-semibold text-ink">@{request.requester.username}</span>
          </span>
        </div>

        {request.note && (
          <p className="mt-4 max-w-prose font-body text-ink/80">{request.note}</p>
        )}

        {isRequester ? (
          <div className="mt-5">
            <p className="mb-2 font-body text-sm font-semibold text-ink/70">
              বর্তমান অবস্থা: {STATUS_LABEL[request.status]}
            </p>
            <RequestStatusControls requestId={request.id} currentStatus={request.status} />
          </div>
        ) : (
          viewerId && (
            <div className="mt-4">
              <ReportButton
                targetType="USER"
                targetId={request.requester.id}
                label="অনুরোধকারীকে রিপোর্ট করুন"
              />
            </div>
          )
        )}
      </div>

      {/* Responding: only for signed-in non-requesters, and only while open. */}
      {!isRequester && (
        <div className="mt-8">
          {!viewerId ? (
            <div className="rounded-book border-2 border-dashed border-ink/15 px-4 py-5 text-center font-body text-ink/60">
              সাড়া দিতে হলে{" "}
              <Link
                href={withCallbackUrl("/login", `/requests/${request.id}`)}
                className="font-semibold text-cloth hover:underline"
              >
                লগইন
              </Link>{" "}
              করুন।
            </div>
          ) : request.status !== "OPEN" ? (
            <p className="rounded-book border-2 border-dashed border-ink/15 px-4 py-5 text-center font-body text-ink/60">
              এই অনুরোধটি আর খোলা নেই, তাই নতুন করে সাড়া দেওয়া যাচ্ছে না।
            </p>
          ) : (
            <RequestResponseForm
              requestId={request.id}
              existingResponse={myResponse ? { id: myResponse.id, message: myResponse.message } : null}
            />
          )}
        </div>
      )}

      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl text-ink">
          সাড়া{visibleResponses.length > 0 ? ` (${bn(visibleResponses.length)})` : ""}
        </h2>

        {visibleResponses.length === 0 ? (
          <p className="font-body text-ink/50">এখনো কেউ সাড়া দেননি।</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {visibleResponses.map((response) => (
              <li
                key={response.id}
                className="rounded-book border-2 border-ink/10 bg-paper-dark p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-body font-semibold text-ink">
                    @{response.responder.username}
                    {response.responderId === viewerId && (
                      <span className="ml-2 font-normal text-ink/40">(আপনি)</span>
                    )}
                  </span>
                  {viewerId && response.responderId !== viewerId && (
                    <ReportButton
                      targetType="USER"
                      targetId={response.responderId}
                      label="রিপোর্ট"
                    />
                  )}
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words font-body text-ink/80">
                  {response.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
