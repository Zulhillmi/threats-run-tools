"use client";

import { useEffect, useMemo, useState } from "react";
import type { PricingModel, Tool } from "@/lib/types";

const PAGE_SIZE = 12;

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
  const [page, setPage] = useState(1);
  const toolTypes = useMemo(() => Array.from(new Set(tools.map((tool) => tool.toolType))).sort(), [tools]);

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

  useEffect(() => { setPage(1); }, [query, pricing, type]);

  const totalPages = Math.max(1, Math.ceil(filteredTools.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedTools = filteredTools.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function clearFilters() { setQuery(""); setPricing(""); setType(""); }

  return <div className="category-explorer">
    <form className="category-filter-bar" role="search" onSubmit={(event) => event.preventDefault()}>
      <label className="sr-only" htmlFor="category-search">Search category tools</label>
      <input id="category-search" className="field search-field large" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${categoryName.toLowerCase()}…`} autoComplete="off" />
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
      {(query || pricing || type) && <button className="button ghost small" type="button" onClick={clearFilters}>Clear</button>}
    </form>

    <div className="directory-summary category-summary-bar">
      <p className="result-count"><strong>{filteredTools.length}</strong> of {tools.length} listings · page {currentPage} of {totalPages}</p>
    </div>

    <div className="tool-table category-tool-table">
      {paginatedTools.map((tool) => (
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
    {filteredTools.length > PAGE_SIZE && <div className="pagination" aria-label="Category pagination">
      <button className="button ghost small" type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => <button key={item} className={`page-button ${item === currentPage ? "active" : ""}`} type="button" onClick={() => setPage(item)} aria-current={item === currentPage ? "page" : undefined}>{item}</button>)}
      <button className="button ghost small" type="button" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</button>
    </div>}
    {filteredTools.length === 0 && <div className="empty-state">No matching tools. Try another keyword or clear the filters.</div>}
  </div>;
}
