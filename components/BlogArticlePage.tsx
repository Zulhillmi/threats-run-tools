"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author?: string;
  imageUrl?: string;
  publishedAt?: string;
};

function formatDate(value?: string) {
  if (!value) return "Article";
  return new Date(value).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });
}

export function BlogArticlePage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "";
  const [article, setArticle] = useState<Article | null>(null);
  const [status, setStatus] = useState("Loading article…");

  useEffect(() => {
    if (!slug) {
      setArticle(null);
      setStatus("Article not found.");
      return;
    }
    setStatus("Loading article…");
    fetch(`/api/blogs/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((res) => res.ok ? res.json() : Promise.reject(new Error(String(res.status))))
      .then((data) => {
        const payload = data as { article?: Article };
        if (!payload.article) throw new Error("missing article");
        setArticle(payload.article);
        setStatus("");
      })
      .catch(() => {
        setArticle(null);
        setStatus("Article not found.");
      });
  }, [slug]);

  const paragraphs = useMemo(() => article?.content.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean) || [], [article]);

  if (!article) {
    return <main className="shell section"><div className="empty-state compact-empty">{status}</div></main>;
  }

  return <main>
    <section className="tool-hero shell blog-hero">
      <div className="breadcrumbs"><a href="/">Tools</a><span>/</span><span>Articles</span><span>/</span><span>{article.title}</span></div>
      <div className="tool-hero-grid blog-hero-grid">
        <div className="tool-hero-copy">
          <p className="kicker">{formatDate(article.publishedAt)}</p>
          <h1>{article.title}</h1>
          <p className="lede flush">{article.excerpt}</p>
          {article.author && <p className="muted">By {article.author}</p>}
        </div>
        <div className="tool-hero-media">{article.imageUrl ? <img src={article.imageUrl} alt="" /> : <div className="article-art large-art">TR</div>}</div>
      </div>
    </section>

    <section className="section shell blog-layout">
      <article className="content-card blog-article">
        {paragraphs.length > 0 ? paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>{article.excerpt}</p>}
      </article>
      <aside className="tool-sidebar">
        <div className="card sticky-card">
          <p className="kicker">Article</p>
          <dl className="facts">
            <div><dt>Published</dt><dd>{formatDate(article.publishedAt)}</dd></div>
            {article.author && <div><dt>Author</dt><dd>{article.author}</dd></div>}
          </dl>
          <a className="button full" href="/">Back to tools</a>
        </div>
      </aside>
    </section>
  </main>;
}
