import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Building2, FileCheck, TrendingUp, Award, Users, CheckCircle2, ArrowRight, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: '西安数度财务咨询_2012年老牌财税咨询_企业财税合规_内部管理审计服务',
  description:
    '西安数度财务咨询有限公司2012年成立，首届西安市代理记账协会副会长单位，拥有高级会计师、国际注册会计师、注册税务师团队，专业提供工商财税托管、企业财税合规、内部管理审计、高端财税风控落地服务。',
  keywords: [
    '西安数度财务咨询',
    '西安财税公司',
    '西安财税咨询',
    '西安企业财税合规',
    '西安内部管理审计',
  ],
  alternates: { canonical: '/' },
};

const businessModules = [
  {
    icon: Building2,
    title: '基础一站式工商财税服务',
    desc: '整合工商全项与记账报税全套服务，为初创企业、小微企业提供标准化一站式财税托管。',
    href: '/services/basic',
    tag: '企业刚需',
  },
  {
    icon: FileCheck,
    title: '高端合规 & 内部管控核心业务',
    desc: '依托资深持证财税专家团队，专注财税合规落地、内部财务管控、全域风险排查与体系搭建。',
    href: '/services/compliance',
    tag: '品牌核心',
  },
  {
    icon: TrendingUp,
    title: '财税咨询与风控服务',
    desc: '专业提供高端财税咨询与风控服务，常年财税顾问、股权架构搭建、税负合规计划，保障企业财税安全。',
    href: '/services/consulting',
    tag: '高端增值',
  },
];

const advantages = [
  {
    icon: Award,
    title: '老牌本土品牌，行业公信力突出',
    desc: '2012年成立，深耕西安十余年，首届西安市代理记账协会副会长单位，实战经验深厚。',
  },
  {
    icon: Users,
    title: '高端持证团队，专业能力硬核',
    desc: '核心团队集结多名高级会计师、国际注册会计师、注册税务师，专业全覆盖。',
  },
  {
    icon: Shield,
    title: '差异化高端定位，告别普通代账',
    desc: '主打财税合规体系搭建、内部审计管控、高端架构筹划等高阶服务。',
  },
  {
    icon: CheckCircle2,
    title: '落地式服务，方案闭环可执行',
    desc: '所有合规方案、内审核查、财税优化均配套一对一辅导、整改跟进、定期巡检。',
  },
];

export default function HomePage() {
  return (
    <>
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            name: '西安数度财务咨询有限公司',
            telephone: '029-84556877',
            email: '309814531@qq.com',
            url: 'https://www.shuducw.com',
            description:
              '西安数度财务咨询有限公司2012年成立，首届西安市代理记账协会副会长单位，专业提供工商财税托管、企业财税合规、内部管理审计、高端财税风控落地服务。',
            foundingDate: '2012',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '唐延路35号旺座现代城D座1006室',
              addressLocality: '西安',
              addressRegion: '陕西',
              postalCode: '710075',
              addressCountry: 'CN',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 34.2263,
              longitude: 108.8877,
            },
            areaServed: {
              '@type': 'City',
              name: '西安',
            },
            openingHoursSpecification: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              opens: '09:00',
              closes: '18:00',
            },
            sameAs: [
              'https://www.xiaohongshu.com/user/profile/6521552259',
            ],
            serviceType: ['财税咨询', '代理记账', '企业财税合规', '内部管理审计', '税务筹划'],
            priceRange: '¥¥',
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: '财税服务',
              itemListElement: [
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '公司注册' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '代理记账' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '企业财税合规' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '内部管理审计' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '高端财税咨询' } },
              ],
            },
          }),
        }}
      />

      {/* Hero 区 */}
      <section className="bg-brand-navy text-white">
        <div className="container-brand section-padding !py-20 md:!py-28 lg:!py-36">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold-light text-sm rounded-sm mb-6">
              2012 年成立 · 协会副会长单位
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              西安数度财务咨询
              <span className="text-brand-gold block mt-2">专业 · 合规 · 落地</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
              深耕西安财税行业十余年，拥有高级会计师、国际注册会计师、注册税务师团队，
              专业提供工商财税托管、企业财税合规、内部管理审计、高端财税风控落地服务。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-white font-medium rounded-sm hover:bg-brand-gold-light transition-colors duration-200"
              >
                了解业务范围 <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-sm hover:bg-white/10 transition-colors duration-200"
              >
                联系我们
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 企业简介 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-6">企业简介</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-8" />
            <p className="text-brand-text-muted leading-relaxed text-base md:text-lg">
              西安数度财务咨询有限公司成立于2012年，深耕西安财税行业十余年，是首届西安市代理记账协会副会长单位。
              公司核心团队由多名高级会计师、国际注册会计师、注册税务师组成，高端持证人才储备充足，
              具备扎实的本土政策经验与落地服务能力。突破传统基础代账服务局限，专注为全行业中小微企业提供
              一站式工商财税托管、账务税务规范、财税合规体系搭建、内部管理审计、高端财税咨询与风控落地服务。
            </p>
          </div>
        </div>
      </section>

      {/* 核心业务体系 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">核心业务体系</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto">
              业务体系分层清晰、定位明确，分为基础工商财税服务、中端增值财税服务、高端合规内控核心业务三大板块，
              精准匹配不同规模、不同发展阶段企业的财税需求。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {businessModules.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="card-brand group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-brand-navy/5 rounded-sm flex items-center justify-center group-hover:bg-brand-gold/10 transition-colors duration-300">
                      <Icon size={20} className="text-brand-navy group-hover:text-brand-gold transition-colors duration-300" />
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-brand-gold/10 text-brand-gold rounded-sm font-medium">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-brand-navy mb-3">{item.title}</h3>
                  <p className="text-sm text-brand-text-muted leading-relaxed mb-4">{item.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm text-brand-navy font-medium group-hover:text-brand-gold transition-colors duration-200">
                    了解详情 <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 核心优势 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">核心优势</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {advantages.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="card-brand flex gap-5">
                  <div className="w-12 h-12 bg-brand-navy/5 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Icon size={22} className="text-brand-navy" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-navy mb-2">{item.title}</h3>
                    <p className="text-sm text-brand-text-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 服务理念 */}
      <section className="bg-brand-navy text-white">
        <div className="container-brand section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">服务理念</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-8" />
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8">
              {['合规为先', '风控为本', '落地为王'].map((item) => (
                <div key={item} className="px-6 py-3 border border-brand-gold/40 rounded-sm">
                  <span className="text-brand-gold font-bold text-lg">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-white/80 leading-relaxed text-base md:text-lg">
              西安数度财务咨询有限公司始终秉持&ldquo;合规为先、风控为本、落地为王&rdquo;的核心服务理念，
              依托十余年行业实战经验与高端专业财税团队，助力企业规避财税风险、规范财务体系、
              优化经营税负、完善内部管控。专注为企业提供安全、专业、靠谱的一站式全周期财税服务，
              助力企业合规经营、稳健长效发展。
            </p>
          </div>
        </div>
      </section>

      {/* 小红书关注 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-14">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-sm p-6 md:p-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 13.2c-.24.64-.96 1.28-1.6 1.44-.32.08-.72.16-1.2.16-.48 0-.88-.08-1.2-.16-.64-.16-1.36-.8-1.6-1.44-.16-.48-.24-.88-.24-1.36 0-.48.08-.88.24-1.36.24-.64.96-1.28 1.6-1.44.32-.08.72-.16 1.2-.16.48 0 .88.08 1.2.16.64.16 1.36.8 1.6 1.44.16.48.24.88.24 1.36 0 .48-.08.88-.24 1.36zM12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-brand-navy">关注小红书，获取更多财税知识</h3>
                <p className="text-sm text-brand-text-muted mt-1">定期分享财税干货、政策解读与实务经验</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-white border border-red-200 rounded-sm shadow-sm">
              <span className="text-sm text-brand-text-muted">小红书号</span>
              <span className="text-lg font-bold text-red-500 tracking-wider">6521552259</span>
            </div>
          </div>
        </div>
      </section>

      {/* 常见问题 FAQ 入口 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-brand-bg border border-brand-border rounded-sm p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-gold/10 rounded-sm flex items-center justify-center flex-shrink-0">
                <HelpCircle size={22} className="text-brand-gold" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-brand-navy mb-1">老板关心的财税问题，这里都有答案</h3>
                <p className="text-sm text-brand-text-muted">
                  代理记账多少钱、公司注册材料、税务异常处理等 20 个高频问题解答
                </p>
              </div>
            </div>
            <Link
              href="/faq"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white font-medium rounded-sm hover:bg-brand-navy-light transition-colors duration-200"
            >
              查看常见问题 FAQ <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-brand-border rounded-sm p-6 md:p-8">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-brand-navy mb-2">需要专业的财税服务？</h3>
              <p className="text-brand-text-muted text-sm md:text-base">十余年深耕本土，高端持证团队为您提供安全、专业、靠谱的全周期财税服务。</p>
            </div>
            <Link
              href="/contact"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white font-medium rounded-sm hover:bg-brand-navy-light transition-colors duration-200"
            >
              立即咨询 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
