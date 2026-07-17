import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminToolEditorApp } from "@/components/AdminToolsApps";

export const metadata: Metadata = { title: "Edit tool", robots: { index: false, follow: false } };

export default function AdminToolEditPage() { return <main className="admin-page admin-console-page"><Suspense fallback={null}><AdminToolEditorApp mode="edit" /></Suspense></main>; }
