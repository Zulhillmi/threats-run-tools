import type { Metadata } from "next";
import { AdminBlogsApp } from "@/components/AdminBlogsApp";

export const metadata: Metadata = { title: "Admin articles", robots: { index: false, follow: false } };

export default function AdminBlogsPage() {
  return <main className="admin-page admin-console-page"><AdminBlogsApp /></main>;
}
