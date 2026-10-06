#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""打印目标文章存储内容的中间段（1800–4400 字节），补齐"公告正文6条/裁量基准9类66项/裁量阶次5级"。"""
import json
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
with open('/var/www/shuducw-run/data/articles.json', encoding='utf-8') as f:
    data = json.load(f)
arts = data if isinstance(data, list) else data.get('articles', [])
a = [x for x in arts if x.get('slug') == '2026-shuiwu-cailiang-jizhun'][0]
c = a['content']
print(c[1850:4450])
