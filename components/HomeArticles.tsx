"use client";

import { useEffect, useState } from "react";

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author?: string;
  imageUrl?: string;
  publishedAt?: string;
};

export function HomeArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [status, setStatus] = useState("Loading articles…");

  useEffect(() => {
    fetch("/api/blogs", { cache: "no-store" })
      .then((res) => res.ok ? res.json() : Promise.reject(new Error(String(res.status))))
      .then((data) => { const payload = data as { articles?: Article[] }; setArticles((payload.articles || []).slice(0, 3)); setStatus(""); })
      .catch(() => setStatus("Articles coming soon."));
  }, []);

  return <section className="section shell">
    <div className="section-head"><div><p className="kicker">Articles</p><h2>Latest security tooling notes</h2></div></div>
    {status && articles.length === 0 ? <div className="empty-state compact-empty">{status}</div> : <div className="article-grid">
      {articles.map((article) => <a className="article-card" href={`/blog/?slug=${encodeURIComponent(article.slug)}`} key={article.id || article.slug} aria-label={`Read ${article.title}`}>
        {article.imageUrl ? <img src={article.imageUrl} alt="" loading="lazy" /> : <div className="article-art">TR</div>}
        <div>
          <p className="kicker">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" }) : "Article"}</p>
          <h3>{article.title}</h3>
          <p>{article.excerpt}</p>
          {article.author && <span className="muted">By {article.author}</span>}
          <span className="article-read-more">Read article →</span>
        </div>
      </a>)}
    </div>}
  </section>;
}
