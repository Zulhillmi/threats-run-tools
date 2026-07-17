import { hasAdminAccess, type Env } from "./api/_shared";

type PagesContext = EventContext<Env, string, unknown>;

export async function onRequest(context: PagesContext) {
  const url = new URL(context.request.url);
  if (!url.pathname.startsWith("/admin")) return context.next();
  if (url.pathname.startsWith("/admin/login")) return context.next();
  if (await hasAdminAccess(context.request, context.env)) return context.next();
  const login = new URL("/admin/login/", url.origin);
  login.searchParams.set("redirect", url.pathname);
  return Response.redirect(login.toString(), 302);
}
