import { json, nowIso, slugify, type PagesContext } from "../_shared";
import { validateSubmissionInput } from "../../../lib/submissionValidation";

export async function onRequestPost(context: PagesContext) {
  let body: Record<string, unknown>;
  try { body = await context.request.json(); } catch { return json({ error: "Invalid JSON" }, { status: 400 }); }
  const valid = validateSubmissionInput(body);
  if (!valid.ok) return json({ error: "Please correct the highlighted fields.", fieldErrors: valid.errors }, { status: 400 });
  const id = crypto.randomUUID();
  const createdAt = nowIso();
  const value = valid.value;
  const rawPayload = JSON.stringify({ ...body, ...value, categorySlugs: [value.category] });
  await context.env.DB.prepare(`INSERT INTO submissions (id, submitter_email, name, slug, website_url, tagline, description, category_slug, status, raw_payload, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`).bind(id, value.submitterEmail, value.name, slugify(value.name), value.websiteUrl, value.tagline, value.description, value.category, rawPayload, createdAt, createdAt).run();
  return json({ ok: true, id, status: "pending" }, { status: 201 });
}
