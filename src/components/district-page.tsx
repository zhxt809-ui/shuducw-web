import type { ComponentType } from 'react';
import type { DistrictConfig } from '@/data/districts';
import Link from 'next/link';
import {
  Building2,
  FileText,
  ShieldCheck,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
  Store,
  Calculator,
  Sparkles,
} from 'lucide-react';
import ConsultationForm from '@/components/consultation-form';

const iconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  building: Building2,
  file: FileText,
  shield: ShieldCheck,
  check: CheckCircle2,
  store: Store,
  calc: Calculator,
  spark: Sparkles,
};

export default function DistrictLandingPage({ district }: { district: DistrictConfig }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${district.name}${district.keyword}服务`,
    provider: {
      '@type': 'Organization',
      name: '西安数度财务咨询有限公司',
      url: 'https://www.shuducw.com',
    },
    description: district.metaDescription,
    areaServed: { '@type': 'City', name: '西安' },
    serviceType: district.serviceType,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: district.faq.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />

      {/* Hero */}
      <section className="bg-brand-navy text-white">
        <div className="container-brand section-padding !py-16 md:!py-20">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold-light text-sm rounded-sm mb-6">
              {district.badge}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {district.name}
              <span className="text-brand-gold"> {district.keyword}</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">{district.heroIntro}</p>
            <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-white/80">
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-brand-gold" />
                西安市 · 全城服务，可就近上门
              </span>
              <span className="flex items-center gap-2">
                <Phone size={14} className="text-brand-gold" />
                029-84556877 / 13359182829
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 本地说明 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-6 text-center">
              {district.sectionTitle}
            </h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-8" />
            <div className="space-y-4 text-brand-text leading-relaxed">
              {district.sectionParagraphs.map((p, idx) => (
                <p key={idx} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 服务内容 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">服务内容</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {district.services.map((s) => {
              const Icon = iconMap[s.icon] || CheckCircle2;
              return (
                <div key={s.title} className="card-brand flex gap-4">
                  <div className="w-11 h-11 bg-brand-navy/5 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-brand-navy" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-navy mb-2">{s.title}</h3>
                    <p className="text-sm text-brand-text-muted leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">
              {district.name}常见问题
            </h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto" />
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {district.faq.map((f) => (
              <details key={f.q} className="group bg-brand-bg border border-brand-border rounded-sm p-4 open:shadow-sm">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-brand-navy font-medium">
                  <span>{f.q}</span>
                  <span className="text-brand-gold text-lg flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-brand-text leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 咨询表单 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding">
          <div className="max-w-2xl mx-auto bg-white border border-brand-border rounded-sm p-6 md:p-10">
            <h2 className="text-2xl font-bold text-brand-navy mb-2 text-center">{district.formTitle}</h2>
            <p className="text-sm text-brand-text-muted text-center mb-8">{district.formSub}</p>
            <ConsultationForm />
          </div>
          <div className="text-center mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-brand-navy hover:text-brand-gold font-medium"
            >
              或直接查看联系我们 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
