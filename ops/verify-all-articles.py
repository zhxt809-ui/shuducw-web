#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""以线上 sitemap 为准，逐页校验所有文章页（这是权威口径）。

为什么不再用本地 data/articles.json：2026-10-01 发现服务器上的文章与本地副本不一致，
按本地数据验证会漏掉真正出问题的页面（当时就漏了 5 篇）。

每页检查：
  · 可见 H1 数量（在剥离 script/style 后的可见 HTML 上计数，排除 RSC 载荷干扰）→ 应为 1
  · 可见文本长度（剥离 script/style 与标签后的正文字数）
  · 正文可见性：RSC 载荷中的长中文段有多少能在可见文本中找到 → 应 >= 60%
"""
import re
import ssl
import sys
import urllib.error
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
CTX = ssl.create_default_context()
UA = 'Mozilla/5.0 (compatible; ShuduVerify/1.0)'
BASE = 'https://www.shuducw.com'
CATEGORIES = {'shilu', 'cases', 'tips', 'policies'}


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
            return r.status, r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace')


def strip_scripts(html):
    return re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', html, flags=re.S | re.I)


def visible_text(html):
    t = re.sub(r'<[^>]+>', '', strip_scripts(html))
    t = t.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&quot;', '"')
    return re.sub(r'[\s\u200b]+', '', t)


def payload_text(html):
    j = '\n'.join(re.findall(r'<script[^>]*>(.*?)</script>', html, re.S))
    return (j.replace('\\u003c', '<').replace('\\u003e', '>')
             .replace('\\u0026', '&').replace('\\"', '"').replace('\\n', '\n'))


st, sm = get(f'{BASE}/sitemap.txt')
if st != 200:
    print(f'sitemap.txt 获取失败: HTTP {st}')
    sys.exit(1)
urls = [u.strip() for u in sm.splitlines() if u.strip().startswith('http')]
articles = [u for u in urls if '/news/' in u and u.rstrip('/').split('/')[-1] not in CATEGORIES]
print(f'===== 逐页校验 {len(articles)} 个文章页（口径：线上 sitemap）=====')

problems = []
for url in articles:
    st, html = get(url)
    if st != 200:
        problems.append(f'[{st}] {url} 非 200')
        print(f'  [FAIL] {url} HTTP {st}')
        continue
    vis_html = strip_scripts(html)
    h1 = len(re.findall(r'<h1[\s>]', vis_html))
    vis = visible_text(html)
    pay = payload_text(html)
    runs = re.findall(r'[\u4e00-\u9fa5，。、；：？！]{40,}', pay)
    hit = sum(1 for r in runs if r in vis)
    ratio = (hit / len(runs) * 100) if runs else 0
    ok = (h1 == 1) and (ratio >= 60)
    path = url.replace(BASE, '')
    flag = 'OK  ' if ok else 'FAIL'
    print(f'  [{flag}] {path[:52]:52} H1={h1} 可见文本={len(vis):5} 字 载荷可见={ratio:3.0f}%')
    if h1 != 1:
        problems.append(f'{path}: H1={h1}（应为 1）')
    if ratio < 60:
        problems.append(f'{path}: 正文可见性 {ratio:.0f}%（正文可能不在服务端 HTML 中）')

print(f'\n===== 结论 =====')
print(f'  文章页总数: {len(articles)}   问题: {len(problems)}')
for p in problems:
    print(f'  ✗ {p}')
if not problems:
    print('  全部通过 ✅（每页 H1 唯一，正文对不执行 JS 的爬虫可见）')
