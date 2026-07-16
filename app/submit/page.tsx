import type { Metadata } from "next";
import { SubmitToolForm } from "@/components/SubmitToolForm";

export const metadata: Metadata = { title: "Submit a cybersecurity tool", description: "Submit a CTI, OSINT, malware analysis, detection engineering, vulnerability, or Web3 security tool for review." };

export default function SubmitPage() {
  return <section className="section shell"><p className="kicker">Community submissions</p><h1>Submit a security tool</h1><p className="lede flush">Send us a tool worth adding. We review submissions before they appear in the directory.</p><SubmitToolForm /></section>;
}
