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
  try { return await request.json() as { vote?: number; visitorId?: string }; } catch { return {}; }
}

async function totals(context: PagesContext, slug: string) {
  const row = await context.env.DB.prepare(
    "SELECT COALESCE(SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END), 0) AS upvotes, COALESCE(SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END), 0) AS downvotes FROM tool_votes WHERE tool_slug = ?"
  ).bind(slug).first<{ upvotes: number; downvotes: number }>();
  const upvotes = row?.upvotes || 0;
  const downvotes = row?.downvotes || 0;
  await context.env.DB.prepare(
    "INSERT INTO tool_stats (tool_slug, views, upvotes, downvotes, updated_at) VALUES (?, 0, ?, ?, ?) ON CONFLICT(tool_slug) DO UPDATE SET upvotes = excluded.upvotes, downvotes = excluded.downvotes, updated_at = excluded.updated_at"
  ).bind(slug, upvotes, downvotes, nowIso()).run();
  return { upvotes, downvotes, score: upvotes - downvotes };
}

export async function onRequestPost(context: PagesContext & { params: Params }) {
  const slug = context.params.slug;
  if (!safeSlug(slug)) return json({ error: "Invalid tool" }, { status: 400 });

  const body = await readBody(context.request);
  const vote = body.vote === -1 ? -1 : body.vote === 1 ? 1 : 0;
  if (!vote) return json({ error: "Invalid vote" }, { status: 400 });

  const userAgent = context.request.headers.get("user-agent") || "";
  const visitorId = body.visitorId || "anon";
  const visitorHash = await sha256Hex(`${visitorId}:${userAgent}`);
  const now = nowIso();

  try {
    await context.env.DB.prepare(
      "INSERT INTO tool_votes (id, tool_slug, visitor_hash, vote, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(tool_slug, visitor_hash) DO UPDATE SET vote = excluded.vote, updated_at = excluded.updated_at"
    ).bind(crypto.randomUUID(), slug, visitorHash, vote, now, now).run();

    return json({ ok: true, ...(await totals(context, slug)), userVote: vote });
  } catch {
    return json({ error: "Could not save vote" }, { status: 500 });
  }
}
