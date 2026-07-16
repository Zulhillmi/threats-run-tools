import type { Category } from "@/lib/types";
import { getToolsByCategory } from "@/data/catalog";

export function CategoryCard({ category }: { category: Category }) {
  const count = getToolsByCategory(category.slug).length;
  return <a className="card category-card" href={`/categories/${category.slug}/`}><span className="kicker">{count} tools</span><h3>{category.name}</h3><p>{category.description}</p></a>;
}
