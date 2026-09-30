import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Calculator } from 'lucide-react';
import { RmbUppercaseConverter } from '@/components/rmb-uppercase-converter';
import { InlineConsultForm } from '@/components/inline-consult-form';
import { districts } from '@/data/districts';

export const metadata: Metadata = {
  title: '人民币大写转换器_金额大小写转换_数字转中文大写_西安数度财务咨询',
  description:
    '免费在线人民币大写转换器：输入数字金额实时转为中文大写（壹贰叁…），支持角分与"零""整"规范处理，依据《支付结算办法》票据填写基本规定，合同、发票、支票填写参考，西安数度财务咨询提供。',
  keywords: [
    '人民币大写转换器',
    '金额大小写转换',
    '数字转中文大写',
    '支票大写金额',
    '合同金额大写',
  ],
  alternates: { canonical: '/tools/rmb-uppercase' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '人民币大写转换器',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  description:
    '免费在线人民币金额大写转换工具：数字金额实时转中文大写，支持角分与零、整规范处理，依据票据填写基本规定。',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
  provider: {
    '@type': 'ProfessionalService',
    name: '西安数度财务咨询有限公司',
    telephone: '029-84556877',
  },
};

export default function RmbUppercasePage() {
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
              免费在线工具 · 票据规范口径
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">人民币大写转换器</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              合同、发票、支票填写金额时需要中文大写。输入数字金额，实时转换为规范大写，
              自动处理"零"与"整"的规则，结果可一键复制。
            </p>
          </div>
        </div>
      </section>

      {/* 转换器 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <RmbUppercaseConverter />
          </div>
        </div>
      </section>

      {/* 常见用途 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-5">什么时候会用到？</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                <h3 className="text-sm font-bold text-brand-navy mb-2">签合同</h3>
                <p className="text-xs text-brand-text-muted leading-relaxed">
                  合同金额一般要求同时写小写与大写，大写不易篡改，是金额确认的规范写法。
                </p>
              </div>
              <div className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                <h3 className="text-sm font-bold text-brand-navy mb-2">开支票</h3>
                <p className="text-xs text-brand-text-muted leading-relaxed">
                  支票金额栏必须用中文大写，"零""整"书写不规范可能被银行退票。
                </p>
              </div>
              <div className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                <h3 className="text-sm font-bold text-brand-navy mb-2">开发票与收据</h3>
                <p className="text-xs text-brand-text-muted leading-relaxed">
                  发票、收据、借条、工资条的金额大写栏，都可直接使用转换结果。
                </p>
              </div>
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
              查看代理记账服务与费用参考
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
              href="/tools/income-tax"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
            >
              <Calculator size={14} /> 个税计算器
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
