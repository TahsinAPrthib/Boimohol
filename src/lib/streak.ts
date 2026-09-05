import { prisma } from "@/lib/prisma";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Safe to call multiple times the same day — upserts, doesn't create duplicates.
export async function logReadingActivity(userId: string): Promise<void> {
  const today = startOfUtcDay(new Date());
  await prisma.readingActivity.upsert({
    where: { userId_date: { userId, date: today } },
    update: {},
    create: { userId, date: today },
  });
}

// Consecutive calendar days (up to today, or yesterday if nothing's logged
// yet today) with a ReadingActivity row, walking backward from the most
// recent entry.
export async function getCurrentStreak(userId: string): Promise<number> {
  const activities = await prisma.readingActivity.findMany({
    where: { userId },
    select: { date: true },
  });

  if (activities.length === 0) return 0;

  const dateSet = new Set(activities.map((a) => startOfUtcDay(a.date).getTime()));
  const today = startOfUtcDay(new Date());

  let cursor = dateSet.has(today.getTime()) ? today : new Date(today.getTime() - ONE_DAY_MS);

  let streak = 0;
  while (dateSet.has(cursor.getTime())) {
    streak += 1;
    cursor = new Date(cursor.getTime() - ONE_DAY_MS);
  }

  return streak;
}
