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

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    location.href = "/admin/login/";
  }

  return (
    <div className="wp-admin-shell blogs-cms-v1">
      <aside className="wp-sidebar">
        <div className="wp-brand"><span>TR</span><div><strong>Threats.run TOOLS</strong><small>Management</small></div></div>
        <nav className="wp-nav" aria-label="Admin sections">
          <a href="/admin/">Tools</a>
          <a className="active" href="/admin/blogs/">Articles</a>
          <a href="/" target="_blank">View site</a>
        </nav>
        <button className="button ghost small" onClick={logout}>Logout</button>
      </aside>

      <main className="wp-main">
        <div className="wp-title-row">
          <div>
            <p className="eyebrow">CMS</p>
            <h1>Articles</h1>
            <p>{status}</p>
          </div>
          <div className="admin-actions">
            <button className="button ghost" onClick={() => choose("new")}>Add New</button>
            <button className="button" disabled={saving || validation.length > 0} onClick={save}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </div>

        <section className="admin-metric-grid wp-metrics" aria-label="Article metrics">
          <div><span>Total</span><strong>{blogs.length}</strong></div>
          <div><span>Published</span><strong>{counts.published}</strong></div>
          <div><span>Drafts</span><strong>{counts.drafts}</strong></div>
          <div><span>Archived</span><strong>{counts.archived}</strong></div>
        </section>

        <section className="wp-panel blogs-cms-list-panel">
          <div className="wp-table-tools">
            <input className="field" placeholder="Search articles…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <select className="field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option>draft</option>
              <option>published</option>
              <option>archived</option>
            </select>
            <span className="pill">{filtered.length}/{blogs.length} visible</span>
          </div>
          <div className="wp-table-wrap">
            <table className="wp-table">
              <thead><tr><th>Title</th><th>Status</th><th>Slug</th><th>Published</th><th>Actions</th></tr></thead>
              <tbody>
                <tr className={selected === "new" ? "active-row" : ""}>
                  <td><strong>+ New article</strong><small>Draft editorial record</small></td>
                  <td><span className="status-pill status-draft">draft</span></td>
                  <td>new</td>
                  <td>—</td>
                  <td><button className="link-button" onClick={() => choose("new")}>Create</button></td>
                </tr>
                {filtered.map((blog) => (
                  <tr key={blog.slug} className={selected === blog.slug ? "active-row" : ""}>
                    <td><strong>{blog.title}</strong><small>{blog.excerpt}</small></td>
                    <td><span className={`status-pill status-${blog.status}`}>{blog.status}</span></td>
                    <td>{blog.slug}</td>
                    <td>{blog.publishedAt ? blog.publishedAt.slice(0, 10) : "—"}</td>
                    <td><button className="link-button" onClick={() => choose(blog)}>Edit</button>{blog.slug ? <a href={`/blog/${blog.slug}/`} target="_blank">View</a> : null}</td>
                  </tr>
                ))}
                {!filtered.length ? <tr><td colSpan={5}>No articles found.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="wp-editor-grid blogs-cms-editor-grid">
          <div className="wp-panel editor-main">
            <div className="section-head sticky-editor-head">
              <div><p className="eyebrow">{selected === "new" ? "Create" : "Edit"}</p><h2>{selected === "new" ? "New article" : draft.title}</h2><p className="muted">{draft.slug ? `/blog/${draft.slug}/` : "Unsaved draft"}</p></div>
              <div className="admin-actions">{draft.slug ? <a className="button ghost" href={`/blog/${draft.slug}/`} target="_blank">Preview</a> : null}{selected !== "new" ? <button className="button ghost danger-button" onClick={remove}>Delete</button> : null}</div>
            </div>
            {validation.length ? <div className="notice warning wp-notice"><strong>Needs attention</strong><ul>{validation.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
            <Field label="Title"><input className="field" value={draft.title} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Slug"><div className="inline-field"><input className="field" value={draft.slug} onChange={(e) => set("slug", slugify(e.target.value))} /><button className="button ghost small" onClick={() => set("slug", slugify(draft.title))}>Generate</button></div></Field>
            <Field label="Excerpt"><textarea className="field textarea" value={draft.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></Field>
            <Field label="Content"><textarea className="field textarea blog-content-field wp-markdown-field" value={draft.content} onChange={(e) => set("content", e.target.value)} /></Field>
          </div>

          <aside className="wp-panel editor-side">
            <Field label="Status"><select className="field" value={draft.status} onChange={(e) => set("status", e.target.value)}><option>draft</option><option>published</option><option>archived</option></select></Field>
            <Field label="Author"><input className="field" value={draft.author || ""} onChange={(e) => set("author", e.target.value)} /></Field>
            <Field label="Image URL"><input className="field" value={draft.imageUrl || ""} onChange={(e) => set("imageUrl", e.target.value)} /></Field>
            <Field label="Published at"><input className="field" type="datetime-local" value={(draft.publishedAt || "").slice(0, 16)} onChange={(e) => set("publishedAt", e.target.value)} /></Field>
            <button className="button full" disabled={saving || validation.length > 0} onClick={save}>{saving ? "Saving…" : "Save article"}</button>
            {selected !== "new" ? <button className="button ghost danger-button full" onClick={remove}>Delete article</button> : null}
          </aside>
        </section>
      </main>
    </div>
  );
}
