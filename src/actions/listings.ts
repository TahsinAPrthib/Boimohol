"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { attachPhotosToListing } from "@/actions/photos";

// Photos are uploaded to Cloudinary by the browser before submit, so the form
// carries only their public_ids. Attaching reuses attachPhotosToListing, which
// re-checks ownership, the 5-photo cap, and the real format/size of each asset.
function readPhotoPublicIds(formData: FormData): string[] {
  const raw = formData.get("photoPublicIds");
  if (typeof raw !== "string" || raw.trim() === "") return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  } catch {
    return [];
  }
}

const conditionEnum = z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "WORN"]);
const listingTypeEnum = z.enum(["SELL", "EXCHANGE", "DONATE"]);
const statusEnum = z.enum(["AVAILABLE", "RESERVED", "COMPLETED", "REMOVED"]);

const baseListingSchema = z.object({
  title: z.string().trim().min(1, "বইয়ের নাম আবশ্যক।").max(200, "নামটি অনেক বড়।"),
  author: z.string().trim().min(1, "লেখকের নাম আবশ্যক।").max(120, "নামটি অনেক বড়।"),
  categoryId: z.string().trim().min(1).optional(),
  description: z.string().trim().max(2000, "বিবরণ অনেক বড় হয়ে গেছে।").optional(),
  condition: conditionEnum,
  listingType: listingTypeEnum,
  price: z.coerce.number().positive("মূল্য অবশ্যই ধনাত্মক একটি সংখ্যা হতে হবে।").optional(),
  location: z.string().trim().min(1, "লোকেশন আবশ্যক।").max(120, "লোকেশনটি অনেক বড়।"),
});

// Cross-field rule: price is required (and positive) exactly when
// listingType is SELL, and must be absent for EXCHANGE/DONATE.
const listingSchema = baseListingSchema.superRefine((data, ctx) => {
  if (data.listingType === "SELL" && data.price === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["price"],
      message: "বিক্রির জন্য মূল্য উল্লেখ করা আবশ্যক।",
    });
  } else if (data.listingType !== "SELL" && data.price !== undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["price"],
      message: "বিনিময় বা দানের ক্ষেত্রে মূল্য দেওয়া যাবে না।",
    });
  }
});

export type ListingFormState = {
  success: boolean;
  message?: string;
  fieldErrors?: Partial<
    Record<
      "title" | "author" | "categoryId" | "description" | "condition" | "listingType" | "price" | "location",
      string
    >
  >;
  listingId?: string;
};

export type ListingStatusState = {
  success: boolean;
  message?: string;
};

function parseListingFormData(formData: FormData) {
  const rawPrice = formData.get("price");
  return {
    title: formData.get("title"),
    author: formData.get("author"),
    categoryId: formData.get("categoryId") || undefined,
    description: formData.get("description") || undefined,
    condition: formData.get("condition"),
    listingType: formData.get("listingType"),
    price: rawPrice && rawPrice !== "" ? rawPrice : undefined,
    location: formData.get("location"),
  };
}

function collectFieldErrors(error: z.ZodError): NonNullable<ListingFormState["fieldErrors"]> {
  const fieldErrors: ListingFormState["fieldErrors"] = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof NonNullable<ListingFormState["fieldErrors"]>;
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function createListing(
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "বই তালিকাভুক্ত করতে হলে আগে লগইন করুন।" };
  }

  const parsed = listingSchema.safeParse(parseListingFormData(formData));
  if (!parsed.success) {
    return { success: false, message: "ফর্মে কিছু তথ্য ঠিক নেই।", fieldErrors: collectFieldErrors(parsed.error) };
  }

  const { title, author, categoryId, description, condition, listingType, price, location } = parsed.data;

  const listing = await prisma.listing.create({
    data: {
      sellerId: session.user.id,
      title,
      author,
      categoryId: categoryId ?? null,
      description: description ?? null,
      condition,
      listingType,
      price: listingType === "SELL" ? price ?? null : null,
      location,
    },
  });

  const publicIds = readPhotoPublicIds(formData);
  let photoNote = "";
  if (publicIds.length > 0) {
    const attached = await attachPhotosToListing(listing.id, publicIds);
    // The listing itself is already created, so a photo problem downgrades to
    // a note rather than failing the whole submission.
    if (!attached.success) photoNote = ` তবে ছবি যোগ করা যায়নি: ${attached.message ?? ""}`;
  }

  revalidatePath("/marketplace");
  revalidatePath("/marketplace/mine");

  return {
    success: true,
    message: `আপনার তালিকাটি প্রকাশিত হয়েছে।${photoNote}`,
    listingId: listing.id,
  };
}

export async function updateListing(
  listingId: string,
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "তালিকা সম্পাদনা করতে হলে আগে লগইন করুন।" };
  }

  const existing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!existing) {
    return { success: false, message: "তালিকাটি খুঁজে পাওয়া যায়নি।" };
  }
  if (existing.sellerId !== session.user.id) {
    return { success: false, message: "শুধু বিক্রেতা নিজেই এই তালিকাটি সম্পাদনা করতে পারবেন।" };
  }

  const parsed = listingSchema.safeParse(parseListingFormData(formData));
  if (!parsed.success) {
    return { success: false, message: "ফর্মে কিছু তথ্য ঠিক নেই।", fieldErrors: collectFieldErrors(parsed.error) };
  }

  const { title, author, categoryId, description, condition, listingType, price, location } = parsed.data;

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      title,
      author,
      categoryId: categoryId ?? null,
      description: description ?? null,
      condition,
      listingType,
      price: listingType === "SELL" ? price ?? null : null,
      location,
    },
  });

  const publicIds = readPhotoPublicIds(formData);
  let photoNote = "";
  if (publicIds.length > 0) {
    const attached = await attachPhotosToListing(listingId, publicIds);
    if (!attached.success) photoNote = ` তবে নতুন ছবি যোগ করা যায়নি: ${attached.message ?? ""}`;
  }

  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${listingId}`);
  revalidatePath("/marketplace/mine");

  return { success: true, message: `তালিকাটি আপডেট করা হয়েছে।${photoNote}` };
}

export async function updateListingStatus(
  listingId: string,
  status: "AVAILABLE" | "RESERVED" | "COMPLETED" | "REMOVED"
): Promise<ListingStatusState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "অবস্থা পরিবর্তন করতে হলে আগে লগইন করুন।" };
  }

  const parsedStatus = statusEnum.safeParse(status);
  if (!parsedStatus.success) {
    return { success: false, message: "অনুরোধটি সঠিক নয়।" };
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return { success: false, message: "তালিকাটি খুঁজে পাওয়া যায়নি।" };
  }
  if (listing.sellerId !== session.user.id) {
    return { success: false, message: "শুধু বিক্রেতা নিজেই এই তালিকার অবস্থা পরিবর্তন করতে পারবেন।" };
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: parsedStatus.data },
  });

  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${listingId}`);
  revalidatePath("/marketplace/mine");

  return { success: true };
}
