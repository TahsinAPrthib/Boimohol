import { requireUserId } from "@/lib/authz";

export default async function NewListingLayout({ children }: { children: React.ReactNode }) {
  await requireUserId("/marketplace/new");
  return children;
}
