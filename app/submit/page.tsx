import type { Metadata } from "next";
import { SubmitToolForm } from "@/components/SubmitToolForm";

export const metadata: Metadata = { title: "Submit a cybersecurity tool", description: "Suggest a cybersecurity tool for the Threats.run Tools directory." };

export default function SubmitPage() {
  return <section className="section shell submit-shell"><div className="submit-hero"><p className="kicker">Community suggestions</p><h1>Submit a security tool</h1><p className="lede flush">Suggest a cybersecurity tool for the directory. Add enough context for a quick review: what it does, who it helps, and where people can learn more.</p><div className="submit-checklist"><span>No sign-in required</span><span>Reviewed before listing</span><span>Useful context helps approval</span></div></div><SubmitToolForm /></section>;
}
