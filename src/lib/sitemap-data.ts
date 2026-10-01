import { createHash } from 'node:crypto';
import { listArticles } from '@/lib/store';
import { districts } from '@/data/districts';

/**
 * sitemap 数据与渲染（/sitemap.xml 与 /sitemap.txt 共用，避免两处逻辑漂移）
 *
 * 关键设计（2026-10-01）：
 * 1. 静态页面的 lastmod 使用 DEPLOY_TIME（模块加载时间，生产环境≈本次部署启动时间），
 *    而不是每次渲染都取 new Date()。否则每次重新生成 lastmod 都会变，
 *    ETag 随之每次都变，搜索引擎无法通过 ETag 判断"内容未变化"，
 *    也就拿不到百度所说的"更频繁抓取"待遇。
 * 2. 文章页 lastmod 使用文章真实的 updated_at（内容真变了才会变）。
 */

export type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
};

const DEPLOY_TIME = new Date();

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

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const siteUrl = getSiteUrl();

  // 静态页面（含 FAQ 与资讯分类页）
  const staticPages: SitemapEntry[] = [
    { url: siteUrl, lastModified: DEPLOY_TIME, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${siteUrl}/about`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/services`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/services/basic`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/services/compliance`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/services/consulting`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/services/live-commerce`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/services/delivery`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/tools/vat`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/tools/income-tax`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/tools/rmb-uppercase`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.8 },
    ...districts.map((d) => ({
      url: `${siteUrl}/services/district/${d.slug}`,
      lastModified: DEPLOY_TIME,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
    { url: `${siteUrl}/contact`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/faq`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/cases`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/self-check`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/shareholder-loans`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/invoice-compliance`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/social-insurance-iit`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/high-tech-enterprise`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/company-deregistration`, lastModified: DEPLOY_TIME, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/privacy`, lastModified: DEPLOY_TIME, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/news`, lastModified: DEPLOY_TIME, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/news/shilu`, lastModified: DEPLOY_TIME, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/news/cases`, lastModified: DEPLOY_TIME, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/news/tips`, lastModified: DEPLOY_TIME, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/news/policies`, lastModified: DEPLOY_TIME, changeFrequency: 'daily', priority: 0.8 },
  ];

  // 动态文章页面（仅已发布）
  let articlePages: SitemapEntry[] = [];
  try {
    const data = await listArticles({ publishedOnly: true, limit: 500 });
    articlePages = data.map((article) => ({
      url: `${siteUrl}/news/${article.slug}`,
      lastModified: article.updated_at ? new Date(article.updated_at) : DEPLOY_TIME,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch {
    // 数据不可用时跳过动态页面
  }

  return [...staticPages, ...articlePages];
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
