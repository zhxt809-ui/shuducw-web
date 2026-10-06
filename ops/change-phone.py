#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""电话号变更：029-84556877 → 029-88456877（含 tel: 链接形式 02984556877）。

覆盖范围（一次改全，避免 NAP 不一致）：
  · src/  页面与组件（页脚、页头、联系页、区县页、专题页、工具页、文章页 CTA、404/错误页、API 提示文案）
  · public/  llms.txt
  · ops/  交付文档与脚本（外链执行包的标准信息块、校验脚本、文章源文件）

注意：
  · 手机号 13359182829 不变
  · 保留文件原有换行符（不引入 CRLF），以 UTF-8 无 BOM 写回
  · 图片/二维码里若印有旧电话，本脚本无法处理（需重新出图，人工确认）
"""
import os
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # .../projects（本脚本在 ops/ 下）
OLD = '84556877'
NEW = '88456877'
SCAN_DIRS = ['src', 'public', 'ops', 'scripts']
EXTS = {'.tsx', '.ts', '.js', '.jsx', '.mjs', '.json', '.md', '.txt', '.html', '.css', '.sh', '.py'}
SKIP_DIRS = {'node_modules', '.next', '.git', '.deploy-stage', 'data', '.push-state'}
SELF = os.path.abspath(__file__)  # 不替换本脚本自身（否则会把它的常量一起改掉）

apply = '--apply' in sys.argv
total_files = 0
total_hits = 0
print(f'模式: {"实际写入" if apply else "演练（只统计，不改动）"}')
print(f'替换: {OLD} → {NEW}\n')

changed = []
for d in SCAN_DIRS:
    base = os.path.join(ROOT, d)
    if not os.path.isdir(base):
        continue
    for dirpath, dirnames, filenames in os.walk(base):
        dirnames[:] = [x for x in dirnames if x not in SKIP_DIRS]
        for fn in filenames:
            if os.path.splitext(fn)[1].lower() not in EXTS:
                continue
            path = os.path.join(dirpath, fn)
            if os.path.abspath(path) == SELF:
                continue
            try:
                with open(path, 'r', encoding='utf-8', newline='') as f:
                    text = f.read()
            except (UnicodeDecodeError, OSError):
                continue
            n = text.count(OLD)
            if n == 0:
                continue
            total_files += 1
            total_hits += n
            rel = os.path.relpath(path, ROOT)
            changed.append((rel, n))
            if apply:
                with open(path, 'w', encoding='utf-8', newline='') as f:
                    f.write(text.replace(OLD, NEW))

changed.sort()
for rel, n in changed:
    print(f'  {n:3} 处  {rel}')
print(f'\n合计: {total_files} 个文件、{total_hits} 处')
if not apply:
    print('\n（演练模式，未修改任何文件；加 --apply 执行）')
else:
    print('\n✅ 已写入')
