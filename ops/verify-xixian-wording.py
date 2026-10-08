#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""按 sitemap 全站核查"西安西咸新区"是否已全部改为"西咸新区"（线上真实 HTML）"""
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
UA = {'User-Agent': 'Mozilla/5.0 (audit)'}
OLD, NEW = '西安西咸新区', '西咸新区'


def fetch(url):
    try:
        req = urllib.request.Request(url, headers=UA)
        return urllib.request.urlopen(req, timeout=25).read().decode('utf-8', 'replace')
    except Exception as e:
        return f'__ERROR__{e}'


sitemap = fetch('https://www.shuducw.com/sitemap.xml')
urls = re.findall(r'<loc>([^<]+)</loc>', sitemap)
print(f'sitemap 路由数: {len(urls)}')

extra = ['https://www.shuducw.com/llms.txt', 'https://www.shuducw.com/robots.txt']
targets = urls + extra

bad, good = [], []
for u in targets:
    html = fetch(u)
    if html.startswith('__ERROR__'):
        print(f'  ❌ {u} 抓取失败: {html[9:60]}')
        continue
    n_old, n_new = html.count(OLD), html.count(NEW)
    if n_old:
        bad.append((u, n_old))
    if n_new:
        good.append((u, n_new))

print(f'\n===== 仍含"{OLD}"的页面 =====')
if bad:
    for u, n in bad:
        print(f'  ❌ {u} —— {n} 次')
else:
    print('  ✅ 全站 0 处（sitemap 全部路由 + llms.txt + robots.txt）')

print(f'\n===== 含"{NEW}"的页面 =====')
for u, n in good:
    print(f'  ✅ {u} —— {n} 次')

# 重点页面细节
print('\n===== 西咸新区专题页细节 =====')
xixian = fetch('https://www.shuducw.com/services/district/xixian')
if not xixian.startswith('__ERROR__'):
    title = re.search(r'<title>([^<]*)</title>', xixian)
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', xixian, re.S)
    print(f'  title: {title.group(1) if title else "(无)"}')
    print(f'  h1   : {re.sub(r"<[^>]+>", "", h1.group(1)).strip() if h1 else "(无)"}')
    print(f'  页面内"{OLD}": {xixian.count(OLD)} 次 | "{NEW}": {xixian.count(NEW)} 次')
    kw = re.search(r'name="keywords" content="([^"]*)"', xixian)
    print(f'  keywords: {kw.group(1) if kw else "(无)"}')

print('\n  结论: ' + ('✅ 通过（全站已无"西安西咸新区"）' if not bad else f'❌ 仍有 {len(bad)} 个页面未改'))
sys.exit(0 if not bad else 1)
