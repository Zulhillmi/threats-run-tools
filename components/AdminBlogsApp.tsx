"use client";

import { useEffect, useMemo, useState } from "react";

type Blog = { id?: string; slug: string; title: string; excerpt: string; content: string; author?: string; imageUrl?: string; status: string; publishedAt?: string };
const emptyBlog: Blog = { slug: "", title: "", excerpt: "", content: "", author: "Threats.run", imageUrl: "", status: "draft", publishedAt: "" };
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function AdminBlogsApp() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("new");
  const [draft, setDraft] = useState<Blog>(emptyBlog);
  const [status, setStatus] = useState("Loading blogs…");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/blogs", { credentials: "include", cache: "no-store" });
    if (res.status === 401) { window.location.href = `/admin/login/?redirect=${encodeURIComponent(location.pathname)}`; return; }
    if (!res.ok) { setStatus(`Failed to load blogs: ${res.status}`); return; }
    const data = await res.json() as { blogs?: Blog[] };
    setBlogs(data.blogs || []); setStatus(`Loaded ${(data.blogs || []).length} blogs from D1`);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => blogs.filter((blog) => `${blog.title} ${blog.slug} ${blog.status}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>a.title.localeCompare(b.title)), [blogs, query]);
  function choose(blog: Blog | "new") { if (blog === "new") { setSelected("new"); setDraft(emptyBlog); } else { setSelected(blog.slug); setDraft({ ...emptyBlog, ...blog }); } }
  function set<K extends keyof Blog>(key: K, value: Blog[K]) { setDraft((current) => ({ ...current, [key]: value })); }

  async function save() {
    setSaving(true); setStatus("Saving blog…");
    const method = selected === "new" ? "POST" : "PATCH";
    const path = selected === "new" ? "/api/admin/blogs" : `/api/admin/blogs/${encodeURIComponent(selected)}`;
    const res = await fetch(path, { method, credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) });
    const data = await res.json().catch(() => ({})) as { error?: string; blog?: { slug?: string } };
    setSaving(false);
    if (!res.ok) { setStatus(data.error || `Save failed: ${res.status}`); return; }
    setStatus(`Saved ${draft.title}`); await load(); setSelected(data.blog?.slug || draft.slug);
  }
  async function remove() {
    if (selected === "new" || !confirm(`Delete ${draft.title}?`)) return;
    const res = await fetch(`/api/admin/blogs/${encodeURIComponent(selected)}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) { setStatus(`Delete failed: ${res.status}`); return; }
    setStatus(`Deleted ${draft.title}`); choose("new"); await load();
  }

  return <div className="admin-workbench real-admin">
    <aside className="admin-panel admin-sidebar-panel">
      <div className="admin-toolbar"><button className="button small" onClick={() => choose("new")}>New blog</button><a className="button ghost small" href="/admin/">Tools</a></div>
      <p className="pill">{filtered.length}/{blogs.length} live D1</p>
      <input className="field" placeholder="Search blogs…" value={query} onChange={(e)=>setQuery(e.target.value)} />
      <div className="admin-tool-list" role="listbox" aria-label="Live blogs">
        {filtered.map((blog) => <button key={blog.slug} className={`admin-row ${selected === blog.slug ? "active" : ""}`} onClick={() => choose(blog)}><strong>{blog.title}</strong><span>{blog.status} · {blog.slug}</span></button>)}
      </div>
    </aside>
    <section className="admin-panel admin-editor">
      <div className="section-head"><div><p className="eyebrow">BLOG ADMIN</p><h2>{selected === "new" ? "Create blog" : `Edit ${draft.title}`}</h2><p className="muted">{status}</p></div><div className="admin-actions"><button className="button" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save blog"}</button>{selected !== "new" && <button className="button ghost" onClick={remove}>Delete</button>}</div></div>
      <div className="admin-form-grid">
        <label>Title<input className="field" value={draft.title} onChange={(e)=>set("title", e.target.value)} /></label>
        <label>Slug<div className="inline-field"><input className="field" value={draft.slug} onChange={(e)=>set("slug", e.target.value)} /><button className="button ghost small" onClick={()=>set("slug", slugify(draft.title))}>Generate</button></div></label>
        <label>Author<input className="field" value={draft.author || ""} onChange={(e)=>set("author", e.target.value)} /></label>
        <label>Status<select className="field" value={draft.status} onChange={(e)=>set("status", e.target.value)}><option>draft</option><option>published</option><option>archived</option></select></label>
        <label>Image URL<input className="field" value={draft.imageUrl || ""} onChange={(e)=>set("imageUrl", e.target.value)} /></label>
        <label>Published at<input className="field" type="datetime-local" value={(draft.publishedAt || "").slice(0,16)} onChange={(e)=>set("publishedAt", e.target.value)} /></label>
      </div>
      <label>Excerpt<textarea className="field textarea" value={draft.excerpt} onChange={(e)=>set("excerpt", e.target.value)} /></label>
      <label>Content<textarea className="field textarea blog-content-field" value={draft.content} onChange={(e)=>set("content", e.target.value)} /></label>
    </section>
  </div>;
}
