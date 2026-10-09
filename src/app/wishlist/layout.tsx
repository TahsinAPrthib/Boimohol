import { requireUserId } from "@/lib/authz";

export default async function WishlistLayout({ children }: { children: React.ReactNode }) {
  await requireUserId("/wishlist");
  return children;
}
