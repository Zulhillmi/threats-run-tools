"use client";

import { useMemo, useState } from "react";
import { getSubmissionValidationErrors, type SubmissionValidationErrors } from "@/lib/submissionValidation";

type Status = "idle" | "uploading" | "submitting" | "success" | "error";

type FormState = {
  name: string;
  website_url: string;
  tagline: string;
  description: string;
  category: string;
  submitter_email: string;
  pricing_model: string;
  tool_type: string;
  github_url: string;
  docs_url: string;
  image_url: string;
  screenshot_url: string;
  logo_url: string;
  tags: string;
  notes: string;
};

const initialForm: FormState = {
  name: "",
  website_url: "",
  tagline: "",
  description: "",
  category: "cti",
  submitter_email: "",
  pricing_model: "freemium",
  tool_type: "Security tool",
  github_url: "",
  docs_url: "",
  image_url: "",
  screenshot_url: "",
  logo_url: "",
  tags: "",
  notes: "",
};

function inputClass(error?: string) {
  return `field${error ? " field-error" : ""}`;
}

function FieldError({ message }: { message?: string }) {
  return message ? <small className="field-error-text">{message}</small> : null;
}

export function SubmitToolForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<SubmissionValidationErrors>({});
  const [form, setForm] = useState<FormState>(initialForm);
  const [previewUrl, setPreviewUrl] = useState("");

  const imagePreview = useMemo(() => form.image_url || form.screenshot_url || previewUrl, [form.image_url, form.screenshot_url, previewUrl]);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function uploadImage(file?: File | null) {
    if (!file) return;
    setStatus("uploading");
    setMessage("Uploading featured image…");
    const payload = new FormData();
    payload.set("file", file);
    payload.set("name", form.name || "tool-image");
    const response = await fetch("/api/assets/upload", { method: "POST", credentials: "include", body: payload });
    const data = (await response.json().catch(() => ({}))) as { error?: string; url?: string };
    if (!response.ok || !data.url) {
      setStatus("error");
      setMessage(data.error || "Image upload failed.");
      return;
    }
    setField("image_url", data.url);
    setField("screenshot_url", data.url);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus("idle");
    setMessage("Featured image uploaded and attached.");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    const clientErrors = getSubmissionValidationErrors(form);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setStatus("error");
      setMessage("Please correct the highlighted fields.");
      return;
    }
    const response = await fetch("/api/submissions", { method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
    const data = (await response.json().catch(() => ({}))) as { error?: string; fieldErrors?: SubmissionValidationErrors };
    if (!response.ok) {
      setStatus("error");
      setFieldErrors(data.fieldErrors || {});
      setMessage(data.error || (response.status === 401 ? "Sign in before submitting." : "Submission failed."));
      return;
    }
    setForm(initialForm);
    setPreviewUrl("");
    setFieldErrors({});
    setStatus("success");
    setMessage("Submitted. It is in the review queue.");
  }

  return <form className="form submit-form" onSubmit={onSubmit}>
    <div className="submit-form-grid">
      <section className="content-card submit-card">
        <p className="kicker">Core listing</p>
        <label>Tool name<input className={inputClass(fieldErrors.name)} value={form.name} onChange={(event) => setField("name", event.target.value)} minLength={2} required /><FieldError message={fieldErrors.name} /></label>
        <label>Website URL<input className={inputClass(fieldErrors.websiteUrl)} value={form.website_url} onChange={(event) => setField("website_url", event.target.value)} type="url" placeholder="https://example.com" required /><FieldError message={fieldErrors.websiteUrl} /></label>
        <label>Short tagline<input className={inputClass(fieldErrors.tagline)} value={form.tagline} onChange={(event) => setField("tagline", event.target.value)} minLength={8} maxLength={140} required /><FieldError message={fieldErrors.tagline} /></label>
        <label>Description<small>What it does, who uses it, and why it belongs here.</small><textarea className={inputClass(fieldErrors.description)} value={form.description} onChange={(event) => setField("description", event.target.value)} minLength={40} required /><FieldError message={fieldErrors.description} /></label>
        <div className="submit-two-col"><label>Category<select className={inputClass(fieldErrors.category)} value={form.category} onChange={(event) => setField("category", event.target.value)}><option value="cti">Threat intelligence</option><option value="osint">OSINT</option><option value="malware-analysis">Malware analysis</option><option value="detection-engineering">Detection engineering</option><option value="web3-security">Web3 security</option><option value="vulnerability-management">Vulnerability management</option><option value="security-vendors">Security vendors</option></select><FieldError message={fieldErrors.category} /></label><label>Submitter email<input className={inputClass(fieldErrors.submitterEmail)} value={form.submitter_email} onChange={(event) => setField("submitter_email", event.target.value)} type="email" required /><FieldError message={fieldErrors.submitterEmail} /></label></div>
      </section>

      <aside className="content-card submit-card media-card">
        <p className="kicker">Featured image</p>
        <div className="image-dropzone">
          {imagePreview ? <img src={imagePreview} alt="Featured image preview" /> : <div><strong>Upload a featured image</strong><span>PNG, JPG, WebP, GIF, or SVG. Max 4 MB.</span></div>}
        </div>
        <label>Upload image<input className="field file-field" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" onChange={(event) => void uploadImage(event.target.files?.[0])} /></label>
        <label>Or paste image URL<input className={inputClass(fieldErrors.imageUrl)} value={form.image_url} onChange={(event) => { setField("image_url", event.target.value); setField("screenshot_url", event.target.value); }} placeholder="https://.../screenshot.webp" /><FieldError message={fieldErrors.imageUrl} /></label>
        <label>Logo URL / icon URL<input className={inputClass(fieldErrors.logoUrl)} value={form.logo_url} onChange={(event) => setField("logo_url", event.target.value)} placeholder="Optional" /><FieldError message={fieldErrors.logoUrl} /></label>
      </aside>
    </div>

    <section className="content-card submit-card">
      <p className="kicker">Extra context</p>
      <div className="submit-two-col"><label>Pricing model<select className={inputClass(fieldErrors.pricingModel)} value={form.pricing_model} onChange={(event) => setField("pricing_model", event.target.value)}><option value="free">Free</option><option value="open-source">Open source</option><option value="freemium">Freemium</option><option value="paid">Paid</option><option value="enterprise">Enterprise</option></select><FieldError message={fieldErrors.pricingModel} /></label><label>Tool type<input className={inputClass(fieldErrors.toolType)} value={form.tool_type} onChange={(event) => setField("tool_type", event.target.value)} placeholder="Threat intelligence platform" /><FieldError message={fieldErrors.toolType} /></label></div>
      <div className="submit-two-col"><label>GitHub URL<input className={inputClass(fieldErrors.githubUrl)} value={form.github_url} onChange={(event) => setField("github_url", event.target.value)} placeholder="Optional" /><FieldError message={fieldErrors.githubUrl} /></label><label>Docs URL<input className={inputClass(fieldErrors.docsUrl)} value={form.docs_url} onChange={(event) => setField("docs_url", event.target.value)} placeholder="Optional" /><FieldError message={fieldErrors.docsUrl} /></label></div>
      <label>Tags<small>Comma-separated: ioc, enrichment, sandbox, yara…</small><input className="field" value={form.tags} onChange={(event) => setField("tags", event.target.value)} /></label>
      <label>Reviewer notes<textarea className="field" value={form.notes} onChange={(event) => setField("notes", event.target.value)} placeholder="Why this belongs in the directory, edge cases, vendor notes, etc." /></label>
      <div className="submit-actions"><button className="button" disabled={status === "submitting" || status === "uploading"}>{status === "submitting" ? "Submitting…" : status === "uploading" ? "Uploading…" : "Submit for review"}</button>{message && <p className={status === "error" ? "error" : "notice"}>{message}</p>}</div>
    </section>
  </form>;
}
