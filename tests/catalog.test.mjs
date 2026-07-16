import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('catalog has unique slugs and safe URLs', () => {
  const source = readFileSync(new URL('../data/catalog.ts', import.meta.url), 'utf8');
  const slugs = [...source.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(slugs).size, slugs.length);
  const urls = [...source.matchAll(/websiteUrl: "([^"]+)"/g)].map((m) => m[1]);
  assert.ok(urls.length >= 8);
  for (const value of urls) assert.match(value, /^https:\/\//);
});
