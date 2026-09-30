import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Phone, ShieldCheck, BookOpen, Calculator } from 'lucide-react';
import { VatCalculator } from '@/components/vat-calculator';
import { InlineConsultForm } from '@/components/inline-consult-form';
import { districts } from '@/data/districts';

export const metadata: Metadata = {
  title: '增值税计算器_小规模纳税人1%征收率_一般纳税人计算_西安数度财务咨询',
  description:
    '免费在线增值税计算器：小规模纳税人模式（月销售额10万以下免征、3%减按1%征收率）与一般纳税人模式（销项减进项，13%/9%/6%），2026年增值税法及衔接公告现行口径，西安数度财务咨询提供。',
  keywords: [
    '增值税计算器',
    '小规模纳税人增值税计算',
    '一般纳税人增值税计算器',
    '小规模1%征收率计算',
    '西安代理记账',
  ],
  alternates: { canonical: '/tools/vat' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '增值税计算器',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  description:
    '免费在线增值税计算器：小规模纳税人（起征点月销售额10万元、3%减按1%）与一般纳税人（销项减进项）双模式，2026年现行口径。',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
  provider: {
    '@type': 'ProfessionalService',
    name: '西安数度财务咨询有限公司',
    telephone: '029-84556877',
  },
};

export default function VatCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 页面头图 */}
      <section className="bg-brand-navy text-white">
        <div className="container-brand section-padding !py-14 md:!py-16">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold-light text-sm rounded-sm mb-5">
              免费在线工具 · 现行口径
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">增值税计算器</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              小规模纳税人与一般纳税人双模式，按 2026 年施行的《增值税法》及财政部、税务总局衔接公告口径计算，
              结果仅供估算参考。
            </p>
          </div>
        </div>
      </section>

      {/* 计算器 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <VatCalculator />
          </div>
        </div>
      </section>

      {/* 政策依据 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-5 flex items-center gap-2.5">
              <BookOpen size={20} className="text-brand-gold" />
              计算口径与政策依据
            </h2>
            <div className="space-y-4 text-sm text-brand-text-muted leading-relaxed">
              <div className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                <h3 className="font-bold text-brand-navy mb-2">小规模纳税人（含个体户）</h3>
                <ul className="space-y-1.5">
                  <li>· 起征点：月销售额 10 万元（按季申报的季度 30 万元），未超过不征增值税——依据财政部、税务总局《关于增值税法施行后增值税优惠政策衔接事项的公告》，有效期 2026-01-01 至 2027-12-31</li>
                  <li>· 征收率：适用 3% 征收率的应税销售收入，减按 1% 征收（同一公告，同期有效）</li>
                  <li>· 超过起征点的，就全部销售额按征收率计算纳税</li>
                </ul>
              </div>
              <div className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                <h3 className="font-bold text-brand-navy mb-2">一般纳税人</h3>
                <ul className="space-y-1.5">
                  <li>· 应纳税额 = 当期销项税额 − 当期进项税额；销项不足抵扣的差额形成留抵，结转以后期间</li>
                  <li>· 税率：13%（货物及加工修理修配等）、9%（交通运输、建筑、不动产等）、6%（现代服务等）</li>
                  <li>· 年应征增值税销售额超过小规模纳税人标准的，应登记为一般纳税人</li>
                </ul>
              </div>
              <p className="text-xs leading-relaxed">
                提示：城建税、教育费附加等附加税费需以实际缴纳的增值税为计税依据另行计算，
                小规模纳税人或可享受相关减免优惠，以主管税务机关核定为准。政策如有调整，以税务机关最新公布为准。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 内嵌咨询表单 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-14">
          <div className="max-w-3xl mx-auto border border-brand-border rounded-sm bg-white">
            <InlineConsultForm />
          </div>
          <div className="max-w-3xl mx-auto mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-brand-text">
            <span className="flex items-center gap-2">
              <Phone size={14} className="text-brand-gold" />
              029-84556877 / 13359182829
            </span>
            <Link href="/services/basic" className="inline-flex items-center gap-1.5 text-brand-gold hover:text-brand-navy transition-colors">
              查看代理记账服务与费用参考 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 更多工具与服务 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <h2 className="text-lg font-bold text-brand-navy mb-5 text-center">更多免费工具与服务</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/tools/income-tax"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
            >
              <Calculator size={14} /> 个税计算器
            </Link>
            <Link
              href="/self-check"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
            >
              <ShieldCheck size={14} /> 账务风险自查
            </Link>
            <Link
              href="/services/delivery"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
            >
              服务交付标准
            </Link>
            {districts.slice(0, 3).map((d) => (
              <Link
                key={d.slug}
                href={`/services/district/${d.slug}`}
                className="px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
              >
                {d.name}
                {d.keyword}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
