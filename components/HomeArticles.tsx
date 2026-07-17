"use client";

import { useEffect, useMemo, useState } from "react";
import { publicArticles, type PublicArticle } from "@/lib/articles";

type Article = PublicArticle & { id?: string };

const fallbackImages = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80",
];

function formatDate(value?: string) {
  if (!value) return "Latest";
  return new Date(value).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });
}

function readingMinutes(article: Article) {
  const words = (article.content || article.excerpt || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function inferTags(article: Article) {
  const text = `${article.title} ${article.excerpt}`.toLowerCase();
  const tags = [
    ["OSINT", /osint|infrastructure|domain|recon/],
    ["CTI", /threat|intel|campaign|actor|ioc/],
    ["Triage", /triage|investigat|analysis/],
    ["Detection", /detect|rule|signal/],
    ["Malware", /malware|payload|sandbox/],
  ].filter(([, pattern]) => (pattern as RegExp).test(text)).map(([tag]) => String(tag));
  return (tags.length ? tags : ["Security"]).slice(0, 3);
}

function imageFor(article: Article, index: number) {
  return article.imageUrl || fallbackImages[index % fallbackImages.length];
}

export function HomeArticles() {
  const [articles, setArticles] = useState<Article[]>(publicArticles);
  useEffect(() => {
    fetch("/api/blogs", { cache: "no-store" })
      .then((res) => res.ok ? res.json() : Promise.reject(new Error(String(res.status))))
      .then((data) => setArticles(((data as { articles?: Article[] }).articles) || []))
      .catch(() => setArticles(publicArticles));
  }, []);
  const visible = useMemo(() => articles.slice(0, 6), [articles]);
  if (!visible.length) return null;
  return <section className="section shell articles-section">
    <div className="section-head">
      <div><p className="kicker">Analysis</p><h2>Recent articles</h2><p className="muted-copy">Short operational reads for analysts and security teams.</p></div>
      <a className="button ghost" href="/blog/">View all</a>
    </div>
    <div className="article-grid editorial-grid">
      {visible.map((article, index) => <a className="article-card editorial-card" href={`/blog/${encodeURIComponent(article.slug)}/`} key={article.id || article.slug} aria-label={`Read ${article.title}`}>
        <img src={imageFor(article, index)} alt="" loading="lazy" />
        <div>
          <div className="article-meta"><span>{formatDate(article.publishedAt)}</span><span>{readingMinutes(article)} min read</span></div>
          <h3>{article.title}</h3>
          <p>{article.excerpt}</p>
          <div className="article-tags">{inferTags(article).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
          <span className="article-read-more">Read analysis</span>
        </div>
      </a>)}
    </div>
  </section>;
}
