import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Building2,
  FileCheck,
  TrendingUp,
  ArrowRight,
  Briefcase,
  Layers,
  FileText,
  CalendarCheck,
  CalendarDays,
  ShieldAlert,
  UserCheck,
  Archive,
  Shield,
} from 'lucide-react';
import { districts } from '@/data/districts';
import { industries } from '@/data/industries';

export const metadata: Metadata = {
  title: '财税业务范围-西安数度财务咨询-工商财税托管-财税合规-内部审计-财税风控',
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

// 核心业务：与首页一致的客户语言四层服务体系
const businessAreas = [
  {
    icon: Building2,
    num: '01',
    title: '基础财税服务',
    scene: '初创、小微企业日常经营',
    desc: '整合工商全项服务与记账报税全套服务，为初创企业、小微企业提供标准化一站式财税托管，全程规范办理，解决企业开办、日常经营、年度公示等基础财税问题。',
    services: [
      '工商全项服务：公司注册、企业变更、公司注销、股权转让',
      '记账报税全项：代理记账、全税种申报、汇算清缴、税控托管',
      '基础配套服务：社保公积金托管、日常财税答疑、票据管理',
    ],
    href: '/services/basic',
  },
  {
    icon: FileCheck,
    num: '02',
    title: '财税合规与内审',
    scene: '乱账、历史账、税务风险、财税合规',
    desc: '针对账务混乱、税务异常、历史遗留问题与合规要求，提供专项梳理、整改与合规体系搭建服务，修复历史问题、规范日常流程、排查税务风险。',
    services: [
      '账务规范：乱账清理、旧账梳理、账务规范整改',
      '税务合规：税务风险排查、税负测算、税务异常解除、稽查协助',
      '合规体系：财税合规体系搭建、简易财务制度搭建、财务辅导',
    ],
    href: '/services/compliance',
  },
  {
    icon: Shield,
    num: '03',
    title: '内部管理与风险控制',
    scene: '内部审计、财务制度、流程、资金风险',
    desc: '面向已有财务团队或管理基础的企业，提供独立视角的内部管理审计与内控建设，覆盖费用、采购、销售、资金等关键环节，把风险控制嵌入日常管理。',
    services: [
      '内部管理审计：费用专项核查、资产费用核查、采购销售流程审计',
      '内控建设：财务流程梳理、内控制度搭建、岗位分离设计',
      '资金风险：往来款项核查、资金安全管理、管理报表体系',
    ],
    href: '/services/compliance',
  },
  {
    icon: TrendingUp,
    num: '04',
    title: '财税顾问与专项咨询',
    scene: '常年顾问、股权、融资、尽调、集团财税',
    desc: '为成长期与集团化企业提供伴随式财税顾问与专项支持，围绕股权、融资、重大经营决策提供可落地的财税方案。',
    services: [
      '常年财税顾问：日常咨询、事项提醒、政策解读、年度复盘',
      '股权与分红：股权架构合规搭建、股东分红合规安排',
      '投融资支持：投融资财税风控、财务尽调、税务争议辅助处理',
    ],
    href: '/services/consulting',
  },
];

// 配套与专项服务（核心业务之外的配套支持）
const extendedServices = [
  '高新技术企业认定辅助',
  '专精特新申报',
  '研发费用辅助账搭建',
  '出口退税代办',
  '跨境基础财税处理',
  '企业全盘财务外包',
  '财务部门托管',
  '全员薪酬个税合规规划',
  '稳岗补贴等各类企业补贴申报',
];

// 服务交付标准（依据法定期限与行业通行惯例表述，不含编造的时效承诺）
const deliveryStandards = [
  {
    icon: FileText,
    title: '记账与报表交付',
    desc: '每月账务处理完成后，交付财务报表、纳税申报表及完税凭证；账务资料按规范归档留存，企业可随时查阅、随时取回。',
  },
  {
    icon: CalendarCheck,
    title: '纳税申报时效',
    desc: '按税务机关公布的申报期限完成各税种申报；申报期限最后一日为法定节假日的，依法顺延。申报完成后及时反馈申报结果。',
  },
  {
    icon: CalendarDays,
    title: '年度事项办理',
    desc: '企业所得税汇算清缴按法定期限（次年 5 月 31 日前）完成；工商年报在法定年报期（每年 1 月 1 日至 6 月 30 日）内提醒并协助办理。',
  },
  {
    icon: ShieldAlert,
    title: '风险提示义务',
    desc: '发现账务异常、发票疑点、申报数据比对异常或政策变化影响企业时，及时告知并给出处理建议，不隐瞒、不拖延。',
  },
  {
    icon: UserCheck,
    title: '专属会计对接',
    desc: '由持有代理记账资质的会计人员对接服务，日常财税问题在工作时间内答疑，重大事项提供书面说明。',
  },
  {
    icon: Archive,
    title: '资料交接规范',
    desc: '服务期间账簿、凭证、申报资料完整保管；服务终止时，按清单完整移交全部账务资料，不扣押、不留存。',
  },
];

// 费用参考（区间口径与 FAQ、基础财税服务页保持一致）
const feeReference = [
  {
    title: '个体户 / 零申报',
    range: '通常低于小规模档位',
    desc: '业务简单、票据量少或零申报的个体户，费用通常低于小规模企业档位，具体按票据张数与申报频次核算。',
  },
  {
    title: '小规模纳税人代理记账',
    range: '2000-4000 元/年',
    desc: '含月度记账、增值税及附加申报、企业所得税季度预缴、年度汇算清缴、财务报表与凭证交付；视开票量与进销存复杂度浮动。',
  },
  {
    title: '一般纳税人代理记账',
    range: '高于小规模（按票据量核算）',
    desc: '涉及进项销项认证抵扣、月度申报与更复杂的账务处理，费用高于小规模档位，具体按开票量与业务复杂度评估。',
  },
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
            name: '基础财税服务',
            description: '整合工商全项服务与记账报税全套服务，为初创企业、小微企业提供标准化一站式财税托管',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '财税合规与内审',
            description: '乱账清理、历史账务整改、税务风险排查与财税合规体系搭建',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '内部管理与风险控制',
            description: '内部管理审计、内控制度建设、财务流程梳理与资金风险管理',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '财税顾问与专项咨询',
            description: '常年企业财税顾问、股权架构搭建、投融资财税尽调、税务争议辅助处理',
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

      {/* 核心业务：四层服务体系 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">核心业务体系</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto">
              四层核心业务覆盖企业不同发展阶段的财税需求——从日常记账报税，到财务规范、
              内部管理与长期财税顾问，每层都有明确的服务清单与交付标准。
            </p>
          </div>

          <div className="space-y-8">
            {businessAreas.map((area) => {
              const Icon = area.icon;
              return (
                <div key={area.title} className="card-brand">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <div className="w-10 h-10 bg-brand-navy/5 rounded-sm flex items-center justify-center">
                          <Icon size={20} className="text-brand-navy" />
                        </div>
                        <span className="text-xs px-2 py-0.5 bg-brand-gold/10 text-brand-gold rounded-sm font-medium">
                          {area.num}
                        </span>
                        <h3 className="text-lg font-bold text-brand-navy">{area.title}</h3>
                        <span className="text-xs text-brand-text-muted">｜{area.scene}</span>
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

      {/* 配套与专项服务 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">配套与专项服务</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto">
              核心业务之外的配套支持——围绕资质、补贴、外包等专项需求，为合作企业提供全链条配套服务。
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

      {/* 直播电商专项 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <Link
            href="/services/live-commerce"
            className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 md:p-8 bg-gradient-to-r from-brand-navy to-brand-navy-light text-white rounded-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-gold/20 border border-brand-gold/40 rounded-sm flex items-center justify-center flex-shrink-0">
                <TrendingUp size={22} className="text-brand-gold" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1 group-hover:text-brand-gold-light transition-colors">
                  直播电商个体户财税咨询
                </h3>
                <p className="text-white/75 text-sm leading-relaxed">
                  主播报税、直播电商个体户注册、征收方式选择、发票管理、私户收款风险排查——
                  面向直播电商从业者与 MCN 机构的专项财税服务
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-white text-sm font-medium rounded-sm flex-shrink-0 group-hover:bg-brand-gold-light transition-colors">
              查看专项服务 <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      {/* 区域专项服务 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">区域专项服务</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto">
              面向西安各区县企业、商户与个体经营者，提供本地化的注册、记账、报税与财税合规服务
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {districts.map((d) => (
              <Link
                key={d.slug}
                href={`/services/district/${d.slug}`}
                className="group p-5 bg-brand-bg border border-brand-border rounded-sm hover:border-brand-navy hover:shadow-sm transition-all"
              >
                <h3 className="font-bold text-brand-navy group-hover:text-brand-gold mb-2">
                  {d.name} {d.keyword}
                </h3>
                <p className="text-xs text-brand-text-muted leading-relaxed line-clamp-2">{d.metaDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 服务行业 */}
      <section id="industries" className="bg-brand-bg scroll-mt-24">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">服务行业</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto">
              深耕西安十余年，服务覆盖零售、物流、建筑工程、科技、酒店、老年公寓、管理咨询、
              商贸、电商、劳务、跨境贸易等行业，为各行业企业提供适配其经营特点的财税服务。
              其中科技与软件、商贸流通、建筑安装、电商与直播、集团与多主体五类企业另有专项方案，见下方入口。
            </p>
          </div>

          {/* 行业专项方案页入口（可点击进入行业页） */}
          <div className="text-center">
            <p className="text-sm font-bold text-brand-navy mb-4">行业专项财税方案</p>
            <div className="flex flex-wrap justify-center gap-3">
              {industries.map((i) => (
                <Link
                  key={i.slug}
                  href={`/services/industry/${i.slug}`}
                  className="px-4 py-2 bg-white border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
                >
                  {i.name}{i.keyword}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 服务交付标准 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">服务交付标准</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto">
              交付什么、按什么节点交付、责任如何界定——服务过程可预期、可追溯
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliveryStandards.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="p-6 bg-brand-bg border border-brand-border rounded-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white border border-brand-border rounded-sm flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-brand-gold" />
                    </div>
                    <h3 className="font-bold text-brand-navy text-base">{item.title}</h3>
                  </div>
                  <p className="text-sm text-brand-text-muted leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/services/delivery"
              className="inline-flex items-center gap-2 px-6 py-3 border border-brand-navy text-brand-navy text-sm font-medium rounded-sm hover:bg-brand-navy/5 transition-colors"
            >
              查看完整服务流程与交付标准 <ArrowRight size={14} />
            </Link>
          </div>

          <p className="mt-8 text-xs text-brand-text-muted leading-relaxed text-center max-w-3xl mx-auto">
            以上为服务交付的一般标准。具体服务内容、交付要求与双方权责，以双方签订的服务合同约定为准；
            涉及纳税申报的具体期限，以税务机关当期公布的规定为准。
          </p>
        </div>
      </section>

      {/* 费用参考 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">服务费用参考</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto">
              财税服务的费用与企业类型、开票量、票据张数、业务复杂度直接相关，以下为市场常见参考范围，具体以企业实际情况核算
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {feeReference.map((item) => (
              <div key={item.title} className="p-6 bg-white border border-brand-border rounded-sm">
                <h3 className="font-bold text-brand-navy text-base mb-2">{item.title}</h3>
                <p className="text-2xl font-bold text-brand-gold mb-3">{item.range}</p>
                <p className="text-sm text-brand-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 bg-white border border-brand-border rounded-sm">
            <p className="text-sm text-brand-text-muted leading-relaxed">
              <strong className="text-brand-navy">合规与咨询类服务</strong>（财税合规体系搭建、内部管理审计、股权架构与常年财税顾问、
              专项财税风控）：这类服务需先了解企业实际经营与账务状况，按项目复杂度、服务范围与工作量评估报价，
              提供<strong className="text-brand-navy">免费初步诊断</strong>后再确定方案与费用。
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-navy text-white text-sm font-medium rounded-sm hover:bg-brand-navy-light transition-colors"
            >
              免费测算我的服务费用 <ArrowRight size={14} />
            </Link>
          </div>

          <p className="mt-6 text-xs text-brand-text-muted leading-relaxed text-center max-w-3xl mx-auto">
            以上区间为市场常见参考范围，不构成最终报价；具体服务内容与费用以双方签订的服务合同约定为准。
          </p>
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
