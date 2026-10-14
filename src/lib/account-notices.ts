// What the site says about accounts that are suspended or gone. Plain
// strings with no imports, so client components can use them too.

// The error code authorize() throws for a suspended account (a fixed code:
// NextAuth passes it to the browser as result.error), and what the login
// page shows for it.
export const ACCOUNT_SUSPENDED = "AccountSuspended";
export const ACCOUNT_SUSPENDED_MESSAGE =
  "আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে, তাই এখন লগইন করা যাবে না। ভুল হয়েছে মনে হলে tahsinaparthib1@gmail.com ঠিকানায় ইমেইল করুন।";

// Other sign-in refusals, as error codes the login page turns into Bangla.
// They reach it as result.error (email/password) or ?error= (Google, which
// leaves the site and comes back through NextAuth).
export const GOOGLE_ONLY_ACCOUNT = "GoogleOnlyAccount";
export const GOOGLE_EMAIL_IN_USE = "GoogleEmailInUse";
export const GOOGLE_EMAIL_UNVERIFIED = "GoogleEmailUnverified";
export const SIGN_IN_SERVER_ERROR = "ServerError";

const CONTACT = "tahsinaparthib1@gmail.com";

export function loginErrorMessage(code: string): string {
  switch (code) {
    case "CredentialsSignin":
      return "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।";
    case ACCOUNT_SUSPENDED:
      return ACCOUNT_SUSPENDED_MESSAGE;
    case GOOGLE_ONLY_ACCOUNT:
      return "এই অ্যাকাউন্টটি Google দিয়ে খোলা, এতে কোনো পাসওয়ার্ড নেই। “Google দিয়ে চালিয়ে যান” বোতাম দিয়ে লগইন করুন।";
    case GOOGLE_EMAIL_IN_USE:
      return `এই ইমেইল দিয়ে আগে থেকেই একটি অ্যাকাউন্ট আছে, তাই Google দিয়ে নতুন অ্যাকাউন্ট খোলা হয়নি। অ্যাকাউন্টটি আপনার হলে পাসওয়ার্ড দিয়ে লগইন করুন, তারপর সেটিংস থেকে Google যুক্ত করুন। অ্যাকাউন্টটি আপনার না হলে ${CONTACT} ঠিকানায় আমাদের জানান।`;
    case GOOGLE_EMAIL_UNVERIFIED:
      return "এই Google অ্যাকাউন্টের ইমেইল ঠিকানাটি Google-এ যাচাই করা নেই, তাই এটি দিয়ে লগইন করা যাচ্ছে না।";
    case SIGN_IN_SERVER_ERROR:
      return "সার্ভারে সাময়িক সমস্যা হয়েছে, তাই এখন লগইন করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।";
    default:
      // NextAuth's own codes for a failed or cancelled Google round trip
      // (OAuthSignin, OAuthCallback, Callback, AccessDenied, ...).
      return "Google দিয়ে লগইন করা যায়নি। আবার চেষ্টা করুন।";
  }
}

// How someone whose account has been deleted is shown wherever something
// they left behind is still visible to others (messages they sent).
export const DELETED_USER_LABEL = "মুছে ফেলা ব্যবহারকারী";
export const DELETED_PARTNER_NOTICE =
  "এই ব্যবহারকারীর অ্যাকাউন্ট মুছে ফেলা হয়েছে, তাই এই আলাপে নতুন বার্তা পাঠানো যাবে না।";
