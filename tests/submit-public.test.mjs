import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('submit page is public and uses user-facing copy', () => {
  const middleware = readFileSync(resolve(root, 'functions/_middleware.ts'), 'utf8');
  const submitPage = readFileSync(resolve(root, 'app/submit/page.tsx'), 'utf8');
  const form = readFileSync(resolve(root, 'components/SubmitToolForm.tsx'), 'utf8');
  const api = readFileSync(resolve(root, 'functions/api/submissions/index.ts'), 'utf8');

  assert.doesNotMatch(middleware, /pathname\.startsWith\("\/submit"\)/);
  assert.match(submitPage, /No sign-in required/);
  assert.doesNotMatch(submitPage, /Signed-in submissions|Authenticated only|Editorial review queue|Featured image upload/);
  assert.doesNotMatch(form, /\/api\/assets\/upload|credentials: "include"|review queue/i);
  assert.doesNotMatch(api, /requireAdmin|unauthorized/);
});
