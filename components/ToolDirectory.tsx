"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, PricingModel, Tool } from "@/lib/types";
import { ToolCard } from "@/components/ToolCard";

const pricingLabels: Record<PricingModel, string> = {
  free: "Free",
  "open-source": "Open-source",
  freemium: "Freemium",
  paid: "Paid",
  enterprise: "Enterprise",
};

type ViewMode = "grid" | "list";

export function ToolDirectory({ tools, categories }: { tools: Tool[]; categories: Category[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [pricing, setPricing] = useState("");
  const [type, setType] = useState("");
  const [view, setView] = useState<ViewMode>("grid");

  const toolTypes = useMemo(() => Array.from(new Set(tools.map((tool) => tool.toolType))).sort(), [tools]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") || "");
    setCategory(params.get("category") || "");
    setPricing(params.get("pricing") || "");
    setType(params.get("type") || "");
    const requestedView = params.get("view");
    if (requestedView === "list" || requestedView === "grid") setView(requestedView);
  }, []);

  const filteredTools = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchesCategory = !category || tool.categorySlugs.includes(category);
      const matchesPricing = !pricing || tool.pricingModel === pricing;
      const matchesType = !type || tool.toolType === type;
      const haystack = [tool.name, tool.tagline, tool.description, tool.toolType, tool.pricingModel, ...tool.tags, ...tool.categorySlugs]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !needle || haystack.includes(needle);
      return matchesCategory && matchesPricing && matchesType && matchesQuery;
    });
  }, [tools, query, category, pricing, type]);

  function clearFilters() {
    setQuery("");
    setCategory("");
    setPricing("");
    setType("");
  }

  return (
    <>
      <form className="filters filters-expanded tools-filters" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="sr-only" htmlFor="tool-search">Search tools</label>
        <input
          id="tool-search"
          className="field search-field"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tools, vendors, tags, use cases…"
          autoComplete="off"
        />
        <label className="sr-only" htmlFor="tool-category">Filter by category</label>
        <select id="tool-category" className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
        </select>
        <label className="sr-only" htmlFor="tool-pricing">Filter by pricing</label>
        <select id="tool-pricing" className="field" value={pricing} onChange={(event) => setPricing(event.target.value)}>
          <option value="">Any pricing</option>
          {Object.entries(pricingLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <label className="sr-only" htmlFor="tool-type">Filter by tool type</label>
        <select id="tool-type" className="field" value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">Any type</option>
          {toolTypes.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </form>
      <div className="directory-summary tools-summary">
        <p className="result-count">{filteredTools.length} of {tools.length} tools shown</p>
        <div className="view-toolbar" aria-label="Directory view options">
          {(query || category || pricing || type) && <button className="button ghost small" type="button" onClick={clearFilters}>Clear filters</button>}
          <button className={`view-button ${view === "grid" ? "active" : ""}`} type="button" onClick={() => setView("grid")} aria-pressed={view === "grid"}>Grid</button>
          <button className={`view-button ${view === "list" ? "active" : ""}`} type="button" onClick={() => setView("list")} aria-pressed={view === "list"}>List</button>
        </div>
      </div>
      <div className={`grid tool-directory-grid ${view === "list" ? "tool-list-view" : "tool-grid-view"}`}>
        {filteredTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
      </div>
      {filteredTools.length === 0 && <div className="empty-state">No matching tools yet. Try another keyword or submit one we should add.</div>}
    </>
  );
}
