#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""检查服务器文章摘要里「关键词：」出现的位置（决定前台剥离规则是否只剥末尾）。"""
import json
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
PATH = '/var/www/shuducw-run/data/articles.json'
d = json.load(open(PATH, encoding='utf-8'))
rows = d if isinstance(d, list) else d.get('articles', [])
print('文章总数:', len(rows))

hit = 0
tail_hit = 0
for a in rows:
    s = a.get('summary') or ''
    if '关键词' not in s:
        continue
    hit += 1
    tail = s.rstrip().endswith(s[s.rfind('关键词'):].strip())
    if tail:
        tail_hit += 1
    print(f"  [id={a.get('id')}] cat={a.get('category')} 末尾即关键词行={tail}")
    print(f"      摘要尾 58 字: ...{s[-58:]}")

print(f'含「关键词」的摘要: {hit} 条；其中关键词位于末尾(可安全剥离): {tail_hit} 条')
