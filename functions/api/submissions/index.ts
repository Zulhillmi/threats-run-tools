import { isSafeUrl, json, nowIso, slugify, type PagesContext } from "../_shared";

function validate(body: Record<string, unknown>) {
  const name = String(body.name || "").trim();
  const websiteUrl = String(body.website_url || "").trim();
  const tagline = String(body.tagline || "").trim();
  const description = String(body.description || "").trim();
  const submitterEmail = String(body.submitter_email || "").trim();
  const category = String(body.category || "cti").trim();
  if (name.length < 2) return "Tool name is too short.";
  if (!isSafeUrl(websiteUrl)) return "Website URL must be http or https.";
  if (tagline.length < 8 || tagline.length > 140) return "Tagline must be 8-140 characters.";
  if (description.length < 40) return "Description needs at least 40 characters.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(submitterEmail)) return "Submitter email is invalid.";
  return { name, websiteUrl, tagline, description, submitterEmail, category };
}

export async function onRequestPost(context: PagesContext) {
  let body: Record<string, unknown>;
  try { body = await context.request.json(); } catch { return json({ error: "Invalid JSON" }, { status: 400 }); }
  const valid = validate(body);
  if (typeof valid === "string") return json({ error: valid }, { status: 400 });
  const id = crypto.randomUUID();
  const createdAt = nowIso();
  await context.env.DB.prepare(`INSERT INTO submissions (id, submitter_email, name, slug, website_url, tagline, description, category_slug, status, raw_payload, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`).bind(id, valid.submitterEmail, valid.name, slugify(valid.name), valid.websiteUrl, valid.tagline, valid.description, valid.category, JSON.stringify(body), createdAt, createdAt).run();
  return json({ ok: true, id, status: "pending" }, { status: 201 });
}
