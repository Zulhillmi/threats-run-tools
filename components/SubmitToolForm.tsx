"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function SubmitToolForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const response = await fetch("/api/submissions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) { setStatus("error"); setMessage(data.error || "Submission failed."); return; }
    form.reset(); setStatus("success"); setMessage("Submitted. It is in the review queue.");
  }
  return <form className="form" onSubmit={onSubmit}><label>Tool name<input className="field" name="name" minLength={2} required /></label><label>Website URL<input className="field" name="website_url" type="url" placeholder="https://example.com" required /></label><label>Short tagline<input className="field" name="tagline" minLength={8} maxLength={140} required /></label><label>Description<small>What it does, who uses it, and why it belongs here.</small><textarea className="field" name="description" minLength={40} required /></label><label>Category<select className="field" name="category"><option value="cti">Threat intelligence</option><option value="osint">OSINT</option><option value="malware-analysis">Malware analysis</option><option value="detection-engineering">Detection engineering</option><option value="web3-security">Web3 security</option><option value="vulnerability-management">Vulnerability management</option></select></label><label>Submitter email<input className="field" name="submitter_email" type="email" required /></label><button className="button" disabled={status === "submitting"}>{status === "submitting" ? "Submitting…" : "Submit for review"}</button>{message && <p className={status === "error" ? "error" : "notice"}>{message}</p>}</form>;
}
