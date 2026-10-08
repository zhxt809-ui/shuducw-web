import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Calculator } from 'lucide-react';
import { RmbUppercaseConverter } from '@/components/rmb-uppercase-converter';
import { InlineConsultForm } from '@/components/inline-consult-form';
import { districts } from '@/data/districts';

export const metadata: Metadata = {
  title: '人民币大写转换器-金额大小写转换-数字转中文大写-西安数度财务咨询',
  description:
    '免费在线人民币大写转换器：输入数字金额实时转为中文大写（壹贰叁…），支持角分与"零""整"规范处理，附官方口径书写规则、含 0 金额的写法举例与票据出票日期大写写法，依据《支付结算办法》附一《正确填写票据和结算凭证的基本规定》，支票、合同、收据填写参考，西安数度财务咨询提供。',
  keywords: [
    '人民币大写转换器',
    '金额大小写转换',
    '数字转中文大写',
    '支票大写金额',
    '支票大写金额怎么写',
    '大写金额规则',
    '金额中间有零怎么写',
    '票据出票日期大写',
    '合同金额大写',
  ],
  alternates: { canonical: '/tools/rmb-uppercase' },
};

const FAQ = [
  {
    q: '金额中间有"0"，中文大写怎么写？',
    a:
      '按《正确填写票据和结算凭证的基本规定》第五条，分四种情形：数字中间有"0"要写"零"（￥1,409.50 写成人民币壹仟肆佰零玖元伍角）；连续几个"0"可以只写一个"零"（￥6,007.14 写成人民币陆仟零柒元壹角肆分）；万位或元位是"0"而千位、角位不是"0"时，可以只写一个"零"也可以不写（￥1,680.32 写成人民币壹仟陆佰捌拾元零叁角贰分，或不写"零"）；角位是"0"而分位不是"0"时，"元"后应写"零"（￥16,409.02 写成人民币壹万陆仟肆佰零玖元零贰分）。',
  },
  {
    q: '"整"和"正"哪个对？什么时候可以写？',
    a:
      '两个都合规。按规定：中文大写金额数字到"元"为止的，在"元"之后应写"整"（或"正"）字；到"角"为止的，"角"之后可以不写"整"（或"正"）字；大写金额数字有"分"的，"分"后面不写"整"（或"正"）字。同一张票据内建议保持一致。',
  },
  {
    q: '大写金额前面要不要写"人民币"？',
    a:
      '要。规定要求中文大写金额数字前应标明"人民币"字样，且大写金额数字应紧接"人民币"字样填写，不得留有空白；票据大写金额栏内未预印"人民币"字样的，应加填"人民币"三字。如果票据上已经印好了"人民币（大写）"，通常直接在后面接写大写金额即可，具体以开户行要求为准。',
  },
  {
    q: '大写金额和小写金额不一致会怎样？',
    a:
      '后果很重：按《中华人民共和国票据法》第八条，票据金额以中文大写和数码同时记载，二者必须一致，不一致的票据无效；按《支付结算办法》第十三条，结算凭证金额二者不一致的，银行不予受理。因此填写后务必逐位核对。',
  },
  {
    q: '票据的出票日期怎么写？写错了会怎样？',
    a:
      '出票日期必须使用中文大写。月份为壹、贰和壹拾的，日期为壹至玖和壹拾、贰拾、叁拾的，应在其前加"零"；日期为拾壹至拾玖的，应在其前加"壹"。例如 1 月 15 日写成零壹月壹拾伍日，10 月 20 日写成零壹拾月零贰拾日。出票日期用小写填写的，银行不予受理；大写日期未按要求规范填写的，银行可予受理，但由此造成损失的由出票人自行承担。',
  },
  {
    q: '大写写错了能涂改吗？金额不足 1 元怎么写？',
    a:
      '金额、出票或签发日期、收款人名称不得更改，更改的票据无效、更改的结算凭证银行不予受理，写错只能作废重开。金额不足 1 元（如 0.42 元）的写法，上述规定未单独举例，实务标准写法是直接写「肆角贰分」，不加"零"；写成「零肆角贰分」一般也予认可。另需注意：角位是 0 而分位有数时必须写"零"（如 ￥16,409.02 写人民币壹万陆仟肆佰零玖元零贰分），这是规定与实务一致的标准写法，不能省略。本工具按上述实务标准输出。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: '人民币大写转换器',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      description:
        '免费在线人民币金额大写转换工具：数字金额实时转中文大写，支持角分与零、整规范处理，依据《支付结算办法》附一《正确填写票据和结算凭证的基本规定》。',
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

export default function RmbUppercasePage() {
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
              免费在线工具 · 票据规范口径
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">人民币大写转换器</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              合同、发票、支票填写金额时需要中文大写。输入数字金额，实时转换为规范大写，
              自动处理"零"与"整"的规则，结果可一键复制。
            </p>
          </div>
        </div>
      </section>

      {/* 转换器 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <RmbUppercaseConverter />
          </div>
        </div>
      </section>

      {/* 常见用途 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-5">什么时候会用到？</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                <h3 className="text-sm font-bold text-brand-navy mb-2">签合同</h3>
                <p className="text-xs text-brand-text-muted leading-relaxed">
                  合同金额一般要求同时写小写与大写，大写不易篡改，是金额确认的规范写法。
                </p>
              </div>
              <div className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                <h3 className="text-sm font-bold text-brand-navy mb-2">开支票</h3>
                <p className="text-xs text-brand-text-muted leading-relaxed">
                  支票金额栏必须用中文大写，"零""整"书写不规范可能被银行退票。
                </p>
              </div>
              <div className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                <h3 className="text-sm font-bold text-brand-navy mb-2">开发票与收据</h3>
                <p className="text-xs text-brand-text-muted leading-relaxed">
                  发票、收据、借条、工资条的金额大写栏，都可直接使用转换结果。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 官方口径书写规则 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-3">大写金额书写规则（官方口径）</h2>
            <div className="w-16 h-[2px] bg-brand-gold mb-5" />
            <p className="text-sm text-brand-text-muted leading-relaxed mb-6">
              票据和结算凭证上的大写金额不是"随便写写"：少写一个"整"、零的位置不对，都可能被银行退回重开。
              以下要点依据中国人民银行《支付结算办法》（银发〔1997〕393 号）附一《正确填写票据和结算凭证的基本规定》。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
              <div className="p-5 bg-white border border-brand-border rounded-sm">
                <h3 className="text-sm font-bold text-brand-navy mb-2">用字：只能写正楷大写数字</h3>
                <p className="text-xs text-brand-text-muted leading-relaxed">
                  应写「壹贰叁肆伍陆柒捌玖拾佰仟万亿元角分零整（正）」，用正楷或行书；不得用「一二三四五六七八九十念毛另（或 0）」代替，也不得自造简化字。
                </p>
              </div>
              <div className="p-5 bg-white border border-brand-border rounded-sm">
                <h3 className="text-sm font-bold text-brand-navy mb-2">"整"字与"人民币"字样</h3>
                <p className="text-xs text-brand-text-muted leading-relaxed">
                  到"元"为止的，"元"后应写"整"（或"正"）；到"角"为止的，"角"后可以不写；有"分"的，"分"后不写"整"。大写金额前应标明"人民币"，并紧接填写、不得留有空白。
                </p>
              </div>
              <div className="p-5 bg-white border border-brand-border rounded-sm">
                <h3 className="text-sm font-bold text-brand-navy mb-2">金额写错了不能改</h3>
                <p className="text-xs text-brand-text-muted leading-relaxed">
                  票据和结算凭证的金额、出票或签发日期、收款人名称不得更改；更改的票据无效，更改的结算凭证银行不予受理（《支付结算办法》第十二条）。
                </p>
              </div>
              <div className="p-5 bg-white border border-brand-border rounded-sm">
                <h3 className="text-sm font-bold text-brand-navy mb-2">大小写必须一致</h3>
                <p className="text-xs text-brand-text-muted leading-relaxed">
                  票据金额以中文大写和数码同时记载，二者必须一致，不一致的票据无效（《票据法》第八条）；结算凭证金额不一致的，银行不予受理（《支付结算办法》第十三条）。
                </p>
              </div>
            </div>

            <h3 className="text-base font-bold text-brand-navy mb-3">含"0"的金额怎么写：官方原文举例</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-brand-border bg-white">
                <thead className="bg-brand-navy/5 text-brand-navy">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold border-b border-brand-border whitespace-nowrap">小写金额</th>
                    <th className="text-left px-4 py-3 font-bold border-b border-brand-border">中文大写写法</th>
                  </tr>
                </thead>
                <tbody className="text-brand-text-muted">
                  {[
                    ['￥1,409.50', '人民币壹仟肆佰零玖元伍角'],
                    ['￥6,007.14', '人民币陆仟零柒元壹角肆分'],
                    ['￥1,680.32', '人民币壹仟陆佰捌拾元零叁角贰分（也可以不写"零"字）'],
                    ['￥107,000.53', '人民币壹拾万柒仟元零伍角叁分（也可写成人民币壹拾万零柒仟元伍角叁分）'],
                    ['￥16,409.02', '人民币壹万陆仟肆佰零玖元零贰分'],
                    ['￥325.04', '人民币叁佰贰拾伍元零肆分'],
                  ].map(([lower, upper]) => (
                    <tr key={lower} className="border-b border-brand-border last:border-0">
                      <td className="px-4 py-3 whitespace-nowrap text-brand-navy font-medium">{lower}</td>
                      <td className="px-4 py-3 leading-relaxed">{upper}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-brand-text-muted mt-2.5 leading-relaxed">
              表中写法逐条摘自上述规定的第五条举例；本页转换结果已逐例与官方举例核对一致。
            </p>
          </div>
        </div>
      </section>

      {/* 票据出票日期 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-3">票据出票日期怎么写</h2>
            <div className="w-16 h-[2px] bg-brand-gold mb-5" />
            <p className="text-sm text-brand-text-muted leading-relaxed mb-4">
              出票日期是退票的高发项，规则和大写金额不一样，依据同前引规定的第六条、第七条：
            </p>
            <ul className="space-y-2.5 text-sm text-brand-text-muted leading-relaxed">
              <li className="flex gap-2">
                <span className="text-brand-gold flex-shrink-0">·</span>
                出票日期必须使用中文大写；<strong className="text-brand-navy font-medium">用小写填写的，银行不予受理</strong>。
              </li>
              <li className="flex gap-2">
                <span className="text-brand-gold flex-shrink-0">·</span>
                月份为壹、贰和壹拾的，日期为壹至玖和壹拾、贰拾、叁拾的，应在其前加"零"。
              </li>
              <li className="flex gap-2">
                <span className="text-brand-gold flex-shrink-0">·</span>
                日期为拾壹至拾玖的，应在其前面加"壹"。
              </li>
              <li className="flex gap-2">
                <span className="text-brand-gold flex-shrink-0">·</span>
                大写日期未按要求规范填写的，银行可予受理，但由此造成损失的，由出票人自行承担。
              </li>
            </ul>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                <p className="text-xs text-brand-text-muted mb-1">1 月 15 日</p>
                <p className="text-base font-bold text-brand-navy tracking-wide">零壹月壹拾伍日</p>
              </div>
              <div className="p-5 bg-brand-bg border border-brand-border rounded-sm">
                <p className="text-xs text-brand-text-muted mb-1">10 月 20 日</p>
                <p className="text-base font-bold text-brand-navy tracking-wide">零壹拾月零贰拾日</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 常见问题 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-3">大写金额常见问题</h2>
            <div className="w-16 h-[2px] bg-brand-gold mb-6" />
            <div className="space-y-4">
              {FAQ.map((item) => (
                <div key={item.q} className="p-5 bg-white border border-brand-border rounded-sm">
                  <h3 className="text-sm font-bold text-brand-navy mb-2">{item.q}</h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-brand-text-muted mt-5 leading-relaxed">
              本页规则依据中国人民银行《支付结算办法》（银发〔1997〕393 号）附一《正确填写票据和结算凭证的基本规定》
              与《中华人民共和国票据法》第八条、《支付结算办法》第十二条、第十三条，口径核验日期：2026 年 10 月。
              各银行在具体受理尺度上可能略有差异，实际填写请以开户行要求为准。
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
              查看代理记账服务与费用参考
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
              href="/tools/vat"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-bg border border-brand-border rounded-sm text-sm text-brand-navy hover:border-brand-navy hover:text-brand-gold transition-colors"
            >
              <Calculator size={14} /> 增值税计算器
            </Link>
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
