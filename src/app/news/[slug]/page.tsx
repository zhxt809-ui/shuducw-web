import type { Metadata } from 'next';
import Link from 'next/link';
import { permanentRedirect } from 'next/navigation';
import { ArrowLeft, ArrowRight, Calendar, Tag, FileQuestion, FileX, AlertCircle, Phone, MessageSquare } from 'lucide-react';
import { getArticleBySlug, listArticles } from '@/lib/store';
import { marked } from 'marked';
import { cache } from 'react';
import ShareButton from '@/components/share-button';
import { HtmlRenderer } from '@/components/html-renderer';
import NewsListPage from '@/components/news-list';

// 本地文件存储 + ISR 缓存
export const revalidate = 60;

// 资讯分类页 slug（当 /news/cases 等被访问时渲染分类列表，而非文章详情）
const CATEGORY_SLUGS = ['cases', 'tips', 'policies'];

// 旧 slug -> 新 slug 301 跳转映射（2026-09 slug 关键词优化，保留旧链接 SEO 权重）
const LEGACY_SLUG_REDIRECTS: Record<string, string> = {
  'test-1781496267610': 'gongsi-liangtaozhang-fengxian',
  '303-1781792348630': 'wuliangye-zhongxiaoqiye-caiwuhegui',
  '850-1-24-2590-1782049886814': 'xian-canyin-hezhengzhenshou-butui',
  '1-1782348852360': 'shangshigongsi-zicha-butui',
  '2026-1782551611028': '2026-shuiwujicha-zhongdian',
  '1-80-1782786731908': 'xian-wanglaizhang-guazhang-80wan',
  '5-10-1783086858170': 'shenfenmaoyong-zhuce-gongsi-fengxian',
  '2026-4-1783647583539': '2026-caishui-4tiao-hongxian',
  '18-1783927822503': 'sailisi-kuisun-18yi',
  'article-1785294311439': 'yanfa-jijia-kouchu-yongmei',
  '2026-1785318511401': '2026-shuiwu-cailiang-jizhun',
  '5256-1785678940367': 'langzi-gaoxin-zige-quxiao',
  '9000-13-1786156260332': '2026-geshui-9000yi',
};

// 旧 slug 访问 -> 301 跳转到新 slug（保留已收录链接的权重）
function redirectLegacySlug(slug: string): void {
  const target = LEGACY_SLUG_REDIRECTS[slug];
  if (target) {
    permanentRedirect(`/news/${target}`);
  }
}

const categoryLabels: Record<string, string> = {
  cases: '财税案例',
  tips: '财税知识',
  policies: '政策解读',
};

// 使用 React cache() 去重：generateMetadata 和页面组件共享同一次查询
const getArticle = cache(async (slug: string) => {
  try {
    const article = await getArticleBySlug(slug);
    if (!article) {
      return { status: 'not_found' as const };
    }
    if (!article.is_published) {
      return { status: 'not_published' as const, article };
    }
    return { status: 'ok' as const, article };
  } catch (err) {
    console.error('[Article] 获取异常:', err, 'slug:', slug);
    return { status: 'error' as const, message: err instanceof Error ? err.message : String(err) };
  }
});

// 获取同分类相关文章（用于文末内链，利于 SEO 与停留时长）
const getRelatedArticles = cache(async (category: string, currentSlug: string, limit = 3) => {
  try {
    const articles = await listArticles({ category, publishedOnly: true, limit: 20 });
    return articles.filter((a) => a.slug !== currentSlug).slice(0, limit);
  } catch {
    return [];
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // 分类页
  if (CATEGORY_SLUGS.includes(slug)) {
    return {
      title: `${categoryLabels[slug] || '财税资讯'}_财税案例_财税知识_政策解读_西安数度财务咨询`,
      description: `西安数度财务咨询有限公司${categoryLabels[slug] || '财税资讯'}栏目，分享${categoryLabels[slug] || '财税资讯'}内容，助力企业合规经营、优化税负。`,
      keywords: ['西安数度财务咨询', categoryLabels[slug] || '财税资讯', '西安财税', '西安代理记账'],
      alternates: { canonical: `/news/${slug}` },
    };
  }

  const result = await getArticle(slug);

  if (result.status === 'ok') {
    return {
      title: `${result.article.title}_${categoryLabels[result.article.category] || '财税资讯'}`,
      description: result.article.summary || result.article.title,
      keywords: [
        '西安数度财务咨询',
        categoryLabels[result.article.category] || '财税资讯',
        result.article.title,
      ],
      alternates: { canonical: `/news/${slug}` },
    };
  }

  // 文章未找到：若为旧 slug 则 301 跳转到新 slug（保留权重）
  redirectLegacySlug(slug);

  return { title: '文章未找到_西安数度财务咨询' };
}

marked.setOptions({
  breaks: true,
  gfm: true,
});

function renderMarkdown(content: string): string {
  // 检查是否是 HTML 内容（带有标记）
  if (content.startsWith('<!-- html-content -->')) {
    return content.replace('<!-- html-content -->\n', '');
  }
  return marked.parse(content) as string;
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 分类页：/news/cases /news/tips /news/policies 渲染分类列表
  if (CATEGORY_SLUGS.includes(slug)) {
    return <NewsListPage category={slug} />;
  }

  const result = await getArticle(slug);

  // 文章不存在 → 渲染内联 404 页面（不调用 notFound()，避免 Vercel 缓存 404）
  if (result.status === 'not_found') {
    // 旧 slug -> 301 跳转新 slug（仅当旧 slug 已不是有效文章时才跳转）
    redirectLegacySlug(slug);
    return (
      <section className="bg-brand-bg min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <FileX size={48} className="mx-auto text-brand-border mb-4" />
          <h1 className="text-xl font-bold text-brand-text mb-2">文章不存在</h1>
          <p className="text-brand-text-muted text-sm mb-2">
            您访问的文章不存在或已被删除。
          </p>
          <p className="text-brand-text-muted text-xs mb-6">
            slug: {slug}
          </p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-5 py-2 bg-brand-navy text-white text-sm font-medium rounded-md hover:bg-[#2A5A8C] transition-colors"
          >
            <ArrowLeft size={16} />
            返回资讯列表
          </Link>
        </div>
      </section>
    );
  }

  // 数据库错误 → 渲染错误提示页面
  if (result.status === 'error') {
    return (
      <section className="bg-brand-bg min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h1 className="text-xl font-bold text-brand-text mb-2">页面加载异常</h1>
          <p className="text-brand-text-muted text-sm mb-2">
            页面暂时无法加载，请稍后重试。
          </p>
          <p className="text-brand-text-muted text-xs mb-6">
            错误信息: {result.message}
          </p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-5 py-2 bg-brand-navy text-white text-sm font-medium rounded-md hover:bg-[#2A5A8C] transition-colors"
          >
            <ArrowLeft size={16} />
            返回资讯列表
          </Link>
        </div>
      </section>
    );
  }

  // 文章存在但未发布 → 显示提示页面
  if (result.status === 'not_published') {
    return (
      <section className="bg-brand-bg min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <FileQuestion size={48} className="mx-auto text-brand-border mb-4" />
          <h1 className="text-xl font-bold text-brand-text mb-2">文章尚未发布</h1>
          <p className="text-brand-text-muted text-sm mb-6">
            这篇文章「{result.article.title}」已保存但尚未发布。
            <br />
            请在后台管理中勾选「立即发布」后再访问。
          </p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-5 py-2 bg-brand-navy text-white text-sm font-medium rounded-md hover:bg-[#2A5A8C] transition-colors"
          >
            <ArrowLeft size={16} />
            返回资讯列表
          </Link>
        </div>
      </section>
    );
  }

  // 正常展示文章
  const article = result.article;
  const relatedArticles = await getRelatedArticles(article.category, article.slug);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary || article.content.slice(0, 160),
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at,
    author: {
      '@type': 'Organization',
      name: '西安数度财务咨询有限公司',
      url: 'https://www.shuducw.com',
    },
    publisher: {
      '@type': 'Organization',
      name: '西安数度财务咨询有限公司',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.shuducw.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.shuducw.com/news/${article.slug}`,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: 'https://www.shuducw.com/' },
        { '@type': 'ListItem', position: 2, name: '财税资讯', item: 'https://www.shuducw.com/news' },
        {
          '@type': 'ListItem',
          position: 3,
          name: categoryLabels[article.category] || '财税资讯',
          item: `https://www.shuducw.com/news/${article.category}`,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="bg-brand-navy text-white py-12 md:py-16">
        <div className="container-brand px-4 md:px-8">
          <div className="max-w-3xl">
            {article.category && categoryLabels[article.category] && (
              <span className="inline-block px-3 py-1 text-xs font-medium bg-brand-gold text-white rounded mb-4">
                {categoryLabels[article.category]}
              </span>
            )}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug mb-4">
              {article.title}
            </h1>
            {article.summary && (
              <p className="text-white/80 text-base md:text-lg leading-relaxed">
                {article.summary}
              </p>
            )}
            <div className="flex items-center justify-between mt-4 text-sm text-white/60">
              <div className="flex items-center gap-4">
                {article.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(article.published_at)}
                  </span>
                )}
                <span>数度财税</span>
                {article.category && categoryLabels[article.category] && (
                  <span className="flex items-center gap-1">
                    <Tag size={14} />
                    {categoryLabels[article.category]}
                  </span>
                )}
              </div>
              <ShareButton title={article.title} />
            </div>
          </div>
        </div>
      </section>

      {/* 文章正文 */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container-brand px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            {article.content.startsWith('<!-- html-content -->') ? (
              <HtmlRenderer
                html={article.content.replace('<!-- html-content -->', '').trim()}
                className="prose-custom"
              />
            ) : (
              <article
                className="prose-custom"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
              />
            )}

            <div className="mt-12 pt-8 border-t border-brand-border">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-brand-navy hover:text-brand-gold transition-colors text-sm font-medium"
              >
                <ArrowLeft size={16} />
                返回资讯列表
              </Link>
            </div>

            {/* 相关文章（同分类内链，利于 SEO 与停留时长） */}
            {relatedArticles.length > 0 && (
              <div className="mt-10">
                <h2 className="text-lg font-bold text-brand-navy mb-4">相关推荐</h2>
                <div className="space-y-3">
                  {relatedArticles.map((item) => (
                    <Link
                      key={item.id}
                      href={`/news/${item.slug}`}
                      className="flex items-center justify-between gap-4 p-4 bg-brand-bg border border-brand-border rounded-sm hover:border-brand-navy hover:bg-white transition-colors group"
                    >
                      <span className="text-sm font-medium text-brand-text group-hover:text-brand-navy line-clamp-1">
                        {item.title}
                      </span>
                      <ArrowRight size={14} className="text-brand-gold flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 文末咨询 CTA — 将阅读流量转化为咨询线索 */}
            <div className="mt-12 bg-brand-navy text-white rounded-sm p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">需要专业的财税服务？</h2>
                  <p className="text-white/80 text-sm leading-relaxed">
                    西安数度财务咨询 2012 年成立，首届西安市代理记账协会副会长单位，
                    高级会计师、国际注册会计师、注册税务师团队为您提供工商财税托管、
                    财税合规、内部审计、财税风控一站式服务。
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-white/80">
                    <span className="flex items-center gap-2">
                      <Phone size={14} className="text-brand-gold" />
                      029-84556877 / 13359182829
                    </span>
                    <span className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-brand-gold" />
                      微信同号，随时咨询
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 flex-shrink-0">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-gold text-white font-medium rounded-sm hover:bg-brand-gold-light transition-colors"
                  >
                    免费咨询报价 <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="tel:02984556877"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/30 text-white rounded-sm hover:bg-white/10 transition-colors text-sm"
                  >
                    <Phone size={14} /> 电话咨询
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
