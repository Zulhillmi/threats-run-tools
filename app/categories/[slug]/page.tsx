import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategoryBySlug, getCategoryNames, getToolsByCategory } from "@/data/catalog";
import { absoluteUrl } from "@/lib/config";

type Params = Promise<{ slug: string }>;

const categoryGuides: Record<string, { intro: string; selection: string[]; workflows: string[] }> = {
  cti: {
    intro: "Threat intelligence tools should help analysts move from raw indicators to decisions: enrichment, pivots, context, confidence, and actionability. This category groups tools that support IOC triage, infrastructure investigation, malware context, exploited vulnerability prioritisation, and adversary behaviour mapping.",
    selection: ["Indicator enrichment and pivoting", "Evidence quality and source transparency", "Analyst workflow fit", "Free/community access where possible"],
    workflows: ["Enrich suspicious URLs, domains, files, and wallet activity", "Map findings to TTPs and detection opportunities", "Prioritise vulnerability response with exploitation context"],
  },
  osint: {
    intro: "OSINT tools help investigators collect public evidence without jumping straight into paid platforms. Use this workflow for URLs, infrastructure, domains, exposed assets, personas, and web artefacts.",
    selection: ["Public data coverage", "Investigation pivots", "Export/shareability", "Low-friction access"],
    workflows: ["Investigate suspicious infrastructure", "Capture web evidence safely", "Pivot across domains, redirects, and certificates"],
  },
  "malware-analysis": {
    intro: "Malware analysis tools help researchers classify samples, understand behaviours, and connect hashes or families to wider campaigns.",
    selection: ["Sample intelligence", "Rule/signature support", "Family and tag context", "Researcher usability"],
    workflows: ["Triage suspicious files", "Create detection logic", "Track malware family relationships"],
  },
  "detection-engineering": {
    intro: "Detection engineering tools support rule writing, testing, translation, and coverage mapping so teams can convert intelligence into detections.",
    selection: ["Detection portability", "Rule quality", "Coverage mapping", "SOC workflow fit"],
    workflows: ["Write portable detection rules", "Map coverage to ATT&CK", "Turn CTI into deployable SIEM content"],
  },
  "web3-security": {
    intro: "Web3 security tools help teams investigate wallets, scams, malicious contracts, phishing infrastructure, and abuse reports across crypto ecosystems.",
    selection: ["Wallet and transaction context", "Scam/report coverage", "Investigation pivots", "Community signal"],
    workflows: ["Triage suspicious wallets", "Track scam infrastructure", "Collect abuse reports for investigations"],
  },
  "vulnerability-management": {
    intro: "Vulnerability management tools help teams prioritise remediation using exploitation, exposure, and contextual risk instead of CVSS alone.",
    selection: ["Exploitation evidence", "Prioritisation signal", "Operational clarity", "Update cadence"],
    workflows: ["Prioritise known exploited vulnerabilities", "Enrich CVE triage", "Support patch and exposure decisions"],
  },
};

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
  const guide = categoryGuides[category.slug];
  const pricing = Array.from(new Set(tools.map((tool) => tool.pricingModel)));

  return (
    <>
      <section className="category-hero shell">
        <div className="breadcrumbs"><a href="/tools/">Tools</a><span>/</span><span>{category.name}</span></div>
        <div className="category-hero-panel">
          <div>
            <p className="kicker">Workflow</p>
            <h1>{category.seoTitle}</h1>
            <p className="lede flush">{guide?.intro || category.description}</p>
            <div className="cta-row left"><a className="button" href="/tools/">Search all tools</a><a className="button ghost" href="/submit/">Suggest a tool</a></div>
          </div>
          <div className="category-stats">
            <div><strong>{tools.length}</strong><span>tools listed</span></div>
            <div><strong>{pricing.length}</strong><span>pricing models</span></div>
            <div><strong>{tools.filter((tool) => tool.featured).length}</strong><span>featured picks</span></div>
          </div>
        </div>
      </section>

      <section className="section shell category-layout">
        <aside className="category-sidebar">
          <div className="card sticky-card">
            <p className="kicker">How to choose</p>
            <ul className="check-list">{guide?.selection.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="card">
            <p className="kicker">Common workflows</p>
            <ul className="check-list muted">{guide?.workflows.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </aside>

        <div className="category-main">
          <div className="section-head category-head">
            <div><p className="kicker">Curated list</p><h2>{category.name} tools</h2><p>Compare by purpose, pricing, tags, and investigation workflow. These are not ranked yet — the goal is to help pick the right tool for the job.</p></div>
          </div>
          <div className="tool-table">
            {tools.map((tool) => (
              <a className="tool-row" href={`/tools/${tool.slug}/`} key={tool.id}>
                <img src={tool.imageUrl} alt="" />
                <div className="tool-row-main"><strong>{tool.name}</strong><p>{tool.description}</p><div className="tag-row compact">{getCategoryNames(tool.categorySlugs).map((name) => <span className="tag" key={name}>{name}</span>)}{tool.tags.slice(0, 3).map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div></div>
                <div className="tool-row-meta"><span className="pill accent">{tool.toolType}</span><span className="pill">{tool.pricingModel}</span></div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
