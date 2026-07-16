import type { Metadata } from "next";
import { categories, getPublishedTools } from "@/data/catalog";
import { ToolCard } from "@/components/ToolCard";

export const metadata: Metadata = { title: "Cybersecurity tools directory", description: "Browse curated CTI, OSINT, malware analysis, detection engineering, Web3 security, and vulnerability management tools." };

export default function ToolsPage() {
  const tools = getPublishedTools();
  return <section className="section shell"><div className="section-head"><div><p className="kicker">Directory</p><h1>Cybersecurity tools</h1><p className="lede" style={{ marginLeft: 0 }}>Curated tools for operators, analysts, malware researchers, detection engineers, and Web3 investigators.</p></div></div><form className="filters" action="/tools/" role="search"><input className="field" name="q" placeholder="Search tools, tags, categories…" /><select className="field" name="category" defaultValue=""><option value="">All categories</option>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></form><div className="grid">{tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div></section>;
}
