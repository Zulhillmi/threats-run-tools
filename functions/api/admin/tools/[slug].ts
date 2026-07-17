import { json, nowIso, requireAdmin, type PagesContext } from "../../_shared";
import { saveRelations, validate } from "./index";

export async function onRequestPatch(context: PagesContext) {
  const unauthorized = await requireAdmin(context.request, context.env);
  if (unauthorized) return unauthorized;
  const slug = String(context.params.slug || "");
  const existing = await context.env.DB.prepare("SELECT * FROM tools WHERE slug = ? LIMIT 1").bind(slug).first<Record<string, string>>();
  if (!existing) return json({ error: "Tool not found" }, { status: 404 });
  const body = (await context.request.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = validate({ ...body, id: existing.id });
  if ("error" in parsed) return json({ error: parsed.error }, { status: 400 });
  const t = parsed.value;
  const now = nowIso();
  await context.env.DB.prepare(`UPDATE tools SET slug=?, name=?, tagline=?, description=?, website_url=?, github_url=?, docs_url=?, screenshot_url=?, image_url=?, pricing_model=?, tool_type=?, status=?, featured=?, sponsor_tier=?, updated_at=? WHERE id=?`)
    .bind(t.slug, t.name, t.tagline, t.description, t.websiteUrl, t.githubUrl, t.docsUrl, t.screenshotUrl, t.imageUrl, t.pricingModel, t.toolType, t.status, t.featured ? 1 : 0, t.sponsorTier, now, existing.id).run();
  await saveRelations(context.env.DB, existing.id, t.categorySlugs, t.tags);
  return json({ ok: true, tool: { ...t, id: existing.id, updatedAt: now } });
}

export async function onRequestDelete(context: PagesContext) {
  const unauthorized = await requireAdmin(context.request, context.env);
  if (unauthorized) return unauthorized;
  const slug = String(context.params.slug || "");
  const existing = await context.env.DB.prepare("SELECT id FROM tools WHERE slug = ? LIMIT 1").bind(slug).first<Record<string, string>>();
  if (!existing) return json({ error: "Tool not found" }, { status: 404 });
  await context.env.DB.batch([
    context.env.DB.prepare("DELETE FROM tool_categories WHERE tool_id = ?").bind(existing.id),
    context.env.DB.prepare("DELETE FROM tool_tags WHERE tool_id = ?").bind(existing.id),
    context.env.DB.prepare("DELETE FROM tools WHERE id = ?").bind(existing.id),
  ]);
  return json({ ok: true });
}
