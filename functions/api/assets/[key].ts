import { json, type PagesContext } from "../_shared";

export async function onRequestGet(context: PagesContext) {
  if (!context.env.TOOL_ASSETS) return json({ error: "Asset storage is not configured" }, { status: 503 });
  const key = decodeURIComponent(String(context.params.key || ""));
  if (!key || key.includes("/") || key.includes("..")) return json({ error: "Invalid asset key" }, { status: 400 });
  const object = await context.env.TOOL_ASSETS.get(key);
  if (!object) return json({ error: "Asset not found" }, { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", headers.get("cache-control") || "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
