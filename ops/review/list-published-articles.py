#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""列出已发布文章（id/slug/category/sort_order/标题），用于生成百度收录提交清单"""
import json
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

arts = json.load(open('data/articles.json', encoding='utf-8'))
pub = [a for a in arts if a.get('is_published')]
pub.sort(key=lambda a: (a.get('category', ''), a.get('sort_order', 0)))
print(f'总文章 {len(arts)}，已发布 {len(pub)}：\n')
for a in pub:
    print(f"{a.get('id')} | {a.get('category')} | 排序{a.get('sort_order')} | {a.get('slug')} | {a.get('title','')[:34]}")
