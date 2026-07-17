import { json, nowIso, type PagesContext } from "../../_shared";

type Params = { slug: string };

function safeSlug(value: string) {
  return /^[a-z0-9-]{1,100}$/.test(value);
}

async function ensureStats(context: PagesContext, slug: string) {
  await context.env.DB.prepare(
    "INSERT OR IGNORE INTO tool_stats (tool_slug, views, upvotes, downvotes, updated_at) VALUES (?, 0, 0, 0, ?)"
  ).bind(slug, nowIso()).run();
}

export async function onRequestGet(context: PagesContext & { params: Params }) {
  const slug = context.params.slug;
  if (!safeSlug(slug)) return json({ error: "Invalid tool" }, { status: 400 });

  try {
    await ensureStats(context, slug);
    const row = await context.env.DB.prepare(
      "SELECT views, upvotes, downvotes, updated_at FROM tool_stats WHERE tool_slug = ? LIMIT 1"
    ).bind(slug).first<{ views: number; upvotes: number; downvotes: number; updated_at: string }>();

    return json({
      views: row?.views || 0,
      upvotes: row?.upvotes || 0,
      downvotes: row?.downvotes || 0,
      score: (row?.upvotes || 0) - (row?.downvotes || 0),
      updatedAt: row?.updated_at || null,
    });
  } catch {
    return json({ views: 0, upvotes: 0, downvotes: 0, score: 0, updatedAt: null });
  }
}
