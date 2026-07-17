"use client";

import { useEffect, useMemo, useState } from "react";

type Blog = { id?: string; slug: string; title: string; excerpt: string; content: string; author?: string; imageUrl?: string; status: string; publishedAt?: string };
const emptyBlog: Blog = { slug: "", title: "", excerpt: "", content: "", author: "Threats.run", imageUrl: "", status: "draft", publishedAt: "" };
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

export function AdminBlogsApp() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState("new");
  const [draft, setDraft] = useState<Blog>(emptyBlog);
  const [status, setStatus] = useState("Loading articles…");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/blogs", { credentials: "include", cache: "no-store" });
    if (res.status === 401) {
      window.location.href = `/admin/login/?redirect=${encodeURIComponent(location.pathname)}`;
      return;
    }
    if (!res.ok) {
      setStatus(`Failed to load articles: ${res.status}`);
      return;
    }
    const data = (await res.json()) as { blogs?: Blog[] };
    setBlogs(data.blogs || []);
    setStatus(`Loaded ${(data.blogs || []).length} article records`);
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => blogs
      .filter((blog) => `${blog.title} ${blog.slug} ${blog.status}`.toLowerCase().includes(query.toLowerCase()) && (statusFilter === "all" || blog.status === statusFilter))
      .sort((a, b) => a.title.localeCompare(b.title)),
    [blogs, query, statusFilter],
  );
  const counts = useMemo(() => ({
    published: blogs.filter((blog) => blog.status === "published").length,
    drafts: blogs.filter((blog) => blog.status === "draft").length,
    archived: blogs.filter((blog) => blog.status === "archived").length,
  }), [blogs]);
  const validation = [!draft.title && "Title is required", !draft.slug && "Slug is required", !draft.excerpt && "Excerpt is required", !draft.content && "Content body is required"].filter(Boolean) as string[];

  function choose(blog: Blog | "new") {
    if (blog === "new") {
      setSelected("new");
      setDraft(emptyBlog);
    } else {
      setSelected(blog.slug);
      setDraft({ ...emptyBlog, ...blog });
    }
  }
  function set<K extends keyof Blog>(key: K, value: Blog[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    if (validation.length) {
      setStatus(`Fix ${validation.length} validation issue${validation.length === 1 ? "" : "s"} before saving`);
      return;
    }
    setSaving(true);
    setStatus("Saving article…");
    const method = selected === "new" ? "POST" : "PATCH";
    const path = selected === "new" ? "/api/admin/blogs" : `/api/admin/blogs/${encodeURIComponent(selected)}`;
    const res = await fetch(path, { method, credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) });
    const data = (await res.json().catch(() => ({}))) as { error?: string; blog?: { slug?: string } };
    setSaving(false);
    if (!res.ok) {
      setStatus(data.error || `Save failed: ${res.status}`);
      return;
    }
    setStatus(`Saved ${draft.title}`);
    await load();
    setSelected(data.blog?.slug || draft.slug);
  }
  async function remove() {
    if (selected === "new" || !confirm(`Delete ${draft.title}?`)) return;
    const res = await fetch(`/api/admin/blogs/${encodeURIComponent(selected)}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) {
      setStatus(`Delete failed: ${res.status}`);
      return;
    }
    setStatus(`Deleted ${draft.title}`);
    choose("new");
    await load();
  }

  return (
    <div className="enterprise-admin">
      <aside className="admin-sidebar-panel enterprise-sidebar">
        <div className="enterprise-brand">
          <span className="admin-orb">TR</span>
          <div><strong>Threats.run TOOLS</strong><small>Management</small></div>
        </div>
        <nav className="enterprise-nav" aria-label="Admin sections">
          <a href="/admin/">Catalog</a>
          <a className="active" href="/admin/blogs/">Articles</a>
          <a href="/blog/" target="_blank">Public preview</a>
        </nav>
      </aside>

      <main className="enterprise-main">
        <section className="enterprise-hero">
          <div>
            <p className="eyebrow">Articles</p>
            <h1>Articles</h1>
            <p>Publish readable public articles for the tools directory and homepage cards.</p>
          </div>
          <div className="admin-actions">
            <button className="button ghost" onClick={() => choose("new")}>New article</button>
            <button className="button" disabled={saving || validation.length > 0} onClick={save}>{saving ? "Saving…" : "Save article"}</button>
          </div>
        </section>

        <section className="admin-metric-grid" aria-label="Article metrics">
          <div><span>Total articles</span><strong>{blogs.length}</strong></div>
          <div><span>Published</span><strong>{counts.published}</strong></div>
          <div><span>Drafts</span><strong>{counts.drafts}</strong></div>
          <div><span>Archived</span><strong>{counts.archived}</strong></div>
        </section>
        <div className="admin-status-strip"><span>{status}</span><span>{filtered.length} visible</span></div>

        <div className="enterprise-workbench">
          <section className="admin-panel enterprise-list-panel">
            <div className="admin-toolbar compact-toolbar"><div><p className="kicker">Records</p><h2>Articles</h2></div><span className="pill">{filtered.length}/{blogs.length}</span></div>
            <input className="field" placeholder="Search title, slug, status…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <select className="field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All statuses</option><option>draft</option><option>published</option><option>archived</option></select>
            <div className="admin-tool-list enterprise-record-list" role="listbox" aria-label="Live articles">
              <button className={selected === "new" ? "active" : ""} onClick={() => choose("new")}><strong>+ New article</strong><span>Draft editorial record</span></button>
              {filtered.map((blog) => <button key={blog.slug} className={selected === blog.slug ? "active" : ""} onClick={() => choose(blog)}><strong>{blog.title}</strong><span>{blog.status} · {blog.slug}</span></button>)}
            </div>
          </section>

          <section className="admin-panel admin-editor enterprise-editor">
            <div className="section-head sticky-editor-head">
              <div><p className="eyebrow">{selected === "new" ? "Create" : "Edit"}</p><h2>{selected === "new" ? "New article" : draft.title}</h2><p className="muted">{draft.slug ? `/blog/${draft.slug}/` : "Unsaved draft"}</p></div>
              <div className="admin-actions">{draft.slug ? <a className="button ghost" href={`/blog/${draft.slug}/`} target="_blank">Preview</a> : null}{selected !== "new" ? <button className="button ghost danger-button" onClick={remove}>Delete</button> : null}</div>
            </div>
            {validation.length ? <div className="notice warning"><strong>Needs attention</strong><ul>{validation.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}

            <div className="admin-form-grid enterprise-form-grid">
              <Field label="Title"><input className="field" value={draft.title} onChange={(e) => set("title", e.target.value)} /></Field>
              <Field label="Slug"><div className="inline-field"><input className="field" value={draft.slug} onChange={(e) => set("slug", slugify(e.target.value))} /><button className="button ghost small" onClick={() => set("slug", slugify(draft.title))}>Generate</button></div></Field>
              <Field label="Author"><input className="field" value={draft.author || ""} onChange={(e) => set("author", e.target.value)} /></Field>
              <Field label="Status"><select className="field" value={draft.status} onChange={(e) => set("status", e.target.value)}><option>draft</option><option>published</option><option>archived</option></select></Field>
              <Field label="Image URL"><input className="field" value={draft.imageUrl || ""} onChange={(e) => set("imageUrl", e.target.value)} /></Field>
              <Field label="Published at"><input className="field" type="datetime-local" value={(draft.publishedAt || "").slice(0, 16)} onChange={(e) => set("publishedAt", e.target.value)} /></Field>
            </div>
            <Field label="Excerpt"><textarea className="field textarea" value={draft.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></Field>
            <Field label="Content"><textarea className="field textarea blog-content-field enterprise-markdown-field" value={draft.content} onChange={(e) => set("content", e.target.value)} /></Field>
          </section>
        </div>
      </main>
    </div>
  );
}
