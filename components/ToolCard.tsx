import type { Tool } from "@/lib/types";
import { getCategoryNames } from "@/data/catalog";
import { ToolLogo } from "@/components/ToolLogo";
import { getToolInitials } from "@/lib/tool-logo";

function formatPricing(value: Tool["pricingModel"]) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function ToolCard({ tool, imageMode = "screenshot" }: { tool: Tool; imageMode?: "screenshot" | "feature-art" }) {
  const initials = getToolInitials(tool.name);
  const visualUrl = imageMode === "feature-art" ? tool.imageUrl || tool.screenshotUrl : tool.screenshotUrl || tool.imageUrl;
  const outboundUrl = `/api/outbound/?tool=${encodeURIComponent(tool.slug)}&url=${encodeURIComponent(tool.websiteUrl)}&source=featured_image`;

  return (
    <article className="card tool-card">
      <a className="tool-image-link" href={outboundUrl} aria-label={`Visit ${tool.name} website`}>
        <span className="tool-image-banner">Visit site</span>
        {visualUrl ? (
          <img className="tool-image" src={visualUrl} alt="" loading="lazy" />
        ) : (
          <div className="tool-image fallback-image"><span>{initials}</span></div>
        )}
        <ToolLogo name={tool.name} websiteUrl={tool.websiteUrl} logoUrl={tool.logoUrl} className="tool-image-logo" />
        <span className="tool-image-identity" aria-hidden="true"><strong>{initials}</strong><em>{tool.name}</em></span>
      </a>
      <a className="tool-top" href={`/tools/${tool.slug}/`} aria-label={`View ${tool.name} details`}>
        <ToolLogo name={tool.name} websiteUrl={tool.websiteUrl} logoUrl={tool.logoUrl} />
        <div>
          <h3>{tool.name}</h3>
          <span className="pill accent">{tool.toolType}</span>
        </div>
      </a>
      <p>{tool.tagline}</p>
      <div className="tool-signal-row">
        <span>{formatPricing(tool.pricingModel)}</span>
        {tool.githubUrl && <span>GitHub</span>}
        {tool.websiteUrl.includes("github.com") && !tool.githubUrl && <span>GitHub</span>}
        {tool.tags.slice(0, 1).map((tag) => <span key={tag}>#{tag}</span>)}
      </div>
      <div className="tag-row">
        {getCategoryNames(tool.categorySlugs).slice(0, 3).map((name) => <span className="tag" key={name}>{name}</span>)}
      </div>
      <div className="tool-card-actions single-action">
        <a href={`/tools/${tool.slug}/`}>View details</a>
      </div>
    </article>
  );
}
