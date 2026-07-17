"use client";

import { useMemo, useState } from "react";
import type { Category, PricingModel, Tool } from "@/lib/types";

type Props = { categories: Category[] };

type Submission = Partial<Tool> & { submitterEmail?: string; notes?: string };

const starter = JSON.stringify({
  name: "Example Vendor",
  websiteUrl: "https://example.com/",
  tagline: "One-line value proposition.",
  description: "What the tool does, who it is for, and when analysts should use it.",
  pricingModel: "freemium",
  toolType: "Threat intelligence platform",
  categorySlugs: ["cti"],
  tags: ["ioc", "enrichment"],
  submitterEmail: "analyst@example.com",
  notes: "Why this should be listed."
}, null, 2);

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalize(submission: Submission): Tool {
  const slug = submission.slug || slugify(submission.name || "new-tool");
  return {
    id: submission.id || slug,
    slug,
    name: submission.name || "New tool",
    tagline: submission.tagline || "",
    description: submission.description || "",
    websiteUrl: submission.websiteUrl || "",
    githubUrl: submission.githubUrl,
    docsUrl: submission.docsUrl,
    screenshotUrl: submission.screenshotUrl,
    imageUrl: submission.imageUrl,
    pricingModel: (submission.pricingModel || "freemium") as PricingModel,
    toolType: submission.toolType || "",
    tags: submission.tags || [],
    categorySlugs: submission.categorySlugs || [],
    featured: false,
    sponsorTier: "none",
    status: "draft",
  };
}

function clean(tool: Tool) {
  return JSON.stringify(tool, null, 2).replace(/"([^"\\]+)":/g, "$1:").replace(/\n/g, "\n  ");
}

export function AdminSubmissionsWorkbench({ categories }: Props) {
  const [raw, setRaw] = useState(starter);
  const [copyState, setCopyState] = useState("");

  const parsed = useMemo(() => {
    try {
      const value = JSON.parse(raw) as Submission;
      return { value, error: "" };
    } catch (error) {
      return { value: null, error: error instanceof Error ? error.message : "Invalid JSON" };
    }
  }, [raw]);

  const draft = parsed.value ? normalize(parsed.value) : null;
  const problems = draft ? [
    !draft.name && "Missing name",
    !draft.websiteUrl && "Missing website URL",
    !/^https?:\/\//.test(draft.websiteUrl) && "Website should start with http:// or https://",
    !draft.tagline && "Missing tagline",
    !draft.description && "Missing description",
    !draft.toolType && "Missing tool type",
    draft.categorySlugs.length === 0 && "Missing category",
    ...draft.categorySlugs.filter((slug) => !categories.some((category) => category.slug === slug)).map((slug) => `Unknown category: ${slug}`),
  ].filter(Boolean) as string[] : [];

  const exportEntry = draft ? `  ${clean(draft)},` : "";

  async function copy() {
    if (!exportEntry) return;
    try {
      await navigator.clipboard.writeText(exportEntry);
      setCopyState("Copied normalized draft entry.");
    } catch {
      setCopyState("Clipboard failed; copy from the export box manually.");
    }
  }

  return (
    <div className="admin-workbench two-column-admin">
      <section className="admin-panel">
        <p className="kicker">Incoming submission</p>
        <h2>Normalize submitted tool JSON</h2>
        <p className="muted-copy">Paste a submission payload, validate it, then copy a draft catalog entry for editorial cleanup.</p>
        <label>Submission JSON<textarea className="field code-field submission-box" value={raw} onChange={(event) => setRaw(event.target.value)} /></label>
        {parsed.error && <div className="notice error-box">JSON error: {parsed.error}</div>}
      </section>
      <section className="admin-panel">
        <div className="admin-toolbar"><div><p className="kicker">Review</p><h2>{draft?.name || "No valid submission"}</h2></div><button className="button small" type="button" onClick={copy} disabled={!draft}>Copy draft entry</button></div>
        {copyState && <div className="notice success">{copyState}</div>}
        {draft && <>
          <dl className="facts admin-facts">
            <div><dt>Slug</dt><dd>{draft.slug}</dd></div>
            <div><dt>Pricing</dt><dd>{draft.pricingModel}</dd></div>
            <div><dt>Categories</dt><dd>{draft.categorySlugs.join(", ") || "—"}</dd></div>
            <div><dt>Tags</dt><dd>{draft.tags.join(", ") || "—"}</dd></div>
          </dl>
          {problems.length > 0 ? <div className="notice warning"><strong>Before publishing:</strong><ul>{problems.map((item) => <li key={item}>{item}</li>)}</ul></div> : <div className="notice success">Looks structurally ready as a draft. Still review copy and screenshots before publishing.</div>}
          <label>Draft catalog entry<textarea className="field code-field export-field" readOnly value={exportEntry} /></label>
        </>}
      </section>
    </div>
  );
}
