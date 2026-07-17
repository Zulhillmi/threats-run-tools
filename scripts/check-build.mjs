import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const required = ['out/index.html', 'out/tools/index.html', 'out/submit/index.html', 'out/sitemap.xml', 'out/robots.txt'];
for (const file of required) {
  if (!existsSync(file)) throw new Error(`Missing build artifact: ${file}`);
}
const home = readFileSync(join('out', 'index.html'), 'utf8');
for (const marker of ['Threats.run (TOOLS)', 'Cybersecurity tools for analysts', 'Explore by category']) {
  if (!home.includes(marker)) throw new Error(`Missing homepage marker: ${marker}`);
}
const tool = readFileSync(join('out', 'tools', 'urlscan', 'index.html'), 'utf8');
if (!tool.includes('urlscan.io')) throw new Error('Missing urlscan detail page marker');
console.log('Build artifacts verified:', required.length + 1, 'checks');
