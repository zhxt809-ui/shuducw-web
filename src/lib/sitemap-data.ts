import { createHash } from 'node:crypto';
import { listArticles } from '@/lib/store';
import { districts } from '@/data/districts';
import pageLastmod from '@/data/page-lastmod.json';

/**
 * sitemap 数据与渲染（/sitemap.xml 与 /sitemap.txt 共用，避免两处逻辑漂移）
 *
 * lastmod 的取值原则（2026-10-01 修正，依据 Google 官方文档）：
 *   Google 原文："Google uses the <lastmod> value if it's consistently and verifiably
 *   (for example by comparing to the last modification of the page) accurate."
 *   即只有"一致且可验证准确"才会被采用，否则忽略。
 *   因此：
 *     · 静态页面 → 取 src/data/page-lastmod.json 中该路由的真实最后修改日期
 *       （由 scripts/gen-page-lastmod.mjs 依据 git 提交历史生成，可逐文件复核）
 *     · 分类页 /news/<分类> → 取该分类下最新文章的更新时间（列表确实随之变化）
 *     · 文章页 → 取 data/articles.json 中该文章真实的 updated_at
 *     · 仅"新页面尚未进入 page-lastmod.json"时才回退到部署时间（此时它确实是新内容）
 *   绝不把全部页面写成"今天"，那正是会被忽略、且会让爬虫反复重抓未变页面的做法。
 */

export type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
};

/** 模块加载时间（生产环境≈本次部署启动时间），仅作为新页面的回退值 */
const DEPLOY_TIME = new Date();

const PAGE_LASTMOD = pageLastmod as Record<string, string>;

/** 分类页路由 → 对应文章分类 */
const CATEGORY_PATHS: Record<string, string> = {
  '/news/shilu': 'shilu',
  '/news/cases': 'cases',
  '/news/tips': 'tips',
  '/news/policies': 'policies',
};

function parseDay(day: string): Date {
  return new Date(`${day}T00:00:00+08:00`);
}

/** 静态页面的真实最后修改日期：精确路由 → 通配路由 → 部署时间 */
function pageDate(path: string): Date {
  const exact = PAGE_LASTMOD[path];
  if (exact) return parseDay(exact);
  const wildcardKey = path.replace(/\/[^/]+$/, '/*');
  const wildcard = PAGE_LASTMOD[wildcardKey];
  if (wildcard) return parseDay(wildcard);
  return DEPLOY_TIME;
}

export function getSiteUrl(): string {
  const domain = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'www.shuducw.com';
  return domain.startsWith('http') ? domain : `https://${domain}`;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 静态页面清单：path + 抓取频率 + 优先级（lastmod 由 pageDate 统一取真实值） */
const STATIC_PAGES: { path: string; changeFrequency: string; priority: number }[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/services/basic', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services/compliance', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services/consulting', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services/live-commerce', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/services/delivery', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/tools/vat', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/tools/income-tax', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/tools/rmb-uppercase', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/cases', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/self-check', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/shareholder-loans', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/invoice-compliance', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/social-insurance-iit', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/high-tech-enterprise', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/company-deregistration', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/news', changeFrequency: 'daily', priority: 0.9 },
  { path: '/news/shilu', changeFrequency: 'daily', priority: 0.8 },
  { path: '/news/cases', changeFrequency: 'daily', priority: 0.8 },
  { path: '/news/tips', changeFrequency: 'daily', priority: 0.8 },
  { path: '/news/policies', changeFrequency: 'daily', priority: 0.8 },
];

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const siteUrl = getSiteUrl();

  // 动态文章页面（仅已发布）
  let articlePages: SitemapEntry[] = [];
  let articles: Awaited<ReturnType<typeof listArticles>> = [];
  try {
    articles = await listArticles({ publishedOnly: true, limit: 500 });
    articlePages = articles.map((article) => ({
      url: `${siteUrl}/news/${article.slug}`,
      lastModified: article.updated_at ? new Date(article.updated_at) : DEPLOY_TIME,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch {
    // 数据不可用时跳过动态页面
  }

  /** 分类页：取该分类下最新文章的更新时间（比页面文件更贴合"列表已更新"的事实） */
  const categoryLatest = (category: string): Date | null => {
    const times = articles
      .filter((a) => a.category === category && a.updated_at)
      .map((a) => new Date(a.updated_at as string).getTime());
    return times.length ? new Date(Math.max(...times)) : null;
  };

  const staticPages: SitemapEntry[] = STATIC_PAGES.map(({ path, changeFrequency, priority }) => {
    let lastModified = pageDate(path);
    const category = CATEGORY_PATHS[path];
    if (category) {
      const latest = categoryLatest(category);
      if (latest && latest.getTime() > lastModified.getTime()) lastModified = latest;
    }
    return {
      url: path === '/' ? siteUrl : `${siteUrl}${path}`,
      lastModified,
      changeFrequency,
      priority,
    };
  });

  const districtPages: SitemapEntry[] = districts.map((d) => {
    const path = `/services/district/${d.slug}`;
    return {
      url: `${siteUrl}${path}`,
      lastModified: pageDate(path),
      changeFrequency: 'monthly',
      priority: 0.7,
    };
  });

  return [...staticPages, ...districtPages, ...articlePages];
}

export function renderSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${formatDate(entry.lastModified)}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/** 纯文本格式（每行一个网址），百度/360/搜狗 均支持 */
export function renderSitemapTxt(entries: SitemapEntry[]): string {
  return entries.map((e) => e.url).join('\n') + '\n';
}

export function buildEtag(body: string): string {
  return `"${createHash('sha256').update(body).digest('hex').slice(0, 32)}"`;
}

export function latestLastModified(entries: SitemapEntry[]): string {
  const newest = entries.reduce((max, e) => Math.max(max, e.lastModified.getTime()), 0);
  return new Date(newest).toUTCString();
}

/** 命中 If-None-Match 时返回 304（让搜索引擎用 ETag 判断内容未变） */
export function isNotModified(request: Request, etag: string): boolean {
  const inm = request.headers.get('if-none-match');
  if (!inm) return false;
  return inm
    .split(',')
    .map((v) => v.trim())
    .some((v) => v === etag || v === '*');
}
