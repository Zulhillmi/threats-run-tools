import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategoryBySlug, getToolsByCategory } from "@/data/catalog";
import { absoluteUrl } from "@/lib/config";
import { CategoryToolExplorer } from "@/components/CategoryToolExplorer";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() { return categories.map((category) => ({ slug: category.slug })); }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.seoTitle,
    description: category.description,
    alternates: { canonical: absoluteUrl(`/categories/${category.slug}/`) },
    openGraph: { title: category.seoTitle, description: category.description, url: absoluteUrl(`/categories/${category.slug}/`), type: "website" },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();
  const tools = getToolsByCategory(category.slug);
  const categoryNamesBySlug = Object.fromEntries(categories.map((item) => [item.slug, item.name]));

  return (
    <>
      <section className="category-hero shell category-wide-shell">
        <div className="breadcrumbs"><a href="/tools/">Tools</a><span>/</span><span>{category.name}</span></div>
        <div className="category-simple-head">
          <div>
            <h1>{category.name}</h1>
            <p>{category.description}</p>
          </div>
          <div className="category-count"><strong>{tools.length}</strong><span>listings</span></div>
        </div>
      </section>

      <section className="section shell category-wide-shell category-main-only">
        <CategoryToolExplorer tools={tools} categoryName={category.name} categoryNamesBySlug={categoryNamesBySlug} />
      </section>
    </>
  );
}
