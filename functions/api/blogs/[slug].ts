import { json, type PagesContext } from "../_shared";

export async function onRequestGet(context: PagesContext) {
  const slug = String(context.params.slug || "");
  if (!slug) return json({ error: "Missing slug" }, { status: 400 });

  const article = await context.env.DB.prepare(`SELECT id, slug, title, excerpt, content, author, image_url AS imageUrl, status, published_at AS publishedAt, created_at AS createdAt, updated_at AS updatedAt FROM blogs WHERE slug = ? AND status = 'published' LIMIT 1`)
    .bind(slug)
    .first();

  if (!article) return json({ error: "Article not found" }, { status: 404 });
  return json({ article });
}
