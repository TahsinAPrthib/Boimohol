import { requireUserId } from "@/lib/authz";

export default async function NewRequestLayout({ children }: { children: React.ReactNode }) {
  await requireUserId("/requests/new");
  return children;
}
