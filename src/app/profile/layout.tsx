import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/authz";
import { loadProfileUser } from "@/lib/loaders";
import { withCallbackUrl } from "@/lib/safe-redirect";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireUserId("/profile");
  // A session for an account that no longer exists is treated as signed out.
  if (!(await loadProfileUser(userId))) redirect(withCallbackUrl("/login", "/profile"));
  return children;
}
