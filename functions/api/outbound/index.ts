import { isSafeUrl, json, nowIso, type PagesContext } from "../_shared";

export async function onRequestGet(context: PagesContext) {
  const url = new URL(context.request.url);
  const target = url.searchParams.get("url") || "";
  const tool = url.searchParams.get("tool") || "";
  const source = url.searchParams.get("source") || "unknown";
  if (!isSafeUrl(target)) return json({ error: "Invalid outbound URL" }, { status: 400 });

  try {
    await context.env.DB.prepare("INSERT INTO outbound_clicks (id, tool_slug, destination_url, click_source, referrer, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), tool, target, source, context.request.headers.get("referer") || "", context.request.headers.get("user-agent") || "", nowIso())
      .run();
  } catch {
    await context.env.DB.prepare("INSERT INTO outbound_clicks (id, tool_slug, destination_url, referrer, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), tool, target, context.request.headers.get("referer") || "", context.request.headers.get("user-agent") || "", nowIso())
      .run()
      .catch(() => undefined);
  }

  return Response.redirect(target, 302);
}
