import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Phone, ShieldCheck, BookOpen, Calculator } from 'lucide-react';
import { IncomeTaxCalculator } from '@/components/income-tax-calculator';
import { InlineConsultForm } from '@/components/inline-consult-form';
import { districts } from '@/data/districts';

export const metadata: Metadata = {
  title: '个税计算器-经营所得5%-35%-工资薪金个税计算-西安数度财务咨询',
  description:
    '免费在线个人所得税计算器：经营所得模式（个体户5%-35%五级超额累进，含个体工商户减半征收政策）与工资薪金模式（3%-45%七级，减除费用6万/年、专项附加扣除），附现行税率表、专项附加扣除标准与常见问题解答，西安数度财务咨询提供。',
  keywords: [
    '个税计算器',
    '经营所得个人所得税计算',
    '个体户个税计算器',
    '个体工商户减半征收',
    '个体户经营所得怎么算',
    '专项附加扣除标准',
    '工资个税计算',
    '年终奖个税怎么算',
    '直播电商主播报税',
  ],
  alternates: { canonical: '/tools/income-tax' },
};

const FAQ = [
  {
    q: '个体工商户的经营所得个税怎么算？',
    a:
      '经营所得适用 5% 至 35% 的五级超额累进税率。按《个体工商户个人所得税计税办法》第七条，应纳税所得额为收入总额减除成本、费用、税金、损失、其他支出以及允许弥补的以前年度亏损后的余额。需要注意的是：业主本人的工资薪金支出不得在税前扣除（第二十一条）；生产经营与个人、家庭生活混用难以分清的支出，其中 40% 视为与生产经营有关的费用准予扣除（第十六条）；用于个人和家庭的支出不得扣除（第十五条）；纳税年度亏损可向以后年度结转弥补，最长不超过 5 年（第十七条）。',
  },
  {
    q: '个体工商户减半征收个人所得税怎么算？执行到什么时候？',
    a:
      '按财政部 税务总局公告 2023 年第 12 号，自 2023 年 1 月 1 日至 2027 年 12 月 31 日，对个体工商户年应纳税所得额不超过 200 万元的部分，减半征收个人所得税。年应纳税所得额不超过 200 万元时，减免额为应纳税额的 50%；超过 200 万元的部分不适用减半，减免额需按国家税务总局公告规定的公式计算。本计算器在经营所得模式下默认勾选该政策，可自行取消。',
  },
  {
    q: '专项附加扣除现在每月能扣多少？',
    a:
      '按国务院《个人所得税专项附加扣除暂行办法》及 2023 年提高标准的通知：子女教育每个子女每月 2000 元（原 1000 元）；3 岁以下婴幼儿照护每个婴幼儿每月 2000 元（原 1000 元）；赡养老人每月 3000 元（原 2000 元，独生子女按 3000 元定额扣除，非独生子女与兄弟姐妹分摊该额度）。其余项目：继续教育学历（学位）教育每月 400 元、技能或专业技术人员职业资格继续教育取得证书当年 3600 元；住房贷款利息首套每月 1000 元、最长 240 个月；住房租金按城市每月 1500 元、1100 元或 800 元；大病医疗在医保报销后个人负担累计超过 15000 元的部分，在 80000 元限额内据实扣除。',
  },
  {
    q: '工资薪金个税怎么算？6 万元和每月 5000 元是什么关系？',
    a:
      '综合所得减除费用为每年 6 万元，即每月 5000 元。应纳税所得额 = 年收入 − 6 万元 − 三险一金个人部分 − 专项附加扣除 − 其他依法确定的扣除，再按 3% 至 45% 的七级超额累进税率计税。实际发放时按累计预扣法逐月预扣预缴、次年办理汇算清缴，多退少补，本工具按年度简化估算。',
  },
  {
    q: '经营所得和工资薪金有什么区别？主播、工作室按哪个交？',
    a:
      '两者税率表、扣除项目和申报方式都不同：工资薪金属于综合所得，适用 3% 至 45% 七级超额累进，由单位按月累计预扣；经营所得适用 5% 至 35% 五级超额累进，按年计算、分月或分季预缴、年度汇算清缴，不得扣除业主本人工资。具体按哪一类纳税，取决于业务实质、是否办理营业执照与征收方式，由主管税务机关认定，建议结合自身情况确认。',
  },
  {
    q: '年终奖怎么算个税更划算？',
    a:
      '按财政部 税务总局关于延续实施全年一次性奖金个人所得税政策的公告（2023 年第 30 号），居民个人取得全年一次性奖金，可以选择不并入当年综合所得、单独计税（按奖金÷12 查按月换算后的综合所得税率表确定税率和速算扣除数），也可以选择并入当年综合所得计算纳税，该政策执行至 2027 年 12 月 31 日。两种方式税负可能不同，且年终奖在 36000、144000、300000、420000、660000、960000 元等临界点之后存在"多发一元、多缴几千"的区间，建议用我们的年终奖个税计算器分别试算后再选择。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: '个人所得税计算器',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      description:
        '免费在线个税计算器：经营所得（个体户5%-35%五级、含个体工商户减半征收）与工资薪金（3%-45%七级、减除费用6万/年）双模式，现行税率表。',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      provider: {
        '@type': 'ProfessionalService',
        name: '西安数度财务咨询有限公司',
        telephone: '029-88456877',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ],
};

export default function IncomeTaxCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 页面头图 */}
      <section className="bg-brand-navy text-white">
        <div className="container-brand section-padding !py-14 md:!py-16">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold-light text-sm rounded-sm mb-5">
              免费在线工具 · 现行税率表
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">个人所得税计算器</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              个体户、主播常用<b>经营所得</b>模式（5%-35% 五级）；上班族可用<b>工资薪金</b>模式
              （3%-45% 七级，减除费用 6 万元/年）。结果为简化估算，仅供参考。
            </p>
          </div>
        </div>
      </section>

      {/* 计算器 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <IncomeTaxCalculator />
          </div>
        </div>
      </section>

      {/* 政策依据 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-5 flex items-center gap-2.5">
              <BookOpen size={20} className="text-brand-gold" />
              计算口径与政策依据
            </h2>
            <div className="space-y-4 text-sm text-brand-text-muted leading-relaxed">
              <div className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                <h3 className="font-bold text-brand-navy mb-2">经营所得（个体户、个人工作室等）</h3>
                <ul className="space-y-1.5">
                  <li>· 应纳税所得额＝收入总额 − 成本 − 费用 − 税金 − 损失 − 其他支出 − 允许弥补的以前年度亏损（《个体工商户个人所得税计税办法》第七条）</li>
                  <li>· 适用 5% 至 35% 五级超额累进税率：不超过 3 万元部分 5%（速算扣除数 0）；3 万至 9 万部分 10%（1500）；9 万至 30 万部分 20%（10500）；30 万至 50 万部分 30%（40500）；超过 50 万部分 35%（65500）</li>
                  <li>· <strong className="text-brand-navy font-medium">个体工商户减半征收</strong>：2023-01-01 至 2027-12-31，年应纳税所得额不超过 200 万元的部分减半征收个人所得税（财政部 税务总局公告 2023 年第 12 号）</li>
                  <li>· 业主本人的工资薪金支出不得税前扣除（第二十一条）；与个人、家庭生活混用难以分清的支出，其中 40% 视为与生产经营有关费用准予扣除（第十六条）；亏损结转弥补最长不超过 5 年（第十七条）</li>
                  <li>· 计征方式分查账征收与核定征收，实际以主管税务机关确定的方式为准</li>
                </ul>
              </div>
              <div className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                <h3 className="font-bold text-brand-navy mb-2">综合所得（工资薪金等）</h3>
                <ul className="space-y-1.5">
                  <li>· 年度减除费用 6 万元（即每月 5000 元），另可减除三险一金（专项扣除）与专项附加扣除</li>
                  <li>· 适用 3% 至 45% 七级超额累进税率：3.6 万 / 14.4 万 / 30 万 / 42 万 / 66 万 / 96 万级距，速算扣除数分别为 0 / 2520 / 16920 / 31920 / 52920 / 85920 / 181920</li>
                  <li>· 工资薪金实际由单位按累计预扣法逐月代扣代缴，次年 3-6 月办理汇算清缴，本工具为简化年度估算</li>
                  <li>· 全年一次性奖金可选择单独计税或并入综合所得，政策执行至 2027-12-31（本工具暂未含该模块）</li>
                </ul>
              </div>
              <div className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                <h3 className="font-bold text-brand-navy mb-2">专项附加扣除现行标准（7 项）</h3>
                <ul className="space-y-1.5">
                  <li>· 子女教育：每个子女每月 2000 元（2023 年由 1000 元提高）</li>
                  <li>· 3 岁以下婴幼儿照护：每个婴幼儿每月 2000 元（2023 年由 1000 元提高）</li>
                  <li>· 赡养老人：每月 3000 元（2023 年由 2000 元提高；独生子女按 3000 元定额扣除，非独生子女与兄弟姐妹分摊该额度）</li>
                  <li>· 继续教育：学历（学位）教育每月 400 元、同一学历最长 48 个月；技能或专业技术人员职业资格继续教育，取得证书当年 3600 元</li>
                  <li>· 住房贷款利息：首套住房贷款利息每月 1000 元、最长 240 个月</li>
                  <li>· 住房租金：按城市每月 1500 元 / 1100 元 / 800 元</li>
                  <li>· 大病医疗：医保报销后个人负担累计超过 15000 元的部分，在 80000 元限额内据实扣除（年度汇算时办理）</li>
                </ul>
              </div>
              <p className="text-xs leading-relaxed">
                提示：专项附加扣除以实际符合条件并按规定申报为准。政策如有调整，以税务机关最新公布为准。
                口径核验日期：2026 年 10 月。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 常见问题 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-3">个税常见问题</h2>
            <div className="w-16 h-[2px] bg-brand-gold mb-6" />
            <div className="space-y-4">
              {FAQ.map((item) => (
                <div key={item.q} className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                  <h3 className="text-sm font-bold text-brand-navy mb-2">{item.q}</h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-brand-text-muted mt-5 leading-relaxed">
              口径依据：《中华人民共和国个人所得税法》及所附税率表；《个体工商户个人所得税计税办法》（国家税务总局令第 35 号）；
              财政部 税务总局公告 2023 年第 12 号（个体工商户减半征收）；国务院《个人所得税专项附加扣除暂行办法》及
              国务院关于提高个人所得税有关专项附加扣除标准的通知（国发〔2023〕13 号）；
              财政部 税务总局关于延续实施全年一次性奖金个人所得税政策的公告（2023 年第 30 号）。
              口径核验日期：2026 年 10 月。以上为现行政策的简化说明，具体适用请以主管税务机关口径为准。
            </p>
          </div>
        </div>
      </section>

      {/* 内嵌咨询表单 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-14">
          <div className="max-w-3xl mx-auto border border-brand-border rounded-sm bg-white">
            <InlineConsultForm />
          </div>
          <div className="max-w-3xl mx-auto mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-brand-text">
            <span className="flex items-center gap-2">
              <Phone size={14} className="text-brand-gold" />
              029-88456877 / 13359182829
            </span>
            <Link
              href="/services/live-commerce"
              className="inline-flex items-center gap-1.5 text-brand-gold hover:text-brand-navy transition-colors"
            >
              直播电商个体户财税咨询 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 更多工具与服务 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <h2 className="text-lg font-bold text-brand-navy mb-5 text-center">更多免费工具与服务</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/tools/bonus-tax"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
            >
              <Calculator size={14} /> 年终奖试算
            </Link>
            <Link
              href="/tools/vat"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
            >
              <Calculator size={14} /> 增值税计算器
            </Link>
            <Link
              href="/tools/rmb-uppercase"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
            >
              金额大写转换
            </Link>
            <Link
              href="/self-check"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
            >
              <ShieldCheck size={14} /> 账务风险自查
            </Link>
            <Link
              href="/services/delivery"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
            >
              服务交付标准
            </Link>
            {districts.slice(0, 3).map((d) => (
              <Link
                key={d.slug}
                href={`/services/district/${d.slug}`}
                className="px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
              >
                {d.name}
                {d.keyword}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
