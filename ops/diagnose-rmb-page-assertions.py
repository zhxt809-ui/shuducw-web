#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""诊断：对比线上 HTML 里问答标题与表单文案的实际字符（排查断言是否写错）"""
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
req = urllib.request.Request('https://www.shuducw.com/tools/rmb-uppercase', headers={'User-Agent': 'Mozilla/5.0 (audit)'})
html = urllib.request.urlopen(req, timeout=25).read().decode('utf-8', 'replace')

print('===== 页面内所有 h3 文本 =====')
for m in re.finditer(r'<h3[^>]*>(.*?)</h3>', html, re.S):
    txt = re.sub(r'<[^>]+>', '', m.group(1)).strip()
    print('  ' + repr(txt))

print()
print('===== 缩略语/表单提示文案候选 =====')
for kw in ['留下', '咨询', '提交', '手机号', '你的问题']:
    hits = re.findall(kw + r'[^<]{0,16}', html)
    uniq = []
    for h in hits:
        h = h.strip()
        if len(h) > len(kw) and h not in uniq:
            uniq.append(h)
    print(f'  「{kw}」 → {uniq[:4]}')

print()
print('===== 引号字符统计 =====')
print('  ASCII 双引号:', html.count('"'))
print('  中文左引号:', html.count(chr(0x201C)))
print('  中文右引号:', html.count(chr(0x201D)))
