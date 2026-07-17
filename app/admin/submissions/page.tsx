import type { Metadata } from "next";
import { categories } from "@/data/catalog";
import { AdminSubmissionsWorkbench } from "@/components/AdminSubmissionsWorkbench";

export const metadata: Metadata = { title: "Submission queue", robots: { index: false, follow: false } };

export default function AdminSubmissionsPage() {
  return (
    <section className="section shell admin-page">
      <div className="section-head">
        <div>
          <p className="kicker">Admin</p>
          <h1>Submission review</h1>
          <p className="lede flush">Normalize submitted tool data into a draft catalog entry and catch missing fields before publishing.</p>
        </div>
        <a className="button ghost" href="/admin/">Admin home</a>
      </div>
      <AdminSubmissionsWorkbench categories={categories} />
    </section>
  );
}
