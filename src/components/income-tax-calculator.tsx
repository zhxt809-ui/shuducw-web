'use client';

import { useState } from 'react';
import { Calculator, Info } from 'lucide-react';

type Mode = 'business' | 'salary';

// 经营所得五级超额累进（个人所得税法 附表二）
const BUSINESS_BRACKETS = [
  { limit: 30000, rate: 0.05, quick: 0 },
  { limit: 90000, rate: 0.1, quick: 1500 },
  { limit: 300000, rate: 0.2, quick: 10500 },
  { limit: 500000, rate: 0.3, quick: 40500 },
  { limit: Infinity, rate: 0.35, quick: 65500 },
];

// 综合所得七级超额累进（个人所得税法 附表一）
const SALARY_BRACKETS = [
  { limit: 36000, rate: 0.03, quick: 0 },
  { limit: 144000, rate: 0.1, quick: 2520 },
  { limit: 300000, rate: 0.2, quick: 16920 },
  { limit: 420000, rate: 0.25, quick: 31920 },
  { limit: 660000, rate: 0.3, quick: 52920 },
  { limit: 960000, rate: 0.35, quick: 85920 },
  { limit: Infinity, rate: 0.45, quick: 181920 },
];

function bracketTax(taxable: number, brackets: typeof BUSINESS_BRACKETS): { tax: number; rate: number } | null {
  if (!Number.isFinite(taxable) || taxable < 0) return null;
  for (const b of brackets) {
    if (taxable <= b.limit) {
      return { tax: taxable * b.rate - b.quick, rate: b.rate };
    }
  }
  return null;
}

/**
 * 个税计算器（2026-09 上线）
 * 口径依据（现行有效）：
 * - 经营所得：5%-35% 五级超额累进（个体户适用）
 * - 综合所得（工资薪金简化年度算法）：3%-45% 七级，减除费用 6 万元/年
 * 结果为简化估算，实际以预扣预缴/汇算清缴为准。
 */
export function IncomeTaxCalculator() {
  const [mode, setMode] = useState<Mode>('business');
  // 经营所得
  const [bizIncome, setBizIncome] = useState('');
  const [bizCost, setBizCost] = useState('');
  // 工资薪金
  const [salaryIncome, setSalaryIncome] = useState('');
  const [salaryDeduction, setSalaryDeduction] = useState('');
  const [socialInsurance, setSocialInsurance] = useState('');

  const num = (v: string) => {
    const n = Number(v.replace(/,/g, ''));
    return Number.isFinite(n) ? n : NaN;
  };
  const fmt = (n: number) =>
    n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // 经营所得
  const bi = num(bizIncome);
  const bc = num(bizCost);
  const bizHasInput = Number.isFinite(bi) && bi >= 0 && Number.isFinite(bc) && bc >= 0;
  const bizTaxable = bizHasInput ? Math.max(0, bi - bc) : NaN;
  const bizResult = bizHasInput ? bracketTax(bizTaxable, BUSINESS_BRACKETS) : null;
  const bizEffective = bizHasInput && bi > 0 ? (bizResult ? bizResult.tax : 0) / bi : 0;

  // 工资薪金
  const si = num(salaryIncome);
  const sd = Number.isFinite(num(salaryDeduction)) ? num(salaryDeduction) : 0;
  const ssi = Number.isFinite(num(socialInsurance)) ? num(socialInsurance) : 0;
  const salaryHasInput = Number.isFinite(si) && si >= 0;
  const salaryTaxable = salaryHasInput ? Math.max(0, si - 60000 - sd - ssi) : NaN;
  const salaryResult = salaryHasInput ? bracketTax(salaryTaxable, SALARY_BRACKETS) : null;
  const salaryMonthly = salaryHasInput && salaryResult ? salaryResult.tax / 12 : NaN;

  return (
    <div className="bg-white border border-brand-border rounded-sm p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 bg-brand-gold/10 rounded-sm flex items-center justify-center">
          <Calculator size={20} className="text-brand-gold" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-brand-navy">个人所得税计算器</h2>
          <p className="text-xs text-brand-text-muted">经营所得（个体户） / 工资薪金 双模式 · 现行税率表</p>
        </div>
      </div>

      {/* 模式切换 */}
      <div className="flex gap-2 mb-6">
        {([
          ['business', '经营所得（个体户）'],
          ['salary', '工资薪金'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors border ${
              mode === key
                ? 'bg-brand-navy text-white border-brand-navy'
                : 'bg-white text-brand-text border-brand-border hover:border-brand-navy'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'business' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="iit-biz-income" className="block text-sm font-medium text-brand-navy mb-1.5">
                年收入总额（元）<span className="text-red-500">*</span>
              </label>
              <input
                id="iit-biz-income"
                type="number"
                min={0}
                value={bizIncome}
                onChange={(e) => setBizIncome(e.target.value)}
                placeholder="如 600000"
                className="w-full px-4 py-2.5 border border-brand-border rounded-sm text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20"
              />
            </div>
            <div>
              <label htmlFor="iit-biz-cost" className="block text-sm font-medium text-brand-navy mb-1.5">
                年成本费用（元）
              </label>
              <input
                id="iit-biz-cost"
                type="number"
                min={0}
                value={bizCost}
                onChange={(e) => setBizCost(e.target.value)}
                placeholder="如 400000"
                className="w-full px-4 py-2.5 border border-brand-border rounded-sm text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20"
              />
            </div>
          </div>

          {bizHasInput && bizResult && (
            <div className="p-5 bg-brand-bg border border-brand-border rounded-sm space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brand-text-muted">应纳税所得额（收入 − 成本费用）</span>
                <span className="text-brand-navy font-medium">{fmt(bizTaxable)} 元</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-text-muted">适用税率</span>
                <span className="text-brand-navy font-medium">{(bizResult.rate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-brand-border">
                <span className="text-brand-navy font-bold">预计年应纳个人所得税</span>
                <span className="text-brand-gold text-xl font-bold">{fmt(Math.max(0, bizResult.tax))} 元</span>
              </div>
              {bi > 0 && (
                <p className="text-xs text-brand-text-muted">
                  占收入比约 {(bizEffective * 100).toFixed(1)}%（实际以查账征收或核定方式为准）
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="iit-salary" className="block text-sm font-medium text-brand-navy mb-1.5">
                年税前收入（元）<span className="text-red-500">*</span>
              </label>
              <input
                id="iit-salary"
                type="number"
                min={0}
                value={salaryIncome}
                onChange={(e) => setSalaryIncome(e.target.value)}
                placeholder="如 200000"
                className="w-full px-4 py-2.5 border border-brand-border rounded-sm text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20"
              />
            </div>
            <div>
              <label htmlFor="iit-social" className="block text-sm font-medium text-brand-navy mb-1.5">
                年社保公积金（个人部分）
              </label>
              <input
                id="iit-social"
                type="number"
                min={0}
                value={socialInsurance}
                onChange={(e) => setSocialInsurance(e.target.value)}
                placeholder="如 24000"
                className="w-full px-4 py-2.5 border border-brand-border rounded-sm text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20"
              />
            </div>
            <div>
              <label htmlFor="iit-deduction" className="block text-sm font-medium text-brand-navy mb-1.5">
                年专项附加扣除合计
              </label>
              <input
                id="iit-deduction"
                type="number"
                min={0}
                value={salaryDeduction}
                onChange={(e) => setSalaryDeduction(e.target.value)}
                placeholder="如 24000（子女教育+房贷利息等）"
                className="w-full px-4 py-2.5 border border-brand-border rounded-sm text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20"
              />
            </div>
          </div>

          {salaryHasInput && salaryResult && (
            <div className="p-5 bg-brand-bg border border-brand-border rounded-sm space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brand-text-muted">应纳税所得额（年收入 − 6 万 − 三险一金 − 专项附加）</span>
                <span className="text-brand-navy font-medium">{fmt(salaryTaxable)} 元</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-text-muted">适用税率</span>
                <span className="text-brand-navy font-medium">{(salaryResult.rate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-brand-border">
                <span className="text-brand-navy font-bold">预计年应纳个人所得税</span>
                <span className="text-brand-gold text-xl font-bold">{fmt(Math.max(0, salaryResult.tax))} 元</span>
              </div>
              <p className="text-xs text-brand-text-muted">月均约 {fmt(salaryMonthly)} 元</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 p-4 bg-white border border-brand-border rounded-sm flex gap-2.5">
        <Info size={15} className="text-brand-gold flex-shrink-0 mt-0.5" />
        <p className="text-xs text-brand-text-muted leading-relaxed">
          依据：《中华人民共和国个人所得税法》及所附税率表（经营所得 5%-35% 五级；综合所得 3%-45% 七级，
          减除费用 6 万元/年）。工资薪金实际按累计预扣法逐月计算，此处为简化年度估算；
          经营所得实际按查账征收或核定方式计征。本工具不构成税务意见，
          专项附加扣除以实际符合条件的项目为准，具体以税务机关核定与最新政策为准。
        </p>
      </div>
    </div>
  );
}
