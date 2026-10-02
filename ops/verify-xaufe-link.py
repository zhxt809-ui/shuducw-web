#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""核实西安财经大学商学院报道页是否真的给了指向我们官网的外链。

结论要落到三个点：① 有没有 <a href>；② 是否 rel="nofollow"；③ 链接指向哪个地址。
"""
import re
import ssl
import sys
import urllib.error
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
CTX = ssl.create_default_context()
URL = 'https://sxy.xaufe.edu.cn/info/1061/10377.htm'

print('===== 核实西安财经大学报道页的外链 =====')
req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
        raw = r.read()
        html = None
        for enc in ('utf-8', 'gbk', 'gb18030'):
            try:
                html = raw.decode(enc)
                print(f'  页面编码: {enc}')
                break
            except UnicodeDecodeError:
                continue
        if html is None:
            html = raw.decode('utf-8', 'replace')
        print(f'  HTTP {r.status} | 页面 {len(raw)} 字节')
except urllib.error.HTTPError as e:
    print(f'  抓取失败: HTTP {e.code}')
    sys.exit(1)
except Exception as e:
    print(f'  抓取异常: {str(e)[:160]}')
    sys.exit(1)

# 标题
m = re.search(r'<title[^>]*>(.*?)</title>', html, re.S | re.I)
print('  页面标题:', re.sub(r'\s+', ' ', m.group(1)).strip()[:80] if m else '(无)')

# 所有指向我们域名的链接
links = re.findall(r'<a\b[^>]*href=["\']([^"\']*shuducw[^"\']*)["\'][^>]*>(.*?)</a>', html, re.I | re.S)
print(f'\n  指向 shuducw 的 <a> 链接数: {len(links)}')
for href, text in links:
    anchor = re.sub(r'<[^>]+>', '', text)
    anchor = re.sub(r'\s+', ' ', anchor).strip()
    print(f'    href   = {href}')
    print(f'    锚文本 = {anchor[:60]}')

# 是否 nofollow
nofollow = re.findall(r'<a\b[^>]*shuducw[^>]*>', html, re.I)
for tag in nofollow:
    print(f'    标签属性: {tag[:160]}')
    print(f'    含 nofollow: {"nofollow" in tag.lower()}')

# 页面里是否提到"数度"
if not links:
    idx = html.find('数度')
    print(f'\n  页面中"数度"出现位置: {idx}')
    if idx > 0:
        ctx = re.sub(r'\s+', ' ', html[max(0, idx - 300):idx + 300])
        print('  上下文:', ctx)

# 结论
print('\n===== 结论 =====')
if links:
    has_nofollow = any('nofollow' in t.lower() for t in nofollow)
    print('  ✅ 该页面确实存在指向我们站点的链接')
    print(f'     rel=nofollow: {"是（权重传递受限，但仍是发现信号）" if has_nofollow else "否（正常外链，可传递权重）"}')
    print(f'     链接地址: {links[0][0]}')
else:
    print('  ❌ 该页面未找到指向 shuducw 的 <a> 链接（可能只是文字提及，或链接指向第三方平台）')
