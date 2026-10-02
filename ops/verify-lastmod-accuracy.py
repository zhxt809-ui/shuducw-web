#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""逐 URL 核对线上 sitemap 的 lastmod 是否等于其真实来源（源文件 git 日期 / 文章 updated_at）

比对规则与 src/lib/sitemap-data.ts 完全一致：
  · 静态页     -> page-lastmod.json 中该路由的日期（精确优先，其次通配）
  · 分类页     -> max(page-lastmod.json 值, 该分类下最新文章 updated_at)
  · 区县页     -> /services/district/* 通配值
  · 文章详情页 -> data/articles.json 中该文章的 updated_at
"""
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SITEMAP = 'https://www.shuducw.com/sitemap.xml'
LASTMOD_JSON = '/root/page-lastmod.json'
ARTICLES = '/var/www/shuducw-run/data/articles.json'
CATEGORY_PATHS = {'/news/shilu': 'shilu', '/news/cases': 'cases',
                  '/news/tips': 'tips', '/news/policies': 'policies'}


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 ShuduVerify/1.0'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode('utf-8', 'replace')


def day(value):
    if not value:
        return None
    return str(value)[:10]


sitemap_xml = fetch(SITEMAP)
with open(LASTMOD_JSON, encoding='utf-8') as f:
    pagemap = json.load(f)
with open(ARTICLES, encoding='utf-8') as f:
    articles = json.load(f)
if isinstance(articles, dict):
    articles = articles.get('articles', articles.get('data', []))

published = [a for a in articles if a.get('is_published')]
by_slug = {a.get('slug'): day(a.get('updated_at')) for a in published}
cat_latest = {}
for a in published:
    c = a.get('category')
    if c and a.get('updated_at'):
        d = day(a['updated_at'])
        if d and (c not in cat_latest or d > cat_latest[c]):
            cat_latest[c] = d

ns = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
root = ET.fromstring(sitemap_xml)
rows = []
for url_el in root.findall(f'{ns}url'):
    loc = url_el.find(f'{ns}loc').text.strip()
    lm_el = url_el.find(f'{ns}lastmod')
    live = lm_el.text.strip() if lm_el is not None else None
    path = loc.replace('https://www.shuducw.com', '') or '/'

    slug = None
    m = re.match(r'^/news/(.+)$', path)
    if m and path not in CATEGORY_PATHS:
        slug = m.group(1)

    if slug and slug in by_slug:
        expected, src = by_slug[slug], '文章 updated_at'
    elif path in CATEGORY_PATHS:
        wildcard = pagemap.get('/news/*')
        latest = cat_latest.get(CATEGORY_PATHS[path])
        cands = [d for d in (pagemap.get(path), wildcard, latest) if d]
        expected, src = (max(cands) if cands else None), '分类页取最大值(模板+该分类最新文章)'
    elif path in pagemap:
        expected, src = pagemap[path], 'page-lastmod.json 精确匹配'
    else:
        wildcard_key = re.sub(r'/[^/]+$', '/*', path)
        expected, src = pagemap.get(wildcard_key), f'通配 {wildcard_key}'
    rows.append((path, live, expected, src, live == expected))

ok = [r for r in rows if r[4]]
bad = [r for r in rows if not r[4]]
print(f'===== 逐 URL 核对结果 =====')
print(f'  条目总数: {len(rows)}   一致: {len(ok)}   不一致: {len(bad)}')
if bad:
    print('  --- 不一致明细 ---')
    for path, live, expected, src, _ in bad:
        print(f'    {path}: 线上={live} 期望={expected} 来源={src}')
else:
    print('  全部一致 ✅（每条 lastmod 都能追溯到真实来源）')

print('')
print('===== 一致性抽查（每类取 1 条展示判定链）=====')
shown = set()
for path, live, expected, src, good in rows:
    key = src.split(' ')[0]
    if key in shown:
        continue
    shown.add(key)
    print(f'  {path:38} 线上={live}  期望={expected}  依据={src}')

print('')
print('===== 统计：今天被标为修改的页面（应仅为今天真实改动过的页面）=====')
today = datetime.now().strftime('%Y-%m-%d')
todays = [r[0] for r in rows if r[1] == today]
print(f'  共 {len(todays)} 条:')
for p in todays:
    print(f'    {p}')
print('')
print('  核对：这 9 条应均为本次会话实际改动过的页面（首页/关于/联系/自查/股东往来/4 个新专题页）')
