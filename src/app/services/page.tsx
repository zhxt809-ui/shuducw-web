import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, FileCheck, TrendingUp, ArrowRight, Briefcase, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: '财税业务范围_西安数度财务咨询_工商财税托管_财税合规_内部审计_财税风控',
  description:
    '提供全品类企业财税服务，涵盖西安工商记账报税一站式托管、乱账整改、税务优化、财税合规搭建、内部管理审计、股权架构搭建与专项财税风控，适配全行业企业财税需求。',
  keywords: [
    '西安数度财务咨询业务',
    '西安工商财税服务',
    '西安财税合规服务',
    '西安企业内部审计',
    '西安财税风控咨询',
  ],
  alternates: { canonical: '/services' },
};

const businessAreas = [
  {
    icon: Building2,
    tag: '基础刚需',
    title: '基础一站式工商财税服务',
    desc: '整合工商全项服务与记账报税全套服务，为初创企业、小微企业提供标准化一站式财税托管，全程规范办理，解决企业开办、日常经营、年度公示等基础财税问题。',
    services: [
      '工商全项服务：公司注册、企业变更、公司注销、股权转让',
      '记账报税全项：代理记账、全税种申报、汇算清缴、税控托管',
      '基础配套服务：社保公积金托管、日常财税答疑、票据管理',
    ],
    href: '/services/basic',
  },
  {
    icon: Layers,
    tag: '中端增值',
    title: '中端增值财税服务',
    desc: '针对企业经营中常见的账务混乱、税务异常、税负失衡、财务流程不规范等问题，提供专项整改与优化服务，修复历史财税遗留问题，规范日常财税流程。',
    services: [
      '账务优化服务：乱账清理、旧账梳理、账务规范整改',
      '税务风控服务：税负测算、税务合规优化、税务异常解除、稽查协助',
      '企业配套服务：稳岗补贴申报、简易财务制度搭建、财务辅导',
    ],
    href: '/services/basic',
  },
  {
    icon: FileCheck,
    tag: '品牌核心',
    title: '高端合规 & 内部管控核心业务',
    desc: '本公司深耕十余年的标杆高端业务。依托资深持证财税专家团队，专注服务成长型及中大型规范企业，聚焦企业财税合规落地、内部财务管控、全域风险排查与体系搭建。',
    services: [
      '企业财税合规体系搭建',
      '企业内部管理审计',
      '高端财税咨询与企业架构服务',
      '专项财税风控服务',
    ],
    href: '/services/compliance',
  },
  {
    icon: TrendingUp,
    tag: '高端增值',
    title: '财税咨询与风控服务',
    desc: '专业提供高端财税咨询与风控服务，常年企业财税顾问、税负合规计划、税务异常处理、稽查协助、股权架构搭建、投融资财税尽调，全方位保障企业财税安全。',
    services: [
      '常年专属财税顾问',
      '股权架构合规搭建与股东分红合规计划',
      '投融资财税风控与财务尽调',
      '税务争议辅助处理与风险评估',
    ],
    href: '/services/consulting',
  },
];

const extendedServices = [
  '高新技术企业认定辅助',
  '专精特新申报',
  '研发费用辅助账搭建',
  '出口退税代办',
  '跨境基础财税处理',
  '企业全盘财务外包',
  '财务部门托管',
  '全员薪酬个税合规规划',
  '各类企业专项财税补贴申报',
];

export default function ServicesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '西安数度财务咨询有限公司 - 业务范围',
    description: '提供全品类企业财税服务，涵盖工商记账报税一站式托管、乱账整改、税务优化、财税合规搭建、内部管理审计、股权架构搭建与专项财税风控',
    provider: {
      '@type': 'Organization',
      name: '西安数度财务咨询有限公司',
      url: 'https://www.shuducw.com',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: '财税服务目录',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '基础一站式工商财税服务',
            description: '整合工商全项服务与记账报税全套服务，为初创企业、小微企业提供标准化一站式财税托管',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '中端增值财税服务',
            description: '针对企业经营中常见的账务混乱、税务异常、税负失衡等问题，提供专项整改与优化服务',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '高端合规与内部管控核心业务',
            description: '专注企业财税合规落地、内部财务管控、全域风险排查与体系搭建',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '财税咨询与风控服务',
            description: '常年企业财税顾问、税负合规计划、税务异常处理、稽查协助、股权架构搭建、投融资财税尽调',
          },
        },
      ],
    },
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
              全品类企业财税服务
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">业务范围</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              西安数度财务咨询有限公司提供全品类企业财税服务，涵盖西安工商记账报税一站式托管、
              乱账整改、税务优化、财税合规搭建、内部管理审计、股权架构搭建与专项财税风控，
              满足各行业企业全周期财税发展需求。
            </p>
          </div>
        </div>
      </section>

      {/* 业务体系总览 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">业务体系总览</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto">
              业务体系分层清晰、定位明确，分为基础工商财税服务、中端增值财税服务、高端合规内控核心业务三大板块，
              兼顾刚需托管与高端风控落地。
            </p>
          </div>

          <div className="space-y-8">
            {businessAreas.map((area) => {
              const Icon = area.icon;
              return (
                <div key={area.title} className="card-brand">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-brand-navy/5 rounded-sm flex items-center justify-center">
                          <Icon size={20} className="text-brand-navy" />
                        </div>
                        <span className="text-xs px-2 py-0.5 bg-brand-gold/10 text-brand-gold rounded-sm font-medium">
                          {area.tag}
                        </span>
                        <h3 className="text-lg font-bold text-brand-navy">{area.title}</h3>
                      </div>
                      <p className="text-sm text-brand-text-muted leading-relaxed mb-4">{area.desc}</p>
                      <ul className="space-y-2">
                        {area.services.map((service) => (
                          <li key={service} className="flex items-start gap-2 text-sm text-brand-text">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 flex-shrink-0" />
                            {service}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex-shrink-0 flex items-end">
                      <Link
                        href={area.href}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-navy text-white text-sm font-medium rounded-sm hover:bg-brand-navy-light transition-colors duration-200"
                      >
                        了解详情 <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 增值延伸业务 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">增值延伸业务</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto">
              依托核心财税服务优势，为合作企业提供全链条配套增值服务，一站式覆盖企业经营全周期财税、资质、补贴、财务外包需求。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {extendedServices.map((service) => (
              <div key={service} className="flex items-center gap-3 p-4 bg-white border border-brand-border rounded-sm">
                <Briefcase size={16} className="text-brand-gold flex-shrink-0" />
                <span className="text-sm text-brand-text">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-brand-bg border border-brand-border rounded-sm p-6 md:p-8">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-brand-navy mb-2">不确定需要哪项服务？</h3>
              <p className="text-brand-text-muted text-sm md:text-base">联系我们，专业顾问为您量身定制财税解决方案。</p>
            </div>
            <Link
              href="/contact"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white font-medium rounded-sm hover:bg-brand-navy-light transition-colors duration-200"
            >
              免费咨询 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
