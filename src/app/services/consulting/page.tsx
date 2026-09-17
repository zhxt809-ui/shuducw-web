import type { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, UserCheck, Shield, Scale, ArrowRight, ClipboardList, FileSearch, Handshake, RefreshCcw, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: '财税咨询风控_西安数度财务咨询_高端财税咨询_税负合规计划_股权架构搭建',
  description:
    '专业提供高端财税咨询与风控服务，常年企业财税顾问、股权架构搭建、税负合规计划、税务异常处理、稽查协助、投融资财税尽调，全方位保障企业财税安全。',
  keywords: [
    '西安数度财务咨询',
    '西安财税咨询',
    '西安税务风控',
    '西安股权架构搭建',
    '西安企业财税顾问',
  ],
  alternates: { canonical: '/services/consulting' },
};

const consultingServices = [
  {
    icon: UserCheck,
    title: '常年专属财税顾问',
    desc: '为企业配备专属财税顾问，提供全年不间断的财税咨询与指导服务，确保企业日常经营中的财税决策合规、高效。',
    items: [
      '企业日常经营财税决策支持',
      '税收政策变化及时解读与提醒',
      '重大经营事项财税预评估',
      '定期财税健康检查',
    ],
  },
  {
    icon: TrendingUp,
    title: '税负合规计划',
    desc: '基于企业实际经营情况与行业特性，合理规划税务策略，确保合法合规前提下让企业应享尽享税收优惠政策。',
    items: [
      '企业整体税负测算与诊断',
      '分税种合规计划制定',
      '税收优惠政策适配与申请',
      '关联交易税务规划',
    ],
  },
  {
    icon: Shield,
    title: '税务异常处理与稽查协助',
    desc: '针对企业面临的税务异常状态、税务稽查等突发情况，提供专业应对策略与全程协助服务，最大限度降低企业涉税风险与损失。',
    items: [
      '税务异常状态解除',
      '欠税清理方案制定与执行',
      '税务稽查全程协助',
      '税务争议辅助处理',
      '跨区域涉税事项协调',
    ],
  },
  {
    icon: Scale,
    title: '股权架构搭建与企业架构服务',
    desc: '围绕企业股权布局、投融资、并购重组等核心场景，提供定制化高端财税规划服务，从架构层面解决涉税问题。',
    items: [
      '股权架构合规搭建',
      '股东分红合规计划',
      '股权转让财税规划',
      '投融资财税风控与财务尽调',
      '企业合并分立重组财税方案落地',
      '企业财税组织架构搭建',
      '成本管控体系搭建',
    ],
  },
  {
    icon: Shield,
    title: '重大经营事项风险评估',
    desc: '聚焦企业重大经营事项财税风险把控，提供专项风险评估与预案制定，为企业经营筑牢财税安全防线。',
    items: [
      '涉税风险研判',
      '重大经营事项财税风险评估',
      '企业财税风险预案制定',
      '投融资财务尽职调查',
    ],
  },
];

export default function ConsultingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '财税咨询与风控服务',
    provider: {
      '@type': 'Organization',
      name: '西安数度财务咨询有限公司',
      url: 'https://www.shuducw.com',
    },
    description:
      '西安数度财务咨询有限公司专业提供高端财税咨询与风控服务，包含常年财税顾问、税负合规计划、税务异常处理、稽查协助、股权架构搭建、投融资财税尽调、重大经营风险评估，全方位保障企业财税安全。',
    areaServed: {
      '@type': 'City',
      name: '西安',
    },
    serviceType: ['高端财税咨询', '税务风控', '股权架构搭建', '投融资财税尽调', '企业财税顾问'],
  };

  const faqList = [
    {
      q: '税务筹划和偷逃税有什么区别？',
      a: '本质区别在于商业实质和合法性。合法合规的税务安排是基于真实业务、依据现行政策做出的合理安排，有商业实质、经得起核查；偷逃税则是通过隐匿收入、虚开发票、虚构成本等方式少缴税款。以降低税负为目的但缺乏商业实质的安排，可能被穿透认定，风险极大。',
    },
    {
      q: '股权架构怎么搭建更合规？',
      a: '股权架构设计涉及持股主体选择（个人/法人/有限合伙）、出资方式、表决权安排和转让路径，需结合股东诉求、行业监管和税务影响综合设计。建议在设立阶段就规划清楚，避免后期变更带来的高额税负和程序成本，涉及具体方案建议咨询专业机构。',
    },
    {
      q: '公司税负感觉偏高，怎么合规应对？',
      a: '先做税负测算，分析各税种负担与行业水平差异；再核查是否有未充分利用的税收优惠（如小微优惠、研发加计扣除、专项附加扣除等）和可规范的扣除凭证。合规路径是先自查、再规划，而不是简单通过私户收款、虚开发票等方式"节税"。',
    },
    {
      q: '投融资尽调会查什么？',
      a: '投资人或银行尽调重点核查：收入确认口径、往来账款真实性、关联交易、税务合规情况、社保公积金缴纳、重大合同和历史股权变更。账务规范、凭证完整的企业在尽调中更有优势，也能避免估值缩水或融资受阻。',
    },
  ];

  const relatedArticles = [
    { href: '/news/2026-shuiwujicha-zhongdian', title: '2026年税务稽查重点：四大方向与高风险行为' },
    { href: '/news/2026-caishui-4tiao-hongxian', title: '2026年财税4条红线：老板逐条自查' },
    { href: '/news/zhuce-zijin-renjiao-2026', title: '公司注册资金填多少合适？认缴制下的几个坑' },
  ];

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
              高端增值服务
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">财税咨询与风控服务</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              西安数度财务咨询有限公司专业提供高端财税咨询与风控服务，包含常年财税顾问、税负合规计划、
              税务异常处理、稽查协助、股权架构搭建、投融资财税尽调、重大经营风险评估，
              全方位保障企业财税安全。
            </p>
          </div>
        </div>
      </section>

      {/* 服务详情 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="space-y-8">
            {consultingServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div key={idx} className="card-brand">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 bg-brand-navy/5 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={20} className="text-brand-navy" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-brand-navy mb-2">{service.title}</h3>
                      <p className="text-sm text-brand-text-muted leading-relaxed">{service.desc}</p>
                    </div>
                  </div>
                  <div className="pl-14">
                    <h4 className="text-sm font-semibold text-brand-navy mb-3">服务涵盖：</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {service.items.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm text-brand-text">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 服务流程 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">服务流程</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto text-sm md:text-base">
              深度诊断 → 定制方案 → 落地辅导，为企业财税安全保驾护航
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileSearch, step: '01', title: '财税诊断', desc: '了解企业经营与财务现状，开展税负测算与风险研判' },
              { icon: ClipboardList, step: '02', title: '方案规划', desc: '定制税负合规计划、股权架构与风险应对方案' },
              { icon: Handshake, step: '03', title: '顾问落地', desc: '专属顾问全年支持，重大事项提前预评估与辅导' },
              { icon: RefreshCcw, step: '04', title: '定期复盘', desc: '定期财税健康检查，跟踪政策变化动态调整策略' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="card-brand text-center">
                  <div className="relative inline-flex">
                    <div className="w-14 h-14 bg-brand-navy/5 rounded-sm flex items-center justify-center mx-auto mb-4">
                      <Icon size={24} className="text-brand-navy" />
                    </div>
                    <span className="absolute -top-2 -right-2 text-xs font-bold text-brand-gold">{item.step}</span>
                  </div>
                  <h3 className="font-bold text-brand-navy mb-2">{item.title}</h3>
                  <p className="text-sm text-brand-text-muted leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 常见问题 FAQ（页内问答，利于长尾收录与转化） */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding">
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
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">老板常问的问题</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto" />
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqList.map((f) => (
              <details
                key={f.q}
                className="group bg-white border border-brand-border rounded-sm p-4 open:shadow-sm"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-brand-navy font-medium">
                  <span>{f.q}</span>
                  <span className="text-brand-gold text-lg flex-shrink-0 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-brand-text leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>

          {/* 相关科普文章内链 */}
          <div className="mt-10 max-w-3xl mx-auto">
            <h3 className="text-lg font-bold text-brand-navy mb-4">相关财税科普</h3>
            <div className="space-y-3">
              {relatedArticles.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center justify-between gap-4 p-4 bg-white border border-brand-border rounded-sm hover:border-brand-navy hover:shadow-sm transition-all group"
                >
                  <span className="text-sm text-brand-text group-hover:text-brand-navy">{a.title}</span>
                  <ArrowRight size={14} className="text-brand-gold flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-brand-border rounded-sm p-6 md:p-8">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-brand-navy mb-2">需要专业的财税咨询或风控服务？</h3>
              <p className="text-brand-text-muted text-sm md:text-base">高端持证团队为企业提供全方位财税安全保障，从咨询到落地一站式服务。</p>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-brand-text">
                <span className="flex items-center gap-2">
                  <Phone size={14} className="text-brand-gold" />
                  029-84556877 / 13359182829
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white font-medium rounded-sm hover:bg-brand-navy-light transition-colors duration-200"
              >
                免费咨询报价 <ArrowRight size={16} />
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 px-6 py-3 border border-brand-navy text-brand-navy rounded-sm hover:bg-brand-navy/5 transition-colors duration-200 text-sm"
              >
                查看常见问题
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
