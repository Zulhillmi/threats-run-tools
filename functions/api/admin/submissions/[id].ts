import { json, nowIso, requireAdmin, type PagesContext } from "../../_shared";

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
  const toolId = crypto.randomUUID();
  await context.env.DB.batch([
    context.env.DB.prepare(`INSERT INTO tools (id, slug, name, tagline, description, website_url, pricing_model, tool_type, status, featured, sponsor_tier, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'freemium', 'Security tool', 'published', 0, 'none', ?, ?)` ).bind(toolId, submission.slug, submission.name, submission.tagline, submission.description, submission.website_url, updatedAt, updatedAt),
    context.env.DB.prepare("UPDATE submissions SET status = 'approved', reviewed_at = ?, updated_at = ? WHERE id = ?").bind(updatedAt, updatedAt, id),
  ]);
  return json({ ok: true, status: "approved", tool_id: toolId });
}
