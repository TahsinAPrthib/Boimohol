import { requireUserId } from "@/lib/authz";

export default async function MyListingsLayout({ children }: { children: React.ReactNode }) {
  await requireUserId("/marketplace/mine");
  return children;
}
