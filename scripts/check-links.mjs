// Verifies every internal href/src in the built HTML resolves to a file.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const skip = new Set(['node_modules', '.git', 'src', 'scss', 'serverless', 'docs', 'scripts']);
const pages = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (skip.has(f)) continue;
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) pages.push(p);
  }
})('.');

let broken = 0;
for (const page of pages) {
  if (page === '404.html') continue; // uses absolute basePath links by design
  const html = readFileSync(page, 'utf8');
  for (const [, url] of html.matchAll(/(?:href|src)="([^"#?]+)[^"]*"/g)) {
    if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
    let target = resolve(dirname(page), url);
    if (url.endsWith('/') || (existsSync(target) && statSync(target).isDirectory())) target = join(target, 'index.html');
    if (!existsSync(target)) { console.log(`✗ ${page} → ${url}`); broken++; }
  }
}
console.log(`${pages.length} pages checked, ${broken} broken link${broken === 1 ? '' : 's'}.`);
process.exit(broken ? 1 : 0);
