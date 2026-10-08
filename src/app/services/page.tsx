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
  title: '财税业务范围-西安数度财务咨询-五类财税服务-税务合规与优化-财务内控管理-股权投融资',
  description:
    '五类企业财税服务：基础财税服务（工商注册、代理记账、汇算清缴）、税务合规与优化、财务内控管理、股权与投融资财税、企业专项定制，覆盖西安及周边企业的日常经营与专项财税需求。',
  keywords: [
    '西安数度财务咨询业务',
    '西安工商财税服务',
    '西安代理记账',
    '西安税务合规与优化',
    '西安财务内控管理',
    '西安企业内部审计',
    '西安股权架构设计',
    '西安投融资财税',
    '西安企业专项财税服务',
  ],
  alternates: { canonical: '/services' },
};

// 核心业务：五类服务体系（2026-10-08 按公司服务清单重整；首页、导航、页脚、llms.txt 与 Schema 同口径）
const businessAreas = [
  {
    icon: Building2,
    num: '01',
    title: '基础财税服务',
    scene: '初创、小微企业与个体户日常经营',
    desc: '整合工商全项与记账报税全套服务，为初创企业、小微企业提供标准化一站式财税托管，覆盖企业开办、日常经营、年度公示等基础财税事项，全程规范办理、资料完整归档。',
    services: [
      '工商全项：公司注册、工商变更、公司注销',
      '记账报税：代理记账、全税种纳税申报、汇算清缴、发票票据管理、税务异常解除',
      '日常经营：工商年报、乱账旧账整理、经营账、社保公积金开户及申报托管',
      '外包托管：企业全盘财务外包、财务部门托管',
    ],
    href: '/services/basic',
  },
  {
    icon: FileCheck,
    num: '02',
    title: '税务合规与优化服务',
    scene: '税负优化、政策适用、涉税应对、常年陪伴',
    desc: '在合法合规前提下梳理企业税务安排、适用园区与行业财税政策、协助处理涉税争议与稽查应对，并以常年顾问方式陪伴企业完成年度财税合规工作。',
    services: [
      '税务优化：企业税务优化、税负风险排查、个人所得税合规规划、全员薪酬个税合规规划',
      '政策适用：园区财税政策落地、跨境财税（BVI / 香港公司架构与做账年审）',
      '涉税应对：涉税争议协助、税务稽查应对支持',
      '常年陪伴：常年财税顾问（年度财税合规陪伴）、财务人员代培、财务团队搭建与辅导、合规风控内训、业财一体化搭建',
    ],
    href: '/services/compliance',
  },
  {
    icon: Shield,
    num: '03',
    title: '财务内控管理服务',
    scene: '内部审计、制度流程、成本费用、经营分析',
    desc: '面向已有财务团队或管理基础的企业，从制度、流程、成本与数据四个方向搭建财务内控，把风险控制嵌入日常经营，并让经营数据真正可用。',
    services: [
      '制度与流程：财务制度搭建、财务流程优化、岗位分离设计',
      '内部核查：企业内部管理审计、往来款项核查、资产与费用专项核查',
      '成本与风控：成本费用管控、企业内部风控、资金安全管理',
      '经营分析：经营财务数据分析、管理报表体系',
    ],
    href: '/services/compliance',
  },
  {
    icon: TrendingUp,
    num: '04',
    title: '股权与投融资财税服务',
    scene: '股权架构、股权转让、增资扩股、融资与尽调',
    desc: '为成长期与集团化企业提供股权安排、融资支持与价值定价的财税方案，围绕重大经营决策出具可落地的处理路径。',
    services: [
      '股权安排：股权架构设计、股权转让涉税规划、股东分红合规安排',
      '融资支持：增资扩股财税咨询、融资财务顾问、投融资尽调',
      '价值与定价：估值测算与融资定价支持',
    ],
    href: '/services/consulting',
  },
  {
    icon: Briefcase,
    num: '05',
    title: '企业专项定制服务',
    scene: '高新、并购重组、行业专属、审计评估协助',
    desc: '面向有特定资质、特定交易或特定行业需求的企业，按事项定制方案并落地执行，涉及需专业资质出具报告的环节，由我们协助对接相应机构。',
    services: [
      '专项合规：公转私合规规划',
      '资质与补贴：高新技术企业财务辅导、专精特新申报、研发费用辅助账搭建、稳岗补贴及各类财税补贴申报、出口退税代办',
      '交易与专项：并购重组、审计评估协助（对接会计师事务所）',
      '行业专属：行业专属财税方案（科技软件、商贸流通、建筑安装、电商直播、集团多主体）',
    ],
    href: '/services#industries',
  },
];

// 原「配套与专项服务」清单已折进上面五类（高新、补贴、外包、跨境、个税等各自归位），不再单列，避免同一服务两种叫法

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
            name: '税务合规与优化服务',
            description: '企业税务优化、税负风险排查、个人所得税合规规划、园区财税政策落地、涉税争议协助与常年财税顾问',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '财务内控管理服务',
            description: '财务制度搭建、成本费用管控、财务流程优化、企业内部风控与经营财务数据分析',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '股权与投融资财税服务',
            description: '股权架构设计、股权转让涉税规划、增资扩股财税咨询、融资财务顾问、估值测算与投融资尽调',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '企业专项定制服务',
            description: '公转私合规规划、高新技术企业财务辅导、并购重组、行业专属财税方案、审计评估协助（对接会计师事务所）',
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
                <div key={area.title} id={`layer-${area.num}`} className="card-brand scroll-mt-24">
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
