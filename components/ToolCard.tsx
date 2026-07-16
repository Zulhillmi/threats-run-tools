import type { Tool } from "@/lib/types";
import { getCategoryNames } from "@/data/catalog";

export function ToolCard({ tool }: { tool: Tool }) {
  return <article className="card tool-card"><a className="tool-top" href={`/tools/${tool.slug}/`}><div className="tool-logo">{tool.name.slice(0,2).toUpperCase()}</div><div><h3>{tool.name}</h3><span className="pill accent">{tool.toolType}</span></div></a><p>{tool.tagline}</p><div className="tag-row">{getCategoryNames(tool.categorySlugs).map((name) => <span className="tag" key={name}>{name}</span>)}</div></article>;
}
