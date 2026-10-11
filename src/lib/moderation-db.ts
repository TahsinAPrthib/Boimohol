import "server-only";
import type { Prisma, PrismaPromise, ReportTargetType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { describeDbError } from "@/lib/db-errors";

// Updates that close the reports a step answers: the one it was taken from,
// plus any other open report about the same thing (removing a listing
// settles every report about it). An existing admin note is kept.
export async function resolveReports(
  reportId: string | undefined,
  targets: { type: ReportTargetType; ids: string[] }[],
  note: string
): Promise<{ reportId: string | null; updates: PrismaPromise<unknown>[] }> {
  const or: Prisma.ReportWhereInput[] = targets
    .filter((t) => t.ids.length > 0)
    .map((t) => ({ targetType: t.type, targetId: { in: t.ids } }));
  if (reportId) or.push({ id: reportId });
  if (or.length === 0) return { reportId: null, updates: [] };

  const reports = await prisma.report.findMany({
    where: { OR: or, status: { in: ["OPEN", "REVIEWING"] } },
    select: { id: true, adminNote: true },
  });
  const known = reportId ? await prisma.report.findUnique({ where: { id: reportId }, select: { id: true } }) : null;
  return {
    reportId: known?.id ?? null,
    updates: reports.map((r) =>
      prisma.report.update({
        where: { id: r.id },
        data: { status: "RESOLVED", adminNote: r.adminNote || note },
      })
    ),
  };
}

// Runs the steps as one transaction; a failure is logged (without the
// database's own message, which can name the host) and reported as false.
export async function runSteps(steps: PrismaPromise<unknown>[], what: string): Promise<boolean> {
  try {
    await prisma.$transaction(steps);
    return true;
  } catch (err) {
    console.error(`[moderation] ${what} failed: ${describeDbError(err)}`);
    return false;
  }
}
