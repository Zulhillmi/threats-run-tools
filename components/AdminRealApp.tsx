"use client";

import { useEffect, useMemo, useState } from "react";

type Category = { id: string; slug: string; name: string };
type Tool = {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  githubUrl?: string;
  docsUrl?: string;
  screenshotUrl?: string;
  imageUrl?: string;
  pricingModel: string;
  toolType: string;
  status: string;
  featured: boolean;
  sponsorTier: string;
  categorySlugs: string[];
  tags: string[];
};

const emptyTool: Tool = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  websiteUrl: "",
  pricingModel: "freemium",
  toolType: "Security tool",
  status: "draft",
  featured: false,
  sponsorTier: "none",
  categorySlugs: ["cti"],
  tags: [],
};
const pricing = ["free", "open-source", "freemium", "paid", "enterprise"];
const statuses = ["draft", "published", "archived"];
const sponsors = ["none", "community", "sponsor", "partner"];
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function AdminRealApp() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState("new");
  const [draft, setDraft] = useState<Tool>(emptyTool);
  const [status, setStatus] = useState("Loading live database…");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/catalog", { credentials: "include", cache: "no-store" });
    if (res.status === 401) {
      window.location.href = `/admin/login/?redirect=${encodeURIComponent(location.pathname)}`;
      return;
    }
    if (!res.ok) {
      setStatus(`Failed to load catalog: ${res.status}`);
      return;
    }
    const data = (await res.json()) as { tools?: Tool[]; categories?: Category[] };
    setTools(data.tools || []);
    setCategories(data.categories || []);
    setStatus(`Synced ${(data.tools || []).length} catalog records from D1`);
  }
  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const published = tools.filter((tool) => tool.status === "published").length;
    const drafts = tools.filter((tool) => tool.status === "draft").length;
    const featured = tools.filter((tool) => tool.featured).length;
    return { published, drafts, featured };
  }, [tools]);

  const filtered = useMemo(
    () =>
      tools
        .filter((tool) => {
          const haystack = `${tool.name} ${tool.slug} ${tool.toolType} ${tool.tags?.join(" ")}`.toLowerCase();
          return haystack.includes(query.toLowerCase()) && (statusFilter === "all" || tool.status === statusFilter);
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [tools, query, statusFilter],
  );

  const validation = [
    !draft.name && "Name is required",
    !draft.slug && "Slug is required",
    draft.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug) && "Slug must be lowercase kebab-case",
    !draft.tagline && "Tagline is required",
    !draft.websiteUrl && "Website URL is required",
    !draft.description && "Description is required",
    draft.categorySlugs.length === 0 && "Pick at least one category",
  ].filter(Boolean) as string[];

  function choose(tool: Tool | "new") {
    if (tool === "new") {
      setSelected("new");
      setDraft(emptyTool);
    } else {
      setSelected(tool.slug);
      setDraft({ ...tool, tags: tool.tags || [], categorySlugs: tool.categorySlugs || [] });
    }
  }
  function set<K extends keyof Tool>(key: K, value: Tool[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }
  function toggleCategory(slug: string) {
    set("categorySlugs", draft.categorySlugs.includes(slug) ? draft.categorySlugs.filter((s) => s !== slug) : [...draft.categorySlugs, slug]);
  }

  async function save() {
    if (validation.length) {
      setStatus(`Fix ${validation.length} validation issue${validation.length === 1 ? "" : "s"} before saving`);
      return;
    }
    setSaving(true);
    setStatus("Saving to D1…");
    const method = selected === "new" ? "POST" : "PATCH";
    const path = selected === "new" ? "/api/admin/tools" : `/api/admin/tools/${encodeURIComponent(selected)}`;
    const res = await fetch(path, { method, credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) });
    const data = (await res.json().catch(() => ({}))) as { error?: string; tool?: { slug?: string } };
    setSaving(false);
    if (!res.ok) {
      setStatus(data.error || `Save failed: ${res.status}`);
      return;
    }
    setStatus(`Saved ${draft.name} to D1`);
    await load();
    setSelected(data.tool?.slug || draft.slug);
  }
  async function remove() {
    if (selected === "new" || !confirm(`Delete ${draft.name}?`)) return;
    const res = await fetch(`/api/admin/tools/${encodeURIComponent(selected)}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) {
      setStatus(`Delete failed: ${res.status}`);
      return;
    }
    setStatus(`Deleted ${draft.name}`);
    choose("new");
    await load();
  }
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    location.href = "/admin/login/";
  }

  return (
    <div className="enterprise-admin">
      <aside className="admin-sidebar-panel enterprise-sidebar">
        <div className="enterprise-brand">
          <span className="admin-orb">TR</span>
          <div>
            <strong>Tools Console</strong>
            <small>Catalog operations</small>
          </div>
        </div>
        <nav className="enterprise-nav" aria-label="Admin sections">
          <a className="active" href="/admin/">Catalog</a>
          <a href="/admin/blogs/">Articles</a>
          <a href="/tools/" target="_blank">Public preview</a>
        </nav>
        <button className="button ghost small" onClick={logout}>Logout</button>
      </aside>

      <main className="enterprise-main">
        <section className="enterprise-hero">
          <div>
            <p className="eyebrow">Enterprise admin</p>
            <h1>Catalog control center</h1>
            <p>Live D1-backed publishing workflow for the Threats.run tools directory.</p>
          </div>
          <div className="admin-actions">
            <button className="button ghost" onClick={() => choose("new")}>New tool</button>
            <button className="button" disabled={saving || validation.length > 0} onClick={save}>{saving ? "Saving…" : "Save changes"}</button>
          </div>
        </section>

        <section className="admin-metric-grid" aria-label="Catalog metrics">
          <div><span>Total tools</span><strong>{tools.length}</strong></div>
          <div><span>Published</span><strong>{counts.published}</strong></div>
          <div><span>Drafts</span><strong>{counts.drafts}</strong></div>
          <div><span>Featured</span><strong>{counts.featured}</strong></div>
        </section>

        <div className="admin-status-strip"><span>{status}</span><span>{filtered.length} visible</span></div>

        <div className="enterprise-workbench">
          <section className="admin-panel enterprise-list-panel">
            <div className="admin-toolbar compact-toolbar">
              <div><p className="kicker">Records</p><h2>Tools</h2></div>
              <span className="pill">{filtered.length}/{tools.length}</span>
            </div>
            <input className="field" placeholder="Search name, slug, tag, type…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <select className="field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <div className="admin-tool-list enterprise-record-list" role="listbox" aria-label="Live tools">
              <button className={selected === "new" ? "active" : ""} onClick={() => choose("new")}><strong>+ New tool</strong><span>Draft catalog record</span></button>
              {filtered.map((tool) => (
                <button key={tool.slug} className={selected === tool.slug ? "active" : ""} onClick={() => choose(tool)}>
                  <strong>{tool.name}</strong>
                  <span>{tool.status} · {tool.categorySlugs?.join(", ")}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="admin-panel admin-editor enterprise-editor">
            <div className="section-head sticky-editor-head">
              <div>
                <p className="eyebrow">{selected === "new" ? "Create" : "Edit"}</p>
                <h2>{selected === "new" ? "New catalog entry" : draft.name}</h2>
                <p className="muted">{draft.slug ? `/tools/${draft.slug}/` : "Unsaved draft"}</p>
              </div>
              <div className="admin-actions">
                {draft.slug ? <a className="button ghost" href={`/tools/${draft.slug}/`} target="_blank">Preview</a> : null}
                {selected !== "new" ? <button className="button ghost danger-button" onClick={remove}>Delete</button> : null}
              </div>
            </div>

            {validation.length ? <div className="notice warning"><strong>Needs attention</strong><ul>{validation.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}

            <div className="admin-form-grid enterprise-form-grid">
              <Field label="Name"><input className="field" value={draft.name} onChange={(e) => set("name", e.target.value)} /></Field>
              <Field label="Slug" hint="Lowercase canonical URL path."><div className="inline-field"><input className="field" value={draft.slug} onChange={(e) => set("slug", slugify(e.target.value))} /><button className="button ghost small" onClick={() => set("slug", slugify(draft.name))}>Generate</button></div></Field>
              <Field label="Tagline"><input className="field" value={draft.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
              <Field label="Tool type"><input className="field" value={draft.toolType} onChange={(e) => set("toolType", e.target.value)} /></Field>
              <Field label="Website"><input className="field" value={draft.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} /></Field>
              <Field label="GitHub"><input className="field" value={draft.githubUrl || ""} onChange={(e) => set("githubUrl", e.target.value)} /></Field>
              <Field label="Docs"><input className="field" value={draft.docsUrl || ""} onChange={(e) => set("docsUrl", e.target.value)} /></Field>
              <Field label="Screenshot URL"><input className="field" value={draft.screenshotUrl || ""} onChange={(e) => set("screenshotUrl", e.target.value)} /></Field>
              <Field label="Image fallback URL"><input className="field" value={draft.imageUrl || ""} onChange={(e) => set("imageUrl", e.target.value)} /></Field>
              <Field label="Pricing"><select className="field" value={draft.pricingModel} onChange={(e) => set("pricingModel", e.target.value)}>{pricing.map((v) => <option key={v}>{v}</option>)}</select></Field>
              <Field label="Status"><select className="field" value={draft.status} onChange={(e) => set("status", e.target.value)}>{statuses.map((v) => <option key={v}>{v}</option>)}</select></Field>
              <Field label="Sponsor"><select className="field" value={draft.sponsorTier} onChange={(e) => set("sponsorTier", e.target.value)}>{sponsors.map((v) => <option key={v}>{v}</option>)}</select></Field>
            </div>

            <Field label="Description"><textarea className="field textarea" value={draft.description} onChange={(e) => set("description", e.target.value)} /></Field>
            <Field label="Tags, comma-separated"><input className="field" value={draft.tags.join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((v) => v.trim()).filter(Boolean))} /></Field>
            <div className="admin-checks enterprise-checks">
              <span>Publishing surfaces</span>
              {categories.map((cat) => <label key={cat.slug} className="check"><input type="checkbox" checked={draft.categorySlugs.includes(cat.slug)} onChange={() => toggleCategory(cat.slug)} />{cat.name}</label>)}
              <label className="check"><input type="checkbox" checked={draft.featured} onChange={(e) => set("featured", e.target.checked)} />Featured</label>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
