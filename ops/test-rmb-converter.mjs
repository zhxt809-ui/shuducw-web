/**
 * 人民币大写转换器逻辑合规性测试
 *
 * 做法：直接从 src/components/rmb-uppercase-converter.tsx 抽取 DIGITS/SUB_UNITS/GROUP_UNITS/
 * integerToUppercase/centsToUppercase 的真实源码并在 Node 中执行，
 * 避免手抄逻辑导致"测的不是线上代码"。
 *
 * 期望值来自官方原文（《支付结算办法》附一《正确填写票据和结算凭证的基本规定》第五条举例）：
 *   ￥1,409.50  → 人民币壹仟肆佰零玖元伍角
 *   ￥6,007.14  → 人民币陆仟零柒元壹角肆分
 *   ￥1,680.32  → 人民币壹仟陆佰捌拾元零叁角贰分，或 人民币壹仟陆佰捌拾元叁角贰分
 *   ￥107,000.53→ 人民币壹拾万柒仟元零伍角叁分，或 人民币壹拾万零柒仟元伍角叁分
 *   ￥16,409.02 → 人民币壹万陆仟肆佰零玖元零贰分
 *   ￥325.04    → 人民币叁佰贰拾伍元零肆分
 * 注：规则（三）明确"可以只写一个零字，也可以不写'零'字"，故允许的写法集合可能多于原文举例。
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(process.cwd(), 'src/components/rmb-uppercase-converter.tsx');
const tsx = readFileSync(SRC, 'utf8');

const start = tsx.indexOf('const DIGITS');
const end = tsx.indexOf('const EXAMPLES');
if (start === -1 || end === -1 || end <= start) {
  console.error('❌ 无法从源码中定位转换函数（源码结构是否已变？）');
  process.exit(2);
}
const code = tsx
  .slice(start, end)
  // 剥掉 TypeScript 类型标注，使其可在 Node 中直接执行（只针对参数/变量/返回值标注）
  .replace(/\)\s*:\s*(string|number|boolean)\s*\{/g, ') {')
  .replace(/(\w+)\s*:\s*(string|number|boolean)(\[\])?/g, '$1');
const factory = new Function(`${code}\nreturn { centsToUppercase };`);
const { centsToUppercase } = factory();

const toCents = (s) => Math.round(Number(s) * 100);

/** 允许的写法集合（官方原文举例 + 规则明文允许的变体） */
const CASES = [
  ['1409.50', ['壹仟肆佰零玖元伍角', '壹仟肆佰零玖元伍角整']],
  ['6007.14', ['陆仟零柒元壹角肆分']],
  ['1680.32', ['壹仟陆佰捌拾元零叁角贰分', '壹仟陆佰捌拾元叁角贰分']],
  ['107000.53', ['壹拾万柒仟元零伍角叁分', '壹拾万零柒仟元伍角叁分', '壹拾万柒仟元伍角叁分']],
  ['16409.02', ['壹万陆仟肆佰零玖元零贰分']],
  ['325.04', ['叁佰贰拾伍元零肆分']],
  // 边界与常见金额（无官方举例，按规则推导 + 行业惯例核对）
  // 不足 1 元：实务标准写法不加"零"（写成"零肆角贰分"一般也予认可）——经一线实务口径确认
  ['0.42', ['肆角贰分']],
  ['0.05', ['伍分']],
  ['1.5', ['壹元伍角', '壹元伍角整']],
  ['100000', ['壹拾万元整']],
  ['1000000.05', ['壹佰万元零伍分']],
  ['100000000', ['壹亿元整']],
  ['100000001.01', ['壹亿零壹元零壹分', '壹亿零壹元壹分']],
  ['12345.67', ['壹万贰仟叁佰肆拾伍元陆角柒分']],
  ['0', ['零元整']],
];

let pass = 0;
const fails = [];
console.log('===== 人民币大写转换器 · 官方口径实测 =====\n');
for (const [input, allowed] of CASES) {
  const got = centsToUppercase(toCents(input));
  const ok = allowed.includes(got);
  if (ok) pass++;
  else fails.push([input, got, allowed]);
  console.log(`  ${ok ? '✅' : '❌'} ${input.padEnd(14)} → ${got}`);
  if (!ok) console.log(`       期望（官方原文/允许写法之一）: ${allowed.join(' 或 ')}`);
}

console.log(`\n  结果: ${pass}/${CASES.length} 通过`);
if (fails.length) {
  console.log('\n  不一致明细:');
  for (const [input, got, allowed] of fails) {
    console.log(`    ${input}: 实际「${got}」 vs 官方「${allowed.join('」/「')}」`);
  }
}
process.exit(fails.length ? 1 : 0);
