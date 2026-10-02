#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""量化站内页面的"模板化/重复内容"程度——这是 Bing"可识别但不收录"最常见的站内根因。

方法：抓取线上页面 → 剥离 script/style/标签 → 取可见正文 → 用 3-gram 词元集合计算
两两 Jaccard 相似度与"独有文字占比"。相似度 > 0.75 视为高度模板化。
"""
import re
import ssl
import sys
import urllib.error
import urllib.request
from itertools import combinations

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
CTX = ssl.create_default_context()
UA = 'Mozilla/5.0 (compatible; ShuduAudit/1.0)'
BASE = 'https://www.shuducw.com'

DISTRICTS = ['gaoxin', 'weiyang', 'lianhu', 'yanta', 'changan', 'xixian', 'xincheng',
             'beilin', 'baqiao', 'lintong', 'yanliang', 'zhouzhi', 'huyi']
SERVICES = ['basic', 'compliance', 'consulting', 'live-commerce', 'delivery']


def get(path):
    req = urllib.request.Request(BASE + path, headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
            return r.status, r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, ''


def body_text(html):
    t = re.sub(r'<(script|style|nav|footer|header)[^>]*>.*?</\1>', ' ', html, flags=re.S | re.I)
    t = re.sub(r'<[^>]+>', ' ', t)
    t = (t.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&quot;', '"')
          .replace('&lt;', '<').replace('&gt;', '>'))
    return re.sub(r'\s+', '', t)


def shingles(text, n=3):
    return {text[i:i + n] for i in range(len(text) - n + 1)}


print('===== 1. 抓取并测量各页正文 =====')
pages = {}
for slug in DISTRICTS:
    st, html = get(f'/services/district/{slug}')
    if st == 200:
        txt = body_text(html)
        pages[f'区县/{slug}'] = (txt, html)
        print(f'  [OK  ] 区县/{slug:10} 正文 {len(txt):6} 字')
    else:
        print(f'  [{st}] 区县/{slug:10} 抓取失败（可能未上线）')
for slug in SERVICES:
    st, html = get(f'/services/{slug}')
    if st == 200:
        txt = body_text(html)
        pages[f'服务/{slug}'] = (txt, html)
        print(f'  [OK  ] 服务/{slug:10} 正文 {len(txt):6} 字')
for path, label in [('/', '首页'), ('/about', '关于'), ('/faq', 'FAQ'), ('/contact', '联系'),
                    ('/news', '资讯列表'), ('/self-check', '自查')]:
    st, html = get(path)
    if st == 200:
        txt = body_text(html)
        pages[label] = (txt, html)
        print(f'  [OK  ] {label:14} 正文 {len(txt):6} 字')

print('\n===== 2. 两两相似度（3-gram Jaccard，>0.75 视为高度模板化）=====')
sh = {k: shingles(v[0]) for k, v in pages.items()}
pairs = []
for a, b in combinations(sorted(sh), 2):
    A, B = sh[a], sh[b]
    if not A or not B:
        continue
    j = len(A & B) / len(A | B)
    pairs.append((j, a, b))
pairs.sort(reverse=True)
for j, a, b in pairs[:18]:
    flag = '⚠ 高度模板化' if j > 0.75 else ('· 较相似' if j > 0.6 else '')
    print(f'  {j:.3f}  {a:14} ↔ {b:14} {flag}')

print('\n===== 3. 区县页之间：各自独有文字占比（越低越像模板）=====')
dist_keys = [k for k in sh if k.startswith('区县/')]
if len(dist_keys) >= 2:
    union = set().union(*[sh[k] for k in dist_keys])
    for k in dist_keys:
        uniq = len(sh[k] - set().union(*[sh[o] for o in dist_keys if o != k]))
        pct = uniq / max(len(sh[k]), 1) * 100
        print(f'  {k:16} 独有 3-gram {uniq:6} / {len(sh[k]):6}  = {pct:5.1f}%'
              + ('   ⚠ 独有内容过少' if pct < 25 else ''))
    inter = set.intersection(*[sh[k] for k in dist_keys])
    print(f'\n  所有区县页共同出现的 3-gram: {len(inter)}（占单页 {len(inter)/max(len(sh[dist_keys[0]]),1)*100:.1f}%）')

print('\n===== 4. 页面体积与 DOM 规模（Bing 也看页面体验）=====')
for k in ['首页', '区县/gaoxin', '服务/basic', '资讯列表']:
    if k in pages:
        html = pages[k][1]
        print(f'  {k:14} HTML {len(html.encode("utf-8"))/1024:6.1f} KB，DOM 标签 {len(re.findall(r"<[a-zA-Z]", html))} 个')

print('\n===== 5. lang / hreflang / 结构化数据（Bing 判别语种市场）=====')
st, html = get('/')
print('  <html lang>:', (re.search(r'<html[^>]*lang="([^"]*)"', html) or ['', '(缺失!)'])[1])
print('  JSON-LD 块数:', len(re.findall(r'application/ld\+json', html)))
print('  hreflang 标签:', len(re.findall(r'hreflang', html)))
