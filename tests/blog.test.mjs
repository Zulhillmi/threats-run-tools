import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('homepage article cards link to SEO-friendly blog posts', () => {
  const homeArticles = readFileSync(resolve(root, 'components/HomeArticles.tsx'), 'utf8');
  assert.match(homeArticles, /className="article-card editorial-card"/);
  assert.match(homeArticles, /href=\{`\/blog\/\$\{encodeURIComponent\(article\.slug\)\}\/`\}/);
  assert.match(homeArticles, /Read analysis/);
  assert.match(homeArticles, /min read/);
});

test('blog index and SEO-friendly article function exist', () => {
  assert.ok(existsSync(resolve(root, 'app/blog/page.tsx')));
  assert.ok(existsSync(resolve(root, 'functions/blog/[slug].ts')));
  const api = readFileSync(resolve(root, 'functions/api/blogs/[slug].ts'), 'utf8');
  const articleFunction = readFileSync(resolve(root, 'functions/blog/[slug].ts'), 'utf8');
  assert.match(api, /WHERE slug = \? AND status = 'published'/);
  assert.match(articleFunction, /link rel="canonical"/);
  assert.match(articleFunction, /tools\.threats\.run\/blog/);
});
