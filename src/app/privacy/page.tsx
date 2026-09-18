import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: '隐私政策_西安数度财务咨询有限公司_信息保护与数据安全',
  description:
    '西安数度财务咨询有限公司隐私政策：说明网站信息收集范围、使用目的、存储与保护措施，以及用户查询、更正、删除个人信息的权利与联系方式。',
  keywords: ['西安数度财务咨询隐私政策', '信息保护', '数据安全'],
  alternates: { canonical: '/privacy' },
};

const sections = [
  {
    title: '一、我们收集的信息',
    body: [
      '本网站仅在您主动提交咨询表单时，收集您填写的三项信息：企业名称、联系电话、咨询内容。除此之外，我们不会收集您的身份证号、银行账户、经营数据等其他信息。',
      '网站不提供注册、登录等账号体系，不存在 Cookie 跟踪或行为画像。您匿名浏览本网站的任何页面，均不会产生可识别个人的信息记录。',
    ],
  },
  {
    title: '二、信息的使用目的',
    body: [
      '您提交的信息仅用于以下目的：',
      '1. 工作人员与您取得联系，就您咨询的财税问题进行沟通；',
      '2. 根据您描述的情况，为您提供初步的服务方案与报价建议。',
      '我们不会将您的信息用于与上述目的无关的营销推送，也不会用于自动化的电话骚扰。',
    ],
  },
  {
    title: '三、信息的存储与保护',
    body: [
      '您提交的信息保存在我公司自建服务器的本地数据文件中，数据不出境、不上传第三方云平台。',
      '服务器已启用防火墙、密钥登录、访问限流等安全措施；仅有负责客户对接的工作人员可以查看咨询记录。',
      '提交信息后，由持有代理记账资质的会计与您对接，我们将严格保密您的企业信息与联系方式。',
    ],
  },
  {
    title: '四、信息的共享与披露',
    body: [
      '我们不会向任何第三方出售、出租、交换您的信息。仅在以下法定情形下，可能依法提供相关信息：',
      '1. 经您本人明确同意；',
      '2. 依据法律法规或有权机关的法定要求。',
    ],
  },
  {
    title: '五、您的权利',
    body: [
      '您有权查询、更正我们留存的您的信息，也有权要求我们删除您的全部咨询记录。',
      '如需行使上述权利，可通过电话 029-84556877 / 13359182829 或邮箱 309814531@qq.com 与我们联系，我们将在合理时限内处理并回复。',
    ],
  },
  {
    title: '六、政策更新',
    body: [
      '本隐私政策如有更新，将在本页面发布修订版本并标注更新日期。继续使用本网站服务，即视为您知悉并接受最新版本的隐私政策。',
      '本政策最后更新于 2026 年 9 月。',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: '隐私政策',
            description:
              '西安数度财务咨询有限公司隐私政策：信息收集范围、使用目的、存储与保护措施，以及用户查询、更正、删除个人信息的权利与联系方式。',
            publisher: {
              '@type': 'Organization',
              name: '西安数度财务咨询有限公司',
              url: 'https://www.shuducw.com',
            },
          }),
        }}
      />
      {/* 页面头图 */}
      <section className="bg-brand-navy text-white">
        <div className="container-brand section-padding !py-16 md:!py-20">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold-light text-sm rounded-sm mb-6">
              信息保护与数据安全
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">隐私政策</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              我们高度重视您的信息安全。本政策说明西安数度财务咨询有限公司网站在提供服务过程中，
              如何收集、使用、存储和保护您的信息，以及您依法享有的权利。
            </p>
          </div>
        </div>
      </section>

      {/* 正文 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="max-w-3xl mx-auto space-y-10">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="text-xl font-bold text-brand-navy mb-4 flex items-center gap-2">
                  <Shield size={18} className="text-brand-gold flex-shrink-0" />
                  {s.title}
                </h2>
                <div className="space-y-3 text-brand-text leading-relaxed text-sm md:text-base">
                  {s.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-12 bg-brand-bg border border-brand-border rounded-sm p-6">
              <p className="text-sm text-brand-text-muted leading-relaxed">
                对本隐私政策有任何疑问，欢迎通过{' '}
                <Link href="/contact" className="text-brand-navy hover:text-brand-gold font-medium">
                  联系我们
                </Link>{' '}
                页面与我们沟通。
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
