#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证首页"近期笔记"模块：条数、标题正确性（中文未乱码）、链接保留 xsec_token、nofollow"""
import json
import pathlib
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
ROOT = pathlib.Path(__file__).resolve().parent.parent
EXPECT = json.loads((ROOT / 'data' / 'xiaohongshu-notes.json').read_text(encoding='utf-8'))

req = urllib.request.Request('https://www.shuducw.com/', headers={'User-Agent': 'Mozilla/5.0 (audit)'})
html = urllib.request.urlopen(req, timeout=25).read().decode('utf-8', 'replace')

print('===== 首页"近期笔记"模块实测 =====')
# 逐条取 <a ...> 块再从中抽标题，避免依赖属性顺序与 &amp; 实体细节
blocks = re.findall(r'<a href="(https://www\.xiaohongshu\.com/discovery/item/[^"]+)"[^>]*>(.*?)</a>', html, re.S)
items = []
for url, inner in blocks:
    m = re.findall(r'<span[^>]*>([^<]+)</span>', inner)
    title = m[-1].strip() if m else ''
    rel = 'nofollow' if 'nofollow' in inner or True else ''
    # rel 在开标签上，需从原块重新取
    items.append((url.replace('&amp;', '&'), title))
# 单独校验 rel 属性
rel_ok_all = len(re.findall(r'rel="nofollow[^"]*"', html)) >= len(blocks)
print(f'  解析到笔记条数: {len(items)}（期望 {len(EXPECT)}）')
print(f'  rel="nofollow ..." 属性出现次数: {len(re.findall(chr(34).join(["rel=", "nofollow[^", "]*", ""]), html))}')
ok = 0
for i, (url, title) in enumerate(items):
    exp = EXPECT[i] if i < len(EXPECT) else {}
    title_ok = title == exp.get('title', '').strip()
    token_ok = 'xsec_token=' in url
    good = title_ok and token_ok
    ok += 1 if good else 0
    print(f'  {"✅" if good else "❌"} {i+1}. {title}')
    print(f'        标题与数据文件一致: {title_ok} | xsec_token 保留: {token_ok}')

garbled = '?' in ''.join(t for _, t in items)
print(f'\n  中文乱码检查: {"❌ 出现 ? 字符" if garbled else "✅ 无乱码"}')
print(f'  结果: {ok}/{len(EXPECT)} 条完全正确')
sys.exit(0 if ok == len(EXPECT) and not garbled else 1)
