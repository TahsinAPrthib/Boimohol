import type { ModerationActionType } from "@prisma/client";

// Shown to a seller wherever their admin-removed listing appears, and the
// refusal every seller-side listing action gives for one. Only an admin's
// removal is final; a seller can still remove and restore their own.
export const ADMIN_REMOVED_NOTICE =
  "একজন অ্যাডমিন এই তালিকাটি সরিয়ে দিয়েছেন। এটি আর সম্পাদনা বা আবার প্রকাশ করা যাবে না।";

export const MODERATION_ACTION_LABEL: Record<ModerationActionType, string> = {
  REMOVE_LISTING: "তালিকা সরানো হয়েছে",
  DELETE_REVIEW: "পর্যালোচনা মুছে ফেলা হয়েছে",
  DELETE_REQUEST: "অনুরোধ মুছে ফেলা হয়েছে",
  SUSPEND_USER: "অ্যাকাউন্ট স্থগিত",
  UNSUSPEND_USER: "স্থগিতাদেশ তুলে নেওয়া হয়েছে",
  DELETE_USER: "অ্যাকাউন্ট মুছে ফেলা হয়েছে",
};
