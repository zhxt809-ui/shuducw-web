/**
 * 增值税计算器边界与公式测试
 *
 * 做法：从 src/components/vat-calculator.tsx 抽取真实的三行计算表达式
 * （monthlyExclTax / smallFree / smallTax）与一般纳税人三行表达式，
 * 组合成函数在 Node 中执行，避免手抄逻辑导致"测的不是线上代码"。
 *
 * 期望依据（已核官方原文）：
 * - 《增值税法》第二十三条：销售额未达到起征点的免征增值税；达到起征点的，依照本法规定全额计算缴纳。
 * - 财政部 税务总局衔接公告（2026 年第 10 号）：2026-01-01 至 2027-12-31 起征点为月销售额 10 万元
 *   （按季 30 万元、按次/日 1000 元）；小规模纳税人发生除销售、出租不动产或转让土地使用权之外的
 *   应税交易，依照 3% 征收率减按 1% 征收。
 * - 销售额 = 含税销售额 ÷（1 + 规定征收率），减按 1% 时除以 1.01。
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(process.cwd(), 'src/components/vat-calculator.tsx');
const tsx = readFileSync(SRC, 'utf8');

function grab(re, name) {
  const m = tsx.match(re);
  if (!m) {
    console.error(`❌ 未能从源码抽取 ${name}（源码结构是否已变？）`);
    process.exit(2);
  }
  return m[1];
}

const exprSmall = {
  monthlyExclTax: grab(/const monthlyExclTax = (.+?);/, 'monthlyExclTax'),
  smallFree: grab(/const smallFree = (.+?);/, 'smallFree'),
  smallTax: grab(/const smallTax = (.+?);/, 'smallTax'),
};
const exprGeneral = {
  outputVat: grab(/const outputVat = (.+?);/, 'outputVat'),
  payable: grab(/const payable = (.+?);/, 'payable'),
  credit: grab(/const credit = (.+?);/, 'credit'),
};

const smallCalc = new Function(
  's', 'taxInclusive',
  `const monthlyExclTax = ${exprSmall.monthlyExclTax};
   const smallHasInput = Number.isFinite(s) && s >= 0;
   const smallFree = ${exprSmall.smallFree};
   const smallTax = ${exprSmall.smallTax};
   const atThreshold = smallHasInput && Math.abs(monthlyExclTax - 100000) < 0.005;
   return { monthlyExclTax, smallFree, smallTax, atThreshold };`
);
const generalCalc = new Function(
  'gSales', 'gInput', 'r',
  `const generalHasInput = Number.isFinite(gSales) && gSales >= 0 && Number.isFinite(gInput) && gInput >= 0;
   const outputVat = ${exprGeneral.outputVat};
   const payable = ${exprGeneral.payable};
   const credit = ${exprGeneral.credit};
   return { outputVat, payable, credit };`
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

console.log('===== 小规模纳税人：起征点边界（含税输入，÷1.01）=====\n');
// 含税 100999 → 不含税 99999.01（未达到 10 万 → 免征）
check('含税 100999（不含税 99999.01）', (() => { const x = smallCalc(100999, true); return { free: x.smallFree, tax: r2(x.smallTax) }; })(), { free: true, tax: 0 });
// 含税 101000 → 不含税 100000 整（达到起征点 → 全额计税 1000 元）
check('含税 101000（不含税 100000 整，临界）', (() => { const x = smallCalc(101000, true); return { free: x.smallFree, tax: r2(x.smallTax), atThreshold: x.atThreshold }; })(), { free: false, tax: 1000, atThreshold: true });
// 不含税 99999.99（未达到 → 免征）
check('不含税 99999.99', (() => { const x = smallCalc(99999.99, false); return { free: x.smallFree, tax: r2(x.smallTax) }; })(), { free: true, tax: 0 });
// 不含税 100000（达到 → 全额计税）
check('不含税 100000（临界）', (() => { const x = smallCalc(100000, false); return { free: x.smallFree, tax: r2(x.smallTax), atThreshold: x.atThreshold }; })(), { free: false, tax: 1000, atThreshold: true });
// 不含税 105000（超过 → 全额计税，不是只算 5000）
check('不含税 105000（超过，全额计税）', (() => { const x = smallCalc(105000, false); return { free: x.smallFree, tax: r2(x.smallTax) }; })(), { free: false, tax: 1050 });
// 常见小额
check('不含税 80000（免征）', (() => { const x = smallCalc(80000, false); return { free: x.smallFree, tax: r2(x.smallTax) }; })(), { free: true, tax: 0 });
// 换算正确性：含税 101000 / 1.01 = 100000
check('含税换算 ÷1.01 正确性', r2(smallCalc(101000, true).monthlyExclTax), 100000);
check('含税换算 ÷1.01（1010 元）', r2(smallCalc(1010, true).monthlyExclTax), 1000);

console.log('\n===== 一般纳税人：销项 − 进项 =====\n');
check('50 万×13% − 3 万', (() => { const x = generalCalc(500000, 30000, 0.13); return { outputVat: r2(x.outputVat), payable: r2(x.payable), credit: x.credit }; })(), { outputVat: 65000, payable: 35000, credit: false });
check('进项大于销项（留抵）', (() => { const x = generalCalc(100000, 20000, 0.13); return { outputVat: r2(x.outputVat), payable: r2(x.payable), credit: x.credit }; })(), { outputVat: 13000, payable: 0, credit: true });
check('9% 档：200 万×9% − 5 万', (() => { const x = generalCalc(2000000, 50000, 0.09); return { outputVat: r2(x.outputVat), payable: r2(x.payable) }; })(), { outputVat: 180000, payable: 130000 });
check('6% 档：80 万×6% − 1 万', (() => { const x = generalCalc(800000, 10000, 0.06); return { outputVat: r2(x.outputVat), payable: r2(x.payable) }; })(), { outputVat: 48000, payable: 38000 });

console.log(`\n  结果: ${pass}/${pass + fails.length} 通过`);
if (fails.length) {
  console.log('\n  不一致明细:');
  for (const [label, actual, expected] of fails) {
    console.log(`    ${label}: 实际 ${JSON.stringify(actual)} vs 期望 ${JSON.stringify(expected)}`);
  }
}
process.exit(fails.length ? 1 : 0);
