import type { Metadata } from "next";
import { SubmitToolForm } from "@/components/SubmitToolForm";

export const metadata: Metadata = { title: "Submit a cybersecurity tool", description: "Signed-in Threats.run users can submit CTI, OSINT, malware analysis, detection engineering, vulnerability, or Web3 security tools for review." };

export default function SubmitPage() {
  return <section className="section shell submit-shell"><div className="submit-hero"><p className="kicker">Signed-in submissions</p><h1>Submit a security tool</h1><p className="lede flush">Add a reviewed cybersecurity tool with richer metadata, category context, tags, and a featured image. Submissions stay pending until an editor approves them.</p><div className="submit-checklist"><span>Authenticated only</span><span>Featured image upload</span><span>Editorial review queue</span></div></div><SubmitToolForm /></section>;
}
