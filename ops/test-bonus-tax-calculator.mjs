/**
 * 年终奖个税试算：税率表、单独计税、临界点区间、两种方式对比
 *
 * 做法：从 src/lib/bonus-tax.ts 抽取真实源码（剥掉 TS 类型标注后执行），
 * 组件 src/components/bonus-tax-calculator.tsx 与页面表格都引用同一份 lib，确保"测的就是线上逻辑"。
 *
 * 期望依据（已核官方原文）：
 * - 财政部 税务总局公告 2023 年第 30 号：应纳税额＝全年一次性奖金收入×适用税率－速算扣除数；
 *   适用税率与速算扣除数按"奖金 ÷ 12"查《按月换算后的综合所得税率表》确定；执行至 2027-12-31。
 * - 按月换算后的综合所得税率表（公告附件，与广东省税务局公布附件逐格核对）：
 *   ≤3000 3%/0；3000-12000 10%/210；12000-25000 20%/1410；25000-35000 25%/2660；
 *   35000-55000 30%/4410；55000-80000 35%/7160；>80000 45%/15160。
 * - 手算校验：36000 → 36000×3%＝1080；36001 → 36001×10%−210＝3390.10（多缴 2310.10）；
 *   38566.67 元时税后与 36000 元持平；144000 → 144000×10%−210＝14190，其区间右端 160500。
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(process.cwd(), 'src/lib/bonus-tax.ts');
const ts = readFileSync(SRC, 'utf8');

const start = ts.indexOf('export const MONTHLY_BRACKETS');
if (start === -1) {
  console.error('❌ 无法从 src/lib/bonus-tax.ts 定位源码片段（结构是否已变？）');
  process.exit(2);
}
// 取到文件末尾：compareBonusTax 等函数定义在接口声明之后，若按接口截断会漏掉
const code = ts.slice(start);
const js = code
  .replace(/export const /g, 'const ')
  .replace(/export function /g, 'function ')
  .replace(/export interface[\s\S]*?\n}/g, '')
  // 变量声明上的类型标注（含 BlindSpot[]、Bracket[] 这类数组类型）
  .replace(/(const|let|var) (\w+): [^=]+=/g, '$1 $2 =')
  // 函数返回类型与参数类型
  .replace(/\)\s*:\s*[\w<>\[\]| ]+\s*\{/g, ') {')
  .replace(/\(([^)]*)\)/g, (m) => m.replace(/:\s*[\w<>\[\]| ]+(?=\s*[,)])/g, ''));

const factory = new Function(
  `${js}
   return { MONTHLY_BRACKETS, ANNUAL_BRACKETS, annualIncomeTax, bonusAloneTax, BLIND_SPOTS, findBlindSpot, compareBonusTax };`
);
const lib = factory();

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

console.log('===== 月度税率表（公告附件逐格核对）=====\n');
check('级距与税率、速算扣除数', lib.MONTHLY_BRACKETS.map((b) => [b.limit === Infinity ? 'inf' : b.limit, b.rate, b.quick]),
  [[3000, 0.03, 0], [12000, 0.1, 210], [25000, 0.2, 1410], [35000, 0.25, 2660], [55000, 0.3, 4410], [80000, 0.35, 7160], ['inf', 0.45, 15160]]);

console.log('\n===== 单独计税（公式：奖金×税率 − 速算扣除数）=====\n');
check('36000 元（÷12=3000，3% 档）', (() => { const r = lib.bonusAloneTax(36000); return { tax: r2(r.tax), net: r2(r.net), rate: r.rate }; })(), { tax: 1080, net: 34920, rate: 0.03 });
check('36001 元（跳 10% 档）', (() => { const r = lib.bonusAloneTax(36001); return { tax: r2(r.tax), rate: r.rate }; })(), { tax: 3390.1, rate: 0.1 });
check('144000 元（10% 档上界）', r2(lib.bonusAloneTax(144000).tax), 14190);
check('300000 元（20% 档上界）', r2(lib.bonusAloneTax(300000).tax), 58590);
check('420000 元（25% 档上界，速算扣除数取月度值 2660）', r2(lib.bonusAloneTax(420000).tax), 102340);
check('660000 元（30% 档上界）', r2(lib.bonusAloneTax(660000).tax), 193590);
check('960000 元（35% 档上界）', r2(lib.bonusAloneTax(960000).tax), 328840);
check('1200000 元（45% 档）', r2(lib.bonusAloneTax(1200000).tax), 524840);
check('3000 元（÷12=250，3% 档）', r2(lib.bonusAloneTax(3000).tax), 90);

console.log('\n===== "多发不如少发"临界点区间 =====\n');
check('临界点个数（6 个）', lib.BLIND_SPOTS.length, 6);
check('临界点金额序列', lib.BLIND_SPOTS.map((s) => s.boundary), [36000, 144000, 300000, 420000, 660000, 960000]);
check('36000 区间右端 = 38566.67', r2(lib.BLIND_SPOTS[0].upper), 38566.67);
check('144000 区间右端 = 160500', r2(lib.BLIND_SPOTS[1].upper), 160500);
check('300000 区间右端 = 318333.33', r2(lib.BLIND_SPOTS[2].upper), 318333.33);
check('36000 多发 1 元多缴 2310.10', r2(lib.BLIND_SPOTS[0].jumpPerYuan), 2310.1);
check('144000 多发 1 元多缴 13200.20', r2(lib.BLIND_SPOTS[1].jumpPerYuan), 13200.2);
check('37000 落在第一区间内（36000 < 37000 ≤ 38566.67）', lib.findBlindSpot(37000)?.boundary ?? null, 36000);
check('35000 不在区间内（低于临界点 36000）', lib.findBlindSpot(35000), null);
check('40000 不在区间内（税后已恢复）', lib.findBlindSpot(40000), null);
check('36000 本身不在区间内（等于临界点）', lib.findBlindSpot(36000), null);

console.log('\n===== 单独计税 vs 并入综合所得 =====\n');
// 工资 12 万、扣除 2.4 万 → 工资应纳税所得额 = 120000-60000-24000 = 36000 → 个税 1080
// 并入：应纳税所得额 = 120000+36000-60000-24000 = 72000 → 72000×10%-2520 = 4680
// 单独：1080 + 1080 = 2160 → 单独更省，省 2520
check('工资12万+奖金3.6万+扣除2.4万 → 单独更省 2520', (() => {
  const c = lib.compareBonusTax(36000, 120000, 24000);
  return { sep: r2(c.separateTotal), comb: r2(c.combinedTotal), cheaper: c.cheaper, saving: r2(c.saving) };
})(), { sep: 2160, comb: 4680, cheaper: 'separate', saving: 2520 });
// 低收入：工资 5 万（不足 6 万减除），扣除 0 → 工资应纳税所得额 0；并入 = 50000+36000-60000 = 26000 → 780
// 单独 = 0 + 1080 = 1080 → 并入更省 300
check('工资5万（未达减除费用）+奖金3.6万 → 并入更省 300', (() => {
  const c = lib.compareBonusTax(36000, 50000, 0);
  return { sep: r2(c.separateTotal), comb: r2(c.combinedTotal), cheaper: c.cheaper, saving: r2(c.saving) };
})(), { sep: 1080, comb: 780, cheaper: 'combined', saving: 300 });
// 无工资收入：并入综合所得后 36000 元奖金未超过 6 万元减除费用 → 应纳税所得额 0 → 不用缴税
// （单独计税仍按 1080 元缴纳，故此种情形并入更省 1080 元）——计算器应如实反映
check('工资为 0（奖金未超 6 万减除费用）→ 并入后税额 0', (() => { const c = lib.compareBonusTax(36000, 0, 0); return { sep: r2(c.separateTotal), comb: r2(c.combinedTotal), cheaper: c.cheaper }; })(), { sep: 1080, comb: 0, cheaper: 'combined' });
check('奖金为 0 时税额为 0', r2(lib.bonusAloneTax(0).tax), 0);

console.log(`\n  结果: ${pass}/${pass + fails.length} 通过`);
if (fails.length) {
  console.log('\n  不一致明细:');
  for (const [label, actual, expected] of fails) {
    console.log(`    ${label}: 实际 ${JSON.stringify(actual)} vs 期望 ${JSON.stringify(expected)}`);
  }
}
process.exit(fails.length ? 1 : 0);
