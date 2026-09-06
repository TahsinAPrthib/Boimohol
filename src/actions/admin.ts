"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/authz";

const updateSchema = z.object({
  reportId: z.string().min(1),
  status: z.enum(["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"]),
  // Tri-state, and the distinction matters:
  //   undefined  -> caller didn't mention the note; leave it alone
  //   null or "" -> caller explicitly cleared it
  //   non-empty  -> set it
  adminNote: z.string().trim().max(2000, "নোটটি অনেক বড় হয়ে গেছে।").nullable().optional(),
});

export type AdminResult = {
  success: boolean;
  message?: string;
};

export async function updateReportStatus(
  reportId: string,
  status: "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED",
  adminNote?: string | null
): Promise<AdminResult> {
  // Re-checked here rather than relying on the page that rendered the form:
  // a server action is a public endpoint and can be invoked directly.
  const adminId = await getAdminUserId();
  if (!adminId) {
    return { success: false, message: "এই কাজটি করার অনুমতি আপনার নেই।" };
  }

  // Passed through verbatim — collapsing "" or null to undefined here would
  // destroy the difference between "clear the note" and "don't touch it".
  const parsed = updateSchema.safeParse({ reportId, status, adminNote });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "অনুরোধটি সঠিক নয়।" };
  }

  const report = await prisma.report.findUnique({
    where: { id: parsed.data.reportId },
    select: { id: true },
  });
  if (!report) {
    return { success: false, message: "রিপোর্টটি খুঁজে পাওয়া যায়নি।" };
  }

  // undefined leaves the column alone, so a caller that only changes status
  // can't silently wipe a note. An explicit "" or null clears it.
  const noteUpdate =
    parsed.data.adminNote === undefined
      ? {}
      : { adminNote: parsed.data.adminNote === "" ? null : parsed.data.adminNote };

  await prisma.report.update({
    where: { id: parsed.data.reportId },
    data: {
      status: parsed.data.status,
      ...noteUpdate,
    },
  });

  revalidatePath("/admin/reports");

  return { success: true, message: "রিপোর্টটি হালনাগাদ করা হয়েছে।" };
}
