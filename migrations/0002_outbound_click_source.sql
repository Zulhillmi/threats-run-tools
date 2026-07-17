ALTER TABLE outbound_clicks ADD COLUMN click_source TEXT DEFAULT 'unknown';
CREATE INDEX IF NOT EXISTS idx_outbound_source_created ON outbound_clicks(click_source, created_at DESC);
