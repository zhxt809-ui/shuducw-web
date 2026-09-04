import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MessageSquare, ChevronDown, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: '财税常见问题FAQ_西安代理记账_公司注册_税务筹划_西安数度财务咨询',
  description:
    '西安数度财务咨询有限公司整理的企业财税高频问题解答：西安代理记账多少钱、公司注册需要什么材料、小规模纳税人和一般纳税人的区别、税务异常怎么处理、公司注销流程等常见问题。',
  keywords: [
    '西安代理记账多少钱',
    '西安公司注册流程',
    '小规模纳税人和一般纳税人区别',
    '税务异常处理',
    '西安数度财务咨询',
    '财税常见问题',
  ],
  alternates: { canonical: '/faq' },
};

const faqs = [
  {
    q: '西安代理记账一年多少钱？',
    a: '西安代理记账费用因企业类型、开票量、业务复杂度而异，一般小规模纳税人年费在 2000-4000 元左右，一般纳税人稍高。具体以企业实际经营情况为准，可联系西安数度财务咨询免费报价（电话 029-84556877 / 13359182829）。',
  },
  {
    q: '西安注册公司需要准备什么材料？',
    a: '注册公司通常需要：公司名称（准备 3-5 个备选）、经营范围、注册地址证明（房产证或租赁合同）、法人及股东身份证复印件、注册资本和股权比例。西安数度财务咨询提供全程代办服务，包含核名、章程起草、营业执照领取、刻章备案、银行开户预约、税务登记等一站式办理。',
  },
  {
    q: '小规模纳税人和一般纳税人有什么区别？',
    a: '主要区别在税率和进项抵扣：小规模纳税人适用征收率（目前增值税征收率 1% 或 3%，阶段性优惠以最新政策为准），不能抵扣进项；一般纳税人适用 6%/9%/13% 等税率，可抵扣进项税额。年应税销售额超过 500 万元的企业通常需登记为一般纳税人。',
  },
  {
    q: '公司注册后多久必须开始记账报税？',
    a: '公司成立后当月或次月起就应建立账务，按期申报纳税。即使没有业务也要进行零申报，逾期未申报会产生罚款并影响企业信用。建议注册完成后第一时间委托专业代理记账机构，避免遗漏申报。',
  },
  {
    q: '公司没有业务收入，需要报税吗？',
    a: '需要。没有业务收入的企业也要进行零申报（各税种按期申报），否则会被认定为逾期未申报，产生罚款、滞纳金，严重时影响企业信用和法人征信。',
  },
  {
    q: '税务异常状态怎么解除？',
    a: '税务异常通常因逾期申报、地址失联、欠税等引起。解除步骤：先到主管税务机关查明异常原因 → 补申报、补缴税款及滞纳金 → 税务机关核实后解除异常。涉及情况较复杂的可委托西安数度财务咨询协助处理，我们有丰富的税务异常解除经验。',
  },
  {
    q: '公司注销需要多久？需要什么条件？',
    a: '公司注销需先清算：税务注销（结清税款、缴销发票）→ 工商注销（公示 45 天）→ 银行账户注销 → 印章缴销。整体周期通常 2-4 个月。条件：无未结税款、无债务纠纷或已清算完毕、无在诉案件。西安数度财务咨询提供公司注销全程代办。',
  },
  {
    q: '代理记账和兼职会计有什么区别？',
    a: '代理记账机构有正规资质、多名专业人员协作、系统化流程，业务连续性有保障；兼职会计多为个人，人员变动风险高。代理记账还能提供税务风险预警、政策咨询等增值服务，且价格往往更实惠。',
  },
  {
    q: '企业需要做内部审计吗？多久一次？',
    a: '建议每年至少开展一次内部管理审计，规模较大或业务复杂的企业可每半年一次。内部审计能提前发现财务漏洞、费用异常、内控薄弱环节，避免问题积累成大风险。西安数度财务咨询提供常态化内部财务核查、费用专项核查、采购销售流程审计等服务。',
  },
  {
    q: '什么是财税合规？企业如何做到财税合规？',
    a: '财税合规指企业的账务处理、纳税申报、发票管理、资金往来等符合法律法规要求。核心包括：账实相符、按时申报、发票合规、公私账分离、按规定缴税。企业可委托专业机构进行财税风险全面体检，再针对性整改，建立内控合规体系。',
  },
  {
    q: '公司可以找代理记账机构吗？有什么法律依据？',
    a: '可以。《代理记账管理办法》明确允许企业委托具备资质的代理记账机构办理记账报税业务。企业只需保留原始凭证，由代理记账机构完成会计核算、纳税申报等工作，双方签订书面委托协议。',
  },
  {
    q: '发票开具有哪些常见错误？',
    a: '常见错误包括：开票信息不完整（漏税号、地址）、税率适用错误、备注栏未按规定填写、跨月红冲未处理、超经营范围开票等。错误开票可能导致受票方无法抵扣，引发税务风险，建议规范开票流程或委托专业机构管理发票。',
  },
  {
    q: '企业税负太高，如何合规筹划？',
    a: '合规的税务筹划应从业务端入手：合理选择纳税人身份、利用税收优惠政策（小微企业所得税优惠、研发费用加计扣除等）、规范业务合同和发票流、合理设计股权架构。注意：税务筹划必须在合法合规前提下进行，切勿买卖发票或虚构业务。',
  },
  {
    q: '高新技术企业认定对企业有什么好处？',
    a: '高新认定后可享受：企业所得税税率由 25% 降至 15%、研发费用加计扣除、政府一次性奖励补贴、提升企业品牌形象、有利于招投标和融资。认定需要满足研发投入占比、高新收入占比、知识产权等硬性条件，可委托专业机构辅导申报。',
  },
  {
    q: '股东分红需要交税吗？',
    a: '需要。居民企业向个人股东分红，需按"利息、股息、红利所得"缴纳 20% 个人所得税。通过合理的股权架构设计（如有限公司持股平台）可以优化整体税负，具体方案需结合企业实际情况规划。',
  },
  {
    q: '什么是乱账清理？什么情况下需要做？',
    a: '乱账清理指对账目混乱、科目错误、往来不清的账务进行全面梳理和调整，恢复账目的真实、准确。企业出现账实不符、长期挂账、历史账务断层、更换财务人员交接不清等情况时，建议进行乱账清理，避免税务风险。',
  },
  {
    q: '新公司第一年如何合理规划税务？',
    a: '新公司建议：1）根据业务规模选择合适的纳税人身份；2）规范取得发票，留存成本凭证；3）及时申报，避免逾期；4）关注小微企业税收优惠政策；5）从成立初期就建立合规的账务体系。可委托西安数度财务咨询提供成立初期财税规划。',
  },
  {
    q: '社保和公积金可以委托代理吗？',
    a: '可以。企业可将社保公积金开户、人员增减、基数调整、费用缴纳等事务委托给代理机构办理，节省企业人力成本，确保按时合规缴纳。西安数度财务咨询提供社保公积金开户与托管服务。',
  },
  {
    q: '股权转让涉及哪些税费？',
    a: '个人股权转让主要涉及个人所得税（按财产转让所得 20% 征收）和印花税（万分之五）；企业股权转让涉及企业所得税和印花税。转让价格明显偏低且无正当理由的，税务机关有权核定。转让前建议做好财税规划，必要时委托专业机构评估。',
  },
  {
    q: '为什么选择西安数度财务咨询？',
    a: '西安数度财务咨询有限公司 2012 年成立，是首届西安市代理记账协会副会长单位，团队拥有高级会计师、国际注册会计师、注册税务师。深耕西安十余年，提供工商财税托管、财税合规、内部审计、财税风控一站式服务，坚持合规为先、风控为本、落地为王，服务覆盖商贸、建筑、电商、劳务、高新科技、跨境等行业。',
  },
];

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
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
              企业财税高频问题解答
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">财税常见问题 FAQ</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              整理企业老板最关心的财税问题，涵盖代理记账、公司注册、税务申报、
              公司注销、财税合规等高频场景，助您快速了解财税知识、规避风险。
            </p>
          </div>
        </div>
      </section>

      {/* FAQ 列表 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="group border border-brand-border rounded-sm bg-white transition-colors hover:border-brand-navy/30"
                >
                  <summary className="flex items-start gap-3 cursor-pointer list-none p-5 md:p-6 select-none">
                    <span className="flex items-center justify-center w-7 h-7 rounded-sm bg-brand-navy/5 text-brand-navy font-bold text-sm flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="flex-1 font-semibold text-brand-navy leading-relaxed">
                      {faq.q}
                    </span>
                    <ChevronDown size={18} className="text-brand-gold flex-shrink-0 mt-1 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-5 md:px-6 md:pb-6 pl-12 md:pl-14">
                    <p className="text-sm text-brand-text leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 找不到答案时的 CTA */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <HelpCircle size={20} className="text-brand-gold" />
              <h2 className="text-xl md:text-2xl font-bold text-brand-navy">没有找到您关心的问题？</h2>
            </div>
            <p className="text-brand-text-muted mb-8">
              联系我们的专业顾问，一对一解答您的财税疑问。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white font-medium rounded-sm hover:bg-brand-navy-light transition-colors"
              >
                <MessageSquare size={16} />
                在线免费咨询
              </Link>
              <a
                href="tel:02984556877"
                className="inline-flex items-center gap-2 px-6 py-3 border border-brand-navy text-brand-navy rounded-sm hover:bg-brand-navy/5 transition-colors"
              >
                <Phone size={16} />
                029-84556877 / 13359182829
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
