import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, FileText, ShieldCheck, Users, ArrowRight, ClipboardList, FileSearch, Handshake, RefreshCcw, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: '基础财税服务_西安数度财务咨询_公司注册注销_代理记账报税_工商托管',
  description:
    '西安正规基础财税服务商，专业办理公司注册、变更注销、股权转让、工商年报、代理记账报税、税控托管、汇算清缴、社保公积金托管，标准化合规服务。',
  keywords: [
    '西安数度财务咨询',
    '西安公司注册',
    '西安代理记账',
    '西安报税托管',
    '西安工商注销',
  ],
  alternates: { canonical: '/services/basic' },
};

const businessServices = [
  {
    icon: Building2,
    title: '工商全项服务',
    items: [
      '公司注册',
      '企业变更',
      '公司注销',
      '股权转让',
      '经营范围调整',
      '注册地址变更',
      '营业执照补办',
      '工商年报公示',
    ],
  },
  {
    icon: FileText,
    title: '记账报税全项服务',
    items: [
      '代理记账',
      '账务整理',
      '凭证账簿装订',
      '税控托管',
      '发票管理',
      '全税种月度季度申报',
      '零申报办理',
      '企业年度汇算清缴',
      '银行对账对接',
    ],
  },
  {
    icon: ShieldCheck,
    title: '基础配套服务',
    items: [
      '社保公积金开户与托管',
      '日常基础财税答疑',
      '企业简易票据管理',
    ],
  },
];

const optimizationServices = [
  {
    icon: FileText,
    title: '账务优化服务',
    items: [
      '乱账清理',
      '旧账梳理',
      '账务规范整改',
      '日常账务纠错调整',
    ],
  },
  {
    icon: ShieldCheck,
    title: '税务风控服务',
    items: [
      '企业税负测算',
      '日常税务合规优化',
      '税务异常解除',
      '欠税清理',
      '税务稽查协助',
      '跨区域涉税事项办理',
    ],
  },
  {
    icon: Users,
    title: '企业配套服务',
    items: [
      '稳岗补贴及各类财税专项补贴申报',
      '简易财务制度搭建',
      '企业日常财务辅导',
    ],
  },
];

export default function BasicServicePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '基础财税服务',
    provider: {
      '@type': 'Organization',
      name: '西安数度财务咨询有限公司',
      url: 'https://www.shuducw.com',
    },
    description:
      '西安正规基础财税服务商，专业办理公司注册、变更注销、股权转让、工商年报、代理记账报税、税控托管、汇算清缴、社保公积金托管，标准化合规服务。',
    areaServed: {
      '@type': 'City',
      name: '西安',
    },
    serviceType: ['公司注册', '代理记账', '报税托管', '工商注销', '汇算清缴'],
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
              企业刚需引流业务
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">基础财税服务</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              西安数度财务咨询有限公司是正规基础财税服务商，专业办理公司注册、变更注销、股权转让、
              工商年报、代理记账报税、税控托管、汇算清缴、社保公积金托管等一站式财税托管，
              标准化操作，合规省心。
            </p>
          </div>
        </div>
      </section>

      {/* 基础一站式工商财税服务 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">基础一站式工商财税服务</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto">
              整合工商全项服务与记账报税全套服务，为初创企业、小微企业提供标准化一站式财税托管，
              全程规范办理，解决企业开办、日常经营、年度公示等基础财税问题。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {businessServices.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.title} className="card-brand">
                  <div className="w-10 h-10 bg-brand-navy/5 rounded-sm flex items-center justify-center mb-4">
                    <Icon size={20} className="text-brand-navy" />
                  </div>
                  <h3 className="font-bold text-brand-navy text-lg mb-4">{group.title}</h3>
                  <ul className="space-y-2.5">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-brand-text">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 中端增值财税服务 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">中端增值财税服务</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto">
              针对企业经营中常见的账务混乱、税务异常、税负失衡、财务流程不规范等问题，
              提供专项整改与优化服务，修复历史财税遗留问题，规范日常财税流程，降低企业常规经营涉税风险。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {optimizationServices.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.title} className="card-brand">
                  <div className="w-10 h-10 bg-brand-navy/5 rounded-sm flex items-center justify-center mb-4">
                    <Icon size={20} className="text-brand-navy" />
                  </div>
                  <h3 className="font-bold text-brand-navy text-lg mb-4">{group.title}</h3>
                  <ul className="space-y-2.5">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-brand-text">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
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
              标准化流程，签约后快速响应，全程透明可追踪
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ClipboardList, step: '01', title: '需求沟通', desc: '了解企业类型、业务规模与财税现状，提供免费报价' },
              { icon: FileSearch, step: '02', title: '签约建档', desc: '签订委托协议，收集证照资料，建立专属账务档案' },
              { icon: Handshake, step: '03', title: '记账申报', desc: '按月记账、按期申报，税务问题及时预警与处理' },
              { icon: RefreshCcw, step: '04', title: '年度服务', desc: '汇算清缴、工商年报、年度财税复盘与合规建议' },
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

      {/* CTA */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-brand-bg border border-brand-border rounded-sm p-6 md:p-8">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-brand-navy mb-2">需要基础财税服务？</h3>
              <p className="text-brand-text-muted text-sm md:text-base">标准化合规操作，让您专注于业务发展，财税事务交给我们。</p>
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
                在线免费咨询 <ArrowRight size={16} />
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
