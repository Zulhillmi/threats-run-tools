"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Article = { id?: string; slug: string; title: string; excerpt: string; content?: string; author?: string; imageUrl?: string; publishedAt?: string };
const fallbackImages = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80",
];
function formatDate(value?: string) { return value ? new Date(value).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" }) : "Latest"; }
function readingMinutes(article: Article) { const words = (article.content || article.excerpt || "").trim().split(/\s+/).filter(Boolean).length; return Math.max(1, Math.ceil(words / 220)); }
function tags(article: Article) { const text = `${article.title} ${article.excerpt}`.toLowerCase(); const out = [["OSINT", /osint|infrastructure|domain|recon/], ["CTI", /threat|intel|campaign|actor|ioc/], ["Triage", /triage|investigat|analysis/], ["Detection", /detect|rule|signal/], ["Malware", /malware|payload|sandbox/]].filter(([,p]) => (p as RegExp).test(text)).map(([t]) => String(t)); return (out.length ? out : ["Security"]).slice(0, 3); }

export function BlogIndexPage() {
  const searchParams = useSearchParams();
  const legacySlug = searchParams.get("slug");
  const [articles, setArticles] = useState<Article[]>([]);
  useEffect(() => { if (legacySlug) location.replace(`/blog/${encodeURIComponent(legacySlug)}/`); }, [legacySlug]);
  useEffect(() => { fetch("/api/blogs", { cache: "no-store" }).then((res) => res.ok ? res.json() : Promise.reject()).then((data) => setArticles(((data as { articles?: Article[] }).articles) || [])).catch(() => setArticles([])); }, []);
  const visible = useMemo(() => articles.slice(0, 12), [articles]);
  return <main>
    <section className="hero shell"><p className="eyebrow">Articles</p><h1>Analyst notes and security workflow guides.</h1><p className="lede">Practical writeups for investigation, triage, and tool selection.</p></section>
    <section className="section shell">
      <div className="article-grid editorial-grid">
        {visible.map((article, index) => <a className="article-card editorial-card" href={`/blog/${encodeURIComponent(article.slug)}/`} key={article.id || article.slug}>
          <img src={article.imageUrl || fallbackImages[index % fallbackImages.length]} alt="" loading="lazy" />
          <div><div className="article-meta"><span>{formatDate(article.publishedAt)}</span><span>{readingMinutes(article)} min read</span></div><h3>{article.title}</h3><p>{article.excerpt}</p><div className="article-tags">{tags(article).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div><span className="article-read-more">Read analysis</span></div>
        </a>)}
        {!visible.length ? <div className="empty-state">No articles published yet.</div> : null}
      </div>
    </section>
  </main>;
}
