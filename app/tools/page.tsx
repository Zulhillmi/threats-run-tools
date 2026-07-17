import type { Metadata } from "next";
import { categories, getPublishedTools } from "@/data/catalog";
import { ToolDirectory } from "@/components/ToolDirectory";
import { absoluteUrl, siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Cybersecurity tools directory",
  description: "Browse curated CTI, OSINT, malware analysis, detection engineering, security vendor, Web3 security, and vulnerability management tools.",
  alternates: { canonical: absoluteUrl("/tools/") },
  openGraph: { title: "Cybersecurity tools directory", description: siteConfig.description, url: absoluteUrl("/tools/"), type: "website" },
};

export default function ToolsPage() {
  const tools = getPublishedTools();
  return (
    <section className="section shell">
      <div className="section-head">
        <div>
          <p className="kicker">Directory</p>
          <h1>Cybersecurity tools</h1>
          <p className="lede flush">Search curated tools for operators, analysts, malware researchers, detection engineers, and Web3 investigators.</p>
        </div>
      </div>
      <ToolDirectory tools={tools} categories={categories} />
    </section>
  );
}
