import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Building2, FileCheck, TrendingUp, Award, Users, CheckCircle2, ArrowRight, HelpCircle, BadgeCheck, Newspaper, Calculator, ArrowLeftRight, CalendarCheck } from 'lucide-react';
import { listArticles } from '@/lib/store';
import { XiaohongshuIcon } from '@/components/xiaohongshu-icon';
import { districts } from '@/data/districts';
import { InlineConsultForm } from '@/components/inline-consult-form';

// 首页含服务实录动态数据，ISR 定期刷新
export const revalidate = 60;

export const metadata: Metadata = {
  title: '西安数度财务咨询_2012年老牌财税咨询_企业财税合规_内部管理审计服务',
  description:
    '西安数度财务咨询有限公司2012年成立，首届西安市代理记账协会副会长单位，拥有高级会计师、国际注册会计师、税务师团队，专业提供工商财税托管、企业财税合规、内部管理审计、财税风控落地服务。',
  keywords: [
    '西安数度财务咨询',
    '西安财税公司',
    '西安财税咨询',
    '西安企业财税合规',
    '西安内部管理审计',
  ],
  alternates: { canonical: '/' },
};

// 客户问题场景（问题导向首页模块，每条直达对应解决方案页）
const painPoints = [
  { text: '公司刚成立，不知道财税怎么规范', href: '/services/basic' },
  { text: '做了多年账，但历史账务越来越乱', href: '/services/compliance' },
  { text: '股东与公司之间长期存在资金往来', href: '/shareholder-loans' },
  { text: '企业被税务风险预警，不知道从哪里查', href: '/self-check' },
  { text: '企业利润不错，却不清楚税务风险在哪里', href: '/self-check' },
  { text: '企业准备融资，财务数据需要规范', href: '/services/consulting' },
  { text: '财务团队已经建立，但缺乏制度和内部控制', href: '/services/compliance' },
  { text: '企业规模扩大，需要长期财税顾问', href: '/services/consulting' },
];

// 服务体系（客户语言四板块，替代原"基础/中端/高端"内部分层）
const businessModules = [
  {
    icon: Building2,
    title: '基础财税托管',
    flow: '日常经营 → 记账报税 → 工商财税',
    desc: '公司注册、代理记账、纳税申报、汇算清缴、社保公积金、发票票据管理等日常财税托管。',
    href: '/services/basic',
  },
  {
    icon: FileCheck,
    title: '财税规范与合规',
    flow: '发现问题 → 梳理整改 → 税务合规',
    desc: '乱账清理、历史账务梳理、财务规范整改、税务风险排查与合规体系搭建。',
    href: '/services/compliance',
  },
  {
    icon: Shield,
    title: '内部管理与风险控制',
    flow: '规范流程 → 内部审计 → 风险控制',
    desc: '内部管理审计、内控制度、财务流程梳理、资金风险与管理报表体系。',
    href: '/services/compliance',
  },
  {
    icon: TrendingUp,
    title: '财税顾问与专项咨询',
    flow: '企业发展 → 股权/融资 → 专项支持',
    desc: '常年财税顾问、股权架构、投融资财税支持、财务尽调、直播电商个体户专项咨询。',
    href: '/services/consulting',
  },
];

// 专业团队资质（不实名，按持证类别展示，方向与 /about 团队描述一致）
const teamCredentials = [
  {
    icon: Award,
    name: '高级会计师',
    focus: '财务管理 / 内部控制 / 企业财务规范',
  },
  {
    icon: BadgeCheck,
    name: '税务师',
    focus: '税务合规 / 风险排查 / 税务事项处理',
  },
  {
    icon: Users,
    name: '国际注册会计师',
    focus: '企业财务管理 / 财税咨询 / 经营分析',
  },
];

// 财税工具入口
const tools = [
  { icon: Shield, name: '账务风险自查', href: '/self-check', desc: '6 道题多维自测' },
  { icon: Calculator, name: '增值税计算器', href: '/tools/vat', desc: '小规模 / 一般纳税人' },
  { icon: Calculator, name: '个税计算器', href: '/tools/income-tax', desc: '经营所得 / 工资薪金' },
  { icon: ArrowLeftRight, name: '金额大写转换', href: '/tools/rmb-uppercase', desc: '票据规范口径' },
];

export default async function HomePage() {
  // 首页"客户服务实录"区块：仅展示自有服务案例（category=shilu）
  const shiluArticles = await listArticles({ category: 'shilu', publishedOnly: true, limit: 3 });
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
              '西安数度财务咨询有限公司2012年成立，首届西安市代理记账协会副会长单位，企业财税管理与合规服务机构，专业提供工商财税托管、企业财税合规、内部管理审计、财税风控落地服务。',
            foundingDate: '2012',
            founder: {
              '@type': 'Person',
              name: '陈文华',
              jobTitle: '总经理',
              hasCredential: [
                { '@type': 'EducationalOccupationalCredential', name: '高级会计师' },
                { '@type': 'EducationalOccupationalCredential', name: '高级财税合规师' },
                { '@type': 'EducationalOccupationalCredential', name: '国际注册会计师' },
              ],
            },
            hasCredential: {
              '@type': 'EducationalOccupationalCredential',
              name: '代理记账许可证书',
              credentialCategory: '代理记账',
            },
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
            priceRange: '小规模纳税人代理记账 2000-4000 元/年，一般纳税人略高（具体以企业实际情况核算）',
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: '财税服务',
              itemListElement: [
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '公司注册' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '代理记账' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '企业财税合规' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '内部管理审计' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '财税咨询' } },
              ],
            },
          }),
        }}
      />

      {/* 01 首屏：品牌定位 */}
      <section className="bg-brand-navy text-white">
        <div className="container-brand section-padding !py-20 md:!py-28 lg:!py-32">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold-light text-sm rounded-sm mb-6">
              西安数度财务咨询 · 2012 年成立 · 协会副会长单位
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-5">
              企业财税问题，
              <span className="text-brand-gold">不只是记账报税</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
              专注企业财税管理、财税合规、税务风险与内部管控。从基础财税托管，
              到财税规范、内部审计与长期财税顾问，为企业提供贯穿不同发展阶段的专业财税服务。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-white font-medium rounded-sm hover:bg-brand-gold-light transition-colors duration-200"
              >
                免费咨询 <ArrowRight size={16} />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-sm hover:bg-white/10 transition-colors duration-200"
              >
                查看服务
              </Link>
              <Link
                href="/self-check"
                className="inline-flex items-center gap-2 px-6 py-3 border border-brand-gold/50 text-brand-gold-light rounded-sm hover:bg-brand-gold/10 transition-colors duration-200"
              >
                账务风险自查
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 信任背书（资质来自国家公共信用信息报告 2026-09 核验） */}
      <section className="bg-white border-b border-brand-border">
        <div className="container-brand section-padding !py-8 md:!py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-brand-bg rounded-sm">
              <Award size={28} className="text-brand-gold flex-shrink-0" />
              <div>
                <p className="font-bold text-brand-navy leading-snug">2025 年度纳税信用 A 级</p>
                <p className="text-xs text-brand-text-muted mt-1">信用中国查询核验</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-brand-bg rounded-sm">
              <Shield size={28} className="text-brand-gold flex-shrink-0" />
              <div>
                <p className="font-bold text-brand-navy leading-snug">守信激励对象 · 存续</p>
                <p className="text-xs text-brand-text-muted mt-1">无严重失信 / 经营异常记录</p>
              </div>
            </div>
            <Link href="/about" className="flex items-center gap-3 p-4 bg-brand-bg rounded-sm group hover:bg-brand-bg/80 transition-colors">
              <FileCheck size={28} className="text-brand-gold flex-shrink-0" />
              <div>
                <p className="font-bold text-brand-navy leading-snug">代理记账许可证书</p>
                <p className="text-xs text-brand-text-muted mt-1 group-hover:text-brand-gold transition-colors">DLJZ61010120170035 · 西安市财政局核发 · 查看证照 →</p>
              </div>
            </Link>
            <div className="flex items-center gap-3 p-4 bg-brand-bg rounded-sm">
              <Building2 size={28} className="text-brand-gold flex-shrink-0" />
              <div>
                <p className="font-bold text-brand-navy leading-snug">首届西安市代理记账协会副会长单位</p>
                <p className="text-xs text-brand-text-muted mt-1">2012 年成立，深耕西安十余年</p>
              </div>
            </div>
          </div>
          {/* 媒体报道：高校特邀讲座（来源：西安财经大学商学院官网） */}
          <div className="mt-4 flex items-center gap-3 p-4 bg-brand-bg rounded-sm">
            <Newspaper size={28} className="text-brand-gold flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-brand-navy leading-snug">媒体报道 · 高校特邀讲座</p>
              <a
                href="https://sxy.xaufe.edu.cn/info/1061/10377.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-gold hover:underline mt-1 inline-block"
              >
                2026 年 4 月受邀于西安财经大学商学院开展「财税计划与职业发展」专题讲座（来源：西安财经大学商学院官网）
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 02 客户问题：先讲客户的问题，再讲我们是谁 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">
              企业经营过程中，你可能正在面对这些问题
            </h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-5" />
            <p className="text-brand-text-muted max-w-2xl mx-auto text-sm md:text-base">
              带着具体问题来，比带着问题找公司更快——点击你正面对的情况，直接看对应的解决思路
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {painPoints.map((p) => (
              <Link
                key={p.text}
                href={p.href}
                className="group p-5 bg-white border border-brand-border rounded-sm hover:border-brand-navy transition-colors"
              >
                <p className="text-sm text-brand-navy font-medium leading-relaxed mb-3 min-h-[2.75rem]">{p.text}</p>
                <span className="inline-flex items-center gap-1 text-xs text-brand-gold group-hover:text-brand-navy transition-colors">
                  查看对应方案 <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 03 服务体系（客户语言四板块） */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">从日常记账，到企业财税管理</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto">
              四大服务板块覆盖企业不同发展阶段的财税需求，每个板块都有明确的服务清单与交付标准。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {businessModules.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className="card-brand group flex flex-col">
                  <div className="w-10 h-10 bg-brand-navy/5 rounded-sm flex items-center justify-center mb-4 group-hover:bg-brand-gold/10 transition-colors duration-300">
                    <Icon size={20} className="text-brand-navy group-hover:text-brand-gold transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-navy mb-2">{item.title}</h3>
                  <p className="text-xs text-brand-gold font-medium mb-3">{item.flow}</p>
                  <p className="text-sm text-brand-text-muted leading-relaxed mb-4 flex-1">{item.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm text-brand-navy font-medium group-hover:text-brand-gold transition-colors duration-200">
                    了解详情 <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 04 负责人实名 + 专业团队 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">负责人与专业团队</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-5" />
            <p className="text-brand-text-muted max-w-2xl mx-auto text-sm md:text-base">
              负责人实名公开、资质可查；团队由多类持证专业人员组成
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* 负责人（实名，资质经 /about 页与高校官网来源核验） */}
            <div className="lg:col-span-2 p-6 md:p-8 bg-white border border-brand-border rounded-sm">
              <div className="flex items-center gap-4 mb-5">
                <img
                  src="/leader-chenwenhua.jpg"
                  alt="西安数度财务咨询总经理陈文华"
                  className="w-14 h-14 rounded-sm object-cover border border-brand-border flex-shrink-0"
                />
                <div>
                  <h3 className="text-xl font-bold text-brand-navy">陈文华</h3>
                  <p className="text-sm text-brand-text-muted">总经理 · 财务一线出身</p>
                </div>
              </div>
              <p className="text-xs text-brand-text-muted mb-2">专业资质</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {['高级会计师', '高级财税合规师', '国际注册会计师'].map((c) => (
                  <span key={c} className="px-2.5 py-1 text-xs bg-brand-gold/10 text-brand-gold rounded-sm font-medium">
                    {c}
                  </span>
                ))}
              </div>
              <p className="text-xs text-brand-text-muted mb-2">荣誉与社会任职</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {['中税网金牌讲师', '西安财经大学校外硕士生导师', '西安外事学院商学院校外实习实训指导教师'].map((c) => (
                  <span key={c} className="px-2.5 py-1 text-xs bg-brand-navy/5 text-brand-navy rounded-sm font-medium">
                    {c}
                  </span>
                ))}
              </div>
              <ul className="text-sm text-brand-text-muted leading-relaxed space-y-2.5">
                <li className="flex gap-2">
                  <CheckCircle2 size={15} className="text-brand-gold flex-shrink-0 mt-0.5" />
                  二十余年财税咨询与企业服务实战经验，2012 年创立西安数度财务咨询有限公司
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={15} className="text-brand-gold flex-shrink-0 mt-0.5" />
                  专业方向：企业财税管理、税务合规、内部控制与财税咨询
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={15} className="text-brand-gold flex-shrink-0 mt-0.5" />
                  <span>
                    受聘西安财经大学校外硕士生导师，2026 年 4 月受邀担任商学院「财税计划与职业发展」专题讲座主讲嘉宾（
                    <a
                      href="https://sxy.xaufe.edu.cn/info/1061/10377.htm"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-gold hover:underline"
                    >
                      高校官网报道
                    </a>
                    ）
                  </span>
                </li>
              </ul>
              <Link
                href="/about"
                className="mt-5 inline-flex items-center gap-1.5 text-sm text-brand-navy font-medium hover:text-brand-gold transition-colors"
              >
                查看公司详细介绍 <ArrowRight size={14} />
              </Link>
              <div className="mt-5">
                <img
                  src="/lecture-xaufe-2026.jpg"
                  alt="陈文华受邀西安财经大学商学院开展财税专题讲座现场"
                  className="w-full h-36 object-cover rounded-sm border border-brand-border"
                  loading="lazy"
                />
                <p className="text-xs text-brand-text-muted mt-2">2026 年 4 月 · 西安财经大学商学院专题讲座现场</p>
              </div>
            </div>

            {/* 专业团队（不实名，按持证类别展示） */}
            <div className="lg:col-span-3">
              <p className="text-xs text-brand-text-muted mb-3 tracking-wide">专业团队持证类别（团队资质）</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {teamCredentials.map((t) => {
                  const Icon = t.icon;
                  return (
                    <div key={t.name} className="p-6 bg-white border border-brand-border rounded-sm flex flex-col">
                      <div className="w-10 h-10 bg-brand-navy/5 rounded-sm flex items-center justify-center mb-4">
                        <Icon size={20} className="text-brand-navy" />
                      </div>
                      <h3 className="text-base font-bold text-brand-navy mb-2">{t.name}</h3>
                      <p className="text-xs text-brand-text-muted leading-relaxed flex-1">{t.focus}</p>
                    </div>
                  );
                })}
                <div className="sm:col-span-3 p-5 bg-white border border-brand-border rounded-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-navy/5 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Users size={20} className="text-brand-navy" />
                  </div>
                  <p className="text-sm text-brand-text-muted leading-relaxed">
                    财税专业服务团队：记账报税、工商财税、日常财税服务，与持证专业人员协同完成企业全周期财税服务。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05 客户案例：我们实际解决过哪些企业财税问题 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-3">我们实际解决过哪些企业财税问题</h2>
              <div className="w-16 h-[2px] bg-brand-gold mb-4" />
              <p className="text-brand-text-muted max-w-xl text-sm md:text-base">
                真实客户服务实录（已脱敏）——从基础代理记账到财税顾问与合规体系搭建，
                见证企业不同发展阶段的财税需求。
              </p>
            </div>
            <Link
              href="/cases"
              className="flex-shrink-0 inline-flex items-center gap-2 text-sm text-brand-navy font-medium hover:text-brand-gold transition-colors"
            >
              查看全部服务实录 <ArrowRight size={15} />
            </Link>
          </div>

          {shiluArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shiluArticles.map((article) => (
                <Link key={article.id} href={`/news/${article.slug}`} className="card-brand group flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium text-white rounded bg-[#0E7C66]">
                      <BadgeCheck size={12} /> 服务实录
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-brand-text mb-2.5 line-clamp-2 group-hover:text-brand-navy transition-colors leading-relaxed">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="text-sm text-brand-text-muted line-clamp-3 leading-relaxed flex-1">{article.summary}</p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm text-brand-navy font-medium group-hover:text-brand-gold transition-colors">
                    查看完整案例 <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* 06 服务交付（差异化内容前置） */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-14">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white border border-brand-border rounded-sm p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-gold/10 rounded-sm flex items-center justify-center flex-shrink-0">
                <CalendarCheck size={22} className="text-brand-gold" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-brand-navy mb-1.5">数度服务怎么交付？</h3>
                <p className="text-sm text-brand-text-muted leading-relaxed max-w-2xl">
                  每月账务处理与纳税申报按期完成、凭证报表按期交付，7 个交付节点全程可见，
                  双方责任边界写进合同——服务过程公开透明。
                </p>
              </div>
            </div>
            <Link
              href="/services/delivery"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white font-medium rounded-sm hover:bg-brand-navy-light transition-colors duration-200"
            >
              查看服务交付标准 <ArrowRight size={16} />
            </Link>
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
              依托十余年行业实战经验与专业财税团队，助力企业规避财税风险、规范财务体系、
              完善内部管控。专注为企业提供安全、专业、靠谱的一站式全周期财税服务，
              助力企业合规经营、稳健长效发展。
            </p>
          </div>
        </div>
      </section>

      {/* 07 小红书承接（主力获客渠道） */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-14">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-sm p-6 md:p-8">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <XiaohongshuIcon size={36} />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-brand-navy">数度财税 · 小红书</h3>
                <p className="text-sm text-brand-text-muted mt-1">老板真正关心的财税问题，用简单的话讲清楚</p>
              </div>
            </div>
            <a
              href="https://www.xiaohongshu.com/user/profile/6521552259"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3 bg-white border border-red-200 rounded-sm shadow-sm hover:border-red-400 transition-colors"
            >
              <span className="text-sm text-brand-text-muted">小红书号</span>
              <span className="text-lg font-bold text-red-500 tracking-wider">6521552259</span>
            </a>
            <div className="flex-shrink-0 text-center">
              <img
                src="/qr-xiaohongshu.jpg"
                alt="西安数度财务咨询小红书主页二维码"
                className="w-28 h-36 rounded-sm border border-red-200 bg-white p-1 object-contain"
                loading="lazy"
              />
              <p className="text-xs text-brand-text-muted mt-1.5">扫码关注小红书</p>
            </div>
          </div>
        </div>
      </section>

      {/* 08 财税工具 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-14">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-3">财税工具</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-4" />
            <p className="text-sm text-brand-text-muted max-w-2xl mx-auto">免费财税工具，先自己算一算、查一查，再决定是否需要专业帮助</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((t) => {
              const Icon = t.icon;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className="group p-5 bg-white border border-brand-border rounded-sm hover:border-brand-navy transition-colors text-center"
                >
                  <div className="w-10 h-10 bg-brand-navy/5 rounded-sm flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-gold/10 transition-colors">
                    <Icon size={18} className="text-brand-navy group-hover:text-brand-gold transition-colors" />
                  </div>
                  <p className="text-sm font-bold text-brand-navy">{t.name}</p>
                  <p className="text-xs text-brand-text-muted mt-1">{t.desc}</p>
                </Link>
              );
            })}
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
                  代理记账多少钱、公司注册材料、税务异常处理等 28 个高频问题解答
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

      {/* 服务区域（西安全域本地化入口，含各区县页内链） */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-14">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-3">服务区域</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-4" />
            <p className="text-sm text-brand-text-muted max-w-2xl mx-auto">
              公司总部位于高新区，服务覆盖西安全域——按区县提供本地化的注册、记账、报税与财税合规服务
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {districts.map((d) => (
              <Link
                key={d.slug}
                href={`/services/district/${d.slug}`}
                className="px-4 py-2 bg-white border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
              >
                {d.name}
                {d.keyword}
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm text-brand-gold hover:text-brand-navy transition-colors"
            >
              查看区域专项服务详情 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 09 最终咨询：免费财税问题诊断 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-14">
          <div className="max-w-3xl mx-auto border border-brand-border rounded-sm bg-brand-bg">
            <InlineConsultForm />
          </div>
        </div>
      </section>
    </>
  );
}
