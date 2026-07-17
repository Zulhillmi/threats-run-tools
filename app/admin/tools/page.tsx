import type { Metadata } from "next";
import { AdminRealApp } from "@/components/AdminRealApp";

export const metadata: Metadata = { title: "Catalog admin", robots: { index: false, follow: false } };

export default function AdminToolsPage() {
  return <main className="admin-page"><section className="page-hero compact"><p className="eyebrow">ADMIN</p><h1>Catalog admin</h1><p>Create, edit, publish, archive, feature, and delete tools in D1.</p></section><AdminRealApp /></main>;
}
