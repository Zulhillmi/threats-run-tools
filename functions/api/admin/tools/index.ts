import { isSafeUrl, json, nowIso, requireAdmin, slugify, type PagesContext } from "../../_shared";

type Body = Record<string, any>;

const pricing = new Set(["free", "open-source", "freemium", "paid", "enterprise"]);
const statuses = new Set(["draft", "published", "archived"]);
const sponsors = new Set(["none", "community", "sponsor", "partner"]);

function asList(value: unknown) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((v) => v.trim()).filter(Boolean);
  return [];
}

function validate(body: Body) {
  const name = String(body.name || "").trim();
  const finalSlug = slugify(String(body.slug || name));
  const websiteUrl = String(body.websiteUrl || body.website_url || "").trim();
  const tagline = String(body.tagline || "").trim();
  const description = String(body.description || "").trim();
  const pricingModel = String(body.pricingModel || body.pricing_model || "freemium").trim();
  const toolType = String(body.toolType || body.tool_type || "Security tool").trim();
  const status = String(body.status || "draft").trim();
  const sponsorTier = String(body.sponsorTier || body.sponsor_tier || "none").trim();
  const categorySlugs = asList(body.categorySlugs || body.category_slugs);
  const tags = asList(body.tags).map(slugify).filter(Boolean);
  if (name.length < 2) return { error: "Name is too short" };
  if (!finalSlug) return { error: "Slug is required" };
  if (!isSafeUrl(websiteUrl)) return { error: "Website URL must be http or https" };
  if (tagline.length < 4 || tagline.length > 180) return { error: "Tagline must be 4-180 chars" };
  if (description.length < 20) return { error: "Description must be at least 20 chars" };
  if (!pricing.has(pricingModel)) return { error: "Invalid pricing model" };
  if (!statuses.has(status)) return { error: "Invalid status" };
  if (!sponsors.has(sponsorTier)) return { error: "Invalid sponsor tier" };
  return {
    value: {
      id: String(body.id || finalSlug).trim() || finalSlug,
      slug: finalSlug,
      name,
      tagline,
      description,
      websiteUrl,
      githubUrl: String(body.githubUrl || body.github_url || "").trim() || null,
      docsUrl: String(body.docsUrl || body.docs_url || "").trim() || null,
      screenshotUrl: String(body.screenshotUrl || body.screenshot_url || "").trim() || null,
      imageUrl: String(body.imageUrl || body.image_url || "").trim() || null,
      pricingModel,
      toolType,
      status,
      featured: Boolean(body.featured),
      sponsorTier,
      categorySlugs,
      tags,
    },
  };
}

async function saveRelations(db: any, toolId: string, categorySlugs: string[], tags: string[]) {
  const statements = [
    db.prepare("DELETE FROM tool_categories WHERE tool_id = ?").bind(toolId),
    db.prepare("DELETE FROM tool_tags WHERE tool_id = ?").bind(toolId),
  ];
  for (const slug of categorySlugs) {
    statements.push(db.prepare("INSERT OR IGNORE INTO tool_categories (tool_id, category_id) SELECT ?, id FROM categories WHERE slug = ?").bind(toolId, slug));
  }
  for (const tag of tags) {
    statements.push(db.prepare("INSERT OR IGNORE INTO tags (id, slug, name) VALUES (?, ?, ?)").bind(tag, tag, tag));
    statements.push(db.prepare("INSERT OR IGNORE INTO tool_tags (tool_id, tag_id) VALUES (?, ?)").bind(toolId, tag));
  }
  await db.batch(statements);
}

export async function onRequestPost(context: PagesContext) {
  const unauthorized = await requireAdmin(context.request, context.env);
  if (unauthorized) return unauthorized;
  const parsed = validate((await context.request.json().catch(() => ({}))) as Body);
  if ("error" in parsed) return json({ error: parsed.error }, { status: 400 });
  const t = parsed.value;
  const now = nowIso();
  await context.env.DB.batch([
    context.env.DB.prepare(`INSERT INTO tools (id, slug, name, tagline, description, website_url, github_url, docs_url, screenshot_url, image_url, pricing_model, tool_type, status, featured, sponsor_tier, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(t.id, t.slug, t.name, t.tagline, t.description, t.websiteUrl, t.githubUrl, t.docsUrl, t.screenshotUrl, t.imageUrl, t.pricingModel, t.toolType, t.status, t.featured ? 1 : 0, t.sponsorTier, now, now),
  ]);
  await saveRelations(context.env.DB, t.id, t.categorySlugs, t.tags);
  return json({ ok: true, tool: t }, { status: 201 });
}

export { validate, saveRelations };
