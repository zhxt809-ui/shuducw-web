import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2, Phone, AlertTriangle } from 'lucide-react';
import { InlineConsultForm } from '@/components/inline-consult-form';
import { industries, type IndustryConfig } from '@/data/industries';

const jsonLd = (c: IndustryConfig) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: `西安${c.name}${c.keyword}`,
      serviceType: `${c.name}财税服务`,
      areaServed: { '@type': 'City', name: '西安' },
      description: c.metaDescription,
      provider: {
        '@type': 'ProfessionalService',
        name: '西安数度财务咨询有限公司',
        telephone: '029-88456877',
        address: { '@type': 'PostalAddress', addressLocality: '西安', addressRegion: '陕西' },
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: c.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ],
});

export function IndustryLandingPage({ industry }: { industry: IndustryConfig }) {
  const others = industries.filter((i) => i.slug !== industry.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(industry)) }}
      />

      {/* 头图 */}
      <section className="bg-brand-navy text-white">
        <div className="container-brand section-padding !py-14 md:!py-16">
          <div className="max-w-3xl">
            <nav aria-label="面包屑" className="text-xs text-white/60 mb-5">
              <Link href="/" className="hover:text-brand-gold-light transition-colors">
                首页
              </Link>
              <span className="mx-2">/</span>
              <Link href="/services" className="hover:text-brand-gold-light transition-colors">
                业务范围
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white/80">{industry.name}</span>
            </nav>
            <div className="inline-block px-4 py-1.5 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold-light text-sm rounded-sm mb-5">
              {industry.badge}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              西安{industry.name}{industry.keyword}
            </h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">{industry.heroIntro}</p>
          </div>
        </div>
      </section>

      {/* 行业痛点 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-3 flex items-center gap-2.5">
              <AlertTriangle size={20} className="text-brand-gold" />
              {industry.painTitle}
            </h2>
            <div className="w-16 h-[2px] bg-brand-gold mb-6" />
            <ul className="space-y-3">
              {industry.painPoints.map((p) => (
                <li
                  key={p}
                  className="p-4 bg-white border border-brand-border rounded-sm text-sm text-brand-text-muted leading-relaxed"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 我们做什么 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-3">
              针对{industry.name}，我们具体做什么
            </h2>
            <div className="w-16 h-[2px] bg-brand-gold mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {industry.deliverables.map((d) => (
                <div key={d.title} className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                  <h3 className="text-sm font-bold text-brand-navy mb-2 flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-brand-gold flex-shrink-0 mt-0.5" />
                    {d.title}
                  </h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 政策依据 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-3 flex items-center gap-2.5">
              <BookOpen size={20} className="text-brand-gold" />
              {industry.name}常用政策与口径
            </h2>
            <div className="w-16 h-[2px] bg-brand-gold mb-6" />
            <div className="space-y-4">
              {industry.policies.map((p) => (
                <div key={p.title} className="p-5 bg-white border border-brand-border rounded-sm">
                  <h3 className="text-sm font-bold text-brand-navy mb-2">{p.title}</h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed">{p.detail}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-brand-text-muted mt-4 leading-relaxed">
              口径核验日期：2026 年 10 月。以上为现行政策的要点说明，不构成税务意见；
              具体适用请以主管税务机关口径为准。
            </p>
          </div>
        </div>
      </section>

      {/* 常见问题 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-3">
              {industry.name}常见问题
            </h2>
            <div className="w-16 h-[2px] bg-brand-gold mb-6" />
            <div className="space-y-4">
              {industry.faq.map((item) => (
                <div key={item.q} className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                  <h3 className="text-sm font-bold text-brand-navy mb-2">{item.q}</h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 咨询表单 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-14">
          <div className="max-w-3xl mx-auto border border-brand-border rounded-sm bg-white">
            <InlineConsultForm />
          </div>
          <div className="max-w-3xl mx-auto mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-brand-text">
            <span className="flex items-center gap-2">
              <Phone size={14} className="text-brand-gold" />
              029-88456877 / 13359182829
            </span>
            <Link
              href="/services/basic"
              className="inline-flex items-center gap-1.5 text-brand-gold hover:text-brand-navy transition-colors"
            >
              查看代理记账服务与费用参考 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 交叉链接 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <h2 className="text-lg font-bold text-brand-navy mb-5 text-center">其他行业专项服务</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/services/industry/${o.slug}`}
                className="px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
              >
                {o.name}
                {o.keyword}
              </Link>
            ))}
            <Link
              href="/tools"
              className="px-4 py-2 bg-brand-navy text-white rounded-sm text-sm hover:bg-brand-gold transition-colors"
            >
              财税工具中心
            </Link>
            <Link
              href="/services"
              className="px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
            >
              全部财税服务
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
