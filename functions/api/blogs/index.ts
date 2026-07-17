import { json, type PagesContext } from "../_shared";

export async function onRequestGet(context: PagesContext) {
  const rows = await context.env.DB.prepare(`SELECT id, slug, title, excerpt, content, author, image_url AS imageUrl, status, published_at AS publishedAt, created_at AS createdAt, updated_at AS updatedAt FROM blogs WHERE status = 'published' ORDER BY COALESCE(published_at, created_at) DESC LIMIT 12`).all();
  return json({ articles: rows.results || [] });
}
