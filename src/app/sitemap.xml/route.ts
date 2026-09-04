import { NextResponse } from 'next/server';
import { listArticles } from '@/lib/store';

// ISR：新增文章后 sitemap 定期更新
export const revalidate = 300;

type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateSitemapXml(entries: SitemapEntry[]): string {
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

export async function GET() {
  const domain = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'www.shuducw.com';
  const siteUrl = domain.startsWith('http') ? domain : `https://${domain}`;
  const now = new Date();

  // 静态页面（含 FAQ 与资讯分类页）
  const staticPages: SitemapEntry[] = [
    { url: siteUrl, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/services/basic`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/services/compliance`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/services/consulting`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/news`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/news/cases`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/news/tips`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/news/policies`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  ];

  // 动态文章页面
  let articlePages: SitemapEntry[] = [];
  try {
    const data = await listArticles({ publishedOnly: true, limit: 500 });
    articlePages = data.map((article) => ({
      url: `${siteUrl}/news/${article.slug}`,
      lastModified: article.updated_at ? new Date(article.updated_at) : now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch {
    // 数据不可用时跳过动态页面
  }

  const allEntries = [...staticPages, ...articlePages];
  const xml = generateSitemapXml(allEntries);

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
