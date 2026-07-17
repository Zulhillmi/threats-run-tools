import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getPublishedTools, getToolBySlug, getCategoryNames } from "@/data/catalog";
import { absoluteUrl } from "@/lib/config";
import { ToolLogo } from "@/components/ToolLogo";
import { ToolEngagement, ToolReviews } from "@/components/ToolEngagement";
import type { Tool } from "@/lib/types";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() { return getPublishedTools().map((tool) => ({ slug: tool.slug })); }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  const image = tool.screenshotUrl || tool.imageUrl || "/logo-tr.png";
  return {
    title: `${tool.name} — ${tool.tagline}`,
    description: tool.description,
    alternates: { canonical: absoluteUrl(`/tools/${tool.slug}/`) },
    openGraph: {
      title: `${tool.name} — ${tool.tagline}`,
      description: tool.description,
      url: absoluteUrl(`/tools/${tool.slug}/`),
      type: "article",
      images: [{ url: absoluteUrl(image), alt: `${tool.name} screenshot` }],
    },
    twitter: { card: "summary_large_image", title: tool.name, description: tool.description, images: [absoluteUrl(image)] },
  };
}

function formatPricing(value: Tool["pricingModel"]) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function outbound(tool: Tool, url: string, source: string) {
  return `/api/outbound/?tool=${encodeURIComponent(tool.slug)}&url=${encodeURIComponent(url)}&source=${encodeURIComponent(source)}`;
}

function featureList(tool: Tool) {
  const categories = getCategoryNames(tool.categorySlugs);
  const tags = tool.tags.slice(0, 3).join(", ");
  return [
    `Built for ${categories.slice(0, 2).join(" and ").toLowerCase()} workflows.`,
    `Useful when evaluating ${tool.toolType.toLowerCase()} capabilities.`,
    tags ? `Helpful for ${tags} investigations and triage.` : `Useful for practical security operations and research.`,
  ];
}

function bestFor(tool: Tool) {
  const map: Record<string, string> = {
    cti: "Threat intelligence analysts enriching indicators, checking reputation, and pivoting from weak signals into stronger context.",
    "security-vendors": "Security teams comparing vendor platforms for threat intelligence, exposure monitoring, malware research, and operational workflows.",
    osint: "Investigators collecting public web, domain, URL, identity, and infrastructure evidence.",
    "malware-analysis": "Malware researchers triaging samples, hashes, families, strings, and behavioural clues.",
    "detection-engineering": "Detection engineers building, testing, translating, or mapping rules across SOC workflows.",
    "web3-security": "Crypto investigators tracking wallets, scams, phishing, token risk, and abuse reports.",
    "vulnerability-management": "Security teams prioritising vulnerabilities with exposure and real-world exploitation signals.",
    "attack-surface": "Teams finding exposed assets, technologies, services, and externally visible risk.",
  };
  const mapped = tool.categorySlugs.map((slug) => map[slug]).filter(Boolean);
  return mapped.length ? mapped.slice(0, 4) : [`Security teams evaluating ${tool.toolType.toLowerCase()} workflows.`];
}

function faqList(tool: Tool) {
  if (tool.faqs?.length) return tool.faqs;
  const categories = getCategoryNames(tool.categorySlugs).join(", ").toLowerCase();
  return [
    {
      question: `What is ${tool.name} used for?`,
      answer: `${tool.name} is used for ${tool.toolType.toLowerCase()} workflows. ${tool.description}`,
    },
    {
      question: `Is ${tool.name} free?`,
      answer: `The listed pricing model is ${formatPricing(tool.pricingModel)}. Check the official site for exact plan limits, usage restrictions, and current commercial terms.`,
    },
    {
      question: `Which teams should evaluate ${tool.name}?`,
      answer: `It is most relevant to teams working across ${categories || tool.toolType.toLowerCase()} workflows.`,
    },
    {
      question: `What are alternatives to ${tool.name}?`,
      answer: `Start with the similar tools section on this page. It highlights tools with overlapping categories, tags, and operational use cases.`,
    },
  ];
}

function relatedTools(tool: Tool) {
  return getPublishedTools()
    .filter((item) => item.slug !== tool.slug)
    .map((item) => {
      const categoryOverlap = item.categorySlugs.filter((category) => tool.categorySlugs.includes(category)).length;
      const tagOverlap = item.tags.filter((tag) => tool.tags.includes(tag)).length;
      const typeOverlap = item.toolType === tool.toolType ? 1 : 0;
      const pricingOverlap = item.pricingModel === tool.pricingModel ? 1 : 0;
      const score = categoryOverlap * 5 + tagOverlap * 3 + typeOverlap * 3 + pricingOverlap;
      return { item, score, categoryOverlap, tagOverlap, typeOverlap };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, 6);
}

function sourceLinks(tool: Tool) {
  return [
    { label: "Official website", href: outbound(tool, tool.websiteUrl, "detail_source_website") },
    ...(tool.githubUrl ? [{ label: "GitHub", href: outbound(tool, tool.githubUrl, "detail_source_github") }] : []),
    ...(tool.docsUrl ? [{ label: "Docs", href: outbound(tool, tool.docsUrl, "detail_source_docs") }] : []),
  ];
}

export default async function ToolDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const categories = getCategoryNames(tool.categorySlugs);
  const primaryCategory = getCategoryBySlug(tool.categorySlugs[0]);
  const related = relatedTools(tool);
  const features = featureList(tool);
  const useCases = bestFor(tool);
  const faqs = faqList(tool);
  const visualUrl = tool.screenshotUrl || tool.imageUrl;
  const sources = sourceLinks(tool);
  const pricingLabel = formatPricing(tool.pricingModel);

  return (
    <>
      <section className="tool-hero shell revamped-tool-page">
        <div className="breadcrumbs">
          <a href="/tools/">Tools</a>
          {primaryCategory && <><span>/</span><a href={`/categories/${primaryCategory.slug}/`}>{primaryCategory.name}</a></>}
          <span>/</span><span>{tool.name}</span>
        </div>
        <div className="tool-hero-grid tool-profile-hero">
          <div className="tool-hero-copy">
            <div className="tag-row compact"><span className="pill accent">{tool.toolType}</span><span className="pill">{pricingLabel}</span>{tool.featured && <span className="pill">Featured</span>}</div>
            <div className="tool-detail-title-row"><ToolLogo name={tool.name} websiteUrl={tool.websiteUrl} logoUrl={tool.logoUrl} /><h1>{tool.name}</h1></div>
            <p className="lede flush">{tool.tagline}</p>
            <p className="tool-summary">{tool.description}</p>
            <div className="tool-trust-strip" aria-label="Tool facts">
              <span>{categories[0] || "Security tool"}</span>
              <span>{pricingLabel}</span>
              <span>{tool.githubUrl ? "Source available" : "Official site listed"}</span>
              <span>Community voting</span>
            </div>
            <div className="cta-row left">
              <a className="button" href={outbound(tool, tool.websiteUrl, "detail_hero_cta")} rel="nofollow">Visit website</a>
              {tool.githubUrl && <a className="button ghost" href={outbound(tool, tool.githubUrl, "detail_github")} rel="nofollow">View GitHub</a>}
              {tool.docsUrl && <a className="button ghost" href={outbound(tool, tool.docsUrl, "detail_docs")} rel="nofollow">Docs</a>}
            </div>
          </div>
          <a className="tool-hero-media tool-hero-media-link" href={outbound(tool, tool.websiteUrl, "detail_hero_image")} rel="nofollow" aria-label={`Visit ${tool.name} website`}>
            {visualUrl && <img src={visualUrl} alt="" />}
            <span className="tool-image-banner">Visit site</span>
            <ToolLogo name={tool.name} websiteUrl={tool.websiteUrl} logoUrl={tool.logoUrl} className="tool-hero-logo" size="hero" />
          </a>
        </div>
      </section>

      <section className="section shell tool-detail-layout tool-detail-revamp">
        <article className="tool-content">
          <div className="content-card detail-intro-card">
            <p className="kicker">Overview</p>
            <h2>What {tool.name} is good for</h2>
            <p>{tool.description}</p>
            <div className="feature-grid feature-grid-readable">
              {features.map((feature) => <div className="mini-card feature-card" key={feature}><span>✓</span><p>{feature}</p></div>)}
            </div>
          </div>

          <div className="content-card decision-card">
            <p className="kicker">Evaluation guide</p>
            <h2>Quick decision notes</h2>
            <div className="decision-grid">
              <div><strong>Best fit</strong><p>{useCases[0] || `Teams evaluating ${tool.toolType.toLowerCase()} workflows.`}</p></div>
              <div><strong>Check before using</strong><p>Confirm current pricing, data limits, account requirements, and licensing on the official site before production use.</p></div>
              <div><strong>Typical inputs</strong><p>{tool.tags.slice(0, 4).map((tag) => `#${tag}`).join(" · ") || "Security evidence, assets, indicators, or workflow data."}</p></div>
              <div><strong>Discovery path</strong><p>Use the categories, source links, and similar tools below to compare it with nearby options.</p></div>
            </div>
          </div>

          <div className="content-card">
            <p className="kicker">Use cases</p>
            <h2>Where it fits</h2>
            <div className="usecase-list readable-usecases">
              {useCases.map((item) => <div className="usecase" key={item}>{item}</div>)}
            </div>
          </div>

          <div className="content-card">
            <p className="kicker">Classification</p>
            <h2>Categories and tags</h2>
            <div className="tag-row classification-tags">{categories.map((name) => <span className="tag" key={name}>{name}</span>)}{tool.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div>
          </div>

          <div className="content-card source-card">
            <p className="kicker">Sources</p>
            <h2>Official links and checks</h2>
            <p>Use these links to verify current plans, access requirements, documentation, releases, and support status.</p>
            <div className="source-link-grid">
              {sources.map((source) => <a key={source.label} href={source.href} rel="nofollow">{source.label}<span>Tracked visit</span></a>)}
            </div>
          </div>

          <div className="content-card sponsor-inline-card">
            <p className="kicker">Sponsored</p>
            <h2>Reach security teams evaluating tools like {tool.name}</h2>
            <p>Promote relevant security tooling, research, or category resources to analysts comparing tools in this workflow.</p>
            <a className="button ghost" href="/submit/">Sponsor or update a listing</a>
          </div>

          {related.length > 0 && <div className="content-card similar-tools-card">
            <p className="kicker">Alternatives and related tools</p>
            <h2>Similar tools</h2>
            <div className="similar-tool-grid">
              {related.map(({ item, categoryOverlap, tagOverlap, typeOverlap }) => (
                <a className="similar-tool-card" href={`/tools/${item.slug}/`} key={item.slug}>
                  <div className="similar-tool-head"><ToolLogo name={item.name} websiteUrl={item.websiteUrl} logoUrl={item.logoUrl} /><strong>{item.name}</strong></div>
                  <p>{item.tagline}</p>
                  <span>{categoryOverlap ? `${categoryOverlap} shared categor${categoryOverlap === 1 ? "y" : "ies"}` : typeOverlap ? "Same tool type" : `${tagOverlap} shared tag${tagOverlap === 1 ? "" : "s"}`}</span>
                </a>
              ))}
            </div>
          </div>}

          <div className="content-card reviews-content-card">
            <p className="kicker">Reviews</p>
            <h2>Community reviews and comments</h2>
            <ToolReviews slug={tool.slug} name={tool.name} />
          </div>

          <div className="content-card faq-card">
            <p className="kicker">FAQ</p>
            <h2>Questions about {tool.name}</h2>
            <div className="faq-list">
              {faqs.map((faq) => <details className="faq-item" key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
            </div>
          </div>

          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: tool.name, description: tool.description, applicationCategory: tool.toolType, offers: { "@type": "Offer", price: tool.pricingModel === "paid" || tool.pricingModel === "enterprise" ? undefined : "0" }, url: tool.websiteUrl }, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }]) }} />
        </article>

        <aside className="tool-sidebar">
          <div className="card sticky-card tool-quick-facts">
            <p className="kicker">At a glance</p>
            <dl className="facts">
              <div><dt>Type</dt><dd>{tool.toolType}</dd></div>
              <div><dt>Pricing</dt><dd>{pricingLabel}</dd></div>
              <div><dt>Categories</dt><dd>{categories.join(", ")}</dd></div>
              <div><dt>Listed status</dt><dd>{tool.status}</dd></div>
            </dl>
            <a className="button full" href={outbound(tool, tool.websiteUrl, "detail_sidebar_cta")} rel="nofollow">Open website</a>
            <a className="button ghost full" href="/submit/">Suggest an update</a>
          </div>

          <div className="card tool-sidebar-card engagement-card">
            <p className="kicker">Community signal</p>
            <ToolEngagement slug={tool.slug} name={tool.name} />
          </div>

          <div className="card tool-sidebar-card sponsor-card">
            <p className="kicker">Sponsor slot</p>
            <h3>Advertise here</h3>
            <p>Contextual sponsor placement for teams comparing {categories[0]?.toLowerCase() || "security"} tools.</p>
            <a href="/submit/">Claim or sponsor listing</a>
          </div>
        </aside>
      </section>
    </>
  );
}
