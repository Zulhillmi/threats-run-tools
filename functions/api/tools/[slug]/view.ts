import { json, nowIso, type PagesContext } from "../../_shared";

type Params = { slug: string };

function safeSlug(value: string) {
  return /^[a-z0-9-]{1,100}$/.test(value);
}

async function sha256Hex(input: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function readBody(request: Request) {
  try { return await request.json() as { visitorId?: string }; } catch { return {}; }
}

function botLike(userAgent: string) {
  return /bot|crawl|spider|preview|facebookexternalhit|slurp|bing|yandex|duckduck|whatsapp|telegram/i.test(userAgent);
}

export async function onRequestPost(context: PagesContext & { params: Params }) {
  const slug = context.params.slug;
  if (!safeSlug(slug)) return json({ error: "Invalid tool" }, { status: 400 });

  const userAgent = context.request.headers.get("user-agent") || "";
  if (botLike(userAgent)) return json({ ok: true, ignored: true });

  const body = await readBody(context.request);
  const visitorSeed = `${body.visitorId || "anon"}:${userAgent}`;
  const visitorHash = await sha256Hex(visitorSeed);
  const id = crypto.randomUUID();
  const now = nowIso();

  try {
    await context.env.DB.prepare(
      "INSERT INTO tool_views (id, tool_slug, visitor_hash, referrer, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(id, slug, visitorHash, context.request.headers.get("referer") || "", userAgent, now).run();

    await context.env.DB.prepare(
      "INSERT INTO tool_stats (tool_slug, views, upvotes, downvotes, updated_at) VALUES (?, 1, 0, 0, ?) ON CONFLICT(tool_slug) DO UPDATE SET views = views + 1, updated_at = excluded.updated_at"
    ).bind(slug, now).run();
  } catch {
    return json({ ok: false }, { status: 202 });
  }

  return json({ ok: true });
}
