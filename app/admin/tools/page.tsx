import type { Metadata } from "next";
import { getPublishedTools } from "@/data/catalog";

export const metadata: Metadata = { title: "Published tools", robots: { index: false, follow: false } };

export default function AdminToolsPage() {
  const tools = getPublishedTools();
  return <section className="section shell"><p className="kicker">Admin</p><h1>Published tools</h1><div className="admin-list">{tools.map((tool) => <div className="row-card" key={tool.id}><div><strong>{tool.name}</strong><p>{tool.pricingModel} · {tool.toolType}</p></div><a className="button ghost" href={`/tools/${tool.slug}/`}>View</a></div>)}</div></section>;
}
