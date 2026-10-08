/**
 * 年终奖（全年一次性奖金）个税计算 —— 纯函数库
 *
 * 口径依据（现行有效，2026-10 核验）：
 * - 财政部 税务总局《关于延续实施全年一次性奖金个人所得税政策的公告》（2023 年第 30 号）：
 *   一、居民个人取得全年一次性奖金，符合规定的，不并入当年综合所得，以全年一次性奖金收入除以 12 个月
 *      得到的数额，按照本公告所附《按月换算后的综合所得税率表》确定适用税率和速算扣除数，单独计算纳税。
 *      计算公式：应纳税额＝全年一次性奖金收入×适用税率－速算扣除数。
 *   二、也可以选择并入当年综合所得计算纳税。
 *   三、本公告执行至 2027 年 12 月 31 日。
 * - 按月换算后的综合所得税率表（公告附件，与广东省税务局公布附件逐格核对一致）：
 *   不超过 3000 元 3%/0；3000-12000 元 10%/210；12000-25000 元 20%/1410；25000-35000 元 25%/2660；
 *   35000-55000 元 30%/4410；55000-80000 元 35%/7160；超过 80000 元 45%/15160。
 * - 综合所得年度七级税率表用于"并入综合所得"的对比计算。
 */

export interface Bracket {
  limit: number;
  rate: number;
  quick: number;
}

/** 按月换算后的综合所得税率表（年终奖单独计税用，公告 2023 年第 30 号附件） */
export const MONTHLY_BRACKETS: Bracket[] = [
  { limit: 3000, rate: 0.03, quick: 0 },
  { limit: 12000, rate: 0.1, quick: 210 },
  { limit: 25000, rate: 0.2, quick: 1410 },
  { limit: 35000, rate: 0.25, quick: 2660 },
  { limit: 55000, rate: 0.3, quick: 4410 },
  { limit: 80000, rate: 0.35, quick: 7160 },
  { limit: Infinity, rate: 0.45, quick: 15160 },
];

/** 综合所得年度税率表（七级，用于并入综合所得对比） */
export const ANNUAL_BRACKETS: Bracket[] = [
  { limit: 36000, rate: 0.03, quick: 0 },
  { limit: 144000, rate: 0.1, quick: 2520 },
  { limit: 300000, rate: 0.2, quick: 16920 },
  { limit: 420000, rate: 0.25, quick: 31920 },
  { limit: 660000, rate: 0.3, quick: 52920 },
  { limit: 960000, rate: 0.35, quick: 85920 },
  { limit: Infinity, rate: 0.45, quick: 181920 },
];

function findBracket(lookup: number, brackets: Bracket[]): Bracket {
  for (const b of brackets) {
    if (lookup <= b.limit) return b;
  }
  return brackets[brackets.length - 1];
}

/** 按年度税率表计算应纳税额（综合所得） */
export function annualIncomeTax(taxable: number): number {
  if (!Number.isFinite(taxable) || taxable <= 0) return 0;
  const b = findBracket(taxable, ANNUAL_BRACKETS);
  return Math.max(0, taxable * b.rate - b.quick);
}

export interface AloneResult {
  /** 奖金除以 12 后的数额（用于查表） */
  lookup: number;
  rate: number;
  quick: number;
  /** 应纳税额 */
  tax: number;
  /** 税后到手 */
  net: number;
}

/** 年终奖单独计税：应纳税额＝奖金×适用税率－速算扣除数（税率按 奖金÷12 查按月换算表） */
export function bonusAloneTax(bonus: number): AloneResult {
  const safe = Number.isFinite(bonus) && bonus > 0 ? bonus : 0;
  const lookup = safe / 12;
  const b = findBracket(lookup, MONTHLY_BRACKETS);
  const tax = Math.max(0, safe * b.rate - b.quick);
  return { lookup, rate: b.rate, quick: b.quick, tax, net: safe - tax };
}

/**
 * 年终奖"临界点"区间（多发不如少发）：
 * 在每个税率级距上界之后，存在一段区间，其税后到手反而低于上界时的税后到手。
 * 上界 = 该级距上限 × 12（奖金口径）；区间右端由 税后 = 上界税后 反解得到。
 * 例：36000 元（税率 3%）税后 34920 元；发 36001 元即跳入 10% 档、多缴 2310.10 元，
 * 直到 38566.67 元税后才与 36000 元持平——即 36000 < 奖金 ≤ 38566.67 为"多发不如少发"区间。
 */
export interface BlindSpot {
  /** 临界点（该级距上界，建议发放金额） */
  boundary: number;
  /** 区间右端（超过此金额后税后重新高于临界点） */
  upper: number;
  /** 临界点的税后到手 */
  netAtBoundary: number;
  /** 临界点后一档的税率 */
  nextRate: number;
  /** 临界点多发 1 元时多缴的税额 */
  jumpPerYuan: number;
}

export function computeBlindSpots(): BlindSpot[] {
  const spots: BlindSpot[] = [];
  for (let i = 0; i < MONTHLY_BRACKETS.length - 1; i++) {
    const boundary = MONTHLY_BRACKETS[i].limit * 12;
    const next = MONTHLY_BRACKETS[i + 1];
    const netAtBoundary = bonusAloneTax(boundary).net;
    // 下一级距内：税后 = 奖金 −（奖金×税率 − 速算扣除数）= 奖金×(1−税率) + 速算扣除数
    // 右端按四舍五入到"分"（如 36000 档为 38566.67 元），与常用临界点口径一致
    const upper = (netAtBoundary - next.quick) / (1 - next.rate);
    spots.push({
      boundary,
      upper: Math.round(upper * 100) / 100,
      netAtBoundary,
      nextRate: next.rate,
      jumpPerYuan: bonusAloneTax(boundary + 1).tax - bonusAloneTax(boundary).tax,
    });
  }
  return spots;
}

export const BLIND_SPOTS: BlindSpot[] = computeBlindSpots();

/** 判断奖金是否落在"多发不如少发"区间，并给出建议 */
export function findBlindSpot(bonus: number): BlindSpot | null {
  if (!Number.isFinite(bonus) || bonus <= 0) return null;
  for (const s of BLIND_SPOTS) {
    if (bonus > s.boundary && bonus <= s.upper) return s;
  }
  return null;
}

export interface BonusComparison {
  /** 单独计税：工资部分个税 + 年终奖单独计税 */
  separateTotal: number;
  /** 并入综合所得：全部收入合并计税 */
  combinedTotal: number;
  /** 单独计税下工资部分个税 */
  salaryOnlyTax: number;
  /** 并入后综合所得应纳税所得额 */
  combinedTaxable: number;
  /** 更省的方式与节省金额 */
  cheaper: 'separate' | 'combined' | 'equal';
  saving: number;
}

/**
 * 对比"单独计税"与"并入综合所得"
 * @param bonus 年终奖
 * @param salaryIncome 全年工资等综合所得收入（不含年终奖）
 * @param deductions 年度扣除合计（三险一金个人部分 + 专项附加扣除 + 其他扣除；不含 6 万元减除费用）
 */
export function compareBonusTax(bonus: number, salaryIncome: number, deductions: number): BonusComparison {
  const b = Number.isFinite(bonus) && bonus > 0 ? bonus : 0;
  const s = Number.isFinite(salaryIncome) && salaryIncome > 0 ? salaryIncome : 0;
  const d = Number.isFinite(deductions) && deductions > 0 ? deductions : 0;
  const BASIC_DEDUCTION = 60000;

  const salaryTaxable = Math.max(0, s - BASIC_DEDUCTION - d);
  const salaryOnlyTax = annualIncomeTax(salaryTaxable);
  const separateTotal = salaryOnlyTax + bonusAloneTax(b).tax;

  const combinedTaxable = Math.max(0, s + b - BASIC_DEDUCTION - d);
  const combinedTotal = annualIncomeTax(combinedTaxable);

  const diff = separateTotal - combinedTotal;
  return {
    separateTotal,
    combinedTotal,
    salaryOnlyTax,
    combinedTaxable,
    cheaper: diff > 0.005 ? 'combined' : diff < -0.005 ? 'separate' : 'equal',
    saving: Math.abs(diff),
  };
}
