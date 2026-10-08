#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""诊断首页近期笔记模块：模块是否渲染、数据是否被读到"""
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
req = urllib.request.Request('https://www.shuducw.com/', headers={'User-Agent': 'Mozilla/5.0 (audit)'})
html = urllib.request.urlopen(req, timeout=25).read().decode('utf-8', 'replace')

print(f'首页 HTML 长度: {len(html)}')
for marker in ['近期笔记', 'discovery/item', 'xsec_token', '数度财税 · 小红书', 'qr-xiaohongshu', '6521552259']:
    n = html.count(marker)
    print(f'  "{marker}": {n} 次')

i = html.find('近期笔记')
if i == -1:
    i = html.find('数度财税 · 小红书')
print('\n小红书模块附近原始 HTML（用于修正解析规则）:')
print('-' * 80)
print(html[max(0, i - 400): i + 1600])
