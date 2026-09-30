// 算法自测：与 src/components/rmb-uppercase-converter.tsx 中实现保持一致
const DIGITS = '零壹贰叁肆伍陆柒捌玖';
const SUB_UNITS = ['', '拾', '佰', '仟'];
const GROUP_UNITS = ['', '万', '亿', '万亿'];

function integerToUppercase(numStr) {
  if (/^0+$/.test(numStr)) return '';
  const groups = [];
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
    if (groupHasValue) out += groupOut + GROUP_UNITS[unitIdx];
  }
  return out;
}

function centsToUppercase(cents) {
  const intPart = Math.floor(cents / 100);
  const jiao = Math.floor(cents / 10) % 10;
  const fen = cents % 10;
  const yuan = integerToUppercase(String(intPart));
  if (intPart === 0 && jiao === 0 && fen === 0) return '零元整';
  if (intPart === 0) {
    let out = '零';
    if (jiao > 0) out += DIGITS[jiao] + '角';
    if (fen > 0) out += DIGITS[fen] + '分';
    return out;
  }
  let out = yuan + '元';
  if (jiao === 0 && fen === 0) return out + '整';
  if (jiao === 0 && fen > 0) return out + '零' + DIGITS[fen] + '分';
  out += DIGITS[jiao] + '角';
  if (fen > 0) out += DIGITS[fen] + '分';
  return out;
}

const cases = [
  ['0', '零元整'],
  ['0.42', '零肆角贰分'],
  ['0.05', '零伍分'],
  ['0.20', '零贰角'],
  ['1234', '壹仟贰佰叁拾肆元整'],
  ['1234.00', '壹仟贰佰叁拾肆元整'],
  ['1409.50', '壹仟肆佰零玖元伍角'],        // 官方示例
  ['6007.14', '陆仟零柒元壹角肆分'],        // 官方示例：连续零只写一个
  ['16409.02', '壹万陆仟肆佰零玖元零贰分'],  // 官方示例：角0分非0 → 元后写零
  ['1680.32', '壹仟陆佰捌拾元叁角贰分'],     // 官方示例
  ['15', '壹拾伍元整'],
  ['110', '壹佰壹拾元整'],
  ['100000001', '壹亿零壹元整'],
  ['10000000000', '壹佰亿元整'],
  ['1000000000001', '壹万亿零壹元整'],
  ['123456.78', '壹拾贰万叁仟肆佰伍拾陆元柒角捌分'],
  ['1234567.89', '壹佰贰拾叁万肆仟伍佰陆拾柒元捌角玖分'],
];

let fail = 0;
for (const [input, expected] of cases) {
  const cents = Math.round(Number(input) * 100);
  const got = centsToUppercase(cents);
  const ok = got === expected;
  if (!ok) fail++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + input + ' -> ' + got + (ok ? '' : '  (期望: ' + expected + ')'));
}
// 107000.53 官方示例带可选"零"：壹拾万柒仟元零伍角叁分 / 壹拾万柒仟元伍角叁分 均合规
console.log('107000.53 ->', centsToUppercase(Math.round(107000.53 * 100)), '(官方示例带零变体，可不写零亦合规)');
console.log(fail === 0 ? '=== 全部通过 ===' : '=== 有 ' + fail + ' 个用例失败 ===');
process.exit(fail === 0 ? 0 : 1);
