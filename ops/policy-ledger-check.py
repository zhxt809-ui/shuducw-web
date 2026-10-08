#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""政策更新台账检查：涉及页面是否存在、政策是否临近到期或已过期。

背景：站内工具页与 llms.txt 都写着具体政策口径，其中多条带明确执行到期日
（如增值税优惠衔接、个体户减半、年终奖单独计税均为 2027-12-31）。一旦政策到期而页面未更新，
网站就在对外发布失效口径——本脚本把这件事变成可自动发现的告警，已接入 ops/selfcheck.py。

用法:
  python ops/policy-ledger-check.py                 # 以今天为基准检查
  python ops/policy-ledger-check.py --as-of 2027-09-01   # 模拟某个日期（用于验证告警机制本身有效）
  python ops/policy-ledger-check.py --quiet         # 只输出结论行（供 selfcheck 调用）
退出码: 0 = 通过（可能有告警）；1 = 有错误（页面缺失或政策已过期）
"""
import argparse
import datetime as dt
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
ROOT = Path(__file__).resolve().parent.parent
LEDGER = ROOT / 'ops' / 'policy-ledger.json'


def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def parse_date(s):
    if not s:
        return None
    return dt.date.fromisoformat(s)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--as-of', default=None, help='以该日期为基准（YYYY-MM-DD），默认今天')
    ap.add_argument('--quiet', action='store_true', help='只输出结论行')
    args = ap.parse_args()

    try:
        ledger = load(LEDGER)
    except (OSError, ValueError) as e:
        print(f'❌ 台账读取失败: {e}')
        return 1

    today = dt.date.fromisoformat(args.as_of) if args.as_of else dt.date.today()
    window = int(ledger.get('_预警窗口天数', 180))
    policies = ledger.get('policies', [])

    errors, warnings, lines = [], [], []
    for p in policies:
        name = p.get('名称', '(未命名)')
        pid = p.get('id', '?')
        missing_pages = [f for f in p.get('涉及页面', []) if not (ROOT / f).exists()]
        expiry = parse_date(p.get('执行到期日'))
        effective = parse_date(p.get('生效日'))
        status = ''
        if missing_pages:
            errors.append(f'{pid} 涉及页面不存在: {", ".join(missing_pages)}')
            status = '❌ 页面缺失'
        if effective and effective > today:
            warnings.append(f'{pid} 生效日 {effective} 尚未到（今天 {today}），页面文案是否已按新政策更新？')
            status = (status + ' ⚠️ 未生效').strip()
        if expiry:
            days = (expiry - today).days
            if days < 0:
                errors.append(f'{pid} 政策已于 {expiry} 到期（{-days} 天前），必须复核是否延续并更新页面与 llms.txt')
                status = '❌ 已过期'
            elif days <= window:
                warnings.append(f'{pid} 将于 {expiry} 到期（还有 {days} 天），进入 {window} 天预警窗口，请复核')
                status = f'⚠️ {days} 天后到期'
            else:
                status = f'✅ 有效（{days} 天后到期）'
        else:
            status = status or '✅ 现行有效（无到期日）'
        lines.append(f'  {status:<22} {pid:<26} {name[:34]}')

    valid = sum(1 for l in lines if '✅' in l)
    expiring = len(warnings)
    if not args.quiet:
        print(f'===== 政策更新台账检查（基准日 {today}，预警窗口 {window} 天）=====')
        print(f'  台账文件: ops/policy-ledger.json（核验日期 {ledger.get("_核验日期", "?")}）')
        print(f'  共 {len(policies)} 条政策\n')
        for l in lines:
            print(l)
        print()
        for w in warnings:
            print(f'  ⚠️ {w}')
        for e in errors:
            print(f'  ❌ {e}')
        print()

    if errors:
        print(f'  结论: ❌ 台账检查失败（{len(errors)} 项错误 / {expiring} 项预警 / {valid} 条有效）')
        return 1
    if warnings:
        print(f'  结论: ⚠️ 台账检查通过但需关注（{expiring} 项预警 / {valid} 条有效）')
        return 0
    print(f'  结论: ✅ 台账检查通过（{valid} 条政策均在有效期内，无临期）')
    return 0


if __name__ == '__main__':
    sys.exit(main())
