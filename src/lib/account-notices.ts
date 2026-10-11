// What the site says about accounts that are suspended or gone. Plain
// strings with no imports, so client components can use them too.

// The error code authorize() throws for a suspended account (a fixed code:
// NextAuth passes it to the browser as result.error), and what the login
// page shows for it.
export const ACCOUNT_SUSPENDED = "AccountSuspended";
export const ACCOUNT_SUSPENDED_MESSAGE =
  "আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে, তাই এখন লগইন করা যাবে না। ভুল হয়েছে মনে হলে tahsinaparthib1@gmail.com ঠিকানায় ইমেইল করুন।";

// How someone whose account has been deleted is shown wherever something
// they left behind is still visible to others (messages they sent).
export const DELETED_USER_LABEL = "মুছে ফেলা ব্যবহারকারী";
export const DELETED_PARTNER_NOTICE =
  "এই ব্যবহারকারীর অ্যাকাউন্ট মুছে ফেলা হয়েছে, তাই এই আলাপে নতুন বার্তা পাঠানো যাবে না।";
