import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  FileSignature,
  BookOpen,
  Calculator,
  Send,
  FileCheck2,
  CalendarCheck,
  Archive,
  ShieldAlert,
  UserCheck,
  Phone,
} from 'lucide-react';
import { districts } from '@/data/districts';

export const metadata: Metadata = {
  title: '服务交付标准-西安代理记账服务流程-交付物与责任边界-西安数度财务咨询',
  description:
    '西安数度财务咨询代理记账与财税服务交付标准：从签约建账、每月做账、纳税申报、报表交付到年度汇算与资料归档的完整流程，明确交付物、时效节点与责任边界，服务过程可预期、可追溯。',
  keywords: [
    '西安代理记账服务流程',
    '代理记账交付标准',
    '西安代理记账每月做什么',
    '代理记账责任边界',
    '西安财税服务流程',
  ],
  alternates: { canonical: '/services/delivery' },
};

// 服务流程时间轴（依法定节点与行业通行做法描述，不含编造的时效承诺）
const processSteps = [
  {
    icon: FileSignature,
    title: '1. 签约与需求确认',
    desc: '确认服务范围、企业类型、票据情况与申报义务，签订服务合同；明确双方权责、资料交接方式与联系人。',
    deliverable: '服务合同、服务清单、专属会计对接人',
  },
  {
    icon: BookOpen,
    title: '2. 建账与初始资料交接',
    desc: '接收历史账务资料（新办企业从零建账），核对银行流水、发票、合同等原始凭证，建立账簿体系与会计科目。',
    deliverable: '建账完成、账套与科目设置、历史问题清单（如有）',
  },
  {
    icon: Calculator,
    title: '3. 每月账务处理',
    desc: '整理原始凭证、录入记账凭证、归集成本费用、计提折旧与工资，核对银行对账与往来账款。',
    deliverable: '记账凭证、账簿记录（按月）',
  },
  {
    icon: Send,
    title: '4. 纳税申报',
    desc: '按税务机关公布的申报期限完成增值税及附加、企业所得税（或经营所得）、个税等各税种申报；期限最后一日为法定节假日的依法顺延。',
    deliverable: '各税种申报表、申报结果反馈',
  },
  {
    icon: FileCheck2,
    title: '5. 报表与凭证交付',
    desc: '提交资产负债表、利润表等财务报表及完税凭证；账务资料按规范归档，企业可随时查阅、随时取回。',
    deliverable: '财务报表、完税凭证、凭证账簿装订',
  },
  {
    icon: CalendarCheck,
    title: '6. 年度事项办理',
    desc: '企业所得税汇算清缴按法定期限（次年 5 月 31 日前）完成；工商年报在法定年报期（每年 1 月 1 日至 6 月 30 日）内提醒并协助办理。',
    deliverable: '汇算清缴申报表、工商年报完成确认',
  },
  {
    icon: Archive,
    title: '7. 归档与年度复盘',
    desc: '年度账务资料归档留存；结合当年度账务与政策适用情况做合规复盘，提示下一年度需关注的风险点。',
    deliverable: '年度归档、合规风险提示、次年服务建议',
  },
];

// 责任边界（双向说明，减少售前沟通成本）
const responsibilities = {
  ours: [
    '按约定完成账务处理与各税种申报，不遗漏、不逾期',
    '发现账务异常、发票疑点或申报数据比对异常时及时告知并给出处理建议',
    '由持有代理记账资质的会计人员对接，日常问题在工作时间内答疑',
    '服务期间账簿、凭证、申报资料完整保管，服务终止时按清单完整移交',
  ],
  clients: [
    '按期、真实、完整提供经营业务票据与银行流水等原始资料',
    '业务真实性由企业负责，不得提供虚假票据或虚构业务',
    '涉及经营决策、合同签订等事项的税务影响，建议事前沟通确认',
    '企业自身工商、税务、银行相关实名认证与授权事项由企业配合完成',
  ],
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: '代理记账与财税服务交付标准',
  serviceType: '代理记账、纳税申报、财税合规服务',
  provider: {
    '@type': 'ProfessionalService',
    name: '西安数度财务咨询有限公司',
    telephone: '029-88456877',
    address: {
      '@type': 'PostalAddress',
      addressLocality: '西安',
      addressRegion: '陕西省',
      streetAddress: '高新区唐延路35号旺座现代城D座1006室',
      addressCountry: 'CN',
    },
  },
  areaServed: { '@type': 'City', name: '西安' },
  description:
    '代理记账与财税服务的交付流程与标准：签约建账、每月做账、纳税申报、报表交付、年度汇算与资料归档，明确交付物与责任边界。',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: '服务交付节点',
    itemListElement: processSteps.map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.title, description: s.desc },
    })),
  },
};

export default function DeliveryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 页面头图 */}
      <section className="bg-brand-navy text-white">
        <div className="container-brand section-padding !py-16 md:!py-20">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold-light text-sm rounded-sm mb-6">
              交付什么 · 何时交付 · 谁负责什么
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">服务交付标准</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              财税服务最怕"交完钱不知道能得到什么"。本页把西安数度财务咨询的代理记账与财税服务流程、
              每个节点的交付物、时效依据与双方责任边界一次讲清楚，服务过程可预期、可追溯。
            </p>
          </div>
        </div>
      </section>

      {/* 服务流程时间轴 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">服务全流程</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto">
              从签约到归档共 7 个节点，每个节点都有明确交付物
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {processSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative flex gap-5 pb-8 last:pb-0">
                  {/* 竖线 */}
                  {idx < processSteps.length - 1 && (
                    <div className="absolute left-[19px] top-11 bottom-0 w-px bg-brand-border" aria-hidden="true" />
                  )}
                  <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0 relative z-10">
                    <Icon size={17} className="text-brand-gold-light" />
                  </div>
                  <div className="flex-1 pt-1.5">
                    <h3 className="font-bold text-brand-navy mb-2">{step.title}</h3>
                    <p className="text-sm text-brand-text-muted leading-relaxed mb-2">{step.desc}</p>
                    <p className="text-xs text-brand-navy bg-brand-bg border border-brand-border rounded-sm px-3 py-2 inline-block">
                      <span className="text-brand-gold font-medium">交付物：</span>
                      {step.deliverable}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 专项服务交付流程 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">专项服务交付流程</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto">
              基础财税托管按上述 7 节点交付；财税风险排查、内部管理审计与常年财税顾问，
              按以下专项流程推进，每个阶段同样有明确交付物
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="p-6 bg-white border border-brand-border rounded-sm">
              <h3 className="font-bold text-brand-navy mb-4">财税风险排查交付</h3>
              <ol className="space-y-2.5">
                {['需求访谈', '资料收集', '风险分析', '诊断报告', '整改建议', '跟踪复核'].map((s, i) => (
                  <li key={s} className="flex items-center gap-2.5 text-sm text-brand-text">
                    <span className="w-6 h-6 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-brand-text-muted leading-relaxed border-t border-brand-border pt-3">
                交付物：风险诊断报告、问题清单、整改建议与跟踪复核记录
              </p>
            </div>

            <div className="p-6 bg-white border border-brand-border rounded-sm">
              <h3 className="font-bold text-brand-navy mb-4">内部管理审计交付</h3>
              <ol className="space-y-2.5">
                {['项目启动', '确定审计范围', '资料分析', '现场/专项核查', '问题清单', '整改建议', '复核确认'].map((s, i) => (
                  <li key={s} className="flex items-center gap-2.5 text-sm text-brand-text">
                    <span className="w-6 h-6 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-brand-text-muted leading-relaxed border-t border-brand-border pt-3">
                交付物：审计报告、问题与风险清单、整改建议书及复核结论
              </p>
            </div>

            <div className="p-6 bg-white border border-brand-border rounded-sm">
              <h3 className="font-bold text-brand-navy mb-4">常年财税顾问交付</h3>
              <ol className="space-y-2.5">
                {['月度咨询', '事项提醒', '专项分析', '政策解读', '年度复盘'].map((s, i) => (
                  <li key={s} className="flex items-center gap-2.5 text-sm text-brand-text">
                    <span className="w-6 h-6 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-brand-text-muted leading-relaxed border-t border-brand-border pt-3">
                交付物：日常咨询答复、涉税事项提醒、专项分析意见与年度财税复盘
              </p>
            </div>
          </div>

          <p className="mt-8 text-xs text-brand-text-muted text-center max-w-3xl mx-auto">
            专项服务的具体范围、阶段与交付物，以项目启动前双方确认的服务方案为准。
          </p>
        </div>
      </section>

      {/* 责任边界 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">责任边界</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto">
              双向说明，合作前把边界讲清楚，避免后续误解
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-white border border-brand-border rounded-sm">
              <div className="flex items-center gap-3 mb-4">
                <UserCheck size={20} className="text-brand-gold" />
                <h3 className="font-bold text-brand-navy">我们的责任</h3>
              </div>
              <ul className="space-y-3">
                {responsibilities.ours.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-brand-text-muted leading-relaxed">
                    <span className="text-brand-gold flex-shrink-0">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-white border border-brand-border rounded-sm">
              <div className="flex items-center gap-3 mb-4">
                <ShieldAlert size={20} className="text-brand-gold" />
                <h3 className="font-bold text-brand-navy">企业需配合的事项</h3>
              </div>
              <ul className="space-y-3">
                {responsibilities.clients.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-brand-text-muted leading-relaxed">
                    <span className="text-brand-gold flex-shrink-0">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-8 text-xs text-brand-text-muted leading-relaxed text-center max-w-3xl mx-auto">
            本页所述为服务交付的一般标准。具体服务内容、交付要求与双方权责，以双方签订的服务合同约定为准；
            涉及纳税申报的具体期限，以税务机关当期公布的规定为准。
          </p>
        </div>
      </section>

      {/* 区县服务（内链） */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <h2 className="text-lg font-bold text-brand-navy mb-4 text-center">西安全域服务</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {districts.map((d) => (
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

      {/* CTA */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-brand-border rounded-sm p-6 md:p-8">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-brand-navy mb-2">想确认您的企业适合哪种服务方案？</h3>
              <p className="text-brand-text-muted text-sm md:text-base">
                免费初步沟通，按企业实际情况说明服务内容、交付物与费用区间。
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-brand-text">
                <span className="flex items-center gap-2">
                  <Phone size={14} className="text-brand-gold" />
                  029-88456877 / 13359182829
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white font-medium rounded-sm hover:bg-brand-navy-light transition-colors duration-200"
              >
                免费咨询 <ArrowRight size={16} />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-6 py-3 border border-brand-navy text-brand-navy rounded-sm hover:bg-brand-navy/5 transition-colors duration-200 text-sm"
              >
                查看费用参考
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
