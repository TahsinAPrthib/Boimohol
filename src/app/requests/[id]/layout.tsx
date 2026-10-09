import { notFound } from "next/navigation";
import { loadRequest } from "@/lib/loaders";

// Above this route's loading skeleton, so a missing request is a real 404.
export default async function RequestLayout(props: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  if (!(await loadRequest(id))) notFound();
  return props.children;
}
