#!/usr/bin/env node
/**
 * 生成 src/data/page-lastmod.json：每个页面的"最后修改日期"。
 *
 * 为什么必须这么做（2026-10-01 修正）：
 *   原实现让静态页面的 <lastmod> 取"部署时间"，结果是每次部署都把全部静态页面
 *   标成"当天修改"。Google 官方文档对 <lastmod> 的原话是：
 *     "Google uses the <lastmod> value if it's consistently and verifiably
 *      (for example by comparing to the last modification of the page) accurate."
 *   即：只有"一致且可验证准确"时才会被采用，否则直接忽略。
 *   按部署时间生成既不一致，也无法验证，等于白写，还可能让爬虫反复重抓未变的页面。
 *
 * 现在的依据：git 历史中该页面源文件的最后一次提交日期——任何人 `git log` 都能复核，
 * 且不随部署变化。文章页仍使用 data/articles.json 里的真实 updated_at（在 sitemap 路由中处理）。
 *
 * 用法：node scripts/gen-page-lastmod.mjs   （已挂到 package.json 的 build 前置步骤）
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const APP_DIR = join(ROOT, 'src', 'app');
const OUT = join(ROOT, 'src', 'data', 'page-lastmod.json');
const toPosix = (p) => p.split('\\').join('/');

/** 取某文件在 git 历史中的最后提交日期（YYYY-MM-DD）；未跟踪/无历史时回退文件 mtime */
function lastModified(fileRelPosix) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', fileRelPosix], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch {
    /* git 不可用时走 mtime 回退 */
  }
  const abs = join(ROOT, fileRelPosix);
  if (existsSync(abs)) {
    const d = statSync(abs).mtime;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  return null;
}

/** 递归找出所有 page.tsx 并推导路由 */
function findPages(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      findPages(full, acc);
    } else if (entry.name === 'page.tsx') {
      acc.push(full);
    }
  }
  return acc;
}

const routes = {};
for (const file of findPages(APP_DIR)) {
  const relDir = relative(APP_DIR, join(file, '..'));
  const segments = relDir ? toPosix(relDir).split('/') : [];
  // 动态路由（[slug] 等）不进 sitemap 的静态列表，跳过
  if (segments.some((s) => s.startsWith('['))) continue;
  if (segments[0] === 'admin') continue; // 后台不进 sitemap

  const route = segments.length ? '/' + segments.join('/') : '/';
  const pageFile = toPosix(relative(ROOT, file));

  // 候选源文件：页面文件本身 + 该页面专属的数据文件（内容改了，页面就算改了）
  const candidates = [pageFile];
  const last = segments[segments.length - 1];
  for (const extra of [`src/data/topics/${last}.tsx`, `src/data/topics/${last}.ts`, `src/data/${last}.ts`, `src/data/${last}.tsx`]) {
    if (existsSync(join(ROOT, extra))) candidates.push(extra);
  }
  if (route.startsWith('/services/district')) candidates.push('src/data/districts.ts');

  let newest = null;
  for (const c of candidates) {
    const d = lastModified(c);
    if (d && (!newest || d > newest)) newest = d;
  }
  if (newest) routes[route] = newest;
}

const sorted = Object.fromEntries(Object.keys(routes).sort().map((k) => [k, routes[k]]));

// 动态路由对应的成组页面：用通配键给 sitemap 做回退（精确路由优先）
const WILDCARD = {
  '/news/*': ['src/app/news/[slug]/page.tsx'],
  '/services/district/*': ['src/app/services/district/[slug]/page.tsx', 'src/data/districts.ts'],
};
for (const [key, files] of Object.entries(WILDCARD)) {
  let newest = null;
  for (const f of files) {
    const d = lastModified(f);
    if (d && (!newest || d > newest)) newest = d;
  }
  if (newest) sorted[key] = newest;
}

writeFileSync(OUT, JSON.stringify(sorted, null, 2) + '\n', 'utf8');

const exact = Object.keys(sorted).filter((k) => !k.endsWith('/*'));
const dates = Object.values(sorted).sort();
console.log(`[page-lastmod] 已生成 ${OUT}`);
console.log(`[page-lastmod] 精确路由 ${exact.length} 个 + 通配规则 ${Object.keys(sorted).length - exact.length} 条，日期区间 ${dates[0]} ~ ${dates[dates.length - 1]}`);
for (const [r, d] of Object.entries(sorted)) console.log(`  ${d}  ${r}`);
