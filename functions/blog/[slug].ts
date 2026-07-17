import { json, type PagesContext } from "../api/_shared";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value?: string) {
  if (!value) return "Article";
  return new Date(value).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });
}

function readingMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function inferTags(title: string, excerpt: string) {
  const text = `${title} ${excerpt}`.toLowerCase();
  const tags = [
    ["OSINT", /osint|infrastructure|domain|recon/],
    ["CTI", /threat|intel|campaign|actor|ioc/],
    ["Triage", /triage|investigat|analysis/],
    ["Detection", /detect|rule|signal/],
    ["Malware", /malware|payload|sandbox/],
  ].filter(([, pattern]) => (pattern as RegExp).test(text)).map(([tag]) => String(tag));
  return tags.length ? tags.slice(0, 3) : ["Security"];
}

export async function onRequestGet(context: PagesContext) {
  const slug = String(context.params.slug || "");
  if (!slug) return json({ error: "Missing slug" }, { status: 400 });
  const article = await context.env.DB.prepare(`SELECT id, slug, title, excerpt, content, author, image_url AS imageUrl, status, published_at AS publishedAt, created_at AS createdAt, updated_at AS updatedAt FROM blogs WHERE slug = ? AND status = 'published' LIMIT 1`)
    .bind(slug)
    .first<Record<string, string>>();
  if (!article) return new Response("Article not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });

  const canonical = `https://tools.threats.run/blog/${encodeURIComponent(article.slug)}/`;
  const title = escapeHtml(article.title);
  const excerpt = escapeHtml(article.excerpt);
  const date = formatDate(article.publishedAt || article.createdAt);
  const minutes = readingMinutes(article.content || article.excerpt || "");
  const tags = inferTags(article.title || "", article.excerpt || "");
  const image = article.imageUrl || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80`;
  const paragraphs = String(article.content || article.excerpt || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const tagHtml = tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  const bodyHtml = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} | Threats.run (TOOLS)</title><meta name="description" content="${excerpt}"><link rel="canonical" href="${canonical}">
<meta property="og:title" content="${title}"><meta property="og:description" content="${excerpt}"><meta property="og:url" content="${canonical}"><meta property="og:type" content="article"><meta property="og:image" content="${escapeHtml(image)}">
<style>body{margin:0;background:#050505;color:#f5f5f5;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit;text-decoration:none}.shell{width:min(960px,calc(100% - 32px));margin:0 auto}.header{border-bottom:1px solid rgba(255,255,255,.1);background:#050505}.header div{height:68px;display:flex;align-items:center;justify-content:space-between}.brand{font-weight:800;letter-spacing:-.04em}.nav{display:flex;gap:18px;color:rgba(245,245,245,.72);font-size:14px}.hero{padding:42px 0 24px}.kicker{color:#bcff2f;font:700 12px ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase}.hero h1{font-size:clamp(34px,5vw,64px);line-height:1.02;letter-spacing:-.055em;margin:14px 0}.excerpt{font-size:18px;line-height:1.65;color:rgba(245,245,245,.74);max-width:760px}.meta{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0;color:rgba(245,245,245,.6);font-size:14px}.tag{display:inline-flex;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:6px 10px;color:rgba(245,245,245,.72);font-size:12px}.hero-img{width:100%;aspect-ratio:16/7;object-fit:cover;border-radius:28px;border:1px solid rgba(255,255,255,.12);margin-top:22px;background:#111}.article{padding:18px 0 60px}.article-card{border:1px solid rgba(255,255,255,.12);background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.035));border-radius:28px;padding:clamp(22px,4vw,42px)}.article p{font-size:18px;line-height:1.82;color:rgba(245,245,245,.84);margin:0 0 20px}.back{display:inline-flex;margin-top:22px;color:#bcff2f;font-weight:800}</style></head>
<body><header class="header"><div class="shell"><a class="brand" href="/">Threats.run (TOOLS)</a><nav class="nav"><a href="/tools/">Tools</a><a href="/blog/">Articles</a><a href="/submit/">Submit</a></nav></div></header>
<main><section class="hero shell"><p class="kicker">${date} · ${minutes} min read</p><h1>${title}</h1><p class="excerpt">${excerpt}</p><div class="meta">${tagHtml}</div><img class="hero-img" src="${escapeHtml(image)}" alt=""></section>
<section class="article shell"><article class="article-card">${bodyHtml}<a class="back" href="/blog/">Back to articles</a></article></section></main></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } });
}
