'use client';

import { useEffect, useRef, useState } from 'react';
import { Calculator, Info, AlertTriangle } from 'lucide-react';
import { trackToolUse } from '@/lib/analytics';
import { bonusAloneTax, compareBonusTax, findBlindSpot, MONTHLY_BRACKETS } from '@/lib/bonus-tax';

/**
 * 年终奖个税试算器（2026-10 上线）
 * 口径依据：财政部 税务总局公告 2023 年第 30 号
 *   应纳税额＝全年一次性奖金收入×适用税率－速算扣除数（税率按 奖金÷12 查按月换算后的综合所得税率表）；
 *   也可选择并入当年综合所得计算纳税；政策执行至 2027-12-31。
 * 计算逻辑全部来自 @/lib/bonus-tax，与 ops/test-bonus-tax-calculator.mjs 测试的是同一份源码。
 */
export function BonusTaxCalculator() {
  const [bonus, setBonus] = useState('');
  const [salary, setSalary] = useState('');
  const [deduction, setDeduction] = useState('');

  const trackedUse = useRef(false);
  useEffect(() => {
    if (trackedUse.current) return;
    if (bonus || salary || deduction) {
      trackedUse.current = true;
      trackToolUse('年终奖个税试算');
    }
  }, [bonus, salary, deduction]);

  const num = (v: string) => {
    const n = Number(v.replace(/,/g, ''));
    return Number.isFinite(n) ? n : NaN;
  };
  const fmt = (n: number) =>
    n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const b = num(bonus);
  const hasBonus = Number.isFinite(b) && b > 0;
  const alone = hasBonus ? bonusAloneTax(b) : null;
  const blind = hasBonus ? findBlindSpot(b) : null;

  const s = num(salary);
  const d = num(deduction);
  const hasCompare = hasBonus && Number.isFinite(s) && s >= 0;
  const cmp = hasCompare ? compareBonusTax(b, s, Number.isFinite(d) && d > 0 ? d : 0) : null;

  const bracket = alone
    ? MONTHLY_BRACKETS.find((x) => alone.lookup <= x.limit) ?? MONTHLY_BRACKETS[MONTHLY_BRACKETS.length - 1]
    : null;

  return (
    <div className="bg-white border border-brand-border rounded-sm p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 bg-brand-gold/10 rounded-sm flex items-center justify-center">
          <Calculator size={20} className="text-brand-gold" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-brand-navy">年终奖个税试算器</h2>
          <p className="text-xs text-brand-text-muted">
            单独计税 / 并入综合所得 双算对比 · 含"多发不如少发"临界点提醒
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="bonus-amount" className="block text-sm font-medium text-brand-navy mb-1.5">
            年终奖（全年一次性奖金，元）<span className="text-red-500">*</span>
          </label>
          <input
            id="bonus-amount"
            type="number"
            min={0}
            value={bonus}
            onChange={(e) => setBonus(e.target.value)}
            placeholder="如 36000"
            className="w-full px-4 py-2.5 border border-brand-border rounded-sm text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20"
          />
        </div>

        <div className="p-4 bg-brand-bg border border-brand-border rounded-sm space-y-4">
          <p className="text-xs text-brand-text-muted leading-relaxed">
            以下三项用于对比"并入综合所得"是否更划算；不填则只显示单独计税结果。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bonus-salary" className="block text-sm font-medium text-brand-navy mb-1.5">
                全年工资等综合所得收入（不含年终奖，元）
              </label>
              <input
                id="bonus-salary"
                type="number"
                min={0}
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="如 120000"
                className="w-full px-4 py-2.5 border border-brand-border rounded-sm text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20"
              />
            </div>
            <div>
              <label htmlFor="bonus-deduction" className="block text-sm font-medium text-brand-navy mb-1.5">
                年度扣除合计（三险一金 + 专项附加扣除，元）
              </label>
              <input
                id="bonus-deduction"
                type="number"
                min={0}
                value={deduction}
                onChange={(e) => setDeduction(e.target.value)}
                placeholder="如 24000（不含 6 万元减除费用）"
                className="w-full px-4 py-2.5 border border-brand-border rounded-sm text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20"
              />
            </div>
          </div>
        </div>

        {alone && bracket && (
          <div className="p-5 bg-brand-bg border border-brand-border rounded-sm space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-brand-text-muted">奖金 ÷ 12（用于查表）</span>
              <span className="text-brand-navy font-medium">{fmt(alone.lookup)} 元</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-text-muted">适用税率 / 速算扣除数</span>
              <span className="text-brand-navy font-medium">
                {(bracket.rate * 100).toFixed(0)}% / {fmt(bracket.quick)} 元
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-text-muted">单独计税应纳税额</span>
              <span className="text-brand-navy font-medium">{fmt(alone.tax)} 元</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-brand-border">
              <span className="text-brand-navy font-bold">税后到手</span>
              <span className="text-brand-gold text-xl font-bold">{fmt(alone.net)} 元</span>
            </div>
            <p className="text-xs text-brand-text-muted">
              实际税负率约 {((alone.tax / b) * 100).toFixed(2)}%
            </p>
          </div>
        )}

        {blind && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-sm flex gap-2.5">
            <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-700 leading-relaxed space-y-1">
              <p className="font-bold">
                ⚠️ 这个金额正好落在"多发不如少发"区间（{fmt(blind.boundary)} 元 ＜ 奖金 ≤ {fmt(blind.upper)} 元）
              </p>
              <p>
                发放 {fmt(blind.boundary)} 元时：应纳税额 {fmt(bonusAloneTax(blind.boundary).tax)} 元，税后到手 {fmt(blind.netAtBoundary)} 元；
                再多发 1 元即跳入 {(blind.nextRate * 100).toFixed(0)}% 档，<strong>多缴 {fmt(blind.jumpPerYuan)} 元</strong>，
                直到奖金超过 {fmt(blind.upper)} 元税后才重新超过临界点水平。
              </p>
              <p>
                建议：将年终奖控制在 {fmt(blind.boundary)} 元（或改为其他福利/工资形式），可少缴约{' '}
                {fmt(alone ? alone.tax - bonusAloneTax(blind.boundary).tax : 0)} 元。具体方案建议结合全年收入一并测算。
              </p>
            </div>
          </div>
        )}

        {cmp && (
          <div className="p-5 bg-white border border-brand-border rounded-sm space-y-2">
            <p className="text-sm font-bold text-brand-navy mb-1">两种计税方式对比（均为全年合计数额，口径一致）</p>
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-brand-text-muted">方式一 · 年终奖单独计税</span>
              <span className="text-brand-navy font-medium whitespace-nowrap">合计 {fmt(cmp.separateTotal)} 元</span>
            </div>
            <p className="text-xs text-brand-text-muted pl-3 leading-relaxed">
              全年综合所得个税 {fmt(cmp.salaryOnlyTax)} 元（未含年终奖）＋ 年终奖单独计税 {fmt(bonusAloneTax(b).tax)} 元
            </p>
            <div className="flex justify-between gap-4 text-sm pt-1">
              <span className="text-brand-text-muted">方式二 · 并入综合所得</span>
              <span className="text-brand-navy font-medium whitespace-nowrap">合计 {fmt(cmp.combinedTotal)} 元</span>
            </div>
            <p className="text-xs text-brand-text-muted pl-3 leading-relaxed">
              并入后全年应纳税所得额 {fmt(cmp.combinedTaxable)} 元（＝工资 {fmt(Number.isFinite(s) ? s : 0)} 元 ＋ 年终奖 {fmt(b)} 元 − 减除费用及扣除），
              全年个税 {fmt(cmp.combinedTotal)} 元；其中工资部分同为 {fmt(cmp.salaryOnlyTax)} 元，年终奖使税额增加{' '}
              {fmt(cmp.combinedTotal - cmp.salaryOnlyTax)} 元
            </p>
            <div className="flex justify-between items-center pt-1 border-t border-brand-border">
              <span className="text-brand-navy font-bold">结论</span>
              <span className="text-brand-gold font-bold">
                {cmp.cheaper === 'separate'
                  ? `选单独计税更省，少缴 ${fmt(cmp.saving)} 元`
                  : cmp.cheaper === 'combined'
                    ? `选并入综合所得更省，少缴 ${fmt(cmp.saving)} 元`
                    : '两种方式税负相同'}
              </span>
            </div>
            <p className="text-xs text-brand-text-muted leading-relaxed">
              提示：年终奖单独计税方式在一个纳税年度内只能使用一次。若发放时单位已按单独计税预扣预缴，而汇算时发现并入更划算，
              可在办理个税年度汇算时，通过个人所得税 App 在申报表"工资薪金"项下的"奖金计税方式选择"中改为并入综合所得
              （国家税务总局 12366 口径）。两种方式均以年度汇算清缴的最终结果为准。本工具为简化估算，
              未考虑劳务报酬、稿酬、特许权使用费等其他综合所得项目，也未考虑大病医疗等据实扣除。
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 p-4 bg-white border border-brand-border rounded-sm flex gap-2.5">
        <Info size={15} className="text-brand-gold flex-shrink-0 mt-0.5" />
        <p className="text-xs text-brand-text-muted leading-relaxed">
          依据：财政部 税务总局《关于延续实施全年一次性奖金个人所得税政策的公告》（2023 年第 30 号）：
          应纳税额＝全年一次性奖金收入×适用税率－速算扣除数，适用税率和速算扣除数按"奖金 ÷ 12"查
          《按月换算后的综合所得税率表》确定；也可选择并入当年综合所得计算纳税；政策执行至 2027-12-31。
          本工具为简化估算，不构成税务意见，实际以预扣预缴与年度汇算清缴结果为准。口径核验日期：2026 年 10 月。
        </p>
      </div>
    </div>
  );
}
