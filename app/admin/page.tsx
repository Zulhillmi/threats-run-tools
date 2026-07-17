import type { Metadata } from "next";
import { AdminRealApp } from "@/components/AdminRealApp";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function AdminPage() {
  return <main className="admin-page"><section className="page-hero compact"><p className="eyebrow">ADMIN</p><h1>Live catalog admin</h1><p>Authenticated D1-backed tool management. Changes save to the database through protected Pages Functions.</p><div className="cta-row left"><a className="button ghost" href="/admin/blogs/">Blog admin</a></div></section><AdminRealApp /></main>;
}
