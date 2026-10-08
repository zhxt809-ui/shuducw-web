import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Phone, ShieldCheck, BookOpen, Calculator } from 'lucide-react';
import { BonusTaxCalculator } from '@/components/bonus-tax-calculator';
import { InlineConsultForm } from '@/components/inline-consult-form';
import { districts } from '@/data/districts';
import { BLIND_SPOTS } from '@/lib/bonus-tax';

export const metadata: Metadata = {
  title: '年终奖个税计算器-全年一次性奖金单独计税还是并入综合所得-临界点-西安数度财务咨询',
  description:
    '免费在线年终奖个税试算：全年一次性奖金单独计税（应纳税额=奖金×适用税率-速算扣除数，税率按奖金÷12查按月换算表）与并入综合所得双算对比，自动提示"多发一元多缴几千"的临界点区间（36000、144000、300000 等），依据财政部 税务总局公告2023年第30号，执行至2027-12-31，西安数度财务咨询提供。',
  keywords: [
    '年终奖个税计算器',
    '全年一次性奖金个税',
    '年终奖单独计税',
    '年终奖并入综合所得',
    '年终奖临界点',
    '多发一元多缴税',
    '年终奖36000',
    '年终奖怎么算个税',
    '年终奖哪种计税划算',
  ],
  alternates: { canonical: '/tools/bonus-tax' },
};

const FAQ = [
  {
    q: '年终奖个税怎么算？单独计税的计算公式是什么？',
    a:
      '按财政部 税务总局公告 2023 年第 30 号：居民个人取得全年一次性奖金，不并入当年综合所得的，以全年一次性奖金收入除以 12 个月得到的数额，按照《按月换算后的综合所得税率表》确定适用税率和速算扣除数，单独计算纳税。计算公式为：应纳税额＝全年一次性奖金收入×适用税率－速算扣除数。例如年终奖 36000 元，36000÷12＝3000 元，适用 3% 税率、速算扣除数 0，应纳税额＝36000×3%＝1080 元。',
  },
  {
    q: '年终奖单独计税和并入综合所得，哪种更划算？',
    a:
      '没有固定答案，取决于全年工资收入水平与可扣除项目。一般规律：全年综合所得较低（扣除 6 万元减除费用、三险一金、专项附加扣除后应纳税所得额很小甚至为负数）的人，把年终奖并入综合所得往往更省——按广东省税务局公开口径，"当综合所得的应纳税所得额为负数时，全年一次性奖金和综合所得合并计算，一定是最优选择"；全年综合所得已经较高、奖金并入后适用税率高于单独计税对应税率的人，单独计税往往更省。两种方式的计算口径一致（都是全年合计税额，区别只在于年终奖是否并入综合所得），建议用本工具分别试算后再定。若发放时单位已按单独计税预扣，而汇算时发现并入更划算，可在办理个税年度汇算时，通过个人所得税 App 在申报表"工资薪金"项下的"奖金计税方式选择"中改为并入综合所得（国家税务总局 12366 口径）。',
  },
  {
    q: '为什么说年终奖"多发一元，多缴几千"？临界点有哪些？',
    a:
      '因为全年一次性奖金单独计税采用的是"按奖金÷12 查表定税率、再对全额计税"的方法，奖金刚好超过某个级距上界时，全部奖金都会跳入更高税率档，导致税额突增、税后到手反而减少。以 36000 元为例：36000 元时适用 3%，应纳税额 1080 元；多发 1 元变成 36001 元后适用 10%，应纳税额变为 3390.10 元，多缴 2310.10 元，直到奖金超过 38566.67 元税后才重新与 36000 元持平。常见临界点（级距上界）为 36000、144000、300000、420000、660000、960000 元，本页表格列出了每个临界点对应的"多发不如少发"区间。',
  },
  {
    q: '年终奖单独计税一年可以用几次？',
    a:
      '在一个纳税年度内，对每一个纳税人，全年一次性奖金单独计税的办法只允许采用一次。也就是说一年内发放多笔"年终奖"的，只有其中一笔可以按全年一次性奖金单独计税，其余应并入当月工资薪金或综合所得计税。具体以单位为个人办理扣缴申报的口径为准。',
  },
  {
    q: '年终奖政策执行到什么时候？之后会怎样？',
    a:
      '财政部 税务总局公告 2023 年第 30 号明确：本公告执行至 2027 年 12 月 31 日。也就是说 2023 年至 2027 年发放的全年一次性奖金，可以选择单独计税或并入综合所得。2028 年及以后的政策尚未明确，届时应以最新公布的税收政策为准。',
  },
  {
    q: '把年终奖拆成"工资+年终奖"发放，能省税吗？',
    a:
      '有可能。年终奖单独计税与工资薪金综合所得适用两套税率表，在收入水平、扣除项目既定的情况下，两种收入之间的分配比例会影响整体税负，同时还要避开年终奖的临界点区间。但拆分方案受劳动合同约定、社保公积金基数、个税扣缴申报口径等约束，不能仅为省税随意变更发放名目。建议把全年收入、扣除项目、社保基数一并测算后再定，必要时咨询专业机构。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: '年终奖个税计算器',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      description:
        '免费在线年终奖（全年一次性奖金）个税试算：单独计税与并入综合所得双算对比，含"多发不如少发"临界点提醒，依据财政部 税务总局公告2023年第30号。',
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

export default function BonusTaxPage() {
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
              免费在线工具 · 政策执行至 2027-12-31
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">年终奖个税计算器</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              全年一次性奖金"单独计税"与"并入综合所得"双算对比，并自动提示
              "多发一元、多缴几千"的临界点区间，依据财政部 税务总局公告 2023 年第 30 号现行口径。
            </p>
          </div>
        </div>
      </section>

      {/* 计算器 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <BonusTaxCalculator />
          </div>
        </div>
      </section>

      {/* 临界点表 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-3">
              年终奖临界点："多发不如少发"区间一览
            </h2>
            <div className="w-16 h-[2px] bg-brand-gold mb-5" />
            <p className="text-sm text-brand-text-muted leading-relaxed mb-5">
              下表按《按月换算后的综合所得税率表》计算。第二列的意思是：奖金落在该区间内时，
              税后到手反而低于左侧临界点金额，建议直接按临界点金额发放。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-brand-border bg-white">
                <thead className="bg-brand-navy/5 text-brand-navy">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold border-b border-brand-border whitespace-nowrap">临界点（建议发放）</th>
                    <th className="text-left px-4 py-3 font-bold border-b border-brand-border whitespace-nowrap">多发不如少发区间</th>
                    <th className="text-left px-4 py-3 font-bold border-b border-brand-border whitespace-nowrap">多 1 元多缴</th>
                    <th className="text-left px-4 py-3 font-bold border-b border-brand-border whitespace-nowrap">临界点应纳税额</th>
                    <th className="text-left px-4 py-3 font-bold border-b border-brand-border whitespace-nowrap">临界点税后到手</th>
                  </tr>
                </thead>
                <tbody className="text-brand-text-muted">
                  {BLIND_SPOTS.map((s) => (
                    <tr key={s.boundary} className="border-b border-brand-border last:border-0">
                      <td className="px-4 py-3 whitespace-nowrap text-brand-navy font-medium">
                        {s.boundary.toLocaleString('zh-CN')} 元
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {s.boundary.toLocaleString('zh-CN')} ＜ 奖金 ≤ {s.upper.toLocaleString('zh-CN')} 元
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-red-600 font-medium">
                        {s.jumpPerYuan.toLocaleString('zh-CN', { minimumFractionDigits: 2 })} 元
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {(s.boundary - s.netAtBoundary).toLocaleString('zh-CN', { minimumFractionDigits: 2 })} 元
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {s.netAtBoundary.toLocaleString('zh-CN', { minimumFractionDigits: 2 })} 元
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
              区间右端由"税后到手与临界点持平"反解得到，与官方公告附件税率表一致；
              表中金额由页面实时按税率表计算，非人工填写。
            </p>
          </div>
        </div>
      </section>

      {/* 政策依据 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-5 flex items-center gap-2.5">
              <BookOpen size={20} className="text-brand-gold" />
              计算口径与政策依据
            </h2>
            <div className="space-y-4 text-sm text-brand-text-muted leading-relaxed">
              <div className="p-5 bg-white border border-brand-border rounded-sm">
                <h3 className="font-bold text-brand-navy mb-2">方式一：单独计税（政策原文口径）</h3>
                <ul className="space-y-1.5">
                  <li>· 依据：财政部 税务总局《关于延续实施全年一次性奖金个人所得税政策的公告》（2023 年第 30 号，成文日期 2023-08-18）</li>
                  <li>· 奖金不并入当年综合所得，以奖金收入<b>除以 12 个月</b>得到的数额，查《按月换算后的综合所得税率表》确定适用税率和速算扣除数</li>
                  <li>· 计算公式：<b>应纳税额＝全年一次性奖金收入×适用税率－速算扣除数</b></li>
                  <li>· 按月换算后的综合所得税率表：不超过 3000 元 3%/0；3000-12000 元 10%/210；12000-25000 元 20%/1410；25000-35000 元 25%/2660；35000-55000 元 30%/4410；55000-80000 元 35%/7160；超过 80000 元 45%/15160</li>
                  <li>· 一个纳税年度内，该单独计税办法对每一位纳税人<b>只允许采用一次</b></li>
                </ul>
              </div>
              <div className="p-5 bg-white border border-brand-border rounded-sm">
                <h3 className="font-bold text-brand-navy mb-2">方式二：并入当年综合所得</h3>
                <ul className="space-y-1.5">
                  <li>· 同一公告第二条：居民个人取得全年一次性奖金，也可以选择并入当年综合所得计算纳税</li>
                  <li>· 并入后属于综合所得（工资薪金）的一部分，按<b>综合所得年度税率表</b>（3%-45% 七级）计税，计算公式：全年应纳税额＝全年应纳税所得额×适用税率－速算扣除数</li>
                  <li>· 全年应纳税所得额＝（工资等综合所得收入 ＋ 年终奖）− 6 万元减除费用 − 专项扣除（三险一金）− 专项附加扣除 − 其他扣除</li>
                  <li>· 广东省税务局公开口径：<b>当综合所得的应纳税所得额为负数时，全年一次性奖金和综合所得合并计算，一定是最优选择</b>（未用完的减除费用可抵减年终奖）</li>
                  <li>· 对比口径说明：两种方式都按<b>全年合计税额</b>比较——方式一＝全年综合所得个税 ＋ 年终奖单独计税税额；方式二＝并入后全年个税总额。两者口径一致，不存在重复计税</li>
                  <li>· 验算示例（公开口径举例）：全年工资 120000 元、年终奖 48000 元、三险一金等扣除 12000 元，并入后应纳税所得额＝120000＋48000−60000−12000＝96000 元，全年个税＝96000×10%−2520＝<b>7080 元</b>；同例单独计税＝工资部分 2280 元 ＋ 年终奖 4590 元＝6870 元，此例单独计税更省 210 元</li>
                  <li>· 若发放时已按单独计税预扣，汇算时发现并入更划算，可在办理个税年度汇算时通过个人所得税 App 在申报表"工资薪金"项下的"奖金计税方式选择"中改为并入综合所得（12366 口径）</li>
                </ul>
              </div>
              <div className="p-5 bg-white border border-brand-border rounded-sm">
                <h3 className="font-bold text-brand-navy mb-2">执行期限与适用条件</h3>
                <ul className="space-y-1.5">
                  <li>· 公告执行至 <b>2027 年 12 月 31 日</b>；2028 年及以后政策尚未明确</li>
                  <li>· 适用对象为居民个人取得的、符合《国家税务总局关于调整个人取得全年一次性奖金等计算征收个人所得税方法问题的通知》（国税发〔2005〕9 号）规定的全年一次性奖金</li>
                  <li>· 本工具为简化估算，不构成税务意见，实际以单位预扣预缴与年度汇算清缴结果为准</li>
                </ul>
              </div>
              <p className="text-xs leading-relaxed">
                口径核验日期：2026 年 10 月。政策与征管尺度可能调整，具体适用请以主管税务机关口径为准。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 常见问题 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-3">年终奖个税常见问题</h2>
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
              口径依据：财政部 税务总局公告 2023 年第 30 号及其所附《按月换算后的综合所得税率表》、
              《中华人民共和国个人所得税法》及所附综合所得年度税率表、国税发〔2005〕9 号。
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
              href="/services/basic"
              className="inline-flex items-center gap-1.5 text-brand-gold hover:text-brand-navy transition-colors"
            >
              查看代理记账服务与费用参考 <ArrowRight size={14} />
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
              href="/tools"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-sm text-sm hover:bg-brand-gold transition-colors"
            >
              财税工具中心
            </Link>
            <Link
              href="/tools/income-tax"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
            >
              <Calculator size={14} /> 个税计算器
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
