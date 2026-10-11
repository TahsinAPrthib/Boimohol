import { requireUserId } from "@/lib/authz";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireUserId("/settings");
  return children;
}
