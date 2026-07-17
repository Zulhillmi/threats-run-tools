"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, PricingModel, Tool, ToolStatus } from "@/lib/types";

type Props = { tools: Tool[]; categories: Category[] };

type CopyState = "idle" | "copied" | "error";

const pricingModels: PricingModel[] = ["free", "open-source", "freemium", "paid", "enterprise"];
const statuses: ToolStatus[] = ["published", "draft", "archived"];
const sponsorTiers: NonNullable<Tool["sponsorTier"]>[] = ["none", "community", "sponsor", "partner"];

const emptyTool: Tool = {
  id: "",
  slug: "",
  name: "",
  tagline: "",
  description: "",
  websiteUrl: "",
  pricingModel: "freemium",
  toolType: "",
  tags: [],
  categorySlugs: [],
  featured: false,
  sponsorTier: "none",
  status: "draft",
  faqs: [],
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function toCsv(items?: string[]) {
  return (items || []).join(", ");
}

function fromCsv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function faqsToText(tool: Tool) {
  return (tool.faqs || []).map((faq) => `${faq.question} | ${faq.answer}`).join("\n");
}

function faqsFromText(value: string) {
  return value.split("\n").map((line) => {
    const [question, ...rest] = line.split("|");
    return { question: question?.trim() || "", answer: rest.join("|").trim() };
  }).filter((faq) => faq.question && faq.answer);
}

function cleanTool(tool: Tool): Tool {
  const cleaned: Tool = {
    id: tool.id || tool.slug,
    slug: tool.slug,
    name: tool.name,
    tagline: tool.tagline,
    description: tool.description,
    websiteUrl: tool.websiteUrl,
    pricingModel: tool.pricingModel,
    toolType: tool.toolType,
    tags: tool.tags,
    categorySlugs: tool.categorySlugs,
    sponsorTier: tool.sponsorTier || "none",
    status: tool.status,
  };
  if (tool.githubUrl) cleaned.githubUrl = tool.githubUrl;
  if (tool.docsUrl) cleaned.docsUrl = tool.docsUrl;
  if (tool.logoUrl) cleaned.logoUrl = tool.logoUrl;
  if (tool.screenshotUrl) cleaned.screenshotUrl = tool.screenshotUrl;
  if (tool.imageUrl) cleaned.imageUrl = tool.imageUrl;
  if (tool.featured) cleaned.featured = true;
  if (tool.faqs?.length) cleaned.faqs = tool.faqs;
  return cleaned;
}

function tsEntry(tool: Tool) {
  return JSON.stringify(cleanTool(tool), null, 2)
    .replace(/"([^"\\]+)":/g, "$1:")
    .replace(/\n/g, "\n  ");
}

export function AdminWorkbench({ tools, categories }: Props) {
  const sortedTools = useMemo(() => [...tools].sort((a, b) => a.name.localeCompare(b.name)), [tools]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedSlug, setSelectedSlug] = useState(sortedTools[0]?.slug || "new");
  const [draft, setDraft] = useState<Tool>(sortedTools[0] || emptyTool);
  const [faqText, setFaqText] = useState(faqsToText(sortedTools[0] || emptyTool));
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const filtered = sortedTools.filter((tool) => {
    const haystack = `${tool.name} ${tool.slug} ${tool.toolType} ${tool.tags.join(" ")}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (category === "all" || tool.categorySlugs.includes(category));
  });

  useEffect(() => {
    if (selectedSlug === "new" || filtered.length === 0) return;
    if (!filtered.some((tool) => tool.slug === selectedSlug)) {
      const tool = filtered[0];
      setSelectedSlug(tool.slug);
      setDraft(tool);
      setFaqText(faqsToText(tool));
    }
  }, [category, query]);

  const validation = [
    !draft.name && "Name is required",
    !draft.slug && "Slug is required",
    draft.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug) && "Slug must be lowercase kebab-case",
    !draft.tagline && "Tagline is required",
    !draft.description && "Description is required",
    !draft.websiteUrl && "Website URL is required",
    draft.websiteUrl && !/^https?:\/\//.test(draft.websiteUrl) && "Website URL should start with http:// or https://",
    !draft.toolType && "Tool type is required",
    draft.categorySlugs.length === 0 && "At least one category is required",
  ].filter(Boolean) as string[];

  const currentEntry = tsEntry({ ...draft, faqs: faqsFromText(faqText) });
  const currentJson = JSON.stringify(cleanTool({ ...draft, faqs: faqsFromText(faqText) }), null, 2);

  function choose(slug: string) {
    setSelectedSlug(slug);
    if (slug === "new") {
      setDraft(emptyTool);
      setFaqText("");
      return;
    }
    const tool = sortedTools.find((item) => item.slug === slug) || emptyTool;
    setDraft(tool);
    setFaqText(faqsToText(tool));
  }

  function patchTool(partial: Partial<Tool>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  async function copy(value: string) {
    setCopyState("idle");
    try {
      await navigator.clipboard.writeText(value);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  function downloadJson() {
    const blob = new Blob([currentJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draft.slug || "tool"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-workbench">
      <aside className="admin-panel admin-sidebar-panel">
        <div className="admin-toolbar compact-toolbar">
          <button className="button small" type="button" onClick={() => choose("new")}>New tool</button>
          <span className="pill">{filtered.length}/{tools.length}</span>
        </div>
        <label>Search tools<input className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, slug, tag…" /></label>
        <label>Category<select className="field" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label>
        <div className="admin-tool-list" role="listbox" aria-label="Tools">
          <button className={selectedSlug === "new" ? "active" : ""} type="button" onClick={() => choose("new")}><strong>+ New tool</strong><span>Draft entry</span></button>
          {filtered.map((tool) => <button className={tool.slug === selectedSlug ? "active" : ""} type="button" key={tool.slug} onClick={() => choose(tool.slug)}><strong>{tool.name}</strong><span>{tool.pricingModel} · {tool.categorySlugs.join(", ")}</span></button>)}
        </div>
      </aside>

      <section className="admin-panel editor-panel">
        <div className="admin-toolbar">
          <div><p className="kicker">Editor</p><h2>{draft.name || "New tool"}</h2></div>
          <div className="admin-actions"><a className="button ghost small" href={draft.slug ? `/tools/${draft.slug}/` : "/tools/"}>Preview</a><button className="button small" type="button" onClick={() => copy(currentEntry)}>Copy TS entry</button></div>
        </div>

        {copyState === "copied" && <div className="notice success">Copied to clipboard. Paste the entry into <code>data/catalog.ts</code> and commit.</div>}
        {copyState === "error" && <div className="notice error-box">Clipboard failed. Copy from the export box manually.</div>}
        {validation.length > 0 && <div className="notice warning"><strong>Needs attention:</strong><ul>{validation.map((item) => <li key={item}>{item}</li>)}</ul></div>}

        <div className="admin-form-grid">
          <label>Name<input className="field" value={draft.name} onChange={(event) => patchTool({ name: event.target.value })} /></label>
          <label>Slug<div className="inline-field"><input className="field" value={draft.slug} onChange={(event) => patchTool({ slug: slugify(event.target.value), id: slugify(event.target.value) })} /><button className="button ghost small" type="button" onClick={() => patchTool({ slug: slugify(draft.name), id: slugify(draft.name) })}>Generate</button></div></label>
          <label>Tagline<input className="field" value={draft.tagline} onChange={(event) => patchTool({ tagline: event.target.value })} /></label>
          <label>Tool type<input className="field" value={draft.toolType} onChange={(event) => patchTool({ toolType: event.target.value })} /></label>
          <label>Website URL<input className="field" value={draft.websiteUrl} onChange={(event) => patchTool({ websiteUrl: event.target.value })} /></label>
          <label>GitHub URL<input className="field" value={draft.githubUrl || ""} onChange={(event) => patchTool({ githubUrl: event.target.value || undefined })} /></label>
          <label>Docs URL<input className="field" value={draft.docsUrl || ""} onChange={(event) => patchTool({ docsUrl: event.target.value || undefined })} /></label>
          <label>Screenshot URL<input className="field" value={draft.screenshotUrl || ""} onChange={(event) => patchTool({ screenshotUrl: event.target.value || undefined })} /></label>
          <label>Image fallback URL<input className="field" value={draft.imageUrl || ""} onChange={(event) => patchTool({ imageUrl: event.target.value || undefined })} /></label>
          <label>Pricing<select className="field" value={draft.pricingModel} onChange={(event) => patchTool({ pricingModel: event.target.value as PricingModel })}>{pricingModels.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
          <label>Status<select className="field" value={draft.status} onChange={(event) => patchTool({ status: event.target.value as ToolStatus })}>{statuses.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
          <label>Sponsor tier<select className="field" value={draft.sponsorTier || "none"} onChange={(event) => patchTool({ sponsorTier: event.target.value as NonNullable<Tool["sponsorTier"]> })}>{sponsorTiers.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
        </div>

        <label>Description<textarea className="field" value={draft.description} onChange={(event) => patchTool({ description: event.target.value })} /></label>
        <label>Tags, comma-separated<input className="field" value={toCsv(draft.tags)} onChange={(event) => patchTool({ tags: fromCsv(event.target.value) })} /></label>
        <div className="admin-checks"><span>Categories</span>{categories.map((item) => <label key={item.slug}><input type="checkbox" checked={draft.categorySlugs.includes(item.slug)} onChange={(event) => patchTool({ categorySlugs: event.target.checked ? [...draft.categorySlugs, item.slug] : draft.categorySlugs.filter((slug) => slug !== item.slug) })} />{item.name}</label>)}</div>
        <label className="check-line"><input type="checkbox" checked={Boolean(draft.featured)} onChange={(event) => patchTool({ featured: event.target.checked })} /> Featured on public surfaces</label>
        <label>FAQs, one per line: <code>Question | Answer</code><textarea className="field code-field" value={faqText} onChange={(event) => setFaqText(event.target.value)} /></label>

        <div className="admin-toolbar export-toolbar">
          <button className="button" type="button" onClick={() => copy(currentEntry)}>Copy TS entry</button>
          <button className="button ghost" type="button" onClick={() => copy(currentJson)}>Copy JSON</button>
          <button className="button ghost" type="button" onClick={downloadJson}>Download JSON</button>
        </div>
        <label>Catalog export<textarea className="field code-field export-field" readOnly value={`  ${currentEntry},`} /></label>
      </section>
    </div>
  );
}
