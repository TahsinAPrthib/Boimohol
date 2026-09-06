import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withCallbackUrl } from "@/lib/safe-redirect";
import { getCurrentStreak } from "@/lib/streak";
import BookCover from "@/components/BookCover";
import YearlyGoalForm from "@/components/YearlyGoalForm";

type Status = "WANT" | "READING" | "FINISHED";

const SECTIONS: { status: Status; label: string }[] = [
  { status: "READING", label: "পড়ছি" },
  { status: "WANT", label: "পড়তে চাই" },
  { status: "FINISHED", label: "পড়া শেষ" },
];

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(withCallbackUrl("/login", "/profile"));

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      shelfItems: {
        include: { book: { include: { category: true } } },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!user) redirect(withCallbackUrl("/login", "/profile"));

  const streak = await getCurrentStreak(user.id);

  const yearStart = new Date(Date.UTC(new Date().getFullYear(), 0, 1));
  const yearEnd = new Date(Date.UTC(new Date().getFullYear() + 1, 0, 1));
  const finishedThisYear = await prisma.shelfItem.count({
    where: {
      userId: user.id,
      status: "FINISHED",
      finishedAt: { gte: yearStart, lt: yearEnd },
    },
  });

  const progressPercent = user.yearlyGoal
    ? Math.min(100, Math.round((finishedThisYear / user.yearlyGoal) * 100))
    : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-10 border-b-2 border-ink/10 pb-6">
        <h1 className="font-display text-3xl text-ink">{user.name}</h1>
        <p className="font-body text-ink/50">@{user.username}</p>
        {user.bio && <p className="mt-2 max-w-prose font-body text-ink/70">{user.bio}</p>}
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-book border-2 border-ink/10 bg-paper-dark p-5">
          <h3 className="mb-1 font-display text-lg text-ink">পড়ার ধারাবাহিকতা</h3>
          <p className="font-body text-ink/70">
            {streak > 0 ? `${streak} দিন ধরে পড়ছেন` : "আজই পড়া শুরু করুন"}
          </p>
        </div>

        {user.yearlyGoal ? (
          <div className="rounded-book border-2 border-ink/10 bg-paper-dark p-5">
            <h3 className="mb-1 font-display text-lg text-ink">এই বছরের লক্ষ্য</h3>
            <p className="mb-3 font-body text-ink/70">
              {finishedThisYear} / {user.yearlyGoal} টি বই পড়া হয়েছে
            </p>
            <div className="h-3 w-full overflow-hidden rounded-book bg-paper">
              <div className="h-full bg-cloth" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        ) : (
          <YearlyGoalForm />
        )}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink">আমার বইতাক</h2>
        <Link href="/marketplace/mine" className="font-body text-sm font-semibold text-cloth hover:underline">
          আমার বিনিময় তালিকা
        </Link>
      </div>

      <div className="flex flex-col gap-10">
        {SECTIONS.map((section) => {
          const items = user.shelfItems.filter((item) => item.status === section.status);
          return (
            <div key={section.status}>
              <h3 className="mb-3 font-display text-lg text-cloth">
                {section.label} <span className="font-body text-sm text-ink/40">({items.length})</span>
              </h3>
              {items.length === 0 ? (
                <p className="font-body text-sm text-ink/50">এখনো কোনো বই নেই।</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
                  {items.map((item) => (
                    <Link key={item.id} href={`/books/${item.book.id}`} className="group">
                      <BookCover
                        title={item.book.title}
                        author={item.book.author}
                        colorKey={item.book.category.colorKey}
                      />
                      <p className="mt-1 truncate font-body text-xs text-ink/70 group-hover:text-cloth">
                        {item.book.titleBangla || item.book.title}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
