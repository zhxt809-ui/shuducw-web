/**
 * 个税计算器税率表与个体户减半征收测试
 *
 * 做法：从 src/components/income-tax-calculator.tsx 抽取真实税率表与减半计算表达式在 Node 执行，
 * 避免手抄逻辑导致"测的不是线上代码"。
 *
 * 期望依据（已核官方原文）：
 * - 经营所得五级、综合所得七级税率与速算扣除数（《个人所得税法》所附税率表）。
 * - 财政部 税务总局公告 2023 年第 12 号：2023-01-01 至 2027-12-31，
 *   个体工商户年应纳税所得额不超过 200 万元的部分，减半征收个人所得税。
 * - 手算校验：应纳税所得额 24 万（经营所得）→ 240000×20% − 10500 = 37500；减半后 18750。
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(process.cwd(), 'src/components/income-tax-calculator.tsx');
const tsx = readFileSync(SRC, 'utf8');

function slice(startMark, endMark) {
  const a = tsx.indexOf(startMark);
  const b = tsx.indexOf(endMark, a);
  if (a === -1 || b === -1) {
    console.error(`❌ 无法定位源码片段：${startMark}`);
    process.exit(2);
  }
  return tsx.slice(a, b);
}

const code = slice('const BUSINESS_BRACKETS', 'export function IncomeTaxCalculator');
const exprTaxable = tsx.match(/const bizTaxable = (.+?);/);
const exprHalf = tsx.match(/const bizReduction = (.+?);/);
const exprPayable = tsx.match(/const bizPayable = (.+?);/);
if (!exprTaxable || !exprHalf || !exprPayable) {
  console.error('❌ 无法抽取减半征收相关表达式');
  process.exit(2);
}

// 剥掉 TS 类型标注后执行真实源码
const js = code
  .replace(/\)\s*:\s*\{[^}]*\}\s*\|\s*null\s*\{/, ') {')
  .replace(/:\s*typeof BUSINESS_BRACKETS/g, '')
  .replace(/\(taxable:\s*number,\s*brackets[^)]*\)/, '(taxable, brackets)')
  .replace(/:\s*\{ tax: number; rate: number \}/g, '')
  .replace(/:\s*string\[\]/g, '')
  .replace(/:\s*number/g, '')
  .replace(/:\s*boolean/g, '');
const factory = new Function(`${js}\nreturn { bracketTax, BUSINESS_BRACKETS, SALARY_BRACKETS };`);
const { bracketTax, BUSINESS_BRACKETS, SALARY_BRACKETS } = factory();

const halfCalc = new Function(
  'bizTaxable', 'bizTax', 'halfReduction',
  `const bizHasInput = Number.isFinite(bizTaxable);
   const halfEligible = ${tsx.match(/const halfEligible = (.+?);/)[1].replace('bizHasInput && ', 'bizHasInput && ')};
   const bizReduction = ${exprHalf[1]};
   const bizPayable = ${exprPayable[1]};
   return { bizReduction, bizPayable, halfEligible };`
);

const r2 = (n) => Math.round(n * 100) / 100;
let pass = 0;
const fails = [];
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) pass++;
  else fails.push([label, actual, expected]);
  console.log(`  ${ok ? '✅' : '❌'} ${label} → ${JSON.stringify(actual)}`);
  if (!ok) console.log(`       期望: ${JSON.stringify(expected)}`);
}

console.log('===== 经营所得五级（5%-35%）=====\n');
const biz = (t) => r2(bracketTax(t, BUSINESS_BRACKETS).tax);
check('应纳税所得额 30000（临界）', biz(30000), 1500);
check('应纳税所得额 240000 → 20% 档', biz(240000), 37500);
check('应纳税所得额 90000（临界）', biz(90000), 7500);
check('应纳税所得额 300000（临界）', biz(300000), 49500);
check('应纳税所得额 500000（临界）', biz(500000), 109500);
check('应纳税所得额 1000000 → 35% 档', biz(1000000), 284500);
check('应纳税所得额 0', biz(0), 0);

console.log('\n===== 综合所得七级（3%-45%）=====\n');
const sal = (t) => r2(bracketTax(t, SALARY_BRACKETS).tax);
check('应纳税所得额 36000（临界）', sal(36000), 1080);
check('应纳税所得额 100000', sal(100000), 7480);
check('应纳税所得额 144000（临界）', sal(144000), 11880);
check('应纳税所得额 300000（临界）', sal(300000), 43080);
check('应纳税所得额 960000（临界）', sal(960000), 250080);
check('应纳税所得额 1000000 → 45% 档', sal(1000000), 268080);

console.log('\n===== 个体工商户减半征收（2023 年第 12 号）=====\n');
// 24 万应纳税所得额：应纳 37500，减半后 18750
check('24 万 · 勾选减半', (() => { const x = halfCalc(240000, 37500, true); return { r: r2(x.bizReduction), p: r2(x.bizPayable), e: x.halfEligible }; })(), { r: 18750, p: 18750, e: true });
check('24 万 · 未勾选减半', (() => { const x = halfCalc(240000, 37500, false); return { r: r2(x.bizReduction), p: r2(x.bizPayable) }; })(), { r: 0, p: 37500 });
// 200 万整：仍在优惠范围内（不超过 200 万元）
check('200 万整 · 边界（在范围内）', (() => { const x = halfCalc(2000000, 634500, true); return { e: x.halfEligible, p: r2(x.bizPayable) }; })(), { e: true, p: 317250 });
// 超过 200 万：不再适用按 50% 简化（界面给出警示）
check('250 万 · 超出优惠范围', (() => { const x = halfCalc(2500000, 809500, true); return { e: x.halfEligible, r: r2(x.bizReduction) }; })(), { e: false, r: 0 });

console.log(`\n  结果: ${pass}/${pass + fails.length} 通过`);
if (fails.length) {
  console.log('\n  不一致明细:');
  for (const [label, actual, expected] of fails) {
    console.log(`    ${label}: 实际 ${JSON.stringify(actual)} vs 期望 ${JSON.stringify(expected)}`);
  }
}
process.exit(fails.length ? 1 : 0);
