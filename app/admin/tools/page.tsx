import type { Metadata } from "next";
import { AdminToolListApp } from "@/components/AdminToolsApps";

export const metadata: Metadata = { title: "Admin tools", robots: { index: false, follow: false } };

export default function AdminToolsPage() { return <main className="admin-page admin-console-page"><AdminToolListApp /></main>; }
