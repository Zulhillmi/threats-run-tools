import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedTools, getToolBySlug, getCategoryNames } from "@/data/catalog";
import { absoluteUrl } from "@/lib/config";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() { return getPublishedTools().map((tool) => ({ slug: tool.slug })); }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return { title: `${tool.name} — ${tool.tagline}`, description: tool.description, alternates: { canonical: absoluteUrl(`/tools/${tool.slug}/`) } };
}

export default async function ToolDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  const categories = getCategoryNames(tool.categorySlugs);
  return <section className="section shell detail"><article className="detail-main"><p className="kicker">{tool.toolType}</p><h1>{tool.name}</h1><p className="lede" style={{ marginLeft: 0 }}>{tool.tagline}</p><p>{tool.description}</p><div className="tag-row">{categories.map((name) => <span className="tag" key={name}>{name}</span>)}{tool.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: tool.name, description: tool.description, applicationCategory: tool.toolType, offers: { "@type": "Offer", price: tool.pricingModel === "paid" || tool.pricingModel === "enterprise" ? undefined : "0" }, url: tool.websiteUrl }) }} /></article><aside className="side"><div className="card"><span className="pill accent">{tool.pricingModel}</span><h3>Visit {tool.name}</h3><p>Outbound clicks are routed through the tracking endpoint when deployed.</p><a className="button" href={`/api/outbound?tool=${encodeURIComponent(tool.slug)}&url=${encodeURIComponent(tool.websiteUrl)}`} rel="nofollow">Open website</a>{tool.githubUrl && <a className="button ghost" href={tool.githubUrl}>GitHub</a>}</div><div className="notice">Want this updated? Submit a correction through the tool submission queue.</div></aside></section>;
}
