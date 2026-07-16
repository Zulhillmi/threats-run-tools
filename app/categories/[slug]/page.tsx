import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategoryBySlug, getToolsByCategory } from "@/data/catalog";
import { ToolCard } from "@/components/ToolCard";
import { absoluteUrl } from "@/lib/config";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() { return categories.map((category) => ({ slug: category.slug })); }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return { title: category.seoTitle, description: category.description, alternates: { canonical: absoluteUrl(`/categories/${category.slug}/`) } };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();
  const tools = getToolsByCategory(category.slug);
  return <section className="section shell"><p className="kicker">Category</p><h1>{category.seoTitle}</h1><p className="lede" style={{ marginLeft: 0 }}>{category.description}</p><div className="grid">{tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div></section>;
}
