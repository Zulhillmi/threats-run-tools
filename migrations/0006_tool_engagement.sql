CREATE TABLE IF NOT EXISTS tool_stats (
  tool_slug TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tool_views (
  id TEXT PRIMARY KEY,
  tool_slug TEXT NOT NULL,
  visitor_hash TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tool_views_slug_created ON tool_views(tool_slug, created_at DESC);

CREATE TABLE IF NOT EXISTS tool_votes (
  id TEXT PRIMARY KEY,
  tool_slug TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  vote INTEGER NOT NULL CHECK (vote IN (-1, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(tool_slug, visitor_hash)
);

CREATE INDEX IF NOT EXISTS idx_tool_votes_slug ON tool_votes(tool_slug);
