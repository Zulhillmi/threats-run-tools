CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  website_url TEXT NOT NULL,
  github_url TEXT,
  docs_url TEXT,
  logo_key TEXT,
  screenshot_url TEXT,
  image_url TEXT,
  pricing_model TEXT NOT NULL DEFAULT 'freemium',
  tool_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  featured INTEGER NOT NULL DEFAULT 0,
  sponsor_tier TEXT NOT NULL DEFAULT 'none',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  seo_title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tool_categories (
  tool_id TEXT NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (tool_id, category_id)
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tool_tags (
  tool_id TEXT NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (tool_id, tag_id)
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  submitter_email TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  website_url TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  raw_payload TEXT NOT NULL,
  review_note TEXT,
  reviewed_by TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS outbound_clicks (
  id TEXT PRIMARY KEY,
  tool_id TEXT,
  tool_slug TEXT,
  destination_url TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tools_status_featured ON tools(status, featured, name);
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_submissions_status_created ON submissions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outbound_tool_created ON outbound_clicks(tool_slug, created_at DESC);
