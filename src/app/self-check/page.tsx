import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import RiskCheck from '@/components/risk-check';

export const metadata: Metadata = {
  title: '账务风险自查_西安个体户小微企业财税风险测评_西安数度财务咨询',
  description:
    '3 道题快速自查账务处理、资金流与申报习惯，初步了解企业财税风险状况。适合西安个体工商户、小微企业主。完成自查后可预约专业财税诊断，获取风险排查建议。',
  keywords: [
    '账务风险自查',
    '财税风险测评',
    '个体户财税风险',
    '小微企业账务规范',
    '西安代理记账',
    '西安数度财务咨询',
  ],
  alternates: { canonical: '/self-check' },
};

export default function SelfCheckPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: '账务风险自查',
            description:
              '3 道题快速自查账务处理、资金流与申报习惯，初步了解企业财税风险状况，适用于西安个体工商户与小微企业主。',
            publisher: {
              '@type': 'Organization',
              name: '西安数度财务咨询有限公司',
              url: 'https://www.shuducw.com',
            },
          }),
        }}
      />
      {/* Hero */}
      <section className="bg-brand-navy text-white">
        <div className="container-brand section-padding !py-16 md:!py-20">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold-light text-sm rounded-sm mb-6">
              1 分钟 · 3 道题 · 免费
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">账务风险自查</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              面向西安个体工商户与小微企业主：通过 3 道选择题，初步判断您在
              <strong className="text-brand-gold-light"> 账务处理、资金流、申报习惯 </strong>
              三方面的财税风险状况，并给出对应的自查建议。
            </p>
          </div>
        </div>
      </section>

      {/* 自查问卷 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding">
          <div className="max-w-2xl mx-auto">
            <RiskCheck />
          </div>
        </div>
      </section>

      {/* 说明 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-4">关于本次自查</h2>
            <div className="space-y-4 text-sm md:text-base text-brand-text leading-relaxed">
              <p>
                <strong className="text-brand-navy">为什么要自查？</strong>{' '}
                个体户和小微企业的财税风险大多来自账务缺失、公私收款混用、逾期申报等习惯性细节，
                在税务监管数据比对日益精细的今天，这些隐患可能被系统提前预警。提前发现、提前规范，
                远比事后补救成本更低。
              </p>
              <p>
                <strong className="text-brand-navy">自查结果能做什么？</strong>{' '}
                结果用于帮您初步定位风险方向，不构成专业税务意见。如需详细诊断与整改方案，
                可预约我们的持证会计做一次账务梳理与税务风险排查。
              </p>
              <p>
                <strong className="text-brand-navy">信息如何保护？</strong>{' '}
                您的提交信息仅用于与您联系和提供服务，由持有代理记账资质的会计对接，信息严格保密，
                详见{' '}
                <Link href="/privacy" className="text-brand-navy hover:text-brand-gold font-medium">
                  隐私政策
                </Link>
                。
              </p>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 p-6 bg-brand-bg border border-brand-border rounded-sm">
              <ShieldCheck size={32} className="text-brand-gold flex-shrink-0" />
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm font-semibold text-brand-navy">想直接找会计聊聊？</p>
                <p className="text-xs text-brand-text-muted mt-1">
                  电话 029-84556877 / 13359182829，或查看
                  <Link href="/contact" className="text-brand-navy hover:text-brand-gold font-medium">
                    {' '}
                    联系我们
                  </Link>
                </p>
              </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white text-sm font-medium rounded-sm hover:bg-brand-navy-light transition-colors flex-shrink-0"
              >
                查看业务范围 <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
