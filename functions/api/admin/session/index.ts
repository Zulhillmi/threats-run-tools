import { json, makeSessionToken, sessionCookie, hasAdminSession, type PagesContext } from "../../_shared";

export async function onRequestGet(context: PagesContext) {
  return json({ authenticated: await hasAdminSession(context.request, context.env) });
}

export async function onRequestPost(context: PagesContext) {
  if (!context.env.ADMIN_PASSWORD || !context.env.ADMIN_SESSION_SECRET) return json({ error: "Admin auth is not configured" }, { status: 503 });
  const body = (await context.request.json().catch(() => ({}))) as { password?: string };
  if (String(body.password || "") !== context.env.ADMIN_PASSWORD) return json({ error: "Invalid password" }, { status: 401 });
  const token = await makeSessionToken(context.env);
  return json({ ok: true }, { headers: { "set-cookie": sessionCookie(token, 60 * 60 * 8) } });
}
