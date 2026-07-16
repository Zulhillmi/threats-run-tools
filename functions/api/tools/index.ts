import { json, type PagesContext } from "../_shared";

export async function onRequestGet(context: PagesContext) {
  const url = new URL(context.request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const category = (url.searchParams.get("category") || "").trim();
  const params: unknown[] = [];
  let where = "WHERE t.status = 'published'";
  if (q) { where += " AND (t.name LIKE ? OR t.tagline LIKE ? OR t.description LIKE ? OR t.tool_type LIKE ?)"; const like = `%${q}%`; params.push(like, like, like, like); }
  if (category) { where += " AND EXISTS (SELECT 1 FROM tool_categories tc JOIN categories c ON c.id = tc.category_id WHERE tc.tool_id = t.id AND c.slug = ?)"; params.push(category); }
  const result = await context.env.DB.prepare(`SELECT t.* FROM tools t ${where} ORDER BY t.featured DESC, t.name ASC LIMIT 100`).bind(...params).all();
  return json({ tools: result.results || [] });
}
