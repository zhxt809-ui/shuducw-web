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

  const faqList = [
    {
      q: '西安注册公司，注册资本填多少合适？',
      a: '按公司三到五年经营所需资金量填，够用即可，不必攀比。贸易、服务、咨询类公司 10 万到 100 万常见；有行业门槛的（如劳务派遣不低于 200 万）按门槛来。2024 年 7 月 1 日新《公司法》施行后，有限公司认缴出资须自成立之日起五年内缴足。',
    },
    {
      q: '西安注册个体户对地址有什么要求？',
      a: '个体户注册需要提供合法经营场所，可使用自有房产、租赁房屋（需提供租赁合同及产权证明）或符合当地政策的托管地址。不同区县对住宅改商用、集群注册的规定有差异，具体以当地市场监督管理部门要求为准。',
    },
    {
      q: '西安小规模纳税人代理记账收费一般包含哪些服务？',
      a: '市场常见收费区间在 2000-4000 元/年（视开票量与业务复杂度而定），一般包含：月度记账、增值税及附加税申报、企业所得税季度预缴、个税代扣代缴、年度汇算清缴、工商年报及日常财税咨询。签约前建议确认服务清单与责任划分。',
    },
    {
      q: '公司没有业务也要报税吗？',
      a: '需要。公司在领取营业执照后应当按期进行纳税申报，没有收入、没有应纳税额的可以办理零申报，但不能不申报。长期不申报会导致税务异常，影响纳税信用，进而影响发票领用、银行授信和招投标。',
    },
    {
      q: '报税逾期会产生什么后果？',
      a: '未按期申报或缴纳税款的，税务机关会责令限期改正，并可从滞纳税款之日起按日加收万分之五滞纳金；情节严重的可能面临罚款。逾期记录还会影响纳税信用评级。发现逾期应尽快补报并联系主管税务机关处理。',
    },
  ];

  const relatedArticles = [
    { href: '/news/zhuce-zijin-renjiao-2026', title: '公司注册资金填多少合适？认缴制下的几个坑' },
    { href: '/news/xian-kaigongsi-leixing-duibi-2026', title: '西安开公司选哪种类型？个体户、有限公司对比' },
    { href: '/news/gongsi-liangtaozhang-fengxian', title: '公司有两套账？这个风险比你想象的大' },
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
          <p className="mt-10 max-w-3xl mx-auto text-xs text-brand-text-muted leading-relaxed text-center">
            免责声明：本网站内容仅作为财税知识科普参考，不构成个性化税务方案；具体业务以双方签订的服务合同为准。
          </p>
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
              <Link
                href="/self-check"
                className="inline-flex items-center gap-2 px-6 py-3 border border-brand-gold text-brand-gold rounded-sm hover:bg-brand-gold/5 transition-colors duration-200 text-sm"
              >
                账务风险自查
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
