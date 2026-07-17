import type { Metadata } from "next";
import { categories, getPublishedTools } from "@/data/catalog";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function AdminPage() {
  const tools = getPublishedTools();
  const featured = tools.filter((tool) => tool.featured).length;
  const vendors = tools.filter((tool) => tool.categorySlugs.includes("security-vendors")).length;
  return (
    <section className="section shell">
      <p className="kicker">Admin</p>
      <h1>Tools admin</h1>
      <p className="lede flush">Operator console for reviewing submissions and preparing catalog changes before committing them to the static directory.</p>
      <div className="stats admin-stats">
        <div className="stat"><strong>{tools.length}</strong><span>published tools</span></div>
        <div className="stat"><strong>{featured}</strong><span>featured picks</span></div>
        <div className="stat"><strong>{vendors}</strong><span>security vendors</span></div>
        <div className="stat"><strong>{categories.length}</strong><span>categories</span></div>
      </div>
      <div className="grid admin-home-grid">
        <a className="card" href="/admin/tools/"><h3>Catalog editor</h3><p>Edit tool metadata, categories, pricing, screenshots, FAQ copy, and export a ready-to-paste catalog entry.</p></a>
        <a className="card" href="/admin/submissions/"><h3>Submission review</h3><p>Paste submitted JSON, validate required fields, normalize it into a draft entry, and identify cleanup work.</p></a>
        <div className="card"><h3>Current limitation</h3><p>This static Pages build cannot write directly to Git from the browser yet. The admin exports clean entries for commit-based publishing.</p></div>
      </div>
    </section>
  );
}
