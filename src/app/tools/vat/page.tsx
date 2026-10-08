import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Phone, ShieldCheck, BookOpen, Calculator } from 'lucide-react';
import { VatCalculator } from '@/components/vat-calculator';
import { InlineConsultForm } from '@/components/inline-consult-form';
import { districts } from '@/data/districts';

export const metadata: Metadata = {
  title: '增值税计算器-小规模纳税人1%征收率-一般纳税人计算-西安数度财务咨询',
  description:
    '免费在线增值税计算器：小规模纳税人模式（起征点月销售额10万元、3%减按1%征收率）与一般纳税人模式（销项减进项，13%/9%/6%），含2026年《增值税法》施行后起征点判断、1%优惠除外情形、进项不得抵扣情形与常见问题解答，西安数度财务咨询提供。',
  keywords: [
    '增值税计算器',
    '小规模纳税人增值税计算',
    '一般纳税人增值税计算器',
    '小规模1%征收率计算',
    '月销售额10万起征点',
    '刚好10万要不要交增值税',
    '小规模纳税人1%优惠到什么时候',
    '进项税额不得抵扣情形',
    '含税价换算不含税',
    '西安代理记账',
  ],
  alternates: { canonical: '/tools/vat' },
};

const FAQ = [
  {
    q: '月销售额刚好 10 万元，要不要交增值税？',
    a:
      '按《中华人民共和国增值税法》第二十三条：小规模纳税人发生应税交易，销售额未达到起征点的，免征增值税；达到起征点的，依照本法规定全额计算缴纳增值税。衔接公告明确起征点为月销售额 10 万元（按季申报为季度 30 万元，按次纳税为每次/日 1000 元）。因此"刚好 10 万元"属于达到起征点，应就全部销售额计税，与 2026 年之前"月销售额 10 万元以下（含本数）免征"的口径不同。临界情形建议与主管税务机关确认。',
  },
  {
    q: '小规模纳税人 3% 减按 1% 的优惠，有哪些不适用的情况？',
    a:
      '衔接公告明确：自 2026 年 1 月 1 日至 2027 年 12 月 31 日，小规模纳税人发生除销售、出租不动产或者转让土地使用权之外的增值税应税交易，依照 3% 征收率减按 1% 征收。也就是说销售、出租不动产和转让土地使用权不适用 1% 优惠。此外还有单列的几种情形：小规模纳税人（不含自然人）销售自己使用过的固定资产，3% 征收率减按 2%；个人出租住房，3% 征收率减按 1.5%。',
  },
  {
    q: '含税价怎么换算成不含税销售额？',
    a:
      '按简易计税方法，销售额 = 含税销售额 ÷（1 + 规定征收率）。减按 1% 征收时，征收率按 1% 计算，即除以 1.01；适用 3% 征收率时除以 1.03。本计算器已按此换算后再判断起征点、再计算应纳税额。',
  },
  {
    q: '一般纳税人增值税怎么算？哪些进项不能抵扣？',
    a:
      '一般计税方法下，应纳税额 = 当期销项税额 − 当期进项税额（《增值税法》第十四条）。并非所有进项都能抵扣，《增值税法》第二十二条明确不得抵扣的情形包括：适用简易计税方法计税项目对应的进项税额；免征增值税项目对应的进项税额；非正常损失项目对应的进项税额；购进并用于集体福利或者个人消费的货物、服务、无形资产、不动产对应的进项税额；购进并直接用于消费的餐饮服务、居民日常服务和娱乐服务对应的进项税额；以及国务院规定的其他进项税额。',
  },
  {
    q: '进项大于销项怎么办？留抵税额只能结转吗？',
    a:
      '按《增值税法》第二十一条，当期进项税额大于当期销项税额的部分，纳税人可以按照国务院的规定选择结转下期继续抵扣，或者申请退还。本计算器按"结转以后期间抵扣"提示，是否申请退还以国务院规定和主管税务机关要求为准。',
  },
  {
    q: '月销售额超过 10 万元，是按超出部分交税吗？',
    a:
      '不是。按《增值税法》第二十三条，达到起征点的应按全部销售额计算缴纳增值税，而不是只就超过起征点的部分计税。例如月销售额 10.5 万元，是对 10.5 万元全额按征收率计税，不是只对 0.5 万元计税。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: '增值税计算器',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      description:
        '免费在线增值税计算器：小规模纳税人（起征点月销售额10万元、3%减按1%）与一般纳税人（销项减进项）双模式，2026年现行口径。',
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

export default function VatCalculatorPage() {
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
              免费在线工具 · 现行口径
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">增值税计算器</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              小规模纳税人与一般纳税人双模式，按 2026 年施行的《增值税法》及财政部、税务总局衔接公告口径计算，
              结果仅供估算参考。
            </p>
          </div>
        </div>
      </section>

      {/* 计算器 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <VatCalculator />
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
                <h3 className="font-bold text-brand-navy mb-2">小规模纳税人（含个体户）</h3>
                <ul className="space-y-1.5">
                  <li>· 起征点：月销售额 10 万元（按季申报为季度销售额 30 万元，按次纳税为每次/日销售额 1000 元），有效期 2026-01-01 至 2027-12-31——依据财政部、税务总局《关于增值税法施行后增值税优惠政策衔接事项的公告》</li>
                  <li>· 判断口径：《增值税法》第二十三条规定"销售额未达到起征点的，免征增值税；达到起征点的，依照本法规定全额计算缴纳增值税"。据此，销售额<strong className="text-brand-navy font-medium">未达到</strong> 10 万元免征；<strong className="text-brand-navy font-medium">刚好等于或超过</strong> 10 万元，按全部销售额计税（不是只算超出部分）</li>
                  <li>· 换算：销售额 = 含税销售额 ÷（1 + 规定征收率）；减按 1% 征收时除以 1.01</li>
                  <li>· 征收率：适用 3% 征收率的应税销售收入，减按 1% 征收（2026-01-01 至 2027-12-31）</li>
                  <li>· 不适用 1% 优惠的情形：销售、出租不动产，转让土地使用权（同一公告排除）</li>
                  <li>· 单列情形：小规模纳税人（不含自然人）销售自己使用过的固定资产，3% 减按 2%；个人出租住房，3% 减按 1.5%</li>
                </ul>
              </div>
              <div className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                <h3 className="font-bold text-brand-navy mb-2">一般纳税人</h3>
                <ul className="space-y-1.5">
                  <li>· 应纳税额 = 当期销项税额 − 当期进项税额（《增值税法》第十四条）；进项大于销项的部分，可选择结转下期继续抵扣或按规定申请退还（第二十一条）</li>
                  <li>· 进项税额需凭法律、行政法规或国务院规定的增值税扣税凭证抵扣；用于简易计税项目、免征增值税项目、非正常损失、集体福利或个人消费，以及直接用于消费的餐饮、居民日常和娱乐服务的进项税额不得抵扣（第二十二条）</li>
                  <li>· 税率：13%（货物、加工修理修配、有形动产租赁等）、9%（交通运输、邮政、基础电信、建筑、不动产租赁、销售不动产、转让土地使用权等）、6%（其他服务、无形资产）（《增值税法》第十条）</li>
                  <li>· 小规模纳税人标准为年应征增值税销售额未超过 500 万元（《增值税法》第九条）</li>
                </ul>
              </div>
              <p className="text-xs leading-relaxed">
                提示：城建税、教育费附加等附加税费需以实际缴纳的增值税为计税依据另行计算，
                小规模纳税人或可享受相关减免优惠，以主管税务机关核定为准。政策如有调整，以税务机关最新公布为准。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 常见问题 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-3">增值税常见问题</h2>
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
              口径依据：《中华人民共和国增值税法》（2026 年 1 月 1 日施行）第八条至第十一条、第十四条、第二十一条至第二十三条，
              财政部、税务总局《关于增值税法施行后增值税优惠政策衔接事项的公告》（2026 年第 10 号），
              以及国家税务总局关于起征点标准等增值税征管事项的公告及其官方解读。口径核验日期：2026 年 10 月。
              政策与征管尺度可能调整，临界情形与实际申报请以主管税务机关口径为准。
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
            <Link href="/services/basic" className="inline-flex items-center gap-1.5 text-brand-gold hover:text-brand-navy transition-colors">
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
              href="/tools/income-tax"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
            >
              <Calculator size={14} /> 个税计算器
            </Link>
            <Link
              href="/tools/bonus-tax"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
            >
              <Calculator size={14} /> 年终奖试算
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
