import { requireUserId } from "@/lib/authz";

export default async function MyRequestsLayout({ children }: { children: React.ReactNode }) {
  await requireUserId("/requests/mine");
  return children;
}
