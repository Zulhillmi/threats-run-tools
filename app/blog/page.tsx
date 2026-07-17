import { Suspense } from "react";
import { BlogArticlePage } from "@/components/BlogArticlePage";

export const metadata = {
  title: "Article — Threats.run Tools",
  alternates: { canonical: "/blog/" },
};

export default function BlogPage() {
  return <Suspense fallback={<main className="shell section"><div className="empty-state compact-empty">Loading article…</div></main>}><BlogArticlePage /></Suspense>;
}
