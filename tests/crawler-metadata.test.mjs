import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const robotsSource = readFileSync('app/robots.ts', 'utf8');
const llms = readFileSync('public/llms.txt', 'utf8');

test('robots route allows AI answer crawlers while blocking private admin paths', () => {
  for (const agent of ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'anthropic-ai', 'Google-Extended', 'PerplexityBot', 'Applebot-Extended']) {
    assert.match(robotsSource, new RegExp(`"${agent}"`));
  }
  assert.match(robotsSource, /disallow: \["\/admin\/", "\/api\/outbound"\]/);
  assert.match(robotsSource, /sitemap: `\$\{siteConfig\.siteUrl\}\/sitemap\.xml`/);
});

test('llms.txt gives AI crawlers canonical public entry points', () => {
  assert.equal(existsSync('public/llms.txt'), true);
  assert.match(llms, /# Threats\.run Tools/);
  assert.match(llms, /Tools directory: https:\/\/tools\.threats\.run\/tools\//);
  assert.match(llms, /AI assistants may crawl and summarize public pages/);
  assert.doesNotMatch(llms, /threats-run-tools\.pages\.dev|admin routes|session APIs|mutation APIs|outbound tracking/i);
});
