#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""读取线上 data/articles.json 中指定文章的真实存储内容，判断它到底写了什么。

目的：那篇思维导图文章（slug: 2026-shuiwu-cailiang-jizhun）用户能读到的正文极少，
重写前必须先看清它存储的内容里有哪些文字（导图节点标签等），避免凭空编造政策内容。
"""
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
PATH = '/var/www/shuducw-run/data/articles.json'
TARGET = '2026-shuiwu-cailiang-jizhun'

with open(PATH, encoding='utf-8') as f:
    data = json.load(f)
arts = data if isinstance(data, list) else data.get('articles', [])
print(f'data/articles.json 共 {len(arts)} 篇文章')

print()
print('=' * 74)
print('全部文章的正文长度排序（找出所有"薄正文"的文章）')
print('=' * 74)
rows = []
for a in arts:
    c = a.get('content') or ''
    # 纯文字量（剔除标签与脚本）
    plain = re.sub(r'<script\b.*?</script>', ' ', c, flags=re.S | re.I)
    plain = re.sub(r'<style\b.*?</style>', ' ', plain, flags=re.S | re.I)
    plain = re.sub(r'<[^>]+>', ' ', plain)
    plain = re.sub(r'\s+', '', plain)
    rows.append((len(plain), len(c), a.get('is_published'), a.get('slug'), (a.get('title') or '')[:34]))
rows.sort()
for plain_len, raw_len, pub, slug, title in rows:
    flag = '⚠️ 正文过薄' if plain_len < 600 else ('  ' if plain_len >= 1200 else '· ')
    print(f"  {flag} 纯文字 {plain_len:6} 字 / 存储 {raw_len:7} 字节  发布={pub}  {slug[:40]:40} {title}")

print()
print('=' * 74)
print(f'目标文章 {TARGET} 的存储内容全文')
print('=' * 74)
hit = [a for a in arts if a.get('slug') == TARGET]
if not hit:
    print('  ❌ 未找到该 slug（可能是线上 slug 不同）')
else:
    a = hit[0]
    print(f"  标题: {a.get('title')}")
    print(f"  分类: {a.get('category')}  发布: {a.get('is_published')}")
    print(f"  摘要: {a.get('summary')}")
    print(f"  发布时间: {a.get('published_at')}")
    c = a.get('content') or ''
    print(f"  内容总长: {len(c)} 字节")
    print()
    print('  ---- 存储内容原文（前 6000 字节）----')
    print(c[:6000])
    print()
    print('  ---- 其中提取出的全部中文字符串（导图节点等，用于核对可复述的事实）----')
    strings = re.findall(r'[\u4e00-\u9fa5][\u4e00-\u9fa5，。、；：""''（）%0-9A-Za-z\-—·]{5,}', c)
    seen = set()
    for s in strings:
        if s in seen:
            continue
        seen.add(s)
        print('    ' + s[:100])
