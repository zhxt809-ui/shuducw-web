import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Phone, ShieldCheck, BookOpen, Calculator } from 'lucide-react';
import { IncomeTaxCalculator } from '@/components/income-tax-calculator';
import { InlineConsultForm } from '@/components/inline-consult-form';
import { districts } from '@/data/districts';

export const metadata: Metadata = {
  title: '个税计算器-经营所得5%-35%-工资薪金个税计算-西安数度财务咨询',
  description:
    '免费在线个人所得税计算器：经营所得模式（个体户5%-35%五级超额累进，适合个体户、主播、个人工作室）与工资薪金模式（3%-45%七级，减除费用6万/年、专项附加扣除），现行税率表，西安数度财务咨询提供。',
  keywords: [
    '个税计算器',
    '经营所得个人所得税计算',
    '个体户个税计算器',
    '工资个税计算',
    '直播电商主播报税',
  ],
  alternates: { canonical: '/tools/income-tax' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '个人所得税计算器',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  description:
    '免费在线个税计算器：经营所得（个体户5%-35%五级）与工资薪金（3%-45%七级、减除费用6万/年）双模式，现行税率表。',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
  provider: {
    '@type': 'ProfessionalService',
    name: '西安数度财务咨询有限公司',
    telephone: '029-84556877',
  },
};

export default function IncomeTaxCalculatorPage() {
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
              免费在线工具 · 现行税率表
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">个人所得税计算器</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              个体户、主播常用<b>经营所得</b>模式（5%-35% 五级）；上班族可用<b>工资薪金</b>模式
              （3%-45% 七级，减除费用 6 万元/年）。结果为简化估算，仅供参考。
            </p>
          </div>
        </div>
      </section>

      {/* 计算器 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <IncomeTaxCalculator />
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
                <h3 className="font-bold text-brand-navy mb-2">经营所得（个体户、个人工作室等）</h3>
                <ul className="space-y-1.5">
                  <li>· 以每一纳税年度的收入总额减除成本、费用以及损失后的余额为应纳税所得额</li>
                  <li>· 适用 5% 至 35% 五级超额累进税率：不超过 3 万元部分 5%；3 万至 9 万部分 10%；9 万至 30 万部分 20%；30 万至 50 万部分 30%；超过 50 万部分 35%</li>
                  <li>· 计征方式分查账征收与核定征收，实际以主管税务机关确定的方式为准</li>
                </ul>
              </div>
              <div className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                <h3 className="font-bold text-brand-navy mb-2">综合所得（工资薪金等）</h3>
                <ul className="space-y-1.5">
                  <li>· 年度减除费用 6 万元，另可减除三险一金（专项扣除）与专项附加扣除</li>
                  <li>· 适用 3% 至 45% 七级超额累进税率（3 万 6 / 14 万 4 / 30 万 / 42 万 / 66 万 / 96 万级距）</li>
                  <li>· 工资薪金实际由单位按累计预扣法逐月代扣代缴，次年 3-6 月办理汇算清缴，本工具为简化年度估算</li>
                </ul>
              </div>
              <p className="text-xs leading-relaxed">
                提示：专项附加扣除（子女教育、赡养老人、房贷利息、房租、继续教育、大病医疗、婴幼儿照护等）
                以实际符合条件并按规定申报为准。政策如有调整，以税务机关最新公布为准。
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
            <Link
              href="/services/live-commerce"
              className="inline-flex items-center gap-1.5 text-brand-gold hover:text-brand-navy transition-colors"
            >
              直播电商个体户财税咨询 <ArrowRight size={14} />
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
              href="/tools/vat"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
            >
              <Calculator size={14} /> 增值税计算器
            </Link>
            <Link
              href="/tools/rmb-uppercase"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
            >
              金额大写转换
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
