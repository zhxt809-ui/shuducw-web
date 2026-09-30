import type { Metadata } from 'next';
import Link from 'next/link';
import { Award, Users, Building2, Shield, CheckCircle2, ArrowRight, Target, Eye, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: '关于我们_西安数度财务咨询_资深财税机构_协会副会长单位_高端财税专家团队',
  description:
    '西安数度财务咨询有限公司2012年成立，西安市代理记账协会首届副会长单位，深耕西安财税十余年，配备多名高级会计师、国际注册会计师、注册税务师，专注企业财税合规与内部财务管控落地服务。',
  keywords: [
    '西安数度财务咨询简介',
    '西安资深财税机构',
    '西安代理记账协会副会长单位',
    '高端财税专家团队',
  ],
  alternates: { canonical: '/about' },
};

const advantages = [
  {
    icon: Award,
    title: '负责人财务出身，深耕行业十余年',
    desc: '负责人出身财务一线，从业至今始终专注财税咨询行业，2012 年创立西安数度财务咨询，深耕西安财税市场十余年，专业积淀与行业经验深厚。',
  },
  {
    icon: Users,
    title: '高端持证团队，专业能力硬核',
    desc: '核心团队集结多名高级会计师、国际注册会计师、注册税务师，人才梯队专业度高，可全覆盖基础财税、合规搭建、内部审计、高端筹划、风险管控全维度业务。',
  },
  {
    icon: Building2,
    title: '差异化高端定位，告别普通代账',
    desc: '不局限于基础记账报税，主打财税合规体系搭建、内部审计管控、企业财税风控、高端架构筹划等高阶服务，精准匹配中高端企业合规经营需求。',
  },
  {
    icon: Target,
    title: '全行业适配，定制化解决痛点',
    desc: '服务覆盖初创、成长型、中小型企业，适配商贸、建筑、电商、劳务、高新、跨境等全行业场景，可针对性解决各行业专属财税难题。',
  },
  {
    icon: CheckCircle2,
    title: '落地式服务，方案闭环可执行',
    desc: '摒弃纯理论咨询，所有合规方案、内审核查、财税优化、架构筹划均配套一对一辅导、整改跟进、定期巡检，确保方案落地见效。',
  },
  {
    icon: Shield,
    title: '合规稳健经营，服务安全可靠',
    desc: '坚守合规经营底线，专注企业内部财税管理、合规整改、风险管控等正规落地业务，全程合法合规，服务稳定有保障。',
  },
];

const serviceIndustries = [
  '商贸', '建筑', '电商', '劳务', '高新科技', '跨境',
];

export default function AboutPage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: '西安数度财务咨询有限公司',
            description: '西安数度财务咨询有限公司2012年成立，西安市代理记账协会首届副会长单位，深耕西安财税十余年。',
            foundingDate: '2012',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '唐延路35号旺座现代城D座1006室',
              addressLocality: '西安',
              addressRegion: '陕西',
              addressCountry: 'CN',
            },
          }),
        }}
      />

      {/* 页面头图 */}
      <section className="bg-brand-navy text-white">
        <div className="container-brand section-padding !py-16 md:!py-20">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">关于我们</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              西安数度财务咨询有限公司2012年成立，系西安市代理记账协会首届副会长单位，
              配备多名高端持证财税专家，十余年深耕西安本土财税市场，专注企业财税合规、
              内部财务管控与高端财税定制落地服务，行业公信力扎实。
            </p>
          </div>
        </div>
      </section>

      {/* 公司简介详情 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-brand-navy mb-6">公司简介</h2>
              <div className="w-12 h-[2px] bg-brand-gold mb-6" />
              <div className="space-y-4 text-brand-text leading-relaxed">
                <p>
                  西安数度财务咨询有限公司成立于2012年，深耕西安财税行业十余年，是首届西安市代理记账协会副会长单位。
                  公司核心团队由多名高级会计师、国际注册会计师、注册税务师组成，高端持证人才储备充足，
                  具备扎实的本土政策经验与落地服务能力。
                </p>
                <p>
                  西安数度财务咨询有限公司突破传统基础代账服务局限，专注为全行业中小微企业提供一站式工商财税托管、
                  账务税务规范、财税合规体系搭建、内部管理审计、高端财税咨询与风控落地服务。依托十余年一线实战经验，
                  聚焦企业财税风险防控、内部财务管控优化、业务涉税合规整改，为企业提供合规、安全、可落地的全生命周期财税解决方案。
                </p>
                <p>
                  公司总经理陈文华（高级会计师、高级财税合规师、国际注册会计师）于 2026 年 4 月受邀担任西安财经大学商学院
                  「财税计划与职业发展」专题讲座主讲嘉宾，面向 MAud / MPAcc 专业研究生分享财税行业合规实践、业财税一体化
                  实操要点与职业发展规划。
                  <a
                    href="https://sxy.xaufe.edu.cn/info/1061/10377.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-gold hover:underline ml-1"
                  >
                    媒体报道原文
                  </a>
                </p>
              </div>
            </div>
            <div>
              <div className="bg-brand-bg p-6 rounded-sm border border-brand-border">
                <h3 className="font-bold text-brand-navy mb-4">核心资质</h3>
                <ul className="space-y-3">
                  {[
                    '首届西安市代理记账协会副会长单位',
                    '高级会计师团队',
                    '国际注册会计师团队',
                    '注册税务师团队',
                    '2012 年成立，十余年深耕',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-brand-text">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-brand-bg p-6 rounded-sm border border-brand-border mt-6">
                <h3 className="font-bold text-brand-navy mb-4">服务行业覆盖</h3>
                <div className="flex flex-wrap gap-2">
                  {serviceIndustries.map((item) => (
                    <span key={item} className="px-3 py-1.5 bg-white border border-brand-border text-sm text-brand-text rounded-sm">
                      {item}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-brand-text-muted mt-3">适配初创、成长型、中小型企业全周期需求</p>
              </div>
              <div className="bg-brand-bg p-6 rounded-sm border border-brand-border mt-6">
                <h3 className="font-bold text-brand-navy mb-4">资质证照</h3>
                <div className="grid grid-cols-2 gap-3">
                  <a href="/license-yingye.jpg" target="_blank" rel="noopener noreferrer" className="block group">
                    <img
                      src="/license-yingye.jpg"
                      alt="西安数度财务咨询有限公司营业执照"
                      className="w-full border border-brand-border rounded-sm bg-white p-1.5 group-hover:opacity-90 transition-opacity"
                      loading="lazy"
                    />
                    <p className="text-xs text-brand-text-muted mt-2 text-center group-hover:text-brand-gold transition-colors">营业执照</p>
                  </a>
                  <a href="/license-daiji.jpg" target="_blank" rel="noopener noreferrer" className="block group">
                    <img
                      src="/license-daiji.jpg"
                      alt="西安数度财务咨询有限公司代理记账许可证书"
                      className="w-full border border-brand-border rounded-sm bg-white p-1.5 group-hover:opacity-90 transition-opacity"
                      loading="lazy"
                    />
                    <p className="text-xs text-brand-text-muted mt-2 text-center group-hover:text-brand-gold transition-colors">代理记账许可证</p>
                  </a>
                </div>
                <p className="text-xs text-brand-text-muted mt-3">点击可查看大图 · 营业执照与代理记账许可证书均为实拍</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 企业负责人（实名板块：照片 + 资质 + 公开活动） */}
      <section className="bg-white border-t border-brand-border">
        <div className="container-brand section-padding">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">企业负责人</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-5" />
            <p className="text-brand-text-muted max-w-2xl mx-auto text-sm md:text-base">负责人实名公开，资质与公开活动可查可验</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
              <div className="md:col-span-1">
                <img
                  src="/leader-chenwenhua.jpg"
                  alt="西安数度财务咨询总经理陈文华"
                  className="w-full max-w-[240px] mx-auto rounded-sm border border-brand-border bg-white p-1.5"
                  loading="lazy"
                />
                <p className="text-xs text-brand-text-muted mt-2 text-center">总经理 · 陈文华</p>
              </div>
              <div className="md:col-span-2 space-y-4 text-brand-text leading-relaxed">
                <div className="flex flex-wrap gap-2">
                  {['高级会计师', '高级财税合规师', '国际注册会计师'].map((c) => (
                    <span key={c} className="px-2.5 py-1 text-xs bg-brand-gold/10 text-brand-gold rounded-sm font-medium">
                      {c}
                    </span>
                  ))}
                </div>
                <p>
                  陈文华，西安数度财务咨询有限公司总经理，财务一线出身，从业至今始终专注财税咨询行业，
                  二十余年财税咨询与企业服务实战经验，2012 年创立西安数度财务咨询。
                  专业方向：企业财税管理、税务合规、内部控制与财税咨询。
                </p>
                <p className="text-sm text-brand-text-muted">
                  2026 年 4 月受邀担任西安财经大学商学院「财税计划与职业发展」专题讲座主讲嘉宾，
                  面向 MAud / MPAcc 专业研究生分享财税行业合规实践、业财税一体化实操要点与职业发展规划。
                  <a
                    href="https://sxy.xaufe.edu.cn/info/1061/10377.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-gold hover:underline ml-1"
                  >
                    媒体报道原文
                  </a>
                </p>
              </div>
            </div>

            {/* 公开活动照片 */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-brand-navy mb-4">公开活动</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="/lecture-xaufe-2026.jpg" target="_blank" rel="noopener noreferrer" className="block group">
                  <img
                    src="/lecture-xaufe-2026.jpg"
                    alt="陈文华受邀西安财经大学商学院开展财税专题讲座现场"
                    className="w-full h-56 object-cover rounded-sm border border-brand-border group-hover:opacity-90 transition-opacity"
                    loading="lazy"
                  />
                  <p className="text-xs text-brand-text-muted mt-2">2026 年 4 月 · 西安财经大学商学院「财税计划与职业发展」专题讲座现场</p>
                </a>
                <a href="/activity-waishi.jpg" target="_blank" rel="noopener noreferrer" className="block group">
                  <img
                    src="/activity-waishi.jpg"
                    alt="陈文华高校公开活动"
                    className="w-full h-56 object-cover rounded-sm border border-brand-border group-hover:opacity-90 transition-opacity"
                    loading="lazy"
                  />
                  <p className="text-xs text-brand-text-muted mt-2">负责人高校公开活动</p>
                </a>
              </div>
              <p className="text-xs text-brand-text-muted mt-3">点击可查看大图</p>
            </div>

            {/* 负责人资质证书 */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-brand-navy mb-4">负责人资质证书</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <a href="/cert-acc-international.jpg" target="_blank" rel="noopener noreferrer" className="block group">
                  <img
                    src="/cert-acc-international.jpg"
                    alt="陈文华国际注册会计师证书"
                    className="w-full h-52 object-cover object-top rounded-sm border border-brand-border bg-white p-1.5 group-hover:opacity-90 transition-opacity"
                    loading="lazy"
                  />
                  <p className="text-xs text-brand-text-muted mt-2 text-center">国际注册会计师</p>
                </a>
                <a href="/cert-xaufe.jpg" target="_blank" rel="noopener noreferrer" className="block group">
                  <img
                    src="/cert-xaufe.jpg"
                    alt="陈文华西安财经大学相关证书"
                    className="w-full h-52 object-cover object-top rounded-sm border border-brand-border bg-white p-1.5 group-hover:opacity-90 transition-opacity"
                    loading="lazy"
                  />
                  <p className="text-xs text-brand-text-muted mt-2 text-center">西安财经大学</p>
                </a>
                <a href="/cert-waishi.jpg" target="_blank" rel="noopener noreferrer" className="block group">
                  <img
                    src="/cert-waishi.jpg"
                    alt="陈文华西安外事学院相关证书"
                    className="w-full h-52 object-cover object-top rounded-sm border border-brand-border bg-white p-1.5 group-hover:opacity-90 transition-opacity"
                    loading="lazy"
                  />
                  <p className="text-xs text-brand-text-muted mt-2 text-center">西安外事学院</p>
                </a>
              </div>
              <p className="text-xs text-brand-text-muted mt-3">点击可查看大图 · 证书均为实拍</p>
            </div>
          </div>
        </div>
      </section>

      {/* 核心优势 */}
      <section id="advantages" className="bg-brand-bg">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">核心优势</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="card-brand">
                  <div className="w-10 h-10 bg-brand-navy/5 rounded-sm flex items-center justify-center mb-4">
                    <Icon size={20} className="text-brand-navy" />
                  </div>
                  <h3 className="font-bold text-brand-navy mb-2">{item.title}</h3>
                  <p className="text-sm text-brand-text-muted leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 服务理念 */}
      <section id="philosophy" className="bg-white">
        <div className="container-brand section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-6">服务理念</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-8" />
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8">
              {[
                { icon: Eye, text: '合规为先' },
                { icon: Shield, text: '风控为本' },
                { icon: Heart, text: '落地为王' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-center gap-2 px-6 py-3 border border-brand-gold/40 rounded-sm bg-brand-gold/5">
                    <Icon size={18} className="text-brand-gold" />
                    <span className="text-brand-gold font-bold text-lg">{item.text}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-brand-text-muted leading-relaxed text-base md:text-lg">
              西安数度财务咨询有限公司始终秉持&ldquo;合规为先、风控为本、落地为王&rdquo;的核心服务理念，
              依托十余年行业实战经验与高端专业财税团队，助力企业规避财税风险、规范财务体系、
              优化经营税负、完善内部管控。专注为企业提供安全、专业、靠谱的一站式全周期财税服务，
              助力企业合规经营、稳健长效发展。
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-brand-border rounded-sm p-6 md:p-8">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-brand-navy mb-2">了解更多或预约咨询</h3>
              <p className="text-brand-text-muted text-sm md:text-base">十余年深耕本土，高端持证团队为您提供安全、专业、靠谱的全周期财税服务。</p>
            </div>
            <Link
              href="/contact"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white font-medium rounded-sm hover:bg-brand-navy-light transition-colors duration-200"
            >
              联系我们 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
