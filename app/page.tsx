import { categories, getPublishedTools } from "@/data/catalog";
import { ToolCard } from "@/components/ToolCard";
import { HomeArticles } from "@/components/HomeArticles";

export default function HomePage() {
  const tools = getPublishedTools();
  const featured = tools.filter((tool) => tool.featured).slice(0, 6);
  const categoryCards = categories.map((category) => ({
    ...category,
    count: tools.filter((tool) => tool.categorySlugs.includes(category.slug)).length,
  }));
  return <main>
    <section className="hero shell">
      <p className="eyebrow">Threats.run (TOOLS)</p>
      <h1>Cybersecurity tools for analysts, hunters, and security teams.</h1>
      <p className="lede">A curated directory of investigation, intelligence, malware analysis, detection, Web3 security, and vulnerability management resources.</p>
      <form className="hero-search" action="/tools/" role="search" aria-label="Search cybersecurity tools">
        <input className="field" name="q" type="search" placeholder="Search OSINT, CTI, malware, detection tools…" />
        <button className="button" type="submit">Search tools</button>
      </form>
      <div className="stats">
        <div className="stat"><strong>{tools.length}</strong><span>Curated tools</span></div>
        <div className="stat"><strong>{categories.length}</strong><span>Categories</span></div>
        <div className="stat"><strong>{tools.filter((tool) => tool.pricingModel === "free" || tool.pricingModel === "open-source").length}</strong><span>Free or open resources</span></div>
        <div className="stat"><strong>{tools.filter((tool) => tool.featured).length}</strong><span>Ready picks</span></div>
      </div>
    </section>

    <section className="section shell">
      <div className="section-head">
        <div><p className="kicker">Browse</p><h2>Explore by category</h2></div>
        <a className="button ghost" href="/tools/">All tools</a>
      </div>
      <div className="category-card-grid">
        {categoryCards.map((category) => <a className="category-card" href={`/categories/${category.slug}/`} key={category.slug}>
          <span>{category.count} tools</span>
          <h3>{category.name}</h3>
          <p>{category.description}</p>
        </a>)}
      </div>
    </section>

    <section className="section shell">
      <div className="section-head"><div><p className="kicker">Featured</p><h2>Ready picks</h2></div><a className="button ghost" href="/tools/">Browse directory</a></div>
      <div className="grid">{featured.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}</div>
    </section>

    <HomeArticles />
  </main>;
}
