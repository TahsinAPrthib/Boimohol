"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logReadingActivity } from "@/lib/streak";

const aspectRating = z.coerce.number().int().min(1).max(5).optional().nullable();

const reviewSchema = z.object({
  bookId: z.string().min(1),
  rating: z.coerce
    .number({ invalid_type_error: "রেটিং নির্বাচন করুন।" })
    .int()
    .min(1, "রেটিং নির্বাচন করুন।")
    .max(5, "রেটিং সর্বোচ্চ ৫ হতে পারে।"),
  plotRating: aspectRating,
  writingRating: aspectRating,
  pacingRating: aspectRating,
  text: z.string().trim().max(2000, "মন্তব্যটি অনেক বড় হয়ে গেছে।").optional(),
});

export type ReviewState = {
  success: boolean;
  message?: string;
  fieldErrors?: Partial<
    Record<"rating" | "text" | "plotRating" | "writingRating" | "pacingRating", string>
  >;
};

// The aspect StarRating inputs default to 0 (unrated); treat that the same
// as "not provided" so the field stays optional.
function readAspect(formData: FormData, field: string): string | undefined {
  const value = formData.get(field);
  return value && value !== "0" ? String(value) : undefined;
}

export async function submitReview(
  _prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "পর্যালোচনা দিতে হলে আগে লগইন করুন।" };
  }

  const parsed = reviewSchema.safeParse({
    bookId: formData.get("bookId"),
    rating: formData.get("rating"),
    plotRating: readAspect(formData, "plotRating"),
    writingRating: readAspect(formData, "writingRating"),
    pacingRating: readAspect(formData, "pacingRating"),
    text: formData.get("text") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: ReviewState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<ReviewState["fieldErrors"]>;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, message: "ফর্মে কিছু তথ্য ঠিক নেই।", fieldErrors };
  }

  const { bookId, rating, text, plotRating, writingRating, pacingRating } = parsed.data;

  await prisma.review.upsert({
    where: { bookId_userId: { bookId, userId: session.user.id } },
    update: {
      rating,
      text: text || null,
      plotRating: plotRating ?? null,
      writingRating: writingRating ?? null,
      pacingRating: pacingRating ?? null,
    },
    create: {
      bookId,
      userId: session.user.id,
      rating,
      text: text || null,
      plotRating: plotRating ?? null,
      writingRating: writingRating ?? null,
      pacingRating: pacingRating ?? null,
    },
  });

  await logReadingActivity(session.user.id);

  revalidatePath(`/books/${bookId}`);

  return { success: true, message: "আপনার পর্যালোচনা সংরক্ষণ করা হয়েছে।" };
}
