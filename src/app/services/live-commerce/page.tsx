import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Phone,
  ArrowRight,
  CheckCircle2,
  Video,
  ReceiptText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import ConsultationForm from '@/components/consultation-form';

export const metadata: Metadata = {
  title: '西安直播电商个体户财税咨询_主播报税_合规经营_西安数度财务咨询',
  description:
    '西安直播电商个体户与主播财税咨询：直播收入怎么报税、个体户注册与核定征收、平台佣金发票、私户收款风险排查，帮助主播与电商经营者合规经营、安心赚钱。',
  keywords: [
    '西安直播电商财税',
    '西安主播报税',
    '直播个体户注册',
    '主播收入怎么报税',
    '西安数度财务咨询',
  ],
  alternates: { canonical: '/services/live-commerce' },
};

const services = [
  {
    icon: Video,
    title: '直播 / 电商个体户注册',
    desc: '协助主播、带货商家注册个体工商户，确定经营范围，完成税务登记与银行开户，从源头规范经营主体。',
  },
  {
    icon: ReceiptText,
    title: '收入申报与发票管理',
    desc: '直播带货佣金、打赏、坑位费等收入的分类与申报辅导，发票申领、开具与平台结算对账，佣金发票合规。',
  },
  {
    icon: ShieldCheck,
    title: '征收方式与税负测算',
    desc: '结合经营情况分析核定征收与查账征收的适用，测算综合税负，选择合规且成本可控的申报方式。',
  },
  {
    icon: Sparkles,
    title: '私户收款风险排查',
    desc: '经营收入长期走私人账户的风险排查与整改方案，帮助经营者建立公账收款、规范核算的习惯。',
  },
];

const faqList = [
  {
    q: '主播 / 直播带货收入怎么报税？',
    a: '以个人名义直播的，收入多按劳务报酬所得缴纳个税（平台通常代扣代缴）；注册了个体户、工作室或公司的，按经营所得或企业所得税申报。带货佣金、坑位费、打赏等不同收入性质可能不同，建议按实际业务模式确认并规范申报。',
  },
  {
    q: '做直播带货，要不要注册个体户？',
    a: '如果直播收入稳定、规模较大，或需要给品牌方开票，建议注册个体工商户，用经营主体对外签约、收款、开票，比个人身份更规范，也方便成本费用扣除。具体是否注册可结合收入规模和业务模式判断。',
  },
  {
    q: '直播电商个体户要交哪些税？',
    a: '通常涉及增值税（小规模纳税人适用征收率，月销售额未超过 10 万元的按现行政策免征，以最新政策为准）和个人所得税经营所得（5%-35% 超额累进税率或核定征收）。平台结算的佣金收入应及时申报，避免收入与申报不符。',
  },
  {
    q: '直播收入走私人账户有什么风险？',
    a: '经营收入长期通过个人微信、支付宝收取且不申报，属于隐匿收入，在金税四期银行与税务数据比对下极易暴露，一旦核查将面临补税、滞纳金和罚款。建议经营收入走对公账户或申报完整，保留平台结算记录。',
  },
  {
    q: '给平台或品牌方开票要交多少税？',
    a: '作为个体户开具发票，增值税按征收率计算（月销售额未超 10 万元按现行政策免征），个人所得税按经营所得缴纳。开票本身不是额外税负的来源，税负主要取决于收入与成本核算，建议提前做好税负测算。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: '西安直播电商个体户财税咨询',
  provider: {
    '@type': 'Organization',
    name: '西安数度财务咨询有限公司',
    url: 'https://www.shuducw.com',
  },
  description:
    '为西安直播电商个体户与主播提供收入申报、个体户注册、核定征收、发票管理、私户收款风险排查等财税咨询服务。',
  areaServed: { '@type': 'City', name: '西安' },
  serviceType: ['直播电商财税', '主播报税', '个体户注册', '税务咨询'],
};

export default function LiveCommercePage() {
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
            mainEntity: faqList.map((f) => ({
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
              西安直播电商 · 个体户财税专项
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">直播电商个体户财税咨询</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              直播带货、短视频、私域电商快速发展的当下，主播和电商经营者的财税合规越来越重要。
              我们为西安直播电商个体户与主播提供收入申报、个体户注册、征收方式选择、
              发票管理与私户收款风险排查一站式服务，2025 年度纳税信用 A 级纳税人。
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-white/80">
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
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-6 text-center">主播和电商经营者，最该先搞懂的三件事</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-8" />
            <div className="space-y-4 text-brand-text leading-relaxed">
              <p>
                <strong>第一件：收入性质决定怎么交税。</strong>
                带货佣金、打赏、广告费、坑位费，各自对应的税目不同。以个人名义还是注册主体经营，
                直接决定按劳务报酬还是经营所得交税。收入规模上来了，注册个体户往往更规范、更划算。
              </p>
              <p>
                <strong>第二件：平台结算不等于"已经交完税"。</strong>
                平台可能代扣了部分个税，但涉及多平台、多渠道收入时，需要自行汇总申报，年度还有汇算清缴义务。
                只靠平台代扣、自己不管，很容易出现漏报。
              </p>
              <p>
                <strong>第三件：私户收款是最大雷区。</strong>
                直播收入如果长期走个人微信、支付宝且不申报，在金税四期数据比对下极易被识别，
                一旦核查就是补税、滞纳金加罚款。合规的起点是把经营收入"晒"在明处。
              </p>
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
            {services.map((s) => {
              const Icon = s.icon;
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
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">直播电商常见问题</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto" />
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqList.map((f) => (
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
            <h2 className="text-2xl font-bold text-brand-navy mb-2 text-center">免费咨询直播电商财税问题</h2>
            <p className="text-sm text-brand-text-muted text-center mb-8">
              提交后 1 个工作日内联系您，提供免费收入申报与合规方案建议
            </p>
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
