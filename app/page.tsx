import { categories, getPublishedTools } from "@/data/catalog";
import { ToolCard } from "@/components/ToolCard";
import { CategoryCard } from "@/components/CategoryCard";
import { siteConfig } from "@/lib/config";
import { HomeArticles } from "@/components/HomeArticles";

export default function HomePage() {
  const tools = getPublishedTools();
  const featured = tools.filter((tool) => tool.featured).slice(0, 6);
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Cybersecurity tools directory</p>
        <h1>Find security tools worth using.</h1>
        <p className="lede">A curated Threats.run directory for CTI, OSINT, malware analysis, detection engineering, Web3 security, and vulnerability prioritization.</p>
        <form className="hero-search" action="/tools/" role="search">
          <input className="field" name="q" placeholder="Search urlscan, YARA, KEV, malware…" />
          <button className="button" type="submit">Search tools</button>
        </form>
        <div className="cta-row">
          <a className="button secondary" href="/tools/">Browse directory</a>
          <a className="button ghost" href="/submit/">Submit a tool</a>
        </div>
        <div className="stats">
          <div className="stat"><strong>{tools.length}</strong><span>curated tools</span></div>
          <div className="stat"><strong>{categories.length}</strong><span>security workflows</span></div>
          <div className="stat"><strong>CTI</strong><span>operator focused</span></div>
          <div className="stat"><strong>Open</strong><span>community submissions</span></div>
        </div>
      </section>
      <section className="section shell">
        <div className="section-head"><div><p className="kicker">Featured</p><h2>Analyst-ready picks</h2></div><a className="button ghost" href="/tools/">View all</a></div>
        <div className="grid">{featured.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div>
      </section>
      <HomeArticles />
      <section className="section shell">
        <div className="section-head"><div><p className="kicker">Categories</p><h2>Browse by workflow</h2></div></div>
        <div className="grid">{categories.map((category) => <CategoryCard key={category.slug} category={category} />)}</div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: siteConfig.name, url: siteConfig.siteUrl, potentialAction: { "@type": "SearchAction", target: `${siteConfig.siteUrl}/tools/?q={search_term_string}`, "query-input": "required name=search_term_string" } }) }} />
    </>
  );
}
