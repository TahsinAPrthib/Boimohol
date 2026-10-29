import { notFound } from "next/navigation";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/authz";
import { bn, bnDate } from "@/lib/bangla";
import { escapeLike, readQuery } from "@/lib/search";
import SearchBox from "@/components/SearchBox";

// Enough to scan; past this, search narrows it down.
const PAGE_SIZE = 200;

export default async function AdminUsersPage(props: { searchParams: Promise<{ q?: string | string[] }> }) {
  // 404 rather than 403: a non-admin should not learn this route exists.
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  const searchParams = await props.searchParams;
  const q = readQuery(searchParams.q);
  // "@name" is how usernames are shown everywhere, so it's how people type them.
  const term = escapeLike(q.replace(/^@/, ""));
  const where: Prisma.UserWhereInput = term
    ? {
        OR: [
          { username: { contains: term, mode: "insensitive" } },
          { email: { contains: term, mode: "insensitive" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        suspendedAt: true,
        needsUsername: true,
        googleId: true,
        _count: { select: { listings: true, reviews: true, bookRequests: true } },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 font-display text-3xl text-ink">ব্যবহারকারী</h1>
      <p className="mb-6 max-w-prose font-body text-ink/70">
        কারও পাতায় গিয়ে তাঁর তালিকা, পর্যালোচনা ও অনুরোধ সরাতে পারবেন, অ্যাকাউন্ট স্থগিত বা মুছে ফেলতে পারবেন।
      </p>

      <div className="mb-6 flex flex-col gap-3 border-b-2 border-ink/10 pb-6">
        <SearchBox label="ব্যবহারকারী খুঁজুন" placeholder="ইউজারনেম বা ইমেইল" />
        <p className="font-body text-sm text-ink/70">
          {q ? `“${q}” মেলে এমন ${bn(total)} জন` : `মোট ${bn(total)} জন`}
          {total > users.length && ` — প্রথম ${bn(users.length)} জন দেখানো হচ্ছে`}
        </p>
      </div>

      {users.length === 0 ? (
        <p className="rounded-book border-2 border-dashed border-ink/15 px-4 py-8 text-center font-body text-ink/70 [overflow-wrap:anywhere]">
          {q ? `“${q}” নামে বা ইমেইলে কোনো ব্যবহারকারী পাওয়া যায়নি।` : "এখনো কোনো ব্যবহারকারী নেই।"}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {users.map((user) => (
            <li key={user.id}>
              <Link
                href={`/admin/users/${user.id}`}
                className="flex flex-col gap-2 rounded-book border-2 border-ink/10 bg-paper-dark p-4 transition-colors hover:border-cloth sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 [overflow-wrap:anywhere]">
                  <p className="flex flex-wrap items-center gap-2 font-body font-semibold text-ink">
                    @{user.username}
                    {user.role === "ADMIN" && (
                      <span className="rounded-book bg-cloth/15 px-2 py-0.5 text-xs text-cloth">অ্যাডমিন</span>
                    )}
                    {user.suspendedAt && (
                      <span className="rounded-book bg-oxblood/10 px-2 py-0.5 text-xs text-oxblood">স্থগিত</span>
                    )}
                    {user.googleId && (
                      <span className="rounded-book bg-ink/10 px-2 py-0.5 text-xs text-ink">Google</span>
                    )}
                    {user.needsUsername && (
                      <span className="rounded-book bg-turmeric/20 px-2 py-0.5 text-xs text-ink">ইউজারনেম বাকি</span>
                    )}
                    {user.id === adminId && <span className="text-xs font-normal text-ink/70">(আপনি)</span>}
                  </p>
                  <p className="font-body text-sm text-ink/70">{user.email}</p>
                  <p className="font-body text-xs text-ink/70">যোগ দিয়েছেন {bnDate(user.createdAt)}</p>
                </div>
                <dl className="flex shrink-0 gap-4 font-body text-sm text-ink/70">
                  <div>
                    <dt className="text-xs text-ink/70">তালিকা</dt>
                    <dd className="font-semibold text-ink">{bn(user._count.listings)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink/70">পর্যালোচনা</dt>
                    <dd className="font-semibold text-ink">{bn(user._count.reviews)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink/70">অনুরোধ</dt>
                    <dd className="font-semibold text-ink">{bn(user._count.bookRequests)}</dd>
                  </div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
