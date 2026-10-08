'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeftRight, Copy, Check } from 'lucide-react';
import { trackToolUse } from '@/lib/analytics';

const DIGITS = '零壹贰叁肆伍陆柒捌玖';
const SUB_UNITS = ['', '拾', '佰', '仟'];
const GROUP_UNITS = ['', '万', '亿', '万亿'];

/** 整数部分转中文大写（不含"元"），支持到仟兆位 */
function integerToUppercase(numStr: string): string {
  if (/^0+$/.test(numStr)) return '';
  const groups: string[] = [];
  for (let end = numStr.length; end > 0; end -= 4) {
    const start = Math.max(0, end - 4);
    groups.unshift(numStr.slice(start, end));
  }
  let out = '';
  for (let gi = 0; gi < groups.length; gi++) {
    const groupStr = groups[gi];
    const unitIdx = groups.length - 1 - gi;
    const groupHasValue = /[^0]/.test(groupStr);
    let groupOut = '';
    let zero = false;
    for (let di = 0; di < groupStr.length; di++) {
      const d = Number(groupStr[di]);
      const pos = groupStr.length - 1 - di;
      if (d === 0) {
        zero = true;
      } else {
        if (zero && (groupOut || out)) groupOut += '零';
        groupOut += DIGITS[d] + SUB_UNITS[pos];
        zero = false;
      }
    }
    if (groupHasValue) {
      out += groupOut + GROUP_UNITS[unitIdx];
    }
  }
  return out;
}

/** 金额（分）转人民币大写，依据《支付结算办法》附一《正确填写票据和结算凭证的基本规定》 */
function centsToUppercase(cents: number): string {
  const intPart = Math.floor(cents / 100);
  const jiao = Math.floor(cents / 10) % 10;
  const fen = cents % 10;
  const yuan = integerToUppercase(String(intPart));

  if (intPart === 0 && jiao === 0 && fen === 0) return '零元整';
  if (intPart === 0) {
    // 纯角分（不足 1 元）：实务标准写法直接写"X角Y分"，不加"零"（如 ￥0.42 → 肆角贰分、￥0.05 → 伍分）。
    // 官方附一《正确填写票据和结算凭证的基本规定》未单独规定不足 1 元的写法；
    // 经实务确认，写成"零肆角贰分"一般也予认可，本工具按标准写法（不加"零"）输出。
    let out = '';
    if (jiao > 0) out += DIGITS[jiao] + '角';
    if (fen > 0) out += DIGITS[fen] + '分';
    return out;
  }
  let out = yuan + '元';
  if (jiao === 0 && fen === 0) return out + '整';
  if (jiao === 0 && fen > 0) return out + '零' + DIGITS[fen] + '分'; // 角位 0 分位非 0 → 元后写零
  out += DIGITS[jiao] + '角'; // 到角为止，可不写"整"
  if (fen > 0) out += DIGITS[fen] + '分';
  return out;
}

const EXAMPLES = ['1680.32', '6007.14', '16409.02', '1409.50', '107000.53'];

/**
 * 人民币金额大写转换器（2026-09 上线）
 * 口径依据：《支付结算办法》（银发〔1997〕393号）附一《正确填写票据和结算凭证的基本规定》
 */
export function RmbUppercaseConverter() {
  const [raw, setRaw] = useState('');
  const [copied, setCopied] = useState(false);

  // 埋点：首次填入金额即上报一次「工具使用」
  const trackedUse = useRef(false);
  useEffect(() => {
    if (trackedUse.current) return;
    if (raw) {
      trackedUse.current = true;
      trackToolUse('人民币大写转换器');
    }
  }, [raw]);

  const parsed = useMemo(() => {
    const cleaned = raw.replace(/[¥￥,\s]/g, '');
    if (!cleaned) return { state: 'empty' as const };
    if (!/^\d*\.?\d*$/.test(cleaned) || cleaned === '.' || cleaned === '')
      return { state: 'invalid' as const };
    const value = Number(cleaned);
    if (!Number.isFinite(value)) return { state: 'invalid' as const };
    if (value < 0) return { state: 'negative' as const };
    if (value >= 100000000000000) return { state: 'tooLarge' as const }; // 超过百万亿级不支持
    const cents = Math.round(value * 100);
    return { state: 'ok' as const, cents, value };
  }, [raw]);

  const result = parsed.state === 'ok' ? centsToUppercase(parsed.cents) : '';

  const displayLower =
    parsed.state === 'ok'
      ? '¥' + parsed.value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '';

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // 剪贴板不可用时静默失败，用户可手动选中复制
    }
  };

  return (
    <div className="bg-white border border-brand-border rounded-sm p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 bg-brand-gold/10 rounded-sm flex items-center justify-center">
          <ArrowLeftRight size={20} className="text-brand-gold" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-brand-navy">人民币大写转换器</h2>
          <p className="text-xs text-brand-text-muted">数字金额转中文大写 · 票据填写规范口径</p>
        </div>
      </div>

      <div>
        <label htmlFor="rmb-amount" className="block text-sm font-medium text-brand-navy mb-1.5">
          金额（元）<span className="text-red-500">*</span>
        </label>
        <input
          id="rmb-amount"
          type="text"
          inputMode="decimal"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="如 12345.67（支持粘贴带 ¥ 或千分位的金额）"
          className="w-full px-4 py-3 border border-brand-border rounded-sm text-lg focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20"
        />
        {/* 示例速填 */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs text-brand-text-muted">试试：</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setRaw(ex)}
              className="px-2.5 py-1 text-xs bg-brand-bg border border-brand-border rounded-sm text-brand-text hover:border-brand-navy hover:text-brand-navy transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* 结果 */}
      {parsed.state === 'ok' && (
        <div className="mt-5 p-5 bg-brand-bg border border-brand-border rounded-sm space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-brand-text-muted">小写金额</span>
            </div>
            <p className="text-lg text-brand-navy font-medium">{displayLower}</p>
          </div>
          <div className="border-t border-brand-border pt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-brand-text-muted">中文大写（票据用）</span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs text-brand-gold hover:text-brand-navy transition-colors"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
            <p className="text-xl md:text-2xl text-brand-navy font-bold tracking-wider break-all">{result}</p>
          </div>
        </div>
      )}
      {parsed.state === 'invalid' && (
        <p className="mt-4 text-sm text-red-500">请输入正确的金额数字，如 1234.56</p>
      )}
      {parsed.state === 'negative' && <p className="mt-4 text-sm text-red-500">票据大写金额不支持负数，请输入正数</p>}
      {parsed.state === 'tooLarge' && <p className="mt-4 text-sm text-red-500">金额超出可转换范围（百万亿以内）</p>}

      {/* 规则说明 */}
      <div className="mt-6 p-4 border border-brand-border rounded-sm bg-white">
        <h3 className="text-sm font-bold text-brand-navy mb-2">大写金额书写规则（票据口径）</h3>
        <ul className="text-xs text-brand-text-muted leading-relaxed space-y-1">
          <li>· 数字对照：0-9 → 零壹贰叁肆伍陆柒捌玖；位名：拾、佰、仟、万、亿</li>
          <li>· 到"元"为止的，"元"后应写"整"（或"正"）字；到"角"为止的，"角"后可以不写"整"字（本工具默认不写）；有"分"的，"分"后不写"整"</li>
          <li>· 大写金额前应标明"人民币"字样并紧接填写、不得留有空白；票据栏内未预印"人民币"字样的，应加填"人民币"三字</li>
          <li>· 金额中间有"0"时写"零"字，如 1409.50 → 壹仟肆佰零玖元伍角</li>
          <li>· 连续几个"0"时只写一个"零"字，如 6007.14 → 陆仟零柒元壹角肆分</li>
          <li>· "角"位是"0"而"分"位不是"0"时，"元"后应写"零"字，如 16409.02 → 壹万陆仟肆佰零玖元零贰分（实务标准写法，必须写"零"）</li>
          <li>· 金额不足 1 元的，直接写"X角Y分"不加"零"，如 0.42 → 肆角贰分、0.05 → 伍分（写成"零肆角贰分"一般也予认可）</li>
        </ul>
        <p className="text-xs text-brand-text-muted mt-2.5 leading-relaxed">
          依据：《支付结算办法》（银发〔1997〕393号）附一《正确填写票据和结算凭证的基本规定》。
          本工具转换结果供书写参考，票据填写请以银行要求为准。
        </p>
      </div>
    </div>
  );
}
