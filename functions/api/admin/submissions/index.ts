import { json, requireAdmin, type PagesContext } from "../../_shared";

export async function onRequestGet(context: PagesContext) {
  const unauthorized = await requireAdmin(context.request, context.env);
  if (unauthorized) return unauthorized;
  const result = await context.env.DB.prepare("SELECT * FROM submissions ORDER BY created_at DESC LIMIT 100").all();
  return json({ submissions: result.results || [] });
}
