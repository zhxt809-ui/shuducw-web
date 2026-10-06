import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, BadgeCheck, FileText, Phone } from 'lucide-react';
import { listArticles } from '@/lib/store';

export const revalidate = 60;

export const metadata: Metadata = {
  title: '客户服务实录-西安数度财务咨询-真实财税服务案例-服务成果',
  description:
    '西安数度财务咨询有限公司真实客户服务案例（已脱敏）：食品企业业财税一体化、高新技术企业常年财税顾问、保险销售企业财税服务，展示公司十余年专业落地能力。',
  keywords: [
    '西安数度财务咨询客户案例',
    '西安财税服务实录',
    '西安财税公司案例',
    '西安代理记账案例',
    '西安企业财税合规案例',
  ],
  alternates: { canonical: '/cases' },
};

export default async function CasesPage() {
  const articles = await listArticles({ category: 'shilu', publishedOnly: true, limit: 20 });

  return (
    <>
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: '客户服务实录',
            description:
              '西安数度财务咨询有限公司真实客户服务案例（已脱敏）：食品企业业财税一体化、高新技术企业常年财税顾问、保险销售企业财税服务。',
            url: 'https://www.shuducw.com/cases',
            publisher: {
              '@type': 'Organization',
              name: '西安数度财务咨询有限公司',
              url: 'https://www.shuducw.com',
            },
            hasPart: articles.map((a) => ({
              '@type': 'Article',
              headline: a.title,
              url: `https://www.shuducw.com/news/${a.slug}`,
            })),
          }),
        }}
      />

      {/* Hero */}
      <section className="bg-brand-navy text-white">
        <div className="container-brand section-padding !py-16 md:!py-20">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold-light text-sm rounded-sm mb-6">
              真实服务记录 · 已脱敏
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">客户服务实录</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              以下是西安数度财务咨询有限公司为企业提供财税服务的真实记录（案例均已脱敏处理，隐去企业名称与人员信息）。
              我们坚持只展示经得起核验的真实服务成果，不虚构、不夸大。
            </p>
          </div>
        </div>
      </section>

      {/* 服务实录列表 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">服务实录案例</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto">
              从基础代理记账到财税顾问与合规体系搭建，见证企业不同发展阶段的财税需求
            </p>
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {articles.map((article) => (
                <Link key={article.id} href={`/news/${article.slug}`} className="card-brand group flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium text-white rounded bg-[#0E7C66]">
                      <BadgeCheck size={12} />
                      服务实录
                    </span>
                    {article.published_at && (
                      <span className="text-xs text-brand-text-muted">
                        {new Date(article.published_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-brand-text mb-3 line-clamp-2 group-hover:text-brand-navy transition-colors leading-relaxed">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="text-sm text-brand-text-muted line-clamp-4 leading-relaxed flex-1">{article.summary}</p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-1 text-sm text-brand-navy font-medium group-hover:text-brand-gold transition-colors">
                    查看案例详情 <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText size={48} className="mx-auto text-brand-border mb-4" />
              <p className="text-brand-text-muted text-sm">服务实录整理中，敬请期待</p>
            </div>
          )}

          <p className="mt-10 max-w-3xl mx-auto text-xs text-brand-text-muted leading-relaxed text-center">
            声明：以上案例均为西安数度财务咨询有限公司真实服务记录，已做脱敏处理；网站内容仅作财税知识科普参考，具体业务以双方签订的服务合同为准。
          </p>
        </div>
      </section>

      {/* 为什么敢把实录放出来 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: '十余年实战沉淀', desc: '2012 年成立，首届西安市代理记账协会副会长单位，服务企业覆盖多个行业与成长阶段' },
              { icon: BadgeCheck, title: '资质经得起查', desc: '代理记账许可证书、纳税信用 A 级（信用中国查询核验）、守信激励对象，均可公开核验' },
              { icon: FileText, title: '案例全部脱敏', desc: '隐去企业名称与人员信息，只保留服务内容与成果描述，尊重客户商业信息保密' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="card-brand text-center p-6">
                  <div className="w-12 h-12 bg-brand-navy/5 rounded-sm flex items-center justify-center mx-auto mb-4">
                    <Icon size={22} className="text-brand-navy" />
                  </div>
                  <h3 className="font-bold text-brand-navy mb-2">{item.title}</h3>
                  <p className="text-sm text-brand-text-muted leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-brand-bg border border-brand-border rounded-sm p-6 md:p-8">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-brand-navy mb-2">您的企业也需要这样的财税服务？</h3>
              <p className="text-brand-text-muted text-sm md:text-base">
                资深持证团队为您提供从基础记账到合规内审、财税咨询的全周期服务。
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-brand-text">
                <span className="flex items-center gap-2">
                  <Phone size={14} className="text-brand-gold" />
                  029-88456877 / 13359182829
                </span>
              </div>
            </div>
            <Link
              href="/contact"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white font-medium rounded-sm hover:bg-brand-navy-light transition-colors duration-200"
            >
              免费咨询报价 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
