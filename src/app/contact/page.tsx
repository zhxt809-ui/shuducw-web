import type { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import ConsultationForm from '@/components/consultation-form';

export const metadata: Metadata = {
  title: '联系我们_西安数度财务咨询_西安财税咨询_预约财税服务',
  description:
    '联系西安数度财务咨询有限公司，预约工商财税托管、企业财税合规、内部管理审计、高端财税风控等各项专业财税服务。2012年成立，首届西安市代理记账协会副会长单位。',
  keywords: [
    '西安数度财务咨询',
    '西安财税咨询联系方式',
    '西安财税服务预约',
    '西安财务咨询公司',
  ],
  alternates: { canonical: '/contact' },
};

const contactInfo = [
  {
    icon: Phone,
    title: '电话咨询',
    content: '029-84556877 / 13359182829',
  },
  {
    icon: Mail,
    title: '电子邮箱',
    content: '309814531@qq.com',
  },
  {
    icon: MapPin,
    title: '公司地址',
    content: '西安市高新区唐延路35号旺座现代城D座1006室',
  },
  {
    icon: Clock,
    title: '小红书号',
    content: '6521552259',
  },
];

const serviceInquiry = [
  '基础工商财税服务',
  '中端增值财税服务',
  '企业财税合规体系搭建',
  '企业内部管理审计',
  '高端财税咨询',
  '专项财税风控',
  '股权架构搭建',
  '其他服务',
];

export default function ContactPage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            name: '西安数度财务咨询有限公司',
            telephone: '029-84556877 / 13359182829',
            email: '309814531@qq.com',
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">联系我们</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              欢迎联系西安数度财务咨询有限公司，我们为您提供专业的工商财税托管、
              企业财税合规、内部管理审计、高端财税风控等各项财税服务咨询。
            </p>
          </div>
        </div>
      </section>

      {/* 联系方式 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">联系方式</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <div key={info.title} className="card-brand text-center">
                  <div className="w-12 h-12 bg-brand-navy/5 rounded-sm flex items-center justify-center mx-auto mb-4">
                    <Icon size={22} className="text-brand-navy" />
                  </div>
                  <h3 className="font-bold text-brand-navy mb-2">{info.title}</h3>
                  <p className="text-brand-text font-medium text-sm">{info.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 咨询表单区 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* 左侧：服务咨询 */}
            <div>
              <h2 className="text-2xl font-bold text-brand-navy mb-6">服务咨询</h2>
              <div className="w-12 h-[2px] bg-brand-gold mb-6" />
              <p className="text-brand-text-muted leading-relaxed mb-6">
                请选择您感兴趣的服务类别，我们的专业顾问将尽快与您联系，
                为您提供详细的咨询服务和定制化解决方案。
              </p>
              <div className="space-y-3">
                <h3 className="font-semibold text-brand-navy text-sm">可咨询的服务类别：</h3>
                <div className="flex flex-wrap gap-2">
                  {serviceInquiry.map((service) => (
                    <span
                      key={service}
                      className="px-3 py-1.5 bg-white border border-brand-border text-sm text-brand-text rounded-sm"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 右侧：预约咨询表单 */}
            <ConsultationForm />
          </div>
        </div>
      </section>

      {/* 服务承诺 */}
      <section className="bg-brand-navy text-white">
        <div className="container-brand section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">我们的服务承诺</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: '专业合规', desc: '持证专家团队，全程合法合规' },
                { title: '落地执行', desc: '方案配套跟进，确保落地见效' },
                { title: '安全保密', desc: '严格信息保密，保障客户权益' },
              ].map((item) => (
                <div key={item.title} className="p-6 border border-white/10 rounded-sm">
                  <h3 className="font-bold text-brand-gold mb-2">{item.title}</h3>
                  <p className="text-sm text-white/70">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
