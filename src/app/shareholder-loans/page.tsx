import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Landmark,
  ArrowRight,
  FileSearch,
  Scale,
  CalendarCheck,
  FileSignature,
  ListChecks,
  PhoneCall,
} from 'lucide-react';
import ShareholderCheck from '@/components/shareholder-check';

export const metadata: Metadata = {
  title: '股东从公司拿钱怎么合规-股东借款视同分红20%-老板与公司资金往来-西安数度财务咨询',
  description:
    '股东从公司借款长期不还可能被视同分红按20%缴纳个税（财税〔2003〕158号）。本专题讲解股东借款、公款垫付个人消费、公私账户混用、其他应收款长期挂账的涉税风险与合规处理，并提供股东往来风险自查工具。',
  keywords: [
    '股东借款',
    '股东从公司拿钱',
    '股东往来',
    '视同分红 20%',
    '财税2003 158号',
    '老板从公司借款',
    '其他应收款长期挂账',
    '股东借款个税',
    '西安数度财务咨询',
  ],
  alternates: { canonical: '/shareholder-loans' },
};

const scenarios = [
  {
    title: '股东长期借款不还',
    desc: '老板以"备用金""周转款"名义从公司打款，长期不归还、也不用于公司经营。',
    risk: '纳税年度终了后既不归还、又未用于生产经营的，可能被视同为股东分红，按 20% 征收个人所得税。',
  },
  {
    title: '公款垫付个人消费',
    desc: '公司为股东或家人报销旅游、家庭开支，甚至直接买豪车、住房记在公司名下。',
    risk: '与生产经营无关的个人消费性支出，可能被视同向股东分配，需依法处理并补缴个税。',
  },
  {
    title: '个人账户收公司款',
    desc: '股东个人微信、支付宝、银行卡长期收取经营款项或支付公司费用。',
    risk: '公私混用导致经营收入难以完整入账，易被认定为隐匿收入，是税务稽查的高频风险点。',
  },
  {
    title: '往来科目长期挂账',
    desc: '"其他应收款—股东"长期挂账，跨年度甚至跨多年不清理。',
    risk: '汇算清缴时可能被要求说明用途并做纳税调整；长期无法收回的损失没有税前扣除依据，不能自行扣除。',
  },
];

const policies = [
  {
    title: '财税〔2003〕158号 · 视同分红征税',
    body: '纳税年度内个人投资者从其投资的企业（个人独资企业、合伙企业除外）借款，在该纳税年度终了后既不归还、又未用于企业生产经营的，其未归还的借款可视为企业对个人投资者的红利分配，依照"利息、股息、红利所得"项目计征个人所得税（税率 20%）。',
    source: '财政部、国家税务总局《关于规范个人投资者个人所得税征收管理的通知》第二条',
    sourceUrl: 'https://fgk.chinatax.gov.cn/zcfgk/c102416/c5202842/content.html',
  },
  {
    title: '财税〔2003〕158号 · 独资合伙并入经营所得',
    body: '个人独资企业、合伙企业的个人投资者，以企业资金为本人、家庭成员及相关人员支付与企业生产经营无关的消费性支出，以及购买汽车、住房等财产性支出的，视为企业对个人投资者的利润分配，并入投资者个人的生产经营所得，依照"个体工商户的生产、经营所得"项目计征个人所得税。',
    source: '同文第一条',
    sourceUrl: 'https://fgk.chinatax.gov.cn/zcfgk/c102416/c5202842/content.html',
  },
  {
    title: '国家税务总局公告2011年第25号 · 资产损失税前扣除',
    body: '企业发生的资产损失，应按规定的程序和要求向主管税务机关申报后方能在税前扣除；未经申报的损失，不得在税前扣除。企业应收及预付款项坏账损失、长期无法收回的往来款项，应按本办法申报扣除，不能自行在税前扣除。',
    source: '国家税务总局《企业资产损失所得税税前扣除管理办法》',
    sourceUrl: 'https://fgk.chinatax.gov.cn/zcfgk/c100012/c5194226/content.html',
  },
];

const compliancePath = [
  {
    icon: CalendarCheck,
    title: '年度内归还',
    desc: '股东借款尽量在纳税年度终了前归还；确需继续周转的，应确保用于企业生产经营并有据可查。',
  },
  {
    icon: FileSignature,
    title: '签订书面借款协议',
    desc: '明确金额、用途、归还期限与利率，让"借款"关系清晰可证，避免被认定为长期挂账。',
  },
  {
    icon: Scale,
    title: '依法按分红处理',
    desc: '长期占用确难归还的，建议按"利息、股息、红利所得"依法完税后处理，规范股东往来。',
  },
  {
    icon: ListChecks,
    title: '定期清理往来',
    desc: '每个纳税年度梳理"其他应收款—股东"等往来科目，该归还的归还、该处理的处理，不留跨年挂账。',
  },
];

const faqs = [
  {
    q: '股东从公司借款长期不还，要交税吗？',
    a: '按财税〔2003〕158号，纳税年度内股东从其投资的企业借款，在纳税年度终了后既不归还、又未用于企业生产经营的，其未归还的借款可视为企业对个人投资者的红利分配，按"利息、股息、红利所得"项目计征个人所得税（20%）。建议在纳税年度内归还，或依法按分红处理。',
  },
  {
    q: '公司用公款给股东买豪车、支付个人消费，有什么风险？',
    a: '公司为股东或家人支付与企业生产经营无关的个人消费性支出，可能被视同向股东分配，需依法处理并补缴个税；个人独资企业、合伙企业按财税〔2003〕158号并入经营所得计税。建议严格区分公司与个人开支，规范列支。',
  },
  {
    q: '股东个人账户收公司经营款，会被查吗？',
    a: '长期用个人账户收付公司经营款项属于公私混用，经营收入难以完整入账，易被认定为隐匿收入，是税务稽查的高频风险点。建议规范对公收付，逐笔归账，确保收入完整入账。',
  },
  {
    q: '其他应收款里挂的股东借款怎么处理？',
    a: '建议每个纳税年度清理一次：能够归还的及时归还并留存凭证；确属分红、工资、借款利息的依法处理并申报；长期无法收回的损失需按国家税务总局公告2011年第25号申报后方可税前扣除，不能自行扣除。',
  },
];

export default function ShareholderLoansPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebPage',
                name: '股东从公司拿钱怎么合规_股东往来涉税风险与处理',
                description:
                  '股东借款、公款垫付个人消费、公私账户混用、其他应收款长期挂账的涉税风险与合规处理，含财税〔2003〕158号政策依据与股东往来风险自查工具。',
                publisher: {
                  '@type': 'Organization',
                  name: '西安数度财务咨询有限公司',
                  url: 'https://www.shuducw.com',
                },
              },
              {
                '@type': 'FAQPage',
                mainEntity: faqs.map((f) => ({
                  '@type': 'Question',
                  name: f.q,
                  acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: '首页', item: 'https://www.shuducw.com/' },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: '股东往来专题',
                    item: 'https://www.shuducw.com/shareholder-loans',
                  },
                ],
              },
            ],
          }),
        }}
      />
      {/* 页面头图 */}
      <section className="bg-brand-navy text-white">
        <div className="container-brand section-padding !py-16 md:!py-20">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold-light text-sm rounded-sm mb-6">
              股东与公司资金往来专题
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">老板从公司拿钱，怎么拿才合规？</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              股东借款、公款垫付个人消费、个人账户收公司款、其他应收款长期挂账……
              这些日常操作背后，藏着按 20% 缴纳个税的视同分红风险。结合
              <Link href="https://fgk.chinatax.gov.cn/zcfgk/c102416/c5202842/content.html" target="_blank" rel="noopener noreferrer" className="text-brand-gold-light hover:underline">
                财税〔2003〕158号
              </Link>
              等政策，讲清股东往来的涉税风险与合规处理。
            </p>
          </div>
        </div>
      </section>

      {/* 问题场景 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">这些场景，您遇到过吗？</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto text-sm md:text-base">
              以下情况在中小企业中很常见，也是税务监管数据比对重点关注的领域
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {scenarios.map((s) => (
              <div key={s.title} className="card-brand">
                <h3 className="font-bold text-brand-navy mb-2 flex items-center gap-2">
                  <FileSearch size={17} className="text-brand-gold flex-shrink-0" />
                  {s.title}
                </h3>
                <p className="text-sm text-brand-text mb-3 leading-relaxed">{s.desc}</p>
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-sm px-3 py-2 leading-relaxed">
                  潜在风险：{s.risk}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 政策依据 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">政策依据（来源可查）</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto text-sm md:text-base">
              以下政策均来自财政部、国家税务总局官网公开文件
            </p>
          </div>
          <div className="space-y-5 max-w-4xl mx-auto">
            {policies.map((p) => (
              <div key={p.title} className="bg-white border border-brand-border rounded-sm p-6">
                <h3 className="font-bold text-brand-navy mb-3 flex items-center gap-2">
                  <Scale size={17} className="text-brand-gold flex-shrink-0" />
                  {p.title}
                </h3>
                <p className="text-sm text-brand-text leading-relaxed mb-4">{p.body}</p>
                <a
                  href={p.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-gold hover:text-brand-navy transition-colors"
                >
                  {p.source} <ArrowRight size={12} />
                </a>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-brand-text-muted max-w-2xl mx-auto">
            以上为政策一般性说明，具体适用以企业实际经营情况及主管税务机关认定为准。
          </p>
        </div>
      </section>

      {/* 自查工具 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">股东往来风险自查</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto text-sm md:text-base">
              2 分钟完成 5 道题，初步判断股东与公司资金往来需要关注的方面，并给出对应自查建议
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <ShareholderCheck />
          </div>
        </div>
      </section>

      {/* 合规处理路径 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">股东往来合规处理路径</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto text-sm md:text-base">
              把"老板拿钱"这件事，从模糊地带放进规范轨道
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {compliancePath.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="card-brand">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <Icon size={18} className="text-brand-navy" />
                  </div>
                  <h3 className="font-bold text-brand-navy mb-2">{step.title}</h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 常见问题（页面可见，与上方 FAQPage Schema 一一对应） */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">常见问题</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
          </div>
          <div className="space-y-5 max-w-4xl mx-auto">
            {faqs.map((f) => (
              <div key={f.q} className="bg-brand-bg border border-brand-border rounded-sm p-6">
                <h3 className="font-bold text-brand-navy mb-3 leading-snug">{f.q}</h3>
                <p className="text-sm text-brand-text leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 延伸阅读 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-6">延伸阅读</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/news/xian-wanglaizhang-guazhang-80wan" className="card-brand block hover:border-brand-gold/60 transition-colors">
              <p className="text-sm font-semibold text-brand-navy leading-snug">
                往来账挂账超 1 年不处理，西安一老板付出 80 万代价
              </p>
              <p className="text-xs text-brand-text-muted mt-2">真实案例解读 · 往来长期挂账的代价</p>
            </Link>
            <Link href="/faq" className="card-brand block hover:border-brand-gold/60 transition-colors">
              <p className="text-sm font-semibold text-brand-navy leading-snug">
                股东分红怎么交税？常见财税问题 FAQ
              </p>
              <p className="text-xs text-brand-text-muted mt-2">股东分红 20%、股权转让、往来处理等 30 个高频问题</p>
            </Link>
            <Link href="/services/consulting" className="card-brand block hover:border-brand-gold/60 transition-colors">
              <p className="text-sm font-semibold text-brand-navy leading-snug">
                财税顾问与专项咨询
              </p>
              <p className="text-xs text-brand-text-muted mt-2">常年财税顾问、股权架构、分红与借款合规方案</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 服务承接 CTA */}
      <section className="bg-brand-navy text-white">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Landmark size={22} className="text-brand-gold" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">股东往来梳理与合规方案</h2>
            <p className="text-white/70 text-sm md:text-base leading-relaxed mb-8 max-w-2xl mx-auto">
              由持证会计协助梳理"其他应收款—股东"等往来科目，评估视同分红风险，
              出具书面协议模板与处理方案。如需了解，可先通过自查或致电获取初步判断。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/services/consulting"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-navy font-medium rounded-sm hover:bg-brand-gold-light transition-colors"
              >
                查看财税顾问服务 <ArrowRight size={16} />
              </Link>
              <a
                href="tel:02984556877"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-sm hover:border-brand-gold/60 transition-colors"
              >
                <PhoneCall size={16} /> 029-84556877 免费咨询
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
