#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""查清 html-content 类文章（走客户端 HtmlRenderer）的正文可见性与 H1 来源"""
import json
import re
import ssl
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
CTX = ssl.create_default_context()
UA = 'Mozilla/5.0 (compatible; ShuduAudit/1.0)'
BASE = 'https://www.shuducw.com'
MARK = '<!-- html-content -->'


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
        return r.read().decode('utf-8', 'replace')


def visible_text(html):
    html = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', html, flags=re.S | re.I)
    html = re.sub(r'<[^>]+>', '', html)
    html = html.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&quot;', '"')
    return re.sub(r'[\s\u200b]+', '', html)


def payload_text(html):
    chunks = re.findall(r'<script[^>]*>(.*?)</script>', html, re.S)
    j = '\n'.join(chunks)
    return (j.replace('\\u003c', '<').replace('\\u003e', '>')
             .replace('\\u0026', '&').replace('\\"', '"').replace('\\n', '\n'))


arts = json.load(open('data/articles.json', encoding='utf-8'))
arts = arts if isinstance(arts, list) else arts.get('articles', [])
html_arts = [a for a in arts if MARK in (a.get('content') or '')]
md_arts = [a for a in arts if MARK not in (a.get('content') or '')]

print('===== 1. 本地文章的两条渲染路径分布 =====')
print(f'  html-content 类（走客户端 HtmlRenderer）: {len(html_arts)} 篇')
print(f'  markdown 类（服务端渲染）: {len(md_arts)} 篇')
for a in html_arts:
    c = a['content']
    print(f'      {a["slug"][:45]:45} 发布={a.get("is_published")} 含<script>={c.count("<script")} 含<h1>={c.count("<h1")} 长度={len(c)}')

print('\n===== 2. 线上实测：html-content 类文章正文对不执行 JS 的爬虫是否可见 =====')
for a in html_arts[:3]:
    if not a.get('is_published'):
        continue
    try:
        raw = get(f'{BASE}/news/{a["slug"]}')
    except Exception as e:
        print(f'  /news/{a["slug"]}: 获取失败 {e}')
        continue
    vis, pay = visible_text(raw), payload_text(raw)
    runs = re.findall(r'[\u4e00-\u9fa5，。、；：？！]{40,}', pay)
    hit = sum(1 for r in runs if r in vis)
    h1s = [re.sub(r'<[^>]+>', '', h).strip()[:40] for h in re.findall(r'<h1[^>]*>(.*?)</h1>', raw, re.S)]
    print(f'  /news/{a["slug"]}')
    print(f'      H1 {len(h1s)} 个: {h1s}')
    print(f'      可见文本 {len(vis)} 字；载荷长段 {len(runs)} 段，其中可见 {hit} 段')
    print(f'      判定: {"✅ 正文服务端可见" if runs and hit > len(runs) * 0.6 else "❌ 正文仅存在于 RSC 载荷/客户端，不执行 JS 的爬虫读不到正文"}')

print('\n===== 3. markdown 类文章对照 =====')
for a in md_arts[:2]:
    if not a.get('is_published'):
        continue
    raw = get(f'{BASE}/news/{a["slug"]}')
    vis, pay = visible_text(raw), payload_text(raw)
    runs = re.findall(r'[\u4e00-\u9fa5，。、；：？！]{40,}', pay)
    hit = sum(1 for r in runs if r in vis)
    h1s = [re.sub(r'<[^>]+>', '', h).strip()[:40] for h in re.findall(r'<h1[^>]*>(.*?)</h1>', raw, re.S)]
    print(f'  /news/{a["slug"]}: H1 {len(h1s)} 个；载荷 {len(runs)} 段可见 {hit} 段 → '
          f'{"✅ 服务端可见" if runs and hit > len(runs) * 0.6 else "❌ 客户端渲染"}')
