#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""按《百度搜索网页标题规范》(ziyuan.baidu.com/college/articleinfo?id=2728) 修正标题间隔符。

官方原文：「间隔符（或连续间隔符）如 ---，_ ，| ，—— 统一改成 -」
现状：全站页面标题用 `_` 连接品牌名与频道名，违反该规范。
本脚本只改 title 字符串中的下划线间隔符（要求下划线紧邻中文），不动任何标识符。
"""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT = Path('.')
TARGETS = sorted(list((ROOT / 'src' / 'app').rglob('page.tsx')) + [ROOT / 'src' / 'app' / 'layout.tsx'])
# 下划线紧邻中文时视为标题间隔符
PATTERN = re.compile(r'(?<=[\u4e00-\u9fa5])_|_(?=[\u4e00-\u9fa5])')

changed_files, changed_lines = [], 0
for path in TARGETS:
    if not path.is_file():
        continue
    lines = path.read_text(encoding='utf-8').splitlines(keepends=True)
    touched = False
    for i, line in enumerate(lines):
        if 'title' not in line:
            continue
        new = PATTERN.sub('-', line)
        if new != line:
            lines[i] = new
            touched = True
            changed_lines += 1
    if touched:
        path.write_text(''.join(lines), encoding='utf-8')
        changed_files.append(str(path).replace('\\', '/'))

print(f'已修正标题间隔符的文件: {len(changed_files)} 个，行数: {changed_lines}')
for f in changed_files:
    print('  ' + f)

print('\n=== 修正后仍含下划线间隔符的 title 行（应为空）===')
left = 0
for path in TARGETS:
    if not path.is_file():
        continue
    for i, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
        if 'title' in line and PATTERN.search(line):
            print(f'  {path}:{i}: {line.strip()[:100]}')
            left += 1
print('  无' if not left else f'  仍剩 {left} 行')

print('\n=== 抽样：修正后的标题 ===')
for path in TARGETS[:60]:
    if not path.is_file():
        continue
    text = path.read_text(encoding='utf-8')
    m = re.search(r"title:\s*'([^']{5,120})'", text)
    if m and '西安数度' in m.group(1):
        print(f'  {str(path).replace(chr(92), "/")[:46]:46} {m.group(1)}')
