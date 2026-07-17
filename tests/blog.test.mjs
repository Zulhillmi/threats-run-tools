import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('homepage article cards link to readable blog posts', () => {
  const homeArticles = readFileSync(resolve(root, 'components/HomeArticles.tsx'), 'utf8');
  assert.match(homeArticles, /className="article-card"/);
  assert.match(homeArticles, /href=\{`\/blog\/\?slug=\$\{encodeURIComponent\(article\.slug\)\}`\}/);
  assert.match(homeArticles, /Read article/);
});

test('blog post route and published article API exist', () => {
  assert.ok(existsSync(resolve(root, 'app/blog/page.tsx')));
  const api = readFileSync(resolve(root, 'functions/api/blogs/[slug].ts'), 'utf8');
  assert.match(api, /WHERE slug = \? AND status = 'published'/);
  assert.match(api, /Article not found/);
});
