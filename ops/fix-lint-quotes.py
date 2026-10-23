#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 JSX 正文里用作引号的半角 " 改成中文全角 “ ”（lint 规则 react/no-unescaped-entities + 中文排版规范）。

幂等设计：
- 旧串（半角）还在 → 替换成新串（全角），同一文件内出现多次则全部替换；
- 旧串已不在、新串已在 → 视为已完成，跳过；
- 两者都不在 → 报错退出（说明锚点与文件实际内容不符，必须人工确认）。

不碰 JSX 属性（className="..."），因为替换目标都是含中文上下文的正文子串。
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

LQ, RQ = "\u201c", "\u201d"  # “ ”


def q(s: str) -> str:
    out = []
    open_next = True
    for ch in s:
        if ch == '"':
            out.append(LQ if open_next else RQ)
            open_next = not open_next
        else:
            out.append(ch)
    return "".join(out)


PAIRS = [
    ("src/data/topics/social-insurance-iit.tsx", '也是最容易被"怎么省钱"的思路带偏的地方'),
    ("src/components/income-tax-calculator.tsx", '本工具此处按"全额减半"简化计算会低估税额'),
    ("src/app/services/delivery/page.tsx", '财税服务最怕"交完钱不知道能得到什么"。'),
    ("src/data/topics/company-deregistration.tsx", '注销不是"提交一份材料"那么简单'),
    ("src/data/topics/high-tech-enterprise.tsx", '高新技术企业认定不是"一次性申报"'),
    ("src/app/tools/page.tsx", '避免出现"工具还在按已失效口径计算"的情况'),
    ("src/app/tools/vat/page.tsx", '第二十三条规定"销售额未达到起征点的，免征增值税；达到起征点的，依照本法规定全额计算缴纳增值税"。'),
    ("src/app/shareholder-loans/page.tsx", '把"老板拿钱"这件事'),
    ("src/app/shareholder-loans/page.tsx", '协助梳理"其他应收款—股东"等往来科目'),
    ("src/app/services/live-commerce/page.tsx", '平台结算不等于"已经交完税"。'),
    ("src/app/services/live-commerce/page.tsx", '把经营收入"晒"在明处'),
    ("src/components/vat-calculator.tsx", '第二十三条规定"销售额未达到起征点的免征，'),
    ("src/components/vat-calculator.tsx", '与 2026 年之前"10 万元以下（含本数）免征"'),
    ("src/components/vat-calculator.tsx", '起征点为"未达到免征、达到全额计税"。'),
    ("src/components/bonus-tax-calculator.tsx", '含"多发不如少发"临界点提醒'),
    ("src/components/bonus-tax-calculator.tsx", '以下三项用于对比"并入综合所得"是否更划算'),
    ("src/components/bonus-tax-calculator.tsx", '落在"多发不如少发"区间'),
    ("src/components/bonus-tax-calculator.tsx", '在申报表"工资薪金"项下的"奖金计税方式选择"中'),
    ("src/components/bonus-tax-calculator.tsx", '按"奖金 ÷ 12"查'),
    ("src/app/tools/bonus-tax/page.tsx", '全年一次性奖金"单独计税"与"并入综合所得"双算对比'),
    ("src/app/tools/bonus-tax/page.tsx", '"多发一元、多缴几千"的临界点区间'),
    ("src/app/tools/bonus-tax/page.tsx", '年终奖临界点："多发不如少发"区间一览'),
    ("src/app/tools/bonus-tax/page.tsx", '由"税后到手与临界点持平"反解得到'),
    ("src/app/tools/bonus-tax/page.tsx", '在申报表"工资薪金"项下的"奖金计税方式选择"中'),
    ("src/app/tools/rmb-uppercase/page.tsx", '自动处理"零"与"整"的规则'),
    ("src/app/tools/rmb-uppercase/page.tsx", '必须用中文大写，"零""整"书写不规范可能被银行退票'),
    ("src/app/tools/rmb-uppercase/page.tsx", '不是"随便写写"：少写一个"整"'),
    ("src/app/tools/rmb-uppercase/page.tsx", '>"整"字与"人民币"字样<'),
    ("src/app/tools/rmb-uppercase/page.tsx", '到"元"为止的，"元"后应写"整"（或"正"）；到"角"为止的，"角"后可以不写；有"分"的，"分"后不写"整"。大写金额前应标明"人民币"'),
    ("src/app/tools/rmb-uppercase/page.tsx", '含"0"的金额怎么写'),
    ("src/app/tools/rmb-uppercase/page.tsx", '应在其前加"零"。'),
    ("src/app/tools/rmb-uppercase/page.tsx", '应在其前面加"壹"。'),
    ("src/components/rmb-uppercase-converter.tsx", '· 到"元"为止的，"元"后应写"整"（或"正"）字；到"角"为止的，"角"后可以不写"整"字（本工具默认不写）；有"分"的，"分"后不写"整"'),
    ("src/components/rmb-uppercase-converter.tsx", '· 大写金额前应标明"人民币"字样并紧接填写、不得留有空白；票据栏内未预印"人民币"字样的，应加填"人民币"三字'),
    ("src/components/rmb-uppercase-converter.tsx", '· 金额中间有"0"时写"零"字，如 1409.50 → 壹仟肆佰零玖元伍角'),
    ("src/components/rmb-uppercase-converter.tsx", '· 连续几个"0"时只写一个"零"字，如 6007.14 → 陆仟零柒元壹角肆分'),
    ("src/components/rmb-uppercase-converter.tsx", '· "角"位是"0"而"分"位不是"0"时，"元"后应写"零"字，如 16409.02 → 壹万陆仟肆佰零玖元零贰分（实务标准写法，必须写"零"）'),
    ("src/components/rmb-uppercase-converter.tsx", '· 金额不足 1 元的，直接写"X角Y分"不加"零"，如 0.42 → 肆角贰分、0.05 → 伍分（写成"零肆角贰分"一般也予认可）'),
]


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    by_file = {}
    for rel, old in PAIRS:
        by_file.setdefault(rel, []).append(old)

    failed = 0
    changed_files = 0
    for rel, olds in by_file.items():
        p = ROOT / rel
        text = p.read_text(encoding="utf-8")
        original = text
        for old in olds:
            new = q(old)
            n = text.count(old)
            if n > 0:
                text = text.replace(old, new)
                print(f"[改] {rel}: {n} 处 -> {new[:24]}")
            elif new not in text:
                print(f"[FAIL] {rel}: 旧串与新串都不在，锚点与实际内容不符 -> {old[:36]}")
                failed += 1
            # 旧串不在且新串已在 = 之前已改过，跳过
        if text != original:
            p.write_text(text, encoding="utf-8")
            changed_files += 1

    # 回读校验：所有文件里都不应再有这些半角串
    for rel, olds in by_file.items():
        text = (ROOT / rel).read_text(encoding="utf-8")
        for old in olds:
            if old in text:
                print(f"[残留] {rel}: {old[:36]}")
                failed += 1

    print(f"改动文件 {changed_files} 个；" + ("全部通过" if failed == 0 else f"失败 {failed} 项"))
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
