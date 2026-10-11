"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
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
  const userId = await getSessionUserId();
  if (!userId) {
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
    where: { bookId_userId: { bookId, userId } },
    update: {
      rating,
      text: text || null,
      plotRating: plotRating ?? null,
      writingRating: writingRating ?? null,
      pacingRating: pacingRating ?? null,
    },
    create: {
      bookId,
      userId,
      rating,
      text: text || null,
      plotRating: plotRating ?? null,
      writingRating: writingRating ?? null,
      pacingRating: pacingRating ?? null,
    },
  });

  await logReadingActivity(userId);

  revalidatePath(`/books/${bookId}`);

  return { success: true, message: "আপনার পর্যালোচনা সংরক্ষণ করা হয়েছে।" };
}

export async function deleteReview(reviewId: string): Promise<{ success: boolean; message: string }> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false, message: "পর্যালোচনা মুছতে হলে আগে লগইন করুন।" };
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, bookId: true },
  });
  if (!review) {
    return { success: false, message: "পর্যালোচনাটি খুঁজে পাওয়া যায়নি।" };
  }
  if (review.userId !== userId) {
    return { success: false, message: "শুধু নিজের পর্যালোচনাই মুছে ফেলা যায়।" };
  }

  await prisma.review.delete({ where: { id: reviewId } });

  // The book's average rating, and the home page's recent reviews.
  revalidatePath(`/books/${review.bookId}`);
  revalidatePath("/");

  return { success: true, message: "আপনার পর্যালোচনা মুছে ফেলা হয়েছে।" };
}
