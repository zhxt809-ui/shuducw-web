'use client';

import { useEffect, useRef, useState } from 'react';
import { Calculator, Info } from 'lucide-react';
import { trackToolUse } from '@/lib/analytics';

type Mode = 'small' | 'general';

/**
 * 增值税计算器（2026-09 上线）
 * 口径依据（现行有效）：
 * - 《增值税法》2026-01-01 施行；财政部 税务总局衔接公告：2026-01-01 至 2027-12-31，
 *   小规模纳税人起征点为月销售额 10 万元（按月计税期间）；适用 3% 征收率的减按 1% 征收。
 * - 一般纳税人按"销项 − 进项"计算，税率 13% / 9% / 6%。
 * 结果为简化估算，实际以主管税务机关核定为准。
 */
export function VatCalculator() {
  const [mode, setMode] = useState<Mode>('small');
  // 小规模
  const [smallSales, setSmallSales] = useState('');
  const [taxInclusive, setTaxInclusive] = useState(true);
  // 一般纳税人
  const [generalSales, setGeneralSales] = useState('');
  const [rate, setRate] = useState('0.13');
  const [inputVat, setInputVat] = useState('');

  // 埋点：首次填入金额即上报一次「工具使用」，避免每次按键重复上报
  const trackedUse = useRef(false);
  useEffect(() => {
    if (trackedUse.current) return;
    if (smallSales || generalSales || inputVat) {
      trackedUse.current = true;
      trackToolUse('增值税计算器');
    }
  }, [smallSales, generalSales, inputVat]);

  const num = (v: string) => {
    const n = Number(v.replace(/,/g, ''));
    return Number.isFinite(n) ? n : NaN;
  };

  const fmt = (n: number) =>
    n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // 小规模计算
  const s = num(smallSales);
  const smallHasInput = Number.isFinite(s) && s >= 0;
  const monthlyExclTax = taxInclusive ? s / 1.01 : s;
  const smallFree = smallHasInput && monthlyExclTax <= 100000;
  const smallTax = smallFree ? 0 : monthlyExclTax * 0.01;

  // 一般纳税人计算
  const gSales = num(generalSales);
  const gInput = num(inputVat);
  const r = Number(rate);
  const generalHasInput = Number.isFinite(gSales) && gSales >= 0 && Number.isFinite(gInput) && gInput >= 0;
  const outputVat = generalHasInput ? gSales * r : NaN;
  const payable = generalHasInput ? Math.max(0, outputVat - gInput) : NaN;
  const credit = generalHasInput && gInput > outputVat;

  return (
    <div className="bg-white border border-brand-border rounded-sm p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 bg-brand-gold/10 rounded-sm flex items-center justify-center">
          <Calculator size={20} className="text-brand-gold" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-brand-navy">增值税计算器</h2>
          <p className="text-xs text-brand-text-muted">小规模 / 一般纳税人 双模式 · 2026 年现行口径</p>
        </div>
      </div>

      {/* 模式切换 */}
      <div className="flex gap-2 mb-6">
        {([
          ['small', '小规模纳税人'],
          ['general', '一般纳税人'],
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

      {mode === 'small' ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="vat-small-sales" className="block text-sm font-medium text-brand-navy mb-1.5">
              月销售额（元）<span className="text-red-500">*</span>
            </label>
            <input
              id="vat-small-sales"
              type="number"
              min={0}
              value={smallSales}
              onChange={(e) => setSmallSales(e.target.value)}
              placeholder="如 80000"
              className="w-full px-4 py-2.5 border border-brand-border rounded-sm text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20"
            />
            <label className="flex items-center gap-2 mt-2 text-xs text-brand-text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={taxInclusive}
                onChange={(e) => setTaxInclusive(e.target.checked)}
                className="accent-[#1B3A5C]"
              />
              上方金额为含税收入（未勾选则按不含税计算）
            </label>
          </div>

          {smallHasInput && (
            <div className="p-5 bg-brand-bg border border-brand-border rounded-sm space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brand-text-muted">换算不含税月销售额</span>
                <span className="text-brand-navy font-medium">{fmt(monthlyExclTax)} 元</span>
              </div>
              {smallFree ? (
                <div className="pt-1">
                  <p className="text-green-600 font-bold">未达起征点，免征增值税</p>
                  <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                    月销售额未超过 10 万元（2026-01-01 至 2027-12-31 起征点标准），免征增值税；
                    按季申报的，季度销售额未超过 30 万元同样适用。
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-text-muted">适用征收率</span>
                    <span className="text-brand-navy font-medium">3% 减按 1%</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-brand-border">
                    <span className="text-brand-navy font-bold">预计月应纳增值税</span>
                    <span className="text-brand-gold text-xl font-bold">{fmt(smallTax)} 元</span>
                  </div>
                  <p className="text-xs text-brand-text-muted">
                    年化参考：约 {fmt(smallTax * 12)} 元（不含城建税及附加）
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="vat-g-sales" className="block text-sm font-medium text-brand-navy mb-1.5">
                月销售额（不含税）<span className="text-red-500">*</span>
              </label>
              <input
                id="vat-g-sales"
                type="number"
                min={0}
                value={generalSales}
                onChange={(e) => setGeneralSales(e.target.value)}
                placeholder="如 500000"
                className="w-full px-4 py-2.5 border border-brand-border rounded-sm text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20"
              />
            </div>
            <div>
              <label htmlFor="vat-g-rate" className="block text-sm font-medium text-brand-navy mb-1.5">
                适用税率
              </label>
              <select
                id="vat-g-rate"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full px-4 py-2.5 border border-brand-border rounded-sm text-sm bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20"
              >
                <option value="0.13">13%（货物销售）</option>
                <option value="0.09">9%（交通运输/建筑等）</option>
                <option value="0.06">6%（现代服务）</option>
              </select>
            </div>
            <div>
              <label htmlFor="vat-g-input" className="block text-sm font-medium text-brand-navy mb-1.5">
                月进项税额
              </label>
              <input
                id="vat-g-input"
                type="number"
                min={0}
                value={inputVat}
                onChange={(e) => setInputVat(e.target.value)}
                placeholder="如 30000"
                className="w-full px-4 py-2.5 border border-brand-border rounded-sm text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20"
              />
            </div>
          </div>

          {generalHasInput && (
            <div className="p-5 bg-brand-bg border border-brand-border rounded-sm space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brand-text-muted">销项税额</span>
                <span className="text-brand-navy font-medium">{fmt(outputVat)} 元</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-text-muted">可抵扣进项税额</span>
                <span className="text-brand-navy font-medium">{fmt(gInput)} 元</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-brand-border">
                <span className="text-brand-navy font-bold">本期应纳增值税</span>
                <span className="text-brand-gold text-xl font-bold">{fmt(payable)} 元</span>
              </div>
              {credit && (
                <p className="text-xs text-brand-text-muted">
                  进项大于销项，差额 {fmt(gInput - outputVat)} 元形成留抵税额，结转以后期间抵扣。
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-5 p-4 bg-white border border-brand-border rounded-sm flex gap-2.5">
        <Info size={15} className="text-brand-gold flex-shrink-0 mt-0.5" />
        <p className="text-xs text-brand-text-muted leading-relaxed">
          依据：《中华人民共和国增值税法》（2026-01-01 施行）及财政部、税务总局衔接公告
          （小规模纳税人起征点月销售额 10 万元、适用 3% 征收率的减按 1%，有效期至 2027-12-31）。
          城建税及附加需另行计算，小规模纳税人或可享受减免优惠，以主管税务机关核定为准。
          本工具为简化估算，不构成税务意见，实际以税务机关核定与最新政策为准。
        </p>
      </div>
    </div>
  );
}
