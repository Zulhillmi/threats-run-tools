import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const catalog = await fs.readFile(path.join(root, 'data/catalog.ts'), 'utf8');
const outDir = path.join(root, 'public/tool-screenshots');
await fs.mkdir(outDir, { recursive: true });

const tools = [...catalog.matchAll(/\{ id: "([^"]+)", slug: "([^"]+)"[\s\S]*?name: "([^"]+)"[\s\S]*?websiteUrl: "([^"]+)"/g)]
  .map((m) => ({ id: m[1], slug: m[2], name: m[3], url: m[4] }));

const providers = [
  (url) => `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1200`,
  (url) => `https://image.thum.io/get/width/1200/crop/675/noanimate/${url}`,
  (url) => `https://api.microlink.io/?screenshot=true&meta=false&embed=screenshot.url&url=${encodeURIComponent(url)}`,
];

async function fetchBuffer(url, timeoutMs = 35000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 screenshot-enrichment tools.threats.run' } });
    const type = res.headers.get('content-type') || '';
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ab = await res.arrayBuffer();
    return { buffer: Buffer.from(ab), type };
  } finally {
    clearTimeout(timeout);
  }
}

async function normalize(buffer, outPath) {
  const img = sharp(buffer, { failOn: 'none' }).rotate();
  const meta = await img.metadata();
  if (!meta.width || !meta.height || meta.width < 300 || meta.height < 180) throw new Error(`small image ${meta.width}x${meta.height}`);
  const stats = await img.stats();
  const means = stats.channels.slice(0, 3).map((c) => c.mean);
  const stdev = stats.channels.slice(0, 3).map((c) => c.stdev);
  const avgStdev = stdev.reduce((a, b) => a + b, 0) / stdev.length;
  if (avgStdev < 8) throw new Error(`too flat avg stdev ${avgStdev.toFixed(1)}`);
  await img
    .resize(1200, 675, { fit: 'contain', background: { r: 5, g: 5, b: 5, alpha: 1 } })
    .webp({ quality: 78, effort: 4 })
    .toFile(outPath);
  const out = await fs.stat(outPath);
  if (out.size < 7000) throw new Error(`tiny normalized ${out.size}`);
  return { width: meta.width, height: meta.height, size: out.size, avgStdev: Number(avgStdev.toFixed(1)), means: means.map((n) => Number(n.toFixed(1))) };
}

const queue = tools.slice();
const results = [];
async function worker(idx) {
  while (queue.length) {
    const tool = queue.shift();
    const outPath = path.join(outDir, `${tool.slug}.webp`);
    try {
      await fs.access(outPath);
      const stat = await fs.stat(outPath);
      if (stat.size > 7000) {
        results.push({ slug: tool.slug, name: tool.name, status: 'exists', file: `/tool-screenshots/${tool.slug}.webp`, size: stat.size });
        console.log(`EXISTS ${tool.slug}`);
        continue;
      }
    } catch {}
    let ok = false;
    let lastErr = '';
    for (let i = 0; i < providers.length; i++) {
      try {
        const shotUrl = providers[i](tool.url);
        const { buffer, type } = await fetchBuffer(shotUrl);
        if (buffer.length < 15000) throw new Error(`small response ${buffer.length} ${type}`);
        const info = await normalize(buffer, outPath);
        results.push({ slug: tool.slug, name: tool.name, url: tool.url, status: 'ok', provider: i, file: `/tool-screenshots/${tool.slug}.webp`, ...info });
        console.log(`OK ${tool.slug} provider=${i} size=${info.size}`);
        ok = true;
        break;
      } catch (err) {
        lastErr = `${err.message}`;
      }
    }
    if (!ok) {
      try { await fs.rm(outPath, { force: true }); } catch {}
      results.push({ slug: tool.slug, name: tool.name, url: tool.url, status: 'failed', error: lastErr });
      console.log(`FAIL ${tool.slug} ${lastErr}`);
    }
  }
}

await Promise.all([0, 1, 2, 3].map(worker));
await fs.writeFile(path.join(root, 'public/tool-screenshots/manifest.json'), JSON.stringify(results.sort((a,b)=>a.slug.localeCompare(b.slug)), null, 2));
const ok = results.filter((r) => r.status === 'ok' || r.status === 'exists').length;
console.log(`DONE ${ok}/${tools.length} screenshots usable`);
if (ok !== tools.length) process.exitCode = 2;
