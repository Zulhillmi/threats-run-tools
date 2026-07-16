export interface Env {
  DB: D1Database;
  TOOL_ASSETS?: R2Bucket;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
}

export type PagesContext = EventContext<Env, string, unknown>;

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), { ...init, headers: { "content-type": "application/json; charset=utf-8", ...(init.headers || {}) } });
}

export function nowIso() { return new Date().toISOString(); }

export function isSafeUrl(value: string) {
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; }
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function getCookie(request: Request, name: string) {
  const header = request.headers.get("cookie") || "";
  return header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
}

async function sha256Hex(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function makeSessionToken(env: Env) {
  if (!env.ADMIN_SESSION_SECRET) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return sha256Hex(`tools-admin:${env.ADMIN_SESSION_SECRET}`);
}

export async function hasAdminSession(request: Request, env: Env) {
  const token = getCookie(request, "tools_admin");
  if (!token) return false;
  try { return token === await makeSessionToken(env); } catch { return false; }
}

export async function requireAdmin(request: Request, env: Env) {
  if (await hasAdminSession(request, env)) return null;
  return json({ error: "Unauthorized" }, { status: 401 });
}

export function sessionCookie(value: string, maxAge: number) {
  return `tools_admin=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearSessionCookie() {
  return "tools_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax";
}
