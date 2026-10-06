#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""打印目标文章存储内容的后半段（6000 字节之后），取得完整的思维导图 DATA 结构。"""
import json
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
with open('/var/www/shuducw-run/data/articles.json', encoding='utf-8') as f:
    data = json.load(f)
arts = data if isinstance(data, list) else data.get('articles', [])
a = [x for x in arts if x.get('slug') == '2026-shuiwu-cailiang-jizhun'][0]
c = a['content']
print(f'总长 {len(c)} 字节，打印第 4300 字节之后的内容：')
print('=' * 74)
print(c[4300:])
