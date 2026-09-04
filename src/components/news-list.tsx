import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, TrendingUp, FileText, ArrowRight, ChevronRight } from 'lucide-react';
import { listArticles } from '@/lib/store';

export const revalidate = 60;

export const metadata: Metadata = {
  title: '财税资讯_财税案例_财税知识_政策解读',
  description:
    '西安数度财务咨询有限公司财税资讯频道，提供企业财税案例分享、财税知识普及、最新财税政策解读，助力企业合规经营、优化税负。',
  keywords: [
    '西安财税资讯',
    '西安财税案例',
    '西安财税知识',
    '西安财税政策解读',
    '西安数度财务咨询',
  ],
};

interface ArticleRow {
  id: number;
  title: string;
  slug: string;
  category: string;
  summary: string | null;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string; desc: string }> = {
  cases: { label: '财税案例', icon: BookOpen, color: 'bg-brand-navy', desc: '真实企业财税服务案例，展示专业落地能力' },
  tips: { label: '财税知识', icon: TrendingUp, color: 'bg-brand-gold', desc: '实用财税知识与操作技巧，提升财务管理水平' },
  policies: { label: '政策解读', icon: FileText, color: 'bg-[#2A5A8C]', desc: '最新财税政策深度解读，把握合规方向' },
};

async function getArticles(category?: string): Promise<ArticleRow[]> {
  try {
    const data = await listArticles({
      category,
      publishedOnly: true,
      limit: 50,
    });
    return (data as ArticleRow[]) || [];
  } catch (err) {
    console.error('获取文章异常:', err);
    return [];
  }
}

export default async function NewsListPage({
  category,
}: {
  category?: string;
}) {
  const activeCategory = category || '';
  const articles = await getArticles(activeCategory || undefined);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: activeCategory && categoryConfig[activeCategory]
      ? `${categoryConfig[activeCategory].label} - 西安数度财务咨询有限公司`
      : '财税资讯 - 西安数度财务咨询有限公司',
    description: activeCategory && categoryConfig[activeCategory]
      ? `${categoryConfig[activeCategory].desc}，西安数度财务咨询有限公司出品。`
      : '西安数度财务咨询有限公司财税资讯专栏，分享财税案例、财税知识和政策解读，助力企业合规经营。',
    url: activeCategory
      ? `https://www.shuducw.com/news/${activeCategory}`
      : 'https://www.shuducw.com/news',
    publisher: {
      '@type': 'Organization',
      name: '西安数度财务咨询有限公司',
      url: 'https://www.shuducw.com',
    },
    numberOfItems: articles.length,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="bg-brand-navy text-white py-16 md:py-20">
        <div className="container-brand px-4 md:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {activeCategory && categoryConfig[activeCategory]
              ? categoryConfig[activeCategory].label
              : '财税资讯'}
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            财税案例分享、财税知识普及、最新政策解读 — 助力企业合规经营、稳健发展
          </p>
        </div>
      </section>

      {/* 分类标签（独立 URL 便于搜索引擎收录分类页） */}
      <section className="bg-brand-bg border-b border-brand-border">
        <div className="container-brand px-4 md:px-8">
          <div className="flex items-center gap-4 py-4 overflow-x-auto">
            <Link
              href="/news"
              className={`px-5 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                !activeCategory
                  ? 'bg-brand-navy text-white'
                  : 'bg-white text-brand-text-muted border border-brand-border hover:border-brand-navy hover:text-brand-navy'
              }`}
            >
              全部资讯
            </Link>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <Link
                key={key}
                href={`/news/${key}`}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeCategory === key
                    ? 'bg-brand-navy text-white'
                    : 'bg-white text-brand-text-muted border border-brand-border hover:border-brand-navy hover:text-brand-navy'
                }`}
              >
                {config.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 分类介绍（选中分类时显示） */}
      {activeCategory && categoryConfig[activeCategory] && (
        <section className="bg-white">
          <div className="container-brand section-padding !py-8">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${categoryConfig[activeCategory].color} rounded-md flex items-center justify-center flex-shrink-0`}>
                {(() => {
                  const IconComp = categoryConfig[activeCategory].icon;
                  return <IconComp size={22} className="text-white" />;
                })()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-brand-navy mb-1">
                  {categoryConfig[activeCategory].label}
                </h2>
                <p className="text-brand-text-muted text-sm">{categoryConfig[activeCategory].desc}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 文章列表 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => {
                const cat = categoryConfig[article.category];
                return (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="card-brand group block"
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {cat && (
                          <span className={`inline-block px-2.5 py-0.5 text-xs font-medium text-white rounded ${cat.color}`}>
                            {cat.label}
                          </span>
                        )}
                        <span className="text-xs text-brand-text-muted">
                          {formatDate(article.published_at || article.created_at)}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-brand-text mb-2 line-clamp-2 group-hover:text-brand-navy transition-colors">
                        {article.title}
                      </h3>
                      {article.summary && (
                        <p className="text-sm text-brand-text-muted line-clamp-3 leading-relaxed">
                          {article.summary}
                        </p>
                      )}
                      <div className="mt-4 flex items-center text-sm text-brand-navy font-medium">
                        <span>阅读全文</span>
                        <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <FileText size={48} className="mx-auto text-brand-border mb-4" />
              <h3 className="text-xl font-medium text-brand-text-muted mb-2">暂无资讯内容</h3>
              <p className="text-brand-text-muted text-sm">内容正在筹备中，敬请期待</p>
            </div>
          )}
        </div>
      </section>

      {/* 面包屑导航 */}
      <nav className="bg-brand-bg border-t border-brand-border">
        <div className="container-brand px-4 md:px-8 py-3">
          <ol className="flex items-center text-sm text-brand-text-muted">
            <li><Link href="/" className="hover:text-brand-navy transition-colors">首页</Link></li>
            <li><ChevronRight size={14} className="mx-2" /></li>
            <li><Link href="/news" className="hover:text-brand-navy transition-colors">财税资讯</Link></li>
            {activeCategory && categoryConfig[activeCategory] && (
              <>
                <li><ChevronRight size={14} className="mx-2" /></li>
                <li className="text-brand-navy font-medium">{categoryConfig[activeCategory].label}</li>
              </>
            )}
          </ol>
        </div>
      </nav>
    </>
  );
}
