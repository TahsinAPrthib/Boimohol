"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
import { isBlockedEitherWay } from "@/lib/blocks";
import { requestSearchText } from "@/lib/search";

const requestSchema = z.object({
  title: z.string().trim().min(1, "বইয়ের নাম আবশ্যক।").max(200, "নামটি অনেক বড়।"),
  author: z.string().trim().min(1, "লেখকের নাম আবশ্যক।").max(120, "নামটি অনেক বড়।"),
  categoryId: z.string().trim().min(1).optional(),
  note: z.string().trim().max(1000, "নোটটি অনেক বড় হয়ে গেছে।").optional(),
  location: z.string().trim().max(120, "লোকেশনটি অনেক বড়।").optional(),
});

const statusEnum = z.enum(["OPEN", "FULFILLED", "CLOSED"]);

const responseSchema = z.object({
  requestId: z.string().min(1),
  message: z
    .string()
    .trim()
    .min(1, "কিছু একটা লিখুন।")
    .max(1000, "বার্তাটি অনেক বড় হয়ে গেছে।"),
});

export type RequestFormState = {
  success: boolean;
  message?: string;
  fieldErrors?: Partial<Record<"title" | "author" | "categoryId" | "note" | "location", string>>;
  requestId?: string;
};

export type RequestActionResult = {
  success: boolean;
  message?: string;
};

export async function createRequest(
  _prevState: RequestFormState,
  formData: FormData
): Promise<RequestFormState> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false, message: "অনুরোধ করতে হলে আগে লগইন করুন।" };
  }

  const parsed = requestSchema.safeParse({
    title: formData.get("title"),
    author: formData.get("author"),
    categoryId: formData.get("categoryId") || undefined,
    note: formData.get("note") || undefined,
    location: formData.get("location") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: RequestFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<RequestFormState["fieldErrors"]>;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, message: "ফর্মে কিছু তথ্য ঠিক নেই।", fieldErrors };
  }

  const request = await prisma.bookRequest.create({
    data: {
      requesterId: userId,
      title: parsed.data.title,
      author: parsed.data.author,
      categoryId: parsed.data.categoryId ?? null,
      note: parsed.data.note ?? null,
      location: parsed.data.location ?? null,
      searchText: requestSearchText(parsed.data),
    },
  });

  revalidatePath("/requests");
  revalidatePath("/requests/mine");

  return { success: true, message: "আপনার অনুরোধটি প্রকাশিত হয়েছে।", requestId: request.id };
}

export async function updateRequestStatus(
  requestId: string,
  status: "OPEN" | "FULFILLED" | "CLOSED"
): Promise<RequestActionResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false, message: "অবস্থা পরিবর্তন করতে হলে আগে লগইন করুন।" };
  }

  const parsedStatus = statusEnum.safeParse(status);
  if (!parsedStatus.success) {
    return { success: false, message: "অনুরোধটি সঠিক নয়।" };
  }

  const request = await prisma.bookRequest.findUnique({
    where: { id: requestId },
    select: { requesterId: true },
  });
  if (!request) {
    return { success: false, message: "অনুরোধটি খুঁজে পাওয়া যায়নি।" };
  }
  if (request.requesterId !== userId) {
    return { success: false, message: "শুধু যিনি অনুরোধ করেছেন তিনিই এটির অবস্থা বদলাতে পারবেন।" };
  }

  await prisma.bookRequest.update({
    where: { id: requestId },
    data: { status: parsedStatus.data },
  });

  revalidatePath("/requests");
  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/requests/mine");

  return { success: true };
}

export async function respondToRequest(
  requestId: string,
  message: string
): Promise<RequestActionResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false, message: "সাড়া দিতে হলে আগে লগইন করুন।" };
  }

  const parsed = responseSchema.safeParse({ requestId, message });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "অনুরোধটি সঠিক নয়।" };
  }

  const request = await prisma.bookRequest.findUnique({
    where: { id: parsed.data.requestId },
    select: { requesterId: true, status: true },
  });
  if (!request) {
    return { success: false, message: "অনুরোধটি খুঁজে পাওয়া যায়নি।" };
  }
  if (request.requesterId === userId) {
    return { success: false, message: "নিজের অনুরোধে নিজে সাড়া দেওয়া যাবে না।" };
  }
  if (request.status !== "OPEN") {
    return { success: false, message: "এই অনুরোধটি আর খোলা নেই।" };
  }
  if (await isBlockedEitherWay(userId, request.requesterId)) {
    return { success: false, message: "ব্লক থাকার কারণে এই অনুরোধে সাড়া দেওয়া যাবে না।" };
  }

  // Upsert so re-responding edits the existing message instead of erroring
  // on the [requestId, responderId] unique constraint.
  await prisma.requestResponse.upsert({
    where: {
      requestId_responderId: { requestId: parsed.data.requestId, responderId: userId },
    },
    update: { message: parsed.data.message },
    create: {
      requestId: parsed.data.requestId,
      responderId: userId,
      message: parsed.data.message,
    },
  });

  revalidatePath(`/requests/${parsed.data.requestId}`);

  return { success: true, message: "আপনার সাড়া পাঠানো হয়েছে।" };
}

export async function deleteResponse(responseId: string): Promise<RequestActionResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false, message: "মুছে ফেলতে হলে আগে লগইন করুন।" };
  }

  const response = await prisma.requestResponse.findUnique({
    where: { id: responseId },
    select: { responderId: true, requestId: true },
  });
  if (!response) {
    return { success: false, message: "সাড়াটি খুঁজে পাওয়া যায়নি।" };
  }
  if (response.responderId !== userId) {
    return { success: false, message: "শুধু নিজের সাড়াই মুছে ফেলা যায়।" };
  }

  await prisma.requestResponse.delete({ where: { id: responseId } });

  revalidatePath(`/requests/${response.requestId}`);

  return { success: true, message: "সাড়াটি মুছে ফেলা হয়েছে।" };
}
