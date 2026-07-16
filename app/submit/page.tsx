import type { Metadata } from "next";
import { SubmitToolForm } from "@/components/SubmitToolForm";

export const metadata: Metadata = { title: "Submit a cybersecurity tool", description: "Submit a CTI, OSINT, malware analysis, detection engineering, vulnerability, or Web3 security tool for review." };

export default function SubmitPage() {
  return <section className="section shell"><p className="kicker">Submission queue</p><h1>Submit a security tool</h1><p className="lede" style={{ marginLeft: 0 }}>Submissions go into an approval queue before appearing publicly. No pay-to-win ranking in the MVP.</p><SubmitToolForm /></section>;
}
