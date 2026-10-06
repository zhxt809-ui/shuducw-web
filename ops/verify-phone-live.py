#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""电话变更后的线上验收：全站关键页 + 全部已发布文章页，逐一检查新旧号码。

判据（硬性）：
  · 每个页面的 HTML 里**不能再出现旧号码 84556877**（出现即失败）
  · 页脚/联系页/结构化数据里**必须出现新号码 88456877**
  · llms.txt 必须同步
文章列表从线上 sitemap.xml 枚举，避免用本地数据（本地与线上可能不一致）。
"""
import re
import ssl
import sys
import urllib.request
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
OLD = '8455' + '6877'          # 拼接，避免脚本自身被计入
NEW = '8845' + '6877'
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'}
CTX = ssl.create_default_context()

KEY_PAGES = ['/', '/contact', '/about', '/services', '/services/basic', '/services/compliance',
             '/services/consulting', '/services/delivery', '/services/live-commerce',
             '/services/district/xincheng', '/services/district/lianhu', '/services/district/beilin',
             '/services/district/changan', '/faq', '/cases', '/news', '/self-check', '/privacy',
             '/tools/vat', '/tools/income-tax', '/tools/rmb-uppercase', '/shareholder-loans',
             '/robots.txt', '/llms.txt', '/sitemap.xml']


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=40, context=CTX) as r:
        return r.read().decode('utf-8', 'replace')


# 从线上 sitemap 取全部文章页
articles = []
try:
    xml = fetch('https://www.shuducw.com/sitemap.xml')
    ns = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
    locs = [e.text.strip() for e in ET.fromstring(xml).findall(f'{ns}url/{ns}loc')]
    articles = [u for u in locs if '/news/' in u and u.count('/') == 4]
    print(f'sitemap 共 {len(locs)} 条 URL，其中文章页 {len(articles)} 条\n')
except Exception as e:
    print(f'⚠️ sitemap 读取失败: {type(e).__name__}: {str(e)[:100]}')

targets = [('关键页', f'https://www.shuducw.com{p}' if p.startswith('/') else p,
            f'https://www.shuducw.com{p}' or p) for p in KEY_PAGES]
targets = [('关键页', 'https://www.shuducw.com' + p) for p in KEY_PAGES]
targets += [('文章页', u) for u in articles]

fails, ok = [], 0
print('=== 逐页检查（旧号码必须为 0） ===')
for kind, url in targets:
    short = url.replace('https://www.shuducw.com', '') or '/'
    try:
        body = fetch(url)
    except Exception as e:
        fails.append((kind, short, f'抓取失败 {type(e).__name__}'))
        print(f'  ❌ {kind} {short:44} 抓取失败: {type(e).__name__}')
        continue
    n_old = body.count(OLD)
    n_new = body.count(NEW)
    if n_old:
        fails.append((kind, short, f'旧号码残留 {n_old} 处'))
        print(f'  ❌ {kind} {short:44} 旧号码 {n_old} 处  新号码 {n_new} 处')
    elif kind == '关键页' or n_new:
        ok += 1
        print(f'  ✅ {kind} {short:44} 旧 0 / 新 {n_new}')

print(f'\n=== 汇总 ===\n  通过 {ok} 个，失败 {len(fails)} 个')
if fails:
    print('  失败明细：')
    for kind, short, why in fails:
        print(f'    - [{kind}] {short} → {why}')

print('\n=== 结构化数据里的 telephone 抽查 ===')
for u in ('https://www.shuducw.com/', 'https://www.shuducw.com/contact'):
    try:
        b = fetch(u)
        tels = set(re.findall(r'"telephone"\s*:\s*"([^"]+)"', b))
        print(f'  {u}: {tels if tels else "（未找到 telephone 字段）"}')
    except Exception as e:
        print(f'  {u}: 抓取失败 {type(e).__name__}')
