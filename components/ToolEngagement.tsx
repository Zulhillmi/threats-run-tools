"use client";

import { useEffect, useMemo, useState } from "react";

type Stats = { views: number; upvotes: number; downvotes: number; score: number };

function getVisitorId() {
  const name = "tools_visitor";
  const existing = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
  if (existing) return existing;
  const value = crypto.randomUUID();
  document.cookie = `${name}=${value}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  return value;
}

function formatCount(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}m`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

export function ToolEngagement({ slug, name }: { slug: string; name: string }) {
  const [stats, setStats] = useState<Stats>({ views: 0, upvotes: 0, downvotes: 0, score: 0 });
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);
  const [loadingVote, setLoadingVote] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const disqusShortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME;

  const visitorId = useMemo(() => (typeof document === "undefined" ? "" : getVisitorId()), []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/tools/${slug}/stats`).then((response) => response.json()).then((raw) => {
      const data = raw as Partial<Stats>;
      if (!cancelled) setStats({ views: data.views || 0, upvotes: data.upvotes || 0, downvotes: data.downvotes || 0, score: data.score || 0 });
    }).catch(() => undefined);

    const viewedKey = `tools_viewed_${slug}`;
    if (!sessionStorage.getItem(viewedKey)) {
      sessionStorage.setItem(viewedKey, "1");
      const payload = JSON.stringify({ visitorId });
      const sent = navigator.sendBeacon?.(`/api/tools/${slug}/view`, new Blob([payload], { type: "application/json" }));
      if (!sent) {
        fetch(`/api/tools/${slug}/view`, { method: "POST", headers: { "content-type": "application/json" }, body: payload, keepalive: true }).catch(() => undefined);
      }
      setStats((current) => ({ ...current, views: current.views + 1 }));
    }

    return () => { cancelled = true; };
  }, [slug, visitorId]);

  async function vote(value: 1 | -1) {
    setLoadingVote(true);
    try {
      const response = await fetch(`/api/tools/${slug}/vote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ vote: value, visitorId }),
      });
      const data = await response.json() as Partial<Stats> & { userVote?: 1 | -1 };
      if (response.ok) {
        setStats({ views: stats.views, upvotes: data.upvotes || 0, downvotes: data.downvotes || 0, score: data.score || 0 });
        setUserVote(value);
      }
    } finally {
      setLoadingVote(false);
    }
  }

  useEffect(() => {
    if (!showComments || !disqusShortname || document.getElementById("disqus-script")) return;
    const script = document.createElement("script");
    script.id = "disqus-script";
    script.src = `https://${disqusShortname}.disqus.com/embed.js`;
    script.async = true;
    script.setAttribute("data-timestamp", String(Date.now()));
    document.body.appendChild(script);
  }, [showComments, disqusShortname]);

  return (
    <div className="tool-engagement" data-tool-engagement={slug}>
      <div className="engagement-stats" aria-label={`${name} page activity`}>
        <div><strong>{formatCount(stats.views)}</strong><span>views</span></div>
        <div><strong>{formatCount(stats.upvotes)}</strong><span>upvotes</span></div>
        <div><strong>{formatCount(stats.downvotes)}</strong><span>downvotes</span></div>
      </div>
      <div className="vote-box" aria-label={`Vote on ${name}`}>
        <button className={userVote === 1 ? "active" : ""} type="button" disabled={loadingVote} onClick={() => vote(1)}>Useful ↑</button>
        <button className={userVote === -1 ? "active down" : ""} type="button" disabled={loadingVote} onClick={() => vote(-1)}>Not useful ↓</button>
      </div>
      <div className="review-box">
        <div>
          <strong>Community reviews</strong>
          <p>{disqusShortname ? "Read practitioner notes or add your own comment." : "Reviews are ready for a comment provider; votes are live now."}</p>
        </div>
        {disqusShortname ? <button type="button" onClick={() => setShowComments(true)}>Show reviews</button> : <a href="/submit/">Suggest a review</a>}
      </div>
      {showComments && disqusShortname && <div id="disqus_thread" data-disqus-ready="true" />}
    </div>
  );
}
