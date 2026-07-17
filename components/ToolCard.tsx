import type { Tool } from "@/lib/types";
import { getCategoryNames } from "@/data/catalog";
import { ToolLogo } from "@/components/ToolLogo";
import { getToolInitials } from "@/lib/tool-logo";

export function ToolCard({ tool }: { tool: Tool }) {
  const initials = getToolInitials(tool.name);
  const visualUrl = tool.screenshotUrl || tool.imageUrl;
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
      </a>
      <a className="tool-top" href={`/tools/${tool.slug}/`} aria-label={`View ${tool.name} details`}>
        <ToolLogo name={tool.name} websiteUrl={tool.websiteUrl} logoUrl={tool.logoUrl} />
        <div>
          <h3>{tool.name}</h3>
          <span className="pill accent">{tool.toolType}</span>
        </div>
      </a>
      <p>{tool.tagline}</p>
      <div className="tag-row">
        {getCategoryNames(tool.categorySlugs).map((name) => <span className="tag" key={name}>{name}</span>)}
      </div>
    </article>
  );
}
