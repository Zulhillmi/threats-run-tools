CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blogs_status_published ON blogs(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);

INSERT INTO blogs (id, slug, title, excerpt, content, author, image_url, status, published_at, created_at, updated_at) VALUES
('blog-tool-click-analytics', 'tool-click-analytics-for-security-vendors', 'Why security vendors should care about tool-directory click analytics', 'Premium listings should prove buyer intent, not just impressions. Tracked outbound clicks help show which tools analysts actually visit.', 'Premium listings should prove buyer intent, not just impressions. A directory can separate casual browsing from high-intent vendor visits by tracking featured-image outbound clicks while keeping title clicks as internal research behavior.', 'Threats.run', NULL, 'published', datetime('now', '-2 days'), datetime('now'), datetime('now')),
('blog-cti-tool-stack', 'building-a-practical-cti-tool-stack', 'Building a practical CTI tool stack', 'A practical CTI stack combines enrichment, malware context, infrastructure pivots, vulnerability signal, and detection workflows.', 'A practical CTI stack combines enrichment, malware context, infrastructure pivots, vulnerability signal, and detection workflows. Start with tools analysts use daily, then add specialized sources as gaps appear.', 'Threats.run', NULL, 'published', datetime('now', '-1 day'), datetime('now'), datetime('now')),
('blog-osint-triage', 'osint-triage-for-suspicious-infrastructure', 'OSINT triage for suspicious infrastructure', 'Fast infrastructure triage needs domain, DNS, certificate, URL, and reputation pivots before teams spend time on deeper analysis.', 'Fast infrastructure triage needs domain, DNS, certificate, URL, and reputation pivots before teams spend time on deeper analysis. Good tooling reduces context switching and keeps evidence shareable.', 'Threats.run', NULL, 'published', datetime('now'), datetime('now'), datetime('now'))
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, excerpt=excluded.excerpt, content=excluded.content, author=excluded.author, image_url=excluded.image_url, status=excluded.status, published_at=excluded.published_at, updated_at=datetime('now');
