import { json, nowIso, requireAdmin, slugify, type PagesContext } from "../../_shared";

type RawSubmission = Record<string, any>;

function parseRawPayload(payload: unknown): RawSubmission {
  if (typeof payload !== "string" || !payload.trim()) return {};
  try { return JSON.parse(payload) as RawSubmission; } catch { return {}; }
}

function asList(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

export async function onRequestPatch(context: PagesContext) {
  const unauthorized = await requireAdmin(context.request, context.env);
  if (unauthorized) return unauthorized;
  const id = context.params.id;
  const body = (await context.request.json().catch(() => ({}))) as { action?: string; review_note?: string };
  const action = String(body.action || "");
  if (!["approve", "reject"].includes(action)) return json({ error: "action must be approve or reject" }, { status: 400 });
  const submission = await context.env.DB.prepare("SELECT * FROM submissions WHERE id = ? LIMIT 1").bind(id).first<Record<string, string>>();
  if (!submission) return json({ error: "Submission not found" }, { status: 404 });
  const updatedAt = nowIso();
  if (action === "reject") {
    await context.env.DB.prepare("UPDATE submissions SET status = 'rejected', review_note = ?, reviewed_at = ?, updated_at = ? WHERE id = ?").bind(String(body.review_note || ""), updatedAt, updatedAt, id).run();
    return json({ ok: true, status: "rejected" });
  }

  const raw = parseRawPayload(submission.raw_payload);
  const toolId = crypto.randomUUID();
  const slug = slugify(raw.slug || submission.slug || submission.name);
  const pricingModel = String(raw.pricingModel || raw.pricing_model || "freemium");
  const toolType = String(raw.toolType || raw.tool_type || "Security tool");
  const githubUrl = String(raw.githubUrl || raw.github_url || "").trim() || null;
  const docsUrl = String(raw.docsUrl || raw.docs_url || "").trim() || null;
  const screenshotUrl = String(raw.screenshotUrl || raw.screenshot_url || raw.imageUrl || raw.image_url || "").trim() || null;
  const imageUrl = String(raw.logoUrl || raw.logo_url || raw.imageUrl || raw.image_url || "").trim() || null;
  const categorySlugs = asList(raw.categorySlugs || raw.category_slugs || raw.category || submission.category_slug);
  const tags = asList(raw.tags).map(slugify).filter(Boolean);

  const statements = [
    context.env.DB.prepare(`INSERT INTO tools (id, slug, name, tagline, description, website_url, github_url, docs_url, screenshot_url, image_url, pricing_model, tool_type, status, featured, sponsor_tier, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 0, 'none', ?, ?)` )
      .bind(toolId, slug, submission.name, submission.tagline, submission.description, submission.website_url, githubUrl, docsUrl, screenshotUrl, imageUrl, pricingModel, toolType, updatedAt, updatedAt),
    context.env.DB.prepare("UPDATE submissions SET status = 'approved', reviewed_at = ?, updated_at = ? WHERE id = ?").bind(updatedAt, updatedAt, id),
  ];
  for (const categorySlug of categorySlugs) {
    statements.push(context.env.DB.prepare("INSERT OR IGNORE INTO tool_categories (tool_id, category_id) SELECT ?, id FROM categories WHERE slug = ?").bind(toolId, categorySlug));
  }
  for (const tag of tags) {
    statements.push(context.env.DB.prepare("INSERT OR IGNORE INTO tags (id, slug, name) VALUES (?, ?, ?)").bind(tag, tag, tag));
    statements.push(context.env.DB.prepare("INSERT OR IGNORE INTO tool_tags (tool_id, tag_id) VALUES (?, ?)").bind(toolId, tag));
  }
  await context.env.DB.batch(statements);
  return json({ ok: true, status: "approved", tool_id: toolId });
}
