"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

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

function AdminShell({ active, children }: { active: "tools" | "articles"; children: React.ReactNode }) {
  async function logout() { await fetch("/api/admin/logout", { method: "POST", credentials: "include" }); location.href = "/admin/login/"; }
  return <div className="wp-admin-shell">
    <aside className="wp-sidebar">
      <div className="wp-brand"><span>TR</span><div><strong>Threats.run TOOLS</strong><small>Management</small></div></div>
      <nav className="wp-nav" aria-label="Admin sections">
        <a className={active === "tools" ? "active" : ""} href="/admin/tools/">Tools</a>
        <a className={active === "articles" ? "active" : ""} href="/admin/blogs/">Articles</a>
        <a href="/" target="_blank">View site</a>
      </nav>
      <button className="button ghost small" onClick={logout}>Logout</button>
    </aside>
    <main className="wp-main">{children}</main>
  </div>;
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="admin-field"><span>{label}</span>{children}{hint ? <small>{hint}</small> : null}</label>;
}

async function loadCatalog(setTools: (tools: Tool[]) => void, setCategories: (cats: Category[]) => void, setStatus: (status: string) => void) {
  const res = await fetch("/api/admin/catalog", { credentials: "include", cache: "no-store" });
  if (res.status === 401) { window.location.href = `/admin/login/?redirect=${encodeURIComponent(location.pathname + location.search)}`; return; }
  if (!res.ok) { setStatus(`Could not load catalog (${res.status})`); return; }
  const data = (await res.json()) as { tools?: Tool[]; categories?: Category[] };
  setTools(data.tools || []); setCategories(data.categories || []); setStatus("Catalog loaded");
}

export function AdminToolListApp() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [status, setStatus] = useState("Loading catalog…");
  useEffect(() => { loadCatalog(setTools, setCategories, setStatus); }, []);
  const categoryNames = useMemo(() => Object.fromEntries(categories.map((c) => [c.slug, c.name])), [categories]);
  const filtered = useMemo(() => tools.filter((tool) => {
    const haystack = `${tool.name} ${tool.slug} ${tool.toolType} ${tool.tags?.join(" ")}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (statusFilter === "all" || tool.status === statusFilter);
  }).sort((a, b) => a.name.localeCompare(b.name)), [tools, query, statusFilter]);
  const counts = useMemo(() => ({ published: tools.filter((t) => t.status === "published").length, drafts: tools.filter((t) => t.status === "draft").length, featured: tools.filter((t) => t.featured).length }), [tools]);
  return <AdminShell active="tools">
    <div className="wp-title-row"><div><p className="eyebrow">Catalog</p><h1>Tools</h1><p>{status}</p></div><a className="button" href="/admin/tools/new/">Add New</a></div>
    <section className="admin-metric-grid wp-metrics"><div><span>Total</span><strong>{tools.length}</strong></div><div><span>Published</span><strong>{counts.published}</strong></div><div><span>Drafts</span><strong>{counts.drafts}</strong></div><div><span>Featured</span><strong>{counts.featured}</strong></div></section>
    <section className="wp-panel">
      <div className="wp-table-tools"><input className="field" placeholder="Search tools…" value={query} onChange={(e) => setQuery(e.target.value)} /><select className="field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All statuses</option>{statuses.map((value) => <option key={value}>{value}</option>)}</select></div>
      <div className="wp-table-wrap"><table className="wp-table"><thead><tr><th>Name</th><th>Type</th><th>Categories</th><th>Pricing</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead><tbody>
        {filtered.map((tool) => <tr key={tool.slug}><td><strong>{tool.name}</strong><small>{tool.slug}</small></td><td>{tool.toolType}</td><td>{tool.categorySlugs?.map((slug) => categoryNames[slug] || slug).join(", ")}</td><td>{tool.pricingModel}</td><td><span className={`status-pill status-${tool.status}`}>{tool.status}</span></td><td>{tool.featured ? "Yes" : "No"}</td><td><a href={`/admin/tools/edit/?slug=${encodeURIComponent(tool.slug)}`}>Edit</a><a href={`/tools/${tool.slug}/`} target="_blank">View</a></td></tr>)}
        {!filtered.length ? <tr><td colSpan={7}>No tools found.</td></tr> : null}
      </tbody></table></div>
    </section>
  </AdminShell>;
}

export function AdminToolEditorApp({ mode }: { mode: "new" | "edit" }) {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "";
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState(mode === "new" ? "new" : slug);
  const [draft, setDraft] = useState<Tool>(emptyTool);
  const [status, setStatus] = useState(mode === "new" ? "Create a new tool." : "Loading tool…");
  const [saving, setSaving] = useState(false);
  useEffect(() => { loadCatalog((loaded) => { setTools(loaded); if (mode === "edit") { const found = loaded.find((tool) => tool.slug === slug); if (found) { setDraft({ ...found, tags: found.tags || [], categorySlugs: found.categorySlugs || [] }); setSelected(found.slug); setStatus("Ready to edit"); } else { setStatus("Tool not found"); } } }, setCategories, mode === "new" ? () => {} : setStatus); }, [mode, slug]);
  function set<K extends keyof Tool>(key: K, value: Tool[K]) { setDraft((current) => ({ ...current, [key]: value })); }
  function toggleCategory(catSlug: string) { set("categorySlugs", draft.categorySlugs.includes(catSlug) ? draft.categorySlugs.filter((s) => s !== catSlug) : [...draft.categorySlugs, catSlug]); }
  const validation = [!draft.name && "Name is required", !draft.slug && "Slug is required", draft.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug) && "Slug must be lowercase kebab-case", !draft.tagline && "Tagline is required", !draft.websiteUrl && "Website URL is required", !draft.description && "Description is required", draft.categorySlugs.length === 0 && "Pick at least one category"].filter(Boolean) as string[];
  async function save() {
    if (validation.length) { setStatus(`Fix ${validation.length} issue${validation.length === 1 ? "" : "s"} before saving`); return; }
    setSaving(true); setStatus("Saving…");
    const method = mode === "new" || selected === "new" ? "POST" : "PATCH";
    const path = method === "POST" ? "/api/admin/tools" : `/api/admin/tools/${encodeURIComponent(selected)}`;
    const res = await fetch(path, { method, credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) });
    const data = (await res.json().catch(() => ({}))) as { error?: string; tool?: { slug?: string } };
    setSaving(false);
    if (!res.ok) { setStatus(data.error || `Save failed (${res.status})`); return; }
    const nextSlug = data.tool?.slug || draft.slug;
    setStatus("Saved");
    if (method === "POST") location.href = `/admin/tools/edit/?slug=${encodeURIComponent(nextSlug)}`;
  }
  async function remove() {
    if (selected === "new" || !confirm(`Delete ${draft.name}?`)) return;
    const res = await fetch(`/api/admin/tools/${encodeURIComponent(selected)}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) { setStatus(`Delete failed (${res.status})`); return; }
    location.href = "/admin/tools/";
  }
  return <AdminShell active="tools">
    <div className="wp-title-row"><div><p className="eyebrow">Catalog</p><h1>{mode === "new" ? "Add New Tool" : `Edit ${draft.name || "Tool"}`}</h1><p>{status}</p></div><div className="admin-actions"><a className="button ghost" href="/admin/tools/">Back to list</a>{draft.slug ? <a className="button ghost" href={`/tools/${draft.slug}/`} target="_blank">View</a> : null}<button className="button" disabled={saving || validation.length > 0} onClick={save}>{saving ? "Saving…" : "Save"}</button></div></div>
    {validation.length ? <div className="notice warning wp-notice"><strong>Needs attention</strong><ul>{validation.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
    <section className="wp-editor-grid">
      <div className="wp-panel editor-main">
        <Field label="Name"><input className="field" value={draft.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Slug" hint="Used for the public URL."><div className="inline-field"><input className="field" value={draft.slug} onChange={(e) => set("slug", slugify(e.target.value))} /><button className="button ghost small" onClick={() => set("slug", slugify(draft.name))}>Generate</button></div></Field>
        <Field label="Tagline"><input className="field" value={draft.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
        <Field label="Description"><textarea className="field textarea" value={draft.description} onChange={(e) => set("description", e.target.value)} /></Field>
        <div className="admin-form-grid"><Field label="Website"><input className="field" value={draft.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} /></Field><Field label="Docs"><input className="field" value={draft.docsUrl || ""} onChange={(e) => set("docsUrl", e.target.value)} /></Field><Field label="Repository"><input className="field" value={draft.githubUrl || ""} onChange={(e) => set("githubUrl", e.target.value)} /></Field><Field label="Image URL"><input className="field" value={draft.screenshotUrl || ""} onChange={(e) => set("screenshotUrl", e.target.value)} /></Field></div>
        <Field label="Tags"><input className="field" value={draft.tags.join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((v) => v.trim()).filter(Boolean))} /></Field>
      </div>
      <aside className="wp-panel editor-side">
        <Field label="Status"><select className="field" value={draft.status} onChange={(e) => set("status", e.target.value)}>{statuses.map((value) => <option key={value}>{value}</option>)}</select></Field>
        <Field label="Pricing"><select className="field" value={draft.pricingModel} onChange={(e) => set("pricingModel", e.target.value)}>{pricing.map((value) => <option key={value}>{value}</option>)}</select></Field>
        <Field label="Type"><input className="field" value={draft.toolType} onChange={(e) => set("toolType", e.target.value)} /></Field>
        <Field label="Sponsor"><select className="field" value={draft.sponsorTier} onChange={(e) => set("sponsorTier", e.target.value)}>{sponsors.map((value) => <option key={value}>{value}</option>)}</select></Field>
        <label className="check standalone"><input type="checkbox" checked={draft.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured</label>
        <div className="admin-checks wp-checks"><span>Categories</span>{categories.map((cat) => <label key={cat.slug} className="check"><input type="checkbox" checked={draft.categorySlugs.includes(cat.slug)} onChange={() => toggleCategory(cat.slug)} />{cat.name}</label>)}</div>
        {mode === "edit" ? <button className="button ghost danger-button full" onClick={remove}>Delete</button> : null}
      </aside>
    </section>
  </AdminShell>;
}
