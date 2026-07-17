import { json, nowIso, requireAdmin, type PagesContext } from "../../_shared";
import { validate } from "./index";

export async function onRequestPatch(context: PagesContext) {
  const unauthorized = await requireAdmin(context.request, context.env);
  if (unauthorized) return unauthorized;
  const currentSlug = context.params.slug;
  const parsed = validate((await context.request.json().catch(() => ({}))) as Record<string, any>);
  if ("error" in parsed) return json({ error: parsed.error }, { status: 400 });
  const b = parsed.value;
  const found = await context.env.DB.prepare("SELECT id FROM blogs WHERE slug = ?").bind(currentSlug).first<{ id: string }>();
  if (!found) return json({ error: "Blog not found" }, { status: 404 });
  await context.env.DB.prepare(`UPDATE blogs SET slug=?, title=?, excerpt=?, content=?, author=?, image_url=?, status=?, published_at=?, updated_at=? WHERE id=?`)
    .bind(b.slug, b.title, b.excerpt, b.content, b.author, b.imageUrl, b.status, b.publishedAt, nowIso(), found.id)
    .run();
  return json({ ok: true, blog: { ...b, id: found.id } });
}

export async function onRequestDelete(context: PagesContext) {
  const unauthorized = await requireAdmin(context.request, context.env);
  if (unauthorized) return unauthorized;
  await context.env.DB.prepare("DELETE FROM blogs WHERE slug = ?").bind(context.params.slug).run();
  return json({ ok: true });
}
