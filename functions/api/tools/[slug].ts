import { json, type PagesContext } from "../_shared";

export async function onRequestGet(context: PagesContext) {
  const slug = context.params.slug;
  const result = await context.env.DB.prepare("SELECT * FROM tools WHERE slug = ? AND status = 'published' LIMIT 1").bind(slug).first();
  if (!result) return json({ error: "Tool not found" }, { status: 404 });
  return json({ tool: result });
}
