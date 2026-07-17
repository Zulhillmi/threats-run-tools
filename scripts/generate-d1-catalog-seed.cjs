const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('data/catalog.ts', 'utf8')
  .replace(/^import[^\n]+\n/, '')
  .replace(/export const categories: Category\[] = /, 'const categories = ')
  .replace(/export const tools: Tool\[] = /, 'const tools = ')
  .replace(/export function getPublishedTools[\s\S]*$/m, '')
  + '\nmodule.exports = { categories, tools };\n';
const sandbox = { module: { exports: {} }, exports: {} };
vm.runInNewContext(source, sandbox, { filename: 'catalog.ts' });
const { categories, tools } = sandbox.module.exports;

function q(v) { return v == null || v === '' ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`; }
function id(slug) { return slug.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || slug; }
const lines = [];
lines.push('BEGIN TRANSACTION;');
for (const c of categories) {
  lines.push(`INSERT INTO categories (id, slug, name, description, seo_title, created_at, updated_at) VALUES (${q('cat_'+id(c.slug))}, ${q(c.slug)}, ${q(c.name)}, ${q(c.description)}, ${q(c.seoTitle)}, datetime('now'), datetime('now')) ON CONFLICT(slug) DO UPDATE SET name=excluded.name, description=excluded.description, seo_title=excluded.seo_title, updated_at=datetime('now');`);
}
for (const t of tools) {
  lines.push(`INSERT INTO tools (id, slug, name, tagline, description, website_url, github_url, docs_url, screenshot_url, image_url, pricing_model, tool_type, status, featured, sponsor_tier, created_at, updated_at) VALUES (${q(t.id || t.slug)}, ${q(t.slug)}, ${q(t.name)}, ${q(t.tagline)}, ${q(t.description)}, ${q(t.websiteUrl)}, ${q(t.githubUrl)}, ${q(t.docsUrl)}, ${q(t.screenshotUrl)}, ${q(t.imageUrl)}, ${q(t.pricingModel || 'freemium')}, ${q(t.toolType || 'Security tool')}, ${q(t.status || 'draft')}, ${t.featured ? 1 : 0}, ${q(t.sponsorTier || 'none')}, datetime('now'), datetime('now')) ON CONFLICT(slug) DO UPDATE SET name=excluded.name, tagline=excluded.tagline, description=excluded.description, website_url=excluded.website_url, github_url=excluded.github_url, docs_url=excluded.docs_url, screenshot_url=excluded.screenshot_url, image_url=excluded.image_url, pricing_model=excluded.pricing_model, tool_type=excluded.tool_type, status=excluded.status, featured=excluded.featured, sponsor_tier=excluded.sponsor_tier, updated_at=datetime('now');`);
  lines.push(`DELETE FROM tool_categories WHERE tool_id = ${q(t.id || t.slug)};`);
  for (const cs of (t.categorySlugs || [])) lines.push(`INSERT OR IGNORE INTO tool_categories (tool_id, category_id) SELECT ${q(t.id || t.slug)}, id FROM categories WHERE slug = ${q(cs)};`);
  lines.push(`DELETE FROM tool_tags WHERE tool_id = ${q(t.id || t.slug)};`);
  for (const tag of (t.tags || [])) {
    const s = id(tag.toLowerCase());
    lines.push(`INSERT OR IGNORE INTO tags (id, slug, name) VALUES (${q(s)}, ${q(s)}, ${q(tag)});`);
    lines.push(`INSERT OR IGNORE INTO tool_tags (tool_id, tag_id) VALUES (${q(t.id || t.slug)}, ${q(s)});`);
  }
}
lines.push('COMMIT;');
fs.writeFileSync('migrations/0004_sync_catalog_from_static.sql', lines.join('\n'));
console.log(`wrote ${tools.length} tools and ${categories.length} categories`);
