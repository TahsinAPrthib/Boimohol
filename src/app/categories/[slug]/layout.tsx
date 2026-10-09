import { notFound } from "next/navigation";
import { loadCategory } from "@/lib/loaders";

// Above this route's loading skeleton, so a missing category is a real 404.
export default async function CategoryLayout(props: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  if (!(await loadCategory(slug))) notFound();
  return props.children;
}
