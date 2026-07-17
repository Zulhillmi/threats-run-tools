"use client";

import { useEffect, useMemo, useState } from "react";

type Category = { id: string; slug: string; name: string };
type Tool = {
  id?: string; slug: string; name: string; tagline: string; description: string; websiteUrl: string;
  githubUrl?: string; docsUrl?: string; screenshotUrl?: string; imageUrl?: string; pricingModel: string; toolType: string;
  status: string; featured: boolean; sponsorTier: string; categorySlugs: string[]; tags: string[];
};

const emptyTool: Tool = { slug: "", name: "", tagline: "", description: "", websiteUrl: "", pricingModel: "freemium", toolType: "Security tool", status: "draft", featured: false, sponsorTier: "none", categorySlugs: ["cti"], tags: [] };
const pricing = ["free", "open-source", "freemium", "paid", "enterprise"];
const statuses = ["draft", "published", "archived"];
const sponsors = ["none", "community", "sponsor", "partner"];
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function AdminRealApp() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("new");
  const [draft, setDraft] = useState<Tool>(emptyTool);
  const [status, setStatus] = useState("Loading live database…");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/catalog", { credentials: "include", cache: "no-store" });
    if (res.status === 401) { window.location.href = `/admin/login/?redirect=${encodeURIComponent(location.pathname)}`; return; }
    if (!res.ok) { setStatus(`Failed to load catalog: ${res.status}`); return; }
    const data = await res.json() as { tools?: Tool[]; categories?: Category[] };
    setTools(data.tools || []); setCategories(data.categories || []); setStatus(`Loaded ${(data.tools || []).length} tools from D1`);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => tools.filter((tool) => `${tool.name} ${tool.slug} ${tool.toolType} ${tool.tags?.join(" ")}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name)), [tools, query]);
  function choose(tool: Tool | "new") { if (tool === "new") { setSelected("new"); setDraft(emptyTool); } else { setSelected(tool.slug); setDraft({ ...tool, tags: tool.tags || [], categorySlugs: tool.categorySlugs || [] }); } }
  function set<K extends keyof Tool>(key: K, value: Tool[K]) { setDraft((current) => ({ ...current, [key]: value })); }
  function toggleCategory(slug: string) { set("categorySlugs", draft.categorySlugs.includes(slug) ? draft.categorySlugs.filter((s) => s !== slug) : [...draft.categorySlugs, slug]); }

  async function save() {
    setSaving(true); setStatus("Saving to D1…");
    const method = selected === "new" ? "POST" : "PATCH";
    const path = selected === "new" ? "/api/admin/tools" : `/api/admin/tools/${encodeURIComponent(selected)}`;
    const res = await fetch(path, { method, credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) });
    const data = await res.json().catch(() => ({})) as { error?: string; tool?: { slug?: string } };
    setSaving(false);
    if (!res.ok) { setStatus(data.error || `Save failed: ${res.status}`); return; }
    setStatus(`Saved ${draft.name} to D1`); await load(); setSelected(data.tool?.slug || draft.slug);
  }
  async function remove() {
    if (selected === "new" || !confirm(`Delete ${draft.name}?`)) return;
    const res = await fetch(`/api/admin/tools/${encodeURIComponent(selected)}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) { setStatus(`Delete failed: ${res.status}`); return; }
    setStatus(`Deleted ${draft.name}`); choose("new"); await load();
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST", credentials: "include" }); location.href = "/admin/login/"; }

  return <div className="admin-workbench real-admin">
    <aside className="admin-panel admin-sidebar-panel">
      <div className="admin-toolbar"><button className="button small" onClick={() => choose("new")}>New</button><button className="button ghost small" onClick={logout}>Logout</button></div>
      <p className="pill">{filtered.length}/{tools.length} live D1</p>
      <input className="field" placeholder="Search live tools…" value={query} onChange={(e)=>setQuery(e.target.value)} />
      <div className="admin-tool-list" role="listbox" aria-label="Live tools">
        {filtered.map((tool) => <button key={tool.slug} className={`admin-row ${selected === tool.slug ? "active" : ""}`} onClick={() => choose(tool)}><strong>{tool.name}</strong><span>{tool.status} · {tool.categorySlugs?.join(", ")}</span></button>)}
      </div>
    </aside>
    <section className="admin-panel admin-editor">
      <div className="section-head"><div><p className="eyebrow">REAL ADMIN</p><h2>{selected === "new" ? "Create tool" : `Edit ${draft.name}`}</h2><p className="muted">{status}</p></div><div className="admin-actions"><button className="button" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save to D1"}</button>{selected !== "new" && <button className="button ghost" onClick={remove}>Delete</button>}</div></div>
      <div className="admin-form-grid">
        <label>Name<input className="field" value={draft.name} onChange={(e)=>set("name", e.target.value)} /></label>
        <label>Slug<div className="inline-field"><input className="field" value={draft.slug} onChange={(e)=>set("slug", e.target.value)} /><button className="button ghost small" onClick={()=>set("slug", slugify(draft.name))}>Generate</button></div></label>
        <label>Tagline<input className="field" value={draft.tagline} onChange={(e)=>set("tagline", e.target.value)} /></label>
        <label>Tool type<input className="field" value={draft.toolType} onChange={(e)=>set("toolType", e.target.value)} /></label>
        <label>Website<input className="field" value={draft.websiteUrl} onChange={(e)=>set("websiteUrl", e.target.value)} /></label>
        <label>GitHub<input className="field" value={draft.githubUrl || ""} onChange={(e)=>set("githubUrl", e.target.value)} /></label>
        <label>Docs<input className="field" value={draft.docsUrl || ""} onChange={(e)=>set("docsUrl", e.target.value)} /></label>
        <label>Screenshot URL<input className="field" value={draft.screenshotUrl || ""} onChange={(e)=>set("screenshotUrl", e.target.value)} /></label>
        <label>Image fallback URL<input className="field" value={draft.imageUrl || ""} onChange={(e)=>set("imageUrl", e.target.value)} /></label>
        <label>Pricing<select className="field" value={draft.pricingModel} onChange={(e)=>set("pricingModel", e.target.value)}>{pricing.map((v)=><option key={v}>{v}</option>)}</select></label>
        <label>Status<select className="field" value={draft.status} onChange={(e)=>set("status", e.target.value)}>{statuses.map((v)=><option key={v}>{v}</option>)}</select></label>
        <label>Sponsor<select className="field" value={draft.sponsorTier} onChange={(e)=>set("sponsorTier", e.target.value)}>{sponsors.map((v)=><option key={v}>{v}</option>)}</select></label>
      </div>
      <label>Description<textarea className="field textarea" value={draft.description} onChange={(e)=>set("description", e.target.value)} /></label>
      <label>Tags, comma-separated<input className="field" value={draft.tags.join(", ")} onChange={(e)=>set("tags", e.target.value.split(",").map((v)=>v.trim()).filter(Boolean))} /></label>
      <div className="admin-checks">{categories.map((cat)=><label key={cat.slug} className="check"><input type="checkbox" checked={draft.categorySlugs.includes(cat.slug)} onChange={()=>toggleCategory(cat.slug)} />{cat.name}</label>)}<label className="check"><input type="checkbox" checked={draft.featured} onChange={(e)=>set("featured", e.target.checked)} />Featured</label></div>
    </section>
  </div>;
}
