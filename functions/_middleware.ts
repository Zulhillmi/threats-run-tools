import { hasAdminAccess, type Env } from "./api/_shared";

type PagesContext = EventContext<Env, string, unknown>;

function html(message: string, status = 403) {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin access required</title><style>body{margin:0;background:#050505;color:#f5f5f5;font-family:Inter,Arial,sans-serif;display:grid;min-height:100vh;place-items:center}.box{width:min(92vw,620px);border:1px solid rgba(255,255,255,.14);border-radius:24px;background:rgba(255,255,255,.05);padding:28px}h1{margin:0 0 12px;font-size:28px}.muted{color:#a3a3a3;line-height:1.6}.pill{display:inline-flex;margin-bottom:16px;padding:6px 10px;border:1px solid rgba(188,255,47,.25);border-radius:999px;color:#bcff2f;font-size:12px;text-transform:uppercase;letter-spacing:.08em}</style></head><body><main class="box"><span class="pill">Protected admin</span><h1>Google sign-in required</h1><p class="muted">${message}</p></main></body></html>`, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function onRequest(context: PagesContext) {
  const pathname = new URL(context.request.url).pathname;
  if (!pathname.startsWith("/admin")) return context.next();

  if (await hasAdminAccess(context.request, context.env)) return context.next();

  if (!context.env.CF_ACCESS_AUD) {
    return html("Cloudflare Access / Google login is not configured for this deployment yet, so this admin surface is closed instead of being public.");
  }

  return html("Sign in with the approved Google account through Cloudflare Access to continue.", 401);
}
