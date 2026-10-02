#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证本次修复：8 篇 html-content 文章的正文服务端可见性 + H1 去重 + 标题间隔符。

修复前实测（2026-10-01）：
  /news/2026-shuiwu-cailiang-jizhun   可见文本 1228 字，载荷长段 3/5 可见 → 正文不可见
  /news/zhuce-zijin-renjiao-2026      可见文本 1331 字，载荷长段 3/12 可见 → 正文不可见
修复后应达到：可见文本显著增大（含正文），H1 恰为 1 个。
"""
import json
import re
import ssl
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
CTX = ssl.create_default_context()
UA = 'Mozilla/5.0 (compatible; ShuduVerify/1.0)'
BASE = 'https://www.shuducw.com'
MARK = '<!-- html-content -->'


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
            return r.status, r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace')


def visible_text(html):
    html = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', html, flags=re.S | re.I)
    html = re.sub(r'<[^>]+>', '', html)
    html = html.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&quot;', '"')
    return re.sub(r'[\s\u200b]+', '', html)


def payload_text(html):
    j = '\n'.join(re.findall(r'<script[^>]*>(.*?)</script>', html, re.S))
    return (j.replace('\\u003c', '<').replace('\\u003e', '>')
             .replace('\\u0026', '&').replace('\\"', '"').replace('\\n', '\n'))


arts = json.load(open('data/articles.json', encoding='utf-8'))
arts = arts if isinstance(arts, list) else arts.get('articles', [])
targets = [a for a in arts if MARK in (a.get('content') or '') and a.get('is_published')]

print(f'===== 1. html-content 文章正文可见性与 H1（共 {len(targets)} 篇待验）=====')
ok = bad = skipped = 0
for a in targets:
    st, raw = get(f'{BASE}/news/{a["slug"]}')
    if st != 200:
        print(f'  [跳过] /news/{a["slug"]} HTTP {st}（可能已下架）')
        skipped += 1
        continue
    vis, pay = visible_text(raw), payload_text(raw)
    runs = re.findall(r'[\u4e00-\u9fa5，。、；：？！]{40,}', pay)
    hit = sum(1 for r in runs if r in vis)
    h1 = len(re.findall(r'<h1[\s>]', raw))
    ratio = (hit / len(runs) * 100) if runs else 0
    good = ratio >= 60 and h1 == 1
    ok, bad = (ok + 1, bad) if good else (ok, bad + 1)
    print(f'  [{"OK " if good else "FAIL"}] /news/{a["slug"][:44]}')
    print(f'         可见文本 {len(vis)} 字；载荷长段可见 {hit}/{len(runs)} ({ratio:.0f}%)；H1 = {h1}')

print(f'\n  结果：通过 {ok}，未通过 {bad}，跳过 {skipped}')

print('\n===== 2. 标题间隔符（官方要求统一为 -，修复前为 _）=====')
for path in ['/', '/about', '/services', '/faq', '/news', '/self-check']:
    st, html = get(BASE + path)
    m = re.search(r'<title[^>]*>(.*?)</title>', html, re.S)
    t = m.group(1).strip() if m else '(无)'
    flag = 'OK' if ('_' not in t) else 'FAIL 仍含下划线'
    print(f'  [{flag}] {path}: {t[:70]}')

print('\n===== 3. 回归：404 页面与 sitemap =====')
st, html = get(f'{BASE}/this-page-should-not-exist-9f3a')
print(f'  不存在 URL: HTTP {st}；含品牌化提示: {"页面不存在" in html}')
st, sm = get(f'{BASE}/sitemap.txt')
print(f'  sitemap.txt: HTTP {st}，{len([l for l in sm.splitlines() if l.strip()])} 条')
st, xmlbody = get(f'{BASE}/sitemap.xml')
print(f'  sitemap.xml: HTTP {st}，{xmlbody.count("<loc>")} 条，lastmod {xmlbody.count("<lastmod>")} 个')
