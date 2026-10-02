import type { Metadata } from 'next';
import Link from 'next/link';
import { permanentRedirect } from 'next/navigation';
import { ArrowLeft, ArrowRight, Calendar, Tag, FileQuestion, FileX, AlertCircle, Phone, MessageSquare, Clock3, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { getArticleBySlug, listArticles } from '@/lib/store';
import { marked } from 'marked';
import { cache } from 'react';
import ShareButton from '@/components/share-button';
import { ArticleScripts } from '@/components/article-scripts';
import { prepareArticleHtml, demoteContentHeadings, HTML_CONTENT_MARK } from '@/lib/article-html';
import NewsListPage from '@/components/news-list';
import { XiaohongshuIcon } from '@/components/xiaohongshu-icon';

// 本地文件存储 + ISR 缓存
export const revalidate = 60;

// 资讯分类页 slug（当 /news/cases 等被访问时渲染分类列表，而非文章详情）
const CATEGORY_SLUGS = ['shilu', 'cases', 'tips', 'policies'];

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
  shilu: '服务实录',
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
      title: `${categoryLabels[slug] || '财税资讯'}-财税案例-财税知识-政策解读-西安数度财务咨询`,
      description: `西安数度财务咨询有限公司${categoryLabels[slug] || '财税资讯'}栏目，分享${categoryLabels[slug] || '财税资讯'}内容，助力企业合规经营、优化税负。`,
      keywords: ['西安数度财务咨询', categoryLabels[slug] || '财税资讯', '西安财税', '西安代理记账'],
      alternates: { canonical: `/news/${slug}` },
    };
  }

  const result = await getArticle(slug);

  if (result.status === 'ok') {
    return {
      title: `${result.article.title}_${categoryLabels[result.article.category] || '财税资讯'}-西安数度财务咨询`,
      description: result.article.summary || result.article.title,
      keywords: [
        '西安数度财务咨询',
        categoryLabels[result.article.category] || '财税资讯',
        result.article.title,
      ],
      alternates: { canonical: `/news/${slug}` },
    };
  }

  // 文章未找到 / 未发布：旧 slug 先尝试 301；并加 noindex，避免软 404 页面被搜索引擎收录
  redirectLegacySlug(slug);

  return { title: '文章未找到-西安数度财务咨询', robots: { index: false, follow: false } };
}

marked.setOptions({
  breaks: true,
  gfm: true,
});

function renderMarkdown(content: string): string {
  // 检查是否是 HTML 内容（带有标记）
  if (content.startsWith(HTML_CONTENT_MARK)) {
    return content.replace(`${HTML_CONTENT_MARK}\n`, '');
  }
  // markdown 里可能写了原生 <h1>，降级为 <h2>，避免与模板标题的 H1 重复
  return demoteContentHeadings(marked.parse(content) as string);
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
  // HTML 正文在服务端预处理：正文成为服务端可见文本，脚本交给客户端执行，正文 h1 降级为 h2
  const prepared =
    article.content && article.content.startsWith(HTML_CONTENT_MARK)
      ? prepareArticleHtml(article.content)
      : null;
  const relatedArticles = await getRelatedArticles(article.category, article.slug);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  };

  // 判断文章是否有实质更新（更新时间比发布时间晚 1 天以上才展示“最后更新”）
  const isUpdatedAfterPublish = (published: string, updated: string) => {
    const pub = new Date(published).getTime();
    const upd = new Date(updated).getTime();
    return upd - pub > 24 * 60 * 60 * 1000;
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
                {article.updated_at && article.published_at && isUpdatedAfterPublish(article.published_at, article.updated_at) && (
                  <span className="flex items-center gap-1">
                    <Clock3 size={14} />
                    最后更新 {formatDate(article.updated_at)}
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
            {prepared ? (
              <>
                <div className="prose-custom" dangerouslySetInnerHTML={{ __html: prepared.html }} />
                <ArticleScripts code={prepared.scripts.join('\n;\n')} />
              </>
            ) : (
              <article
                className="prose-custom"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
              />
            )}

            {/* 统一免责声明（专业可信度标准块） */}
            <div className="mt-10 p-4 border border-brand-border rounded-sm bg-white">
              <p className="text-xs text-brand-text-muted leading-relaxed">
                说明：本文由西安数度财务咨询基于公开政策文件与实务经验整理，
                {article.published_at ? `首发于 ${formatDate(article.published_at)}` : ''}
                {article.updated_at && article.published_at && isUpdatedAfterPublish(article.published_at, article.updated_at)
                  ? `，最近更新于 ${formatDate(article.updated_at)}`
                  : ''}
                。内容仅供一般性参考，不构成税务、法律意见；财税政策如有调整，以税务机关最新公布与主管税务机关核定为准。
                具体事项建议结合企业实际情况咨询专业人士。
              </p>
            </div>

            {/* 公私域互导（小红书 + 企微顾问 + 免费测评） */}
            <div className="mt-10 p-6 md:p-8 bg-brand-bg border border-brand-border rounded-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex-1">
                  <h3 className="font-bold text-brand-navy mb-2">看完还有疑问？两种方式继续聊</h3>
                  <p className="text-sm text-brand-text-muted leading-relaxed">
                    财税政策与账务处理因企业情况而异。关注小红书看日常财税科普，
                    或扫码添加企微顾问，把您的具体情况发给持证会计免费评估；
                    也可以先做一次免费的账务风险自查。
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                    <a
                      href="https://www.xiaohongshu.com/user/profile/6521552259"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-brand-navy hover:text-brand-gold transition-colors"
                    >
                      <XiaohongshuIcon size={16} />
                      小红书：6521552259
                    </a>
                    <Link
                      href="/self-check"
                      className="inline-flex items-center gap-1.5 text-brand-navy hover:text-brand-gold transition-colors"
                    >
                      <ShieldCheck size={15} className="text-brand-gold" />
                      免费账务风险自查
                    </Link>
                  </div>
                </div>
                <div className="flex-shrink-0 text-center">
                  <Image
                    src="/qr-wecom.png"
                    alt="西安数度财务咨询企业微信顾问二维码"
                    width={112}
                    height={112}
                    className="rounded-sm border border-brand-border bg-white p-1.5"
                  />
                  <p className="text-xs text-brand-text-muted mt-2">扫码加企微顾问</p>
                </div>
              </div>
            </div>

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

            {/* 相关业务（按分类映射业务页，补足业务内链，利于 SEO） */}
            {(() => {
              const bizMap: Record<string, { href: string; name: string; desc: string }> = {
                shilu: {
                  href: '/services/compliance',
                  name: '财税合规 · 内部审计',
                  desc: '企业财税合规自查、内部管理审计、常年财税顾问，帮您把账做规范、把风险控住',
                },
                tips: {
                  href: '/services/basic',
                  name: '代理记账 · 公司注册',
                  desc: '西安本地工商财税托管，小规模/一般纳税人代理记账、公司注册、工商变更一站式服务',
                },
                cases: {
                  href: '/services/compliance',
                  name: '财税合规 · 内部审计',
                  desc: '企业财税合规自查、内部管理审计、历史账务梳理，帮您提前排查涉税风险',
                },
                policies: {
                  href: '/services/consulting',
                  name: '财税咨询 · 风控落地',
                  desc: '税务政策解读、税收优惠适用性评估、财税风控方案设计与落地',
                },
              };
              const biz = bizMap[article.category];
              if (!biz) return null;
              return (
                <div className="mt-10">
                  <h2 className="text-lg font-bold text-brand-navy mb-4">相关业务</h2>
                  <Link
                    href={biz.href}
                    className="flex items-center justify-between gap-4 p-4 bg-white border border-brand-border rounded-sm hover:border-brand-navy hover:shadow-sm transition-all group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-brand-navy group-hover:text-brand-gold">
                        {biz.name}
                      </p>
                      <p className="text-xs text-brand-muted mt-1 leading-relaxed">{biz.desc}</p>
                    </div>
                    <ArrowRight size={16} className="text-brand-gold flex-shrink-0" />
                  </Link>
                </div>
              );
            })()}

            {/* 文末咨询 CTA — 将阅读流量转化为咨询线索 */}
            <div className="mt-12 bg-brand-navy text-white rounded-sm p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">需要专业的财税服务？</h2>
                  <p className="text-white/80 text-sm leading-relaxed">
                    西安数度财务咨询 2012 年成立，首届西安市代理记账协会副会长单位，
                    高级会计师、国际注册会计师、税务师团队为您提供工商财税托管、
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
