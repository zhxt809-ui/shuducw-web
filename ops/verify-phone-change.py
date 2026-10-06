#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""电话变更后的自查：仓库内是否还有旧号码残留、新号码覆盖情况。"""
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OLD = '8455' + '6877'          # 拼接写法，避免本脚本自身被算作残留
NEW = '8845' + '6877'
SELF = os.path.abspath(__file__)
EXTS = {'.tsx', '.ts', '.js', '.jsx', '.mjs', '.json', '.md', '.txt', '.html', '.css', '.sh', '.py'}

old_hits, new_hits, files_with_new = [], 0, 0
for base in ('src', 'public', 'ops', 'scripts'):
    for dp, dn, fns in os.walk(os.path.join(ROOT, base)):
        dn[:] = [d for d in dn if d not in {'node_modules', '.next', '.git', '.deploy-stage'}]
        for fn in fns:
            if os.path.splitext(fn)[1].lower() not in EXTS:
                continue
            p = os.path.join(dp, fn)
            if os.path.abspath(p) == SELF:
                continue
            try:
                t = open(p, encoding='utf-8', newline='').read()
            except Exception:
                continue
            if OLD in t:
                old_hits.append((os.path.relpath(p, ROOT), t.count(OLD)))
            c = t.count(NEW)
            if c:
                files_with_new += 1
                new_hits += c

print('=== 仓库内旧号码残留 ===')
if old_hits:
    for rel, n in old_hits:
        print(f'  ⚠️ {n} 处  {rel}')
else:
    print('  ✅ 无残留')

print('\n=== 新号码覆盖 ===')
print(f'  {files_with_new} 个文件、{new_hits} 处')

print('\n=== 手机号未被误改（13359182829 应保持原样）===')
n_mobile = 0
for base in ('src', 'public'):
    for dp, dn, fns in os.walk(os.path.join(ROOT, base)):
        for fn in fns:
            if os.path.splitext(fn)[1].lower() not in EXTS:
                continue
            try:
                t = open(os.path.join(dp, fn), encoding='utf-8', newline='').read()
            except Exception:
                continue
            n_mobile += t.count('13359182829')
print(f'  13359182829 出现 {n_mobile} 处 {"✅" if n_mobile else "（已无手机号，需确认是否正常）"}')

print('\n=== tel: 链接形式核查（必须与显示号一致）===')
tel_old = 0
for base in ('src', 'public'):
    for dp, dn, fns in os.walk(os.path.join(ROOT, base)):
        for fn in fns:
            if os.path.splitext(fn)[1].lower() not in EXTS:
                continue
            try:
                t = open(os.path.join(dp, fn), encoding='utf-8', newline='').read()
            except Exception:
                continue
            tel_old += len(re.findall(r'tel:029' + OLD, t))
            tel_new = len(re.findall(r'tel:029' + NEW, t))
print(f'  旧 tel: 链接 {tel_old} 处（应为 0）{"✅" if tel_old == 0 else "⚠️"}')
