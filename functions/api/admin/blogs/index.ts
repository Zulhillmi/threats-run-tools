import { json, nowIso, requireAdmin, slugify, type PagesContext } from "../../_shared";

type Body = Record<string, any>;
const statuses = new Set(["draft", "published", "archived"]);

function validate(body: Body) {
  const title = String(body.title || "").trim();
  const finalSlug = slugify(String(body.slug || title));
  const excerpt = String(body.excerpt || "").trim();
  const content = String(body.content || "").trim();
  const status = String(body.status || "draft").trim();
  if (title.length < 4) return { error: "Title is too short" };
  if (!finalSlug) return { error: "Slug is required" };
  if (excerpt.length < 20 || excerpt.length > 260) return { error: "Excerpt must be 20-260 chars" };
  if (content.length < 20) return { error: "Content must be at least 20 chars" };
  if (!statuses.has(status)) return { error: "Invalid status" };
  return { value: {
    id: String(body.id || finalSlug).trim() || finalSlug,
    slug: finalSlug,
    title,
    excerpt,
    content,
    author: String(body.author || "Threats.run").trim() || "Threats.run",
    imageUrl: String(body.imageUrl || body.image_url || "").trim() || null,
    status,
    publishedAt: String(body.publishedAt || body.published_at || "").trim() || (status === "published" ? nowIso() : null),
  } };
}

export async function onRequestGet(context: PagesContext) {
  const unauthorized = await requireAdmin(context.request, context.env);
  if (unauthorized) return unauthorized;
  const rows = await context.env.DB.prepare(`SELECT id, slug, title, excerpt, content, author, image_url AS imageUrl, status, published_at AS publishedAt, created_at AS createdAt, updated_at AS updatedAt FROM blogs ORDER BY updated_at DESC`).all();
  return json({ blogs: rows.results || [] });
}

export async function onRequestPost(context: PagesContext) {
  const unauthorized = await requireAdmin(context.request, context.env);
  if (unauthorized) return unauthorized;
  const parsed = validate((await context.request.json().catch(() => ({}))) as Body);
  if ("error" in parsed) return json({ error: parsed.error }, { status: 400 });
  const b = parsed.value;
  const now = nowIso();
  await context.env.DB.prepare(`INSERT INTO blogs (id, slug, title, excerpt, content, author, image_url, status, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(b.id, b.slug, b.title, b.excerpt, b.content, b.author, b.imageUrl, b.status, b.publishedAt, now, now)
    .run();
  return json({ ok: true, blog: b }, { status: 201 });
}

export { validate };
