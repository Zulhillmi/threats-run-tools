import type { Metadata } from "next";
import { AdminRealApp } from "@/components/AdminRealApp";

export const metadata: Metadata = { title: "Admin catalog", robots: { index: false, follow: false } };

export default function AdminPage() {
  return <main className="admin-page admin-console-page"><AdminRealApp /></main>;
}
