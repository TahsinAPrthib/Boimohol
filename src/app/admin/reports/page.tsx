import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/authz";
import { cloudinaryUrl } from "@/lib/cloudinary-url";
import ReportStatusControls from "@/components/ReportStatusControls";

type Status = "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED";

const STATUS_LABEL: Record<string, string> = {
  OPEN: "খোলা",
  REVIEWING: "পর্যালোচনায়",
  RESOLVED: "নিষ্পত্তি",
  DISMISSED: "বাতিল",
};

const REASON_LABEL: Record<string, string> = {
  SPAM: "স্প্যাম",
  HARASSMENT: "হয়রানি",
  SCAM: "প্রতারণা",
  INAPPROPRIATE: "অনুপযুক্ত কনটেন্ট",
  COPYRIGHT: "কপিরাইট লঙ্ঘন",
  OTHER: "অন্যান্য",
};

const TARGET_LABEL: Record<string, string> = {
  LISTING: "তালিকা",
  MESSAGE: "বার্তা",
  USER: "ব্যবহারকারী",
};

const FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "সব" },
  { value: "OPEN", label: "খোলা" },
  { value: "REVIEWING", label: "পর্যালোচনায়" },
  { value: "RESOLVED", label: "নিষ্পত্তি" },
  { value: "DISMISSED", label: "বাতিল" },
];

function isStatus(value: string | undefined): value is Status {
  return value === "OPEN" || value === "REVIEWING" || value === "RESOLVED" || value === "DISMISSED";
}

export default async function AdminReportsPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const searchParams = await props.searchParams;
  // 404 rather than 403: a non-admin shouldn't learn this route exists.
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  const statusFilter = searchParams.status;
  const reports = await prisma.report.findMany({
    where: isStatus(statusFilter) ? { status: statusFilter } : {},
    include: { reporter: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });

  // targetId isn't a foreign key (it points at one of three tables), so the
  // targets are resolved in a batch per type and may legitimately be missing
  // if the content was deleted after being reported.
  const idsByType = (type: string) =>
    reports.filter((r) => r.targetType === type).map((r) => r.targetId);

  const [listings, messages, users] = await Promise.all([
    prisma.listing.findMany({
      where: { id: { in: idsByType("LISTING") } },
      select: {
        id: true,
        title: true,
        author: true,
        // Reports are often about the image itself, so the reviewer needs to
        // see it without leaving the queue.
        photos: { orderBy: { order: "asc" }, select: { id: true, publicId: true } },
      },
    }),
    prisma.message.findMany({
      where: { id: { in: idsByType("MESSAGE") } },
      select: {
        id: true,
        text: true,
        sender: { select: { username: true } },
      },
    }),
    prisma.user.findMany({
      where: { id: { in: idsByType("USER") } },
      select: { id: true, username: true },
    }),
  ]);

  const listingById = new Map(listings.map((l) => [l.id, l]));
  const messageById = new Map(messages.map((m) => [m.id, m]));
  const userById = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 font-display text-3xl text-ink">রিপোর্ট</h1>
      <p className="mb-6 font-body text-ink/60">ব্যবহারকারীদের পাঠানো রিপোর্টগুলো এখানে দেখুন ও নিষ্পত্তি করুন।</p>

      <div className="mb-6 flex flex-wrap gap-2 border-b-2 border-ink/10 pb-6">
        {FILTERS.map((f) => {
          const active = f.value === "ALL" ? !isStatus(statusFilter) : statusFilter === f.value;
          return (
            <Link
              key={f.value}
              href={f.value === "ALL" ? "/admin/reports" : `/admin/reports?status=${f.value}`}
              className={`rounded-book border-2 px-3 py-1.5 font-body text-sm font-semibold ${
                active
                  ? "border-cloth bg-cloth text-paper"
                  : "border-ink/20 text-ink hover:border-ink/40"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {reports.length === 0 ? (
        <p className="font-body text-ink/50">এই ফিল্টারে কোনো রিপোর্ট নেই।</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {reports.map((report) => {
            const listing = listingById.get(report.targetId);
            const message = messageById.get(report.targetId);
            const user = userById.get(report.targetId);

            return (
              <li
                key={report.id}
                className="rounded-book border-2 border-ink/10 bg-paper-dark p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-book bg-paper px-2 py-1 font-body text-xs font-semibold text-ink/70">
                      {TARGET_LABEL[report.targetType] ?? report.targetType}
                    </span>
                    <span className="rounded-book bg-oxblood/10 px-2 py-1 font-body text-xs font-semibold text-oxblood">
                      {REASON_LABEL[report.reason] ?? report.reason}
                    </span>
                    <span className="rounded-book bg-paper px-2 py-1 font-body text-xs font-semibold text-ink/70">
                      {STATUS_LABEL[report.status] ?? report.status}
                    </span>
                  </div>
                  <span className="font-body text-xs text-ink/50">
                    {report.createdAt.toLocaleDateString("bn-BD", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <p className="mt-2 font-body text-sm text-ink/60">
                  রিপোর্টকারী: <span className="font-semibold text-ink">@{report.reporter.username}</span>
                </p>

                <div className="mt-2 rounded-book border-2 border-ink/10 bg-paper p-3 [overflow-wrap:anywhere]">
                  {report.targetType === "LISTING" &&
                    (listing ? (
                      <>
                        <Link
                          href={`/marketplace/${listing.id}`}
                          className="font-display text-base text-ink hover:text-cloth"
                        >
                          {listing.title}
                        </Link>
                        <p className="font-body text-xs text-ink/50">{listing.author}</p>
                        {listing.photos.length > 0 && (
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {listing.photos.map((photo) => (
                              <li key={photo.id}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={cloudinaryUrl(photo.publicId, { width: 200, square: true })}
                                  alt={`${listing.title} — রিপোর্ট করা ছবি`}
                                  className="h-20 w-20 rounded-book border-2 border-ink/10 object-cover"
                                />
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <p className="font-body text-sm text-ink/40">তালিকাটি আর নেই (মুছে ফেলা হয়েছে)।</p>
                    ))}

                  {report.targetType === "MESSAGE" &&
                    (message ? (
                      <>
                        <p className="font-body text-sm text-ink/80">{message.text}</p>
                        {/* Deliberately not linked to the thread: /messages/[id]
                            authorizes on participation only, so the link would
                            404 for any admin who isn't in the conversation.
                            Giving admins read access to private threads is a
                            privacy call to make explicitly, not a side effect. */}
                        <p className="mt-1 font-body text-xs text-ink/50">
                          প্রেরক: @{message.sender.username}
                        </p>
                      </>
                    ) : (
                      <p className="font-body text-sm text-ink/40">বার্তাটি আর নেই (মুছে ফেলা হয়েছে)।</p>
                    ))}

                  {report.targetType === "USER" &&
                    (user ? (
                      <p className="font-body text-sm text-ink/80">@{user.username}</p>
                    ) : (
                      <p className="font-body text-sm text-ink/40">
                        ব্যবহারকারীটি আর নেই (মুছে ফেলা হয়েছে)।
                      </p>
                    ))}
                </div>

                {report.details && (
                  <p className="mt-2 font-body text-sm text-ink/70">
                    <span className="font-semibold text-ink">বিবরণ:</span> {report.details}
                  </p>
                )}

                {report.adminNote && (
                  <p className="mt-2 font-body text-sm text-ink/70">
                    <span className="font-semibold text-ink">অ্যাডমিন নোট:</span> {report.adminNote}
                  </p>
                )}

                <ReportStatusControls
                  reportId={report.id}
                  currentStatus={report.status}
                  currentNote={report.adminNote}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
