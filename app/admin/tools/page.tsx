import type { Metadata } from "next";
import { categories, getPublishedTools } from "@/data/catalog";
import { AdminWorkbench } from "@/components/AdminWorkbench";

export const metadata: Metadata = { title: "Catalog editor", robots: { index: false, follow: false } };

export default function AdminToolsPage() {
  const tools = getPublishedTools();
  return (
    <section className="section shell admin-page">
      <div className="section-head">
        <div>
          <p className="kicker">Admin</p>
          <h1>Catalog editor</h1>
          <p className="lede flush">Edit tool records in-browser, validate required public fields, and export TypeScript/JSON for commit-based publishing.</p>
        </div>
        <a className="button ghost" href="/admin/">Admin home</a>
      </div>
      <AdminWorkbench tools={tools} categories={categories} />
    </section>
  );
}
