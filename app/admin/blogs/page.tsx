import type { Metadata } from "next";
import { AdminBlogsApp } from "@/components/AdminBlogsApp";

export const metadata: Metadata = { title: "Blog admin", robots: { index: false, follow: false } };

export default function AdminBlogsPage() {
  return <main className="admin-page"><section className="page-hero compact"><p className="eyebrow">ADMIN</p><h1>Blog admin</h1><p>Authenticated D1-backed article management for homepage article cards.</p></section><AdminBlogsApp /></main>;
}
