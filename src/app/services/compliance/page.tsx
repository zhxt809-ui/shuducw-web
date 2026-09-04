import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Search, FileCheck, TrendingUp, AlertTriangle, ArrowRight, ClipboardList, FileSearch, Handshake, RefreshCcw, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: '高端合规内审服务_西安数度财务咨询_企业财税合规_内部管理审计_财务内控搭建',
  description:
    '西安高端企业财税合规内控机构，专注企业财税风险排查、历史账务整改、合规体系搭建、内部管理审计、资产费用专项核查，助力企业完善财务内控、规避涉税风险。',
  keywords: [
    '西安数度财务咨询',
    '西安企业财税合规',
    '西安内部管理审计',
    '西安财务内控搭建',
    '西安财税风险排查',
  ],
  alternates: { canonical: '/services/compliance' },
};

const coreServices = [
  {
    icon: ShieldCheck,
    title: '企业财税合规体系搭建',
    desc: '针对企业业务流程、账务体系、资金往来、公私账管理开展全维度合规体检，梳理历史财税隐患，结合行业特性定制专属合规落地方案。',
    items: [
      '财税风险全面体检',
      '历史问题整改落地',
      '公私账分离规范',
      '业务涉税流程优化',
      '内控合规体系搭建',
      '分行业合规定制',
      '企业财税合规培训',
      '年度合规巡检复盘',
    ],
  },
  {
    icon: Search,
    title: '企业内部管理审计',
    desc: '专注企业内部财务自查、流程核查、风险管控与管理优化，助力企业完善内控制度、堵塞管理漏洞、提升财务运营规范化水平。',
    items: [
      '常态化内部财务核查',
      '费用专项核查',
      '采购与销售流程审计',
      '企业资产专项盘点',
      '员工离任财务核查',
      '内部经济责任核查',
      '专项资金使用核查',
      '内审制度搭建',
      '问题汇总分析',
      '整改方案落地跟进',
      '内部财务流程优化',
    ],
  },
  {
    icon: TrendingUp,
    title: '高端财税咨询与企业架构服务',
    desc: '围绕企业长期经营、股权布局、投融资、并购重组等核心场景，提供定制化高端财税规划服务。',
    items: [
      '常年专属财税顾问',
      '股权架构合规搭建',
      '企业财税组织架构搭建',
      '股东分红合规计划',
      '股权转让财税规划',
      '投融资财税风控',
      '成本管控体系搭建',
      '财务团队专项辅导',
      '企业合并分立重组财税方案落地',
    ],
  },
  {
    icon: AlertTriangle,
    title: '专项财税风控服务',
    desc: '聚焦企业重大经营事项财税风险把控，提供涉税风险研判、税务争议辅助处理、投融资财务尽调、重大经营事项风险评估等专项服务，为企业经营筑牢财税安全防线。',
    items: [
      '涉税风险研判',
      '税务争议辅助处理',
      '投融资财务尽调',
      '重大经营事项风险评估',
      '企业财税风险预案制定',
    ],
  },
];

export default function CompliancePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '高端合规内审服务',
    provider: {
      '@type': 'Organization',
      name: '西安数度财务咨询有限公司',
      url: 'https://www.shuducw.com',
    },
    description:
      '西安高端企业财税合规内控机构，专注企业财税风险排查、历史账务整改、合规体系搭建、内部管理审计、资产费用专项核查与内审制度落地，解决企业财务不规范、内控薄弱、涉税风险等难题。',
    areaServed: {
      '@type': 'City',
      name: '西安',
    },
    serviceType: ['企业财税合规', '内部管理审计', '财务内控搭建', '财税风险排查'],
  };

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
              品牌核心优势业务
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">高端合规 & 内审服务</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              西安数度财务咨询有限公司是西安高端企业财税合规内控机构，专注企业财税风险排查、
              历史账务整改、合规体系搭建、内部管理审计、资产费用专项核查与内审制度落地，
              解决企业财务不规范、内控薄弱、涉税风险等难题。
            </p>
          </div>
        </div>
      </section>

      {/* 核心业务介绍 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">深耕十余年的标杆高端业务</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted">
              依托资深持证财税专家团队，专注服务成长型及中大型规范企业，聚焦企业财税合规落地、
              内部财务管控、全域风险排查与体系搭建，从根源解决企业财务不规范、内控薄弱、涉税隐患等核心问题。
            </p>
          </div>
        </div>
      </section>

      {/* 四大核心服务 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding">
          <div className="space-y-8">
            {coreServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div key={idx} className="card-brand">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 bg-brand-gold/10 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={20} className="text-brand-gold" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-brand-navy mb-2">{service.title}</h3>
                      <p className="text-sm text-brand-text-muted leading-relaxed">{service.desc}</p>
                    </div>
                  </div>
                  <div className="pl-14">
                    <h4 className="text-sm font-semibold text-brand-navy mb-3">服务涵盖：</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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
      <section className="bg-white">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">服务流程</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto text-sm md:text-base">
              从风险排查到整改落地，全流程闭环，方案可执行可追溯
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Search, step: '01', title: '风险体检', desc: '财税风险全面排查，出具问题清单与风险评估报告' },
              { icon: ClipboardList, step: '02', title: '方案定制', desc: '结合行业特性定制合规整改与内控体系搭建方案' },
              { icon: Handshake, step: '03', title: '落地执行', desc: '一对一辅导整改落地，账务、流程、制度同步规范' },
              { icon: RefreshCcw, step: '04', title: '持续巡检', desc: '年度合规巡检复盘，动态跟踪政策变化与经营调整' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="card-brand text-center">
                  <div className="relative inline-flex">
                    <div className="w-14 h-14 bg-brand-gold/10 rounded-sm flex items-center justify-center mx-auto mb-4">
                      <Icon size={24} className="text-brand-gold" />
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

      {/* CTA */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-brand-bg border border-brand-border rounded-sm p-6 md:p-8">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-brand-navy mb-2">需要高端合规或内审服务？</h3>
              <p className="text-brand-text-muted text-sm md:text-base">资深持证团队为您提供从风险排查到整改落地的全流程闭环服务。</p>
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
                预约免费诊断 <ArrowRight size={16} />
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
