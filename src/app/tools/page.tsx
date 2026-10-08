import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  Calculator,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { InlineConsultForm } from '@/components/inline-consult-form';
import { districts } from '@/data/districts';

export const metadata: Metadata = {
  title: '财税工具中心-免费增值税、个税、年终奖计算器与金额大写转换-西安数度财务咨询',
  description:
    '免费财税工具中心：增值税计算器（小规模与一般纳税人、起征点判定）、个税计算器（个体工商户经营所得与工资薪金）、年终奖试算（单独计税与并入综合所得双算对比、临界点提醒）、人民币金额大写转换与账务风险自查。全部免注册、浏览器内计算，计算口径逐条依据现行有效法规原文，并标注口径核验日期。',
  keywords: [
    '财税工具',
    '免费财税工具',
    '增值税计算器',
    '个税计算器',
    '年终奖个税计算器',
    '金额大写转换',
    '账务风险自查',
    '代理记账工具',
    '西安 财税工具',
  ],
  alternates: { canonical: '/tools' },
};

const TOOLS = [
  {
    icon: ShieldCheck,
    name: '账务风险自查',
    href: '/self-check',
    desc: '6 道题多维自测，看看账上有没有明显的风险点。',
    who: '企业老板、财务负责人',
    basis: '常见税务与账务风险点的实务清单（非税务鉴证结论）',
    tag: '自测',
  },
  {
    icon: Calculator,
    name: '增值税计算器',
    href: '/tools/vat',
    desc: '小规模与一般纳税人双模式，含起征点判定、含税价换算与留抵处理。',
    who: '小规模纳税人、一般纳税人的会计',
    basis: '《中华人民共和国增值税法》（2026-01-01 施行）及财政部 税务总局公告 2026 年第 10 号',
    tag: '计算器',
  },
  {
    icon: Calculator,
    name: '个税计算器',
    href: '/tools/income-tax',
    desc: '个体工商户经营所得（五级）与工资薪金（七级）双模式，含个体户减半征收测算。',
    who: '个体工商户、合伙企业、工薪族',
    basis: '《个人所得税法》及实施条例、个体工商户个人所得税计税办法（35 号令）、财政部 税务总局公告 2023 年第 12 号',
    tag: '计算器',
  },
  {
    icon: Calculator,
    name: '年终奖试算',
    href: '/tools/bonus-tax',
    desc: '年终奖单独计税与并入综合所得双算对比，自动提示"多发不如少发"临界点区间。',
    who: 'HR、发放年终奖的企业',
    basis: '财政部 税务总局公告 2023 年第 30 号及其所附《按月换算后的综合所得税率表》（执行至 2027-12-31）',
    tag: '计算器',
  },
  {
    icon: ArrowLeftRight,
    name: '金额大写转换',
    href: '/tools/rmb-uppercase',
    desc: '按票据规范口径转换人民币大写金额，含"零"的写法与票据出票日期大写。',
    who: '出纳、开票与开单人员',
    basis: '《正确填写票据和结算凭证的基本规定》、《票据法》第八条、《支付结算办法》第十二条',
    tag: '转换工具',
  },
];

const FAQ = [
  {
    q: '这些工具免费吗？需要注册吗？会保存我输入的数据吗？',
    a:
      '全部免费、无需注册登录，输入直接在浏览器里计算。金额、工资等输入内容不会被保存，也不会上传到服务器；我们只统计"某个工具被使用过"这类匿名计数，用于判断哪些工具值得继续完善。只有你主动填写并提交咨询表单时，我们才会收到你填写的公司名称与联系电话，用于回电沟通。',
  },
  {
    q: '工具算出来的结果准确吗？依据是什么？',
    a:
      '每个工具的计算口径都逐条依据现行有效的法规原文，并在页面上标明文号与"口径核验日期"（目前为 2026 年 10 月）。例如增值税起征点按《增值税法》第二十三条"未达到起征点免征、达到起征点全额计税"处理，年终奖单独计税按财政部 税务总局公告 2023 年第 30 号的公式计算，人民币大写按票据填写规定附一的举例口径。工具为简化估算，不构成税务意见；正式申报请以主管税务机关口径为准。',
  },
  {
    q: '工具算的税额和实际扣缴的不一样，为什么？',
    a:
      '常见原因有三类：一是预扣预缴与年度汇算清缴的口径不同（如工资薪金平时按累计预扣法，全年结果要等汇算清缴）；二是工具未包含你的全部收入与扣除项目（如劳务报酬、稿酬、大病医疗支出、捐赠等）；三是单位申报时对全年一次性奖金等项目的处理方式与你的选择不同。建议以个人所得税 App 的年度汇算结果为准，需要核对差异可以联系我们。',
  },
  {
    q: '小规模纳税人该用哪个工具？刚好达到起征点要不要交税？',
    a:
      '用增值税计算器。注意《增值税法》（2026-01-01 施行）把起征点规则改成"未达到起征点的免征、达到起征点的全额计税"，即月销售额刚好等于 10 万元（季度 30 万元）属于应税，需要就全额计算缴纳增值税，与旧口径"10 万元以下（含本数）免征"不同；具体征收率与优惠衔接以财政部 税务总局公告 2026 年第 10 号为准。工具在临界值处会给出专门提示。',
  },
  {
    q: '个体工商户的个税该用哪个工具？减半征收怎么算？',
    a:
      '用个税计算器的"经营所得"模式：五级超额累进税率 5%-35%，可扣除成本费用与每年 6 万元减除费用（业主本人的工资不得扣除）。2023 年 1 月 1 日至 2027 年 12 月 31 日，个体工商户年应纳税所得额不超过 200 万元的部分减半征收个人所得税，工具默认勾选该政策并显示"减半前应纳税额、减免额、预计年应纳个人所得税"三行结果。',
  },
  {
    q: '政策有执行期限，到期后工具会更新吗？',
    a:
      '会。我们建立了政策更新台账，逐条记录每个计算口径的生效日、执行到期日与依据文号，并跟踪涉及的工具页面：到期前会复核政策是否延续，及时更新页面文案与计算逻辑。例如年终奖单独计税政策、个体工商户减半征收政策目前均执行至 2027 年 12 月 31 日；增值税法自 2026 年 1 月 1 日起施行，其配套优惠衔接公告的执行期限同样已登记在册。如果你在使用中发现口径与最新政策不一致，欢迎直接告诉我们。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: '财税工具中心',
      url: 'https://www.shuducw.com/tools',
      description:
        '免费财税工具中心：增值税计算器、个税计算器、年终奖试算、人民币金额大写转换与账务风险自查，计算口径逐条依据现行有效法规原文。',
      provider: {
        '@type': 'ProfessionalService',
        name: '西安数度财务咨询有限公司',
        telephone: '029-88456877',
      },
    },
    {
      '@type': 'ItemList',
      name: '财税工具清单',
      itemListElement: TOOLS.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: t.name,
        url: `https://www.shuducw.com${t.href}`,
        description: t.desc,
      })),
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

export default function ToolsPage() {
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
            <nav aria-label="面包屑" className="text-xs text-white/60 mb-5">
              <Link href="/" className="hover:text-brand-gold-light transition-colors">
                首页
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white/80">财税工具</span>
            </nav>
            <div className="inline-block px-4 py-1.5 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold-light text-sm rounded-sm mb-5">
              全部免费 · 免注册 · 浏览器内计算
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">财税工具中心</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              5 个免费工具，覆盖开票、报税、发薪与账务自查的常见场景。每个工具都标明计算口径的
              法规依据与核验日期——先自己算清楚，再决定要不要找专业帮助。
            </p>
          </div>
        </div>
      </section>

      {/* 工具清单 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className="group flex flex-col p-6 bg-white border border-brand-border rounded-sm hover:border-brand-navy transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 bg-brand-navy/5 rounded-sm flex items-center justify-center group-hover:bg-brand-gold/10 transition-colors">
                        <Icon size={18} className="text-brand-navy group-hover:text-brand-gold transition-colors" />
                      </span>
                      <span className="text-base font-bold text-brand-navy">{t.name}</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-brand-bg border border-brand-border text-brand-text-muted rounded-sm whitespace-nowrap">
                      {t.tag}
                    </span>
                  </div>
                  <p className="text-sm text-brand-text leading-relaxed mb-3">{t.desc}</p>
                  <dl className="text-xs text-brand-text-muted leading-relaxed space-y-1 mb-4">
                    <div>
                      <dt className="inline text-brand-text">适合谁用：</dt>
                      <dd className="inline">{t.who}</dd>
                    </div>
                    <div>
                      <dt className="inline text-brand-text">依据：</dt>
                      <dd className="inline">{t.basis}</dd>
                    </div>
                  </dl>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm text-brand-gold group-hover:text-brand-navy transition-colors">
                    打开工具 <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 口径说明 */}
      <section className="bg-white">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-5 flex items-center gap-2.5">
              <BookOpen size={20} className="text-brand-gold" />
              这些工具的计算口径从哪来
            </h2>
            <div className="space-y-4 text-sm text-brand-text-muted leading-relaxed">
              <p>
                所有口径都取自现行有效的法规原文，逐条核对后再写进工具，不凭经验估算。主要来源包括：
              </p>
              <ul className="space-y-1.5">
                <li>· 《中华人民共和国增值税法》（2026-01-01 施行）及财政部 税务总局关于优惠政策衔接的公告（2026 年第 10 号）</li>
                <li>· 《中华人民共和国个人所得税法》及实施条例、个体工商户个人所得税计税办法（35 号令）、个人所得税专项附加扣除暂行办法</li>
                <li>· 财政部 税务总局公告 2023 年第 30 号（全年一次性奖金）、2023 年第 12 号（个体工商户减半征收）、国发〔2023〕13 号（提高专项附加扣除标准）</li>
                <li>· 《票据法》第八条、《支付结算办法》第十二条、第十三条及所附《正确填写票据和结算凭证的基本规定》</li>
              </ul>
              <p>
                每个工具页面底部都标注了<b>口径核验日期</b>，我们另外维护一份政策更新台账，登记每条口径的生效日、
                到期日与依据文号，并在政策到期前复核是否需要更新——避免出现"工具还在按已失效口径计算"的情况。
              </p>
              <p>
                需要说明的是：工具为简化估算，不含你的全部收入与扣除项目，也<b>不构成税务意见</b>。
                涉及申报、筹划或与主管税务机关的口径差异，仍建议由专业人员结合实际资料判断。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 常见问题 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-3">关于这些工具的常见问题</h2>
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
              口径核验日期：2026 年 10 月。政策与征管尺度可能调整，具体适用请以最新政策和主管税务机关口径为准。
            </p>
          </div>
        </div>
      </section>

      {/* 咨询入口 */}
      <section className="bg-white">
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
              href="/services"
              className="inline-flex items-center gap-1.5 text-brand-gold hover:text-brand-navy transition-colors"
            >
              查看全部财税服务 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 区域服务入口 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-10 md:!py-12">
          <h2 className="text-lg font-bold text-brand-navy mb-5 text-center">西安各区财税服务</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {districts.slice(0, 6).map((d) => (
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
        </div>
      </section>
    </>
  );
}
