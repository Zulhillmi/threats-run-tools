import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const detailPage = readFileSync("app/tools/[slug]/page.tsx", "utf8");
const engagement = readFileSync("components/ToolEngagement.tsx", "utf8");
const migration = readFileSync("migrations/0006_tool_engagement.sql", "utf8");

test("tool detail page tracks outbound CTA sources", () => {
  for (const source of ["detail_hero_cta", "detail_sidebar_cta", "detail_hero_image", "detail_source_website"]) {
    assert.match(detailPage, new RegExp(source));
  }
});

test("tool detail page includes engagement, sponsors, and improved similar tools", () => {
  assert.match(detailPage, /ToolEngagement/);
  assert.match(detailPage, /Community signal/);
  assert.match(detailPage, /Sponsor slot/);
  assert.match(detailPage, /Alternatives and related tools/);
  assert.match(detailPage, /shared categor/);
});

test("tool engagement client supports views, voting, and optional Disqus", () => {
  assert.match(engagement, /\/api\/tools\/\$\{slug\}\/view/);
  assert.match(engagement, /\/api\/tools\/\$\{slug\}\/vote/);
  assert.match(engagement, /NEXT_PUBLIC_DISQUS_SHORTNAME/);
  assert.match(engagement, /Community reviews/);
});

test("tool engagement migration creates stats views and votes tables", () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS tool_stats/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS tool_views/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS tool_votes/);
  assert.match(migration, /UNIQUE\(tool_slug, visitor_hash\)/);
});
