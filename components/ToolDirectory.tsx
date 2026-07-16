"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, Tool } from "@/lib/types";
import { ToolCard } from "@/components/ToolCard";

export function ToolDirectory({ tools, categories }: { tools: Tool[]; categories: Category[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") || "");
    setCategory(params.get("category") || "");
  }, []);

  const filteredTools = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchesCategory = !category || tool.categorySlugs.includes(category);
      const haystack = [tool.name, tool.tagline, tool.description, tool.toolType, tool.pricingModel, ...tool.tags, ...tool.categorySlugs]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !needle || haystack.includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [tools, query, category]);

  return (
    <>
      <form className="filters" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="sr-only" htmlFor="tool-search">Search tools</label>
        <input
          id="tool-search"
          className="field"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tools, tags, use cases…"
          autoComplete="off"
        />
        <label className="sr-only" htmlFor="tool-category">Filter by category</label>
        <select id="tool-category" className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
        </select>
      </form>
      <p className="result-count">{filteredTools.length} tool{filteredTools.length === 1 ? "" : "s"} found</p>
      <div className="grid">
        {filteredTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
      </div>
      {filteredTools.length === 0 && <div className="empty-state">No matching tools yet. Try another keyword or submit one we should add.</div>}
    </>
  );
}
