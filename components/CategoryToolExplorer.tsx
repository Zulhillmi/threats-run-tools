"use client";

import { useMemo, useState } from "react";
import type { PricingModel, Tool } from "@/lib/types";

const pricingLabels: Record<PricingModel, string> = {
  free: "Free",
  "open-source": "Open-source",
  freemium: "Freemium",
  paid: "Paid",
  enterprise: "Enterprise",
};

type Props = {
  tools: Tool[];
  categoryName: string;
  categoryNamesBySlug: Record<string, string>;
};

export function CategoryToolExplorer({ tools, categoryName, categoryNamesBySlug }: Props) {
  const [query, setQuery] = useState("");
  const [pricing, setPricing] = useState("");
  const [type, setType] = useState("");
  const toolTypes = useMemo(() => Array.from(new Set(tools.map((tool) => tool.toolType))).sort(), [tools]);
  const popularTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tool of tools) for (const tag of tool.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10).map(([tag]) => tag);
  }, [tools]);

  const filteredTools = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchesPricing = !pricing || tool.pricingModel === pricing;
      const matchesType = !type || tool.toolType === type;
      const haystack = [tool.name, tool.tagline, tool.description, tool.toolType, tool.pricingModel, ...tool.tags, ...tool.categorySlugs]
        .join(" ")
        .toLowerCase();
      return matchesPricing && matchesType && (!needle || haystack.includes(needle));
    });
  }, [tools, query, pricing, type]);

  function clearFilters() { setQuery(""); setPricing(""); setType(""); }
  function quickTag(tag: string) { setQuery(tag); }

  return <div className="category-explorer">
    <form className="category-search-card" role="search" onSubmit={(event) => event.preventDefault()}>
      <div className="category-search-copy">
        <p className="kicker">Find within {categoryName}</p>
        <h2>Search {categoryName.toLowerCase()} tools</h2>
        <p>Filter this category by vendor, workflow, capability, pricing, or tag.</p>
      </div>
      <div className="category-search-controls">
        <label className="sr-only" htmlFor="category-search">Search category tools</label>
        <input id="category-search" className="field search-field large" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${categoryName.toLowerCase()} tools…`} autoComplete="off" />
        <label className="sr-only" htmlFor="category-pricing">Filter by pricing</label>
        <select id="category-pricing" className="field" value={pricing} onChange={(event) => setPricing(event.target.value)}>
          <option value="">Any pricing</option>
          {Object.entries(pricingLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <label className="sr-only" htmlFor="category-type">Filter by type</label>
        <select id="category-type" className="field" value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">Any type</option>
          {toolTypes.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      {popularTags.length > 0 && <div className="quick-tags" aria-label="Popular tags">
        {popularTags.map((tag) => <button className="tag-button" type="button" key={tag} onClick={() => quickTag(tag)}>#{tag}</button>)}
      </div>}
    </form>

    <div className="directory-summary category-summary-bar">
      <p className="result-count"><strong>{filteredTools.length}</strong> of {tools.length} {categoryName.toLowerCase()} tools shown</p>
      {(query || pricing || type) && <button className="button ghost small" type="button" onClick={clearFilters}>Clear filters</button>}
    </div>

    <div className="tool-table category-tool-table">
      {filteredTools.map((tool) => (
        <a className="tool-row rich-tool-row" href={`/tools/${tool.slug}/`} key={tool.id}>
          {tool.screenshotUrl || tool.imageUrl ? <img src={tool.screenshotUrl || tool.imageUrl} alt="" loading="lazy" /> : <div className="tool-row-fallback">{tool.name.slice(0,2).toUpperCase()}</div>}
          <div className="tool-row-main">
            <div className="tool-row-title"><strong>{tool.name}</strong>{tool.featured && <span className="pill accent">Featured</span>}</div>
            <p>{tool.tagline || tool.description}</p>
            <div className="tag-row compact">{tool.categorySlugs.map((slug) => categoryNamesBySlug[slug] || slug).map((name) => <span className="tag" key={name}>{name}</span>)}{tool.tags.slice(0, 4).map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div>
          </div>
          <div className="tool-row-meta"><span className="pill accent">{tool.toolType}</span><span className="pill">{pricingLabels[tool.pricingModel] || tool.pricingModel}</span></div>
        </a>
      ))}
    </div>
    {filteredTools.length === 0 && <div className="empty-state">No matching tools in this category yet. Try another keyword or clear the filters.</div>}
  </div>;
}
