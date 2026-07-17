import { hasAdminAccess, type Env } from "./api/_shared";

type PagesContext = EventContext<Env, string, unknown>;

function needsSignedInUser(pathname: string) {
  return pathname.startsWith("/admin");
}

export async function onRequest(context: PagesContext) {
  const url = new URL(context.request.url);
  if (!needsSignedInUser(url.pathname)) return context.next();
  if (url.pathname.startsWith("/admin/login")) return context.next();
  if (await hasAdminAccess(context.request, context.env)) return context.next();
  const login = new URL("/admin/login/", url.origin);
  login.searchParams.set("redirect", `${url.pathname}${url.search}`);
  return Response.redirect(login.toString(), 302);
}
