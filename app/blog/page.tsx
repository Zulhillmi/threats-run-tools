import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogIndexPage } from "@/components/BlogIndexPage";

export const metadata: Metadata = {
  title: "Articles",
  description: "Analyst notes and cybersecurity workflow guides from Threats.run TOOLS.",
  alternates: { canonical: "/blog/" },
};

function BlogFallback() {
  return <main><section className="hero shell"><p className="eyebrow">Articles</p><h1>Analyst notes and security workflow guides.</h1><p className="lede">Practical writeups for investigation, triage, and tool selection.</p></section></main>;
}

export default function BlogPage() { return <Suspense fallback={<BlogFallback />}><BlogIndexPage /></Suspense>; }
