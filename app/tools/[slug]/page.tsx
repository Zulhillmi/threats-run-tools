import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getPublishedTools, getToolBySlug, getCategoryNames } from "@/data/catalog";
import { absoluteUrl } from "@/lib/config";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() { return getPublishedTools().map((tool) => ({ slug: tool.slug })); }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return { title: `${tool.name} — ${tool.tagline}`, description: tool.description, alternates: { canonical: absoluteUrl(`/tools/${tool.slug}/`) } };
}

function featureList(tool: ReturnType<typeof getPublishedTools>[number]) {
  const categories = getCategoryNames(tool.categorySlugs);
  return [
    `Built for ${categories.slice(0, 2).join(" and ").toLowerCase()} workflows.`,
    `Useful for teams evaluating ${tool.toolType.toLowerCase()} capabilities.`,
    `Tagged for ${tool.tags.slice(0, 3).join(", ")} investigations.`,
  ];
}

function bestFor(tool: ReturnType<typeof getPublishedTools>[number]) {
  const map: Record<string, string> = {
    cti: "Threat intel analysts enriching indicators and pivoting from weak signals into stronger context.",
    "security-vendors": "Security teams comparing vendor platforms for threat intelligence, exposure monitoring, malware research, and operational security workflows.",
    osint: "Investigators collecting public web, domain, URL, and infrastructure evidence.",
    "malware-analysis": "Malware researchers triaging samples, hashes, families, and behavioural clues.",
    "detection-engineering": "Detection engineers building, testing, or mapping rules across SOC workflows.",
    "web3-security": "Crypto investigators tracking wallets, scams, phishing, and abuse reports.",
    "vulnerability-management": "Security teams prioritising vulnerabilities with real-world exploitation signals.",
  };
  return tool.categorySlugs.map((slug) => map[slug]).filter(Boolean).slice(0, 3);
}

function faqList(tool: ReturnType<typeof getPublishedTools>[number]) {
  if (tool.faqs?.length) return tool.faqs;
  return [
    {
      question: `What is ${tool.name} used for?`,
      answer: `${tool.name} is used for ${tool.toolType.toLowerCase()} workflows. ${tool.description}`
    },
    {
      question: `Is ${tool.name} free?`,
      answer: `The listed pricing model is ${tool.pricingModel}. Check the official site for exact plan limits, enterprise packaging, and current commercial terms.`
    },
    {
      question: `Which teams should evaluate ${tool.name}?`,
      answer: `It is most relevant to teams working across ${getCategoryNames(tool.categorySlugs).join(", ").toLowerCase()} workflows.`
    }
  ];
}

export default async function ToolDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const categories = getCategoryNames(tool.categorySlugs);
  const primaryCategory = getCategoryBySlug(tool.categorySlugs[0]);
  const related = getPublishedTools()
    .filter((item) => item.slug !== tool.slug && item.categorySlugs.some((category) => tool.categorySlugs.includes(category)))
    .slice(0, 3);
  const features = featureList(tool);
  const useCases = bestFor(tool);
  const faqs = faqList(tool);

  return (
    <>
      <section className="tool-hero shell">
        <div className="breadcrumbs">
          <a href="/tools/">Tools</a>
          {primaryCategory && <><span>/</span><a href={`/categories/${primaryCategory.slug}/`}>{primaryCategory.name}</a></>}
          <span>/</span><span>{tool.name}</span>
        </div>
        <div className="tool-hero-grid">
          <div className="tool-hero-copy">
            <div className="tag-row compact"><span className="pill accent">{tool.toolType}</span><span className="pill">{tool.pricingModel}</span>{tool.featured && <span className="pill">Featured</span>}</div>
            <h1>{tool.name}</h1>
            <p className="lede flush">{tool.tagline}</p>
            <p className="tool-summary">{tool.description}</p>
            <div className="cta-row left"><a className="button" href={`/api/outbound?tool=${encodeURIComponent(tool.slug)}&url=${encodeURIComponent(tool.websiteUrl)}`} rel="nofollow">Visit official site</a>{tool.githubUrl && <a className="button ghost" href={tool.githubUrl}>View GitHub</a>}{tool.docsUrl && <a className="button ghost" href={tool.docsUrl}>Docs</a>}</div>
          </div>
          <div className="tool-hero-media">{tool.imageUrl && <img src={tool.imageUrl} alt="" />}</div>
        </div>
      </section>

      <section className="section shell tool-detail-layout">
        <article className="tool-content">
          <div className="content-card">
            <p className="kicker">Overview</p>
            <h2>What {tool.name} is good for</h2>
            <p>{tool.description}</p>
            <div className="feature-grid">
              {features.map((feature) => <div className="mini-card" key={feature}><span>✓</span><p>{feature}</p></div>)}
            </div>
          </div>

          <div className="content-card">
            <p className="kicker">Use cases</p>
            <h2>Where it fits</h2>
            <div className="usecase-list">
              {useCases.map((item) => <div className="usecase" key={item}>{item}</div>)}
            </div>
          </div>

          <div className="content-card">
            <p className="kicker">Classification</p>
            <h2>Categories and tags</h2>
            <div className="tag-row">{categories.map((name) => <span className="tag" key={name}>{name}</span>)}{tool.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div>
          </div>

          <div className="content-card faq-card">
            <p className="kicker">FAQ</p>
            <h2>Questions about {tool.name}</h2>
            <div className="faq-list">
              {faqs.map((faq) => <details className="faq-item" key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
            </div>
          </div>

          {related.length > 0 && <div className="content-card"><p className="kicker">Related</p><h2>Similar tools</h2><div className="related-list">{related.map((item) => <a href={`/tools/${item.slug}/`} key={item.slug}><strong>{item.name}</strong><span>{item.tagline}</span></a>)}</div></div>}

          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: tool.name, description: tool.description, applicationCategory: tool.toolType, offers: { "@type": "Offer", price: tool.pricingModel === "paid" || tool.pricingModel === "enterprise" ? undefined : "0" }, url: tool.websiteUrl }, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }]) }} />
        </article>

        <aside className="tool-sidebar">
          <div className="card sticky-card">
            <p className="kicker">At a glance</p>
            <dl className="facts">
              <div><dt>Type</dt><dd>{tool.toolType}</dd></div>
              <div><dt>Pricing</dt><dd>{tool.pricingModel}</dd></div>
              <div><dt>Categories</dt><dd>{categories.join(", ")}</dd></div>
            </dl>
            <a className="button full" href={`/api/outbound?tool=${encodeURIComponent(tool.slug)}&url=${encodeURIComponent(tool.websiteUrl)}`} rel="nofollow">Open website</a>
            <a className="button ghost full" href="/submit/">Suggest an update</a>
          </div>
        </aside>
      </section>
    </>
  );
}
