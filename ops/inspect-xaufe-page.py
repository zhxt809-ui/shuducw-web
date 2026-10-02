#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把这个页面的所有链接、以及"数度"出现处的原始 HTML 全部列出来，供双方对齐事实。

要排除的可能：链接写成协议相对 //…、指向第三方页面、放在图片/JS 里、或指向别的域名。
"""
import re
import ssl
import sys
import urllib.parse
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
CTX = ssl.create_default_context()
URL = 'https://sxy.xaufe.edu.cn/info/1061/10377.htm'

req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
    raw = r.read()
    html = raw.decode('utf-8', 'replace')
print(f'页面: {URL}')
print(f'HTTP 200 | {len(raw)} 字节\n')

print('===== 1. 全页所有 <a href> 链接（按目标域名归类）=====')
links = re.findall(r'<a\b[^>]*?href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', html, re.I | re.S)
print(f'  链接总数: {len(links)}')
by_host = {}
for href, text in links:
    host = urllib.parse.urlparse(href).netloc or '(相对链接/锚点)'
    anchor = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', text)).strip()[:40]
    by_host.setdefault(host, []).append((href, anchor))

for host, items in sorted(by_host.items(), key=lambda kv: -len(kv[1])):
    print(f'\n  ▸ {host}  （{len(items)} 个）')
    seen = set()
    for href, anchor in items:
        key = (href, anchor)
        if key in seen:
            continue
        seen.add(key)
        print(f'      href={href[:100]:100}  锚文本={anchor}')

print('\n===== 2. 全页搜索 shuducw（任意大小写、含 JS/注释/属性）=====')
for m in re.finditer(r'shuducw', html, re.I):
    s = max(0, m.start() - 120)
    print(f'  位置 {m.start()}: ...{re.sub(chr(92)+"s+", " ", html[s:m.end() + 120])}...')
if not re.search(r'shuducw', html, re.I):
    print('  未出现 shuducw 字样（0 处）')

print('\n===== 3. "数度"出现处的原始 HTML（看是纯文本还是链接）=====')
for m in re.finditer('数度', html):
    s = max(0, m.start() - 260)
    seg = html[s:m.end() + 160]
    print(f'\n  ── 位置 {m.start()} ──')
    print('  ' + re.sub(r'\s+', ' ', seg))
    print(f'  → 该片段含 <a 标签: {"<a " in seg}；含 href: {"href" in seg.lower()}')

print('\n===== 4. 结论 =====')
link_to_us = [h for h, _ in links if 'shuducw' in h.lower()]
print(f'  指向 shuducw 的链接: {len(link_to_us)} 个')
print(f'  全页出现"数度": {len(re.findall("数度", html))} 次（含 meta description / 正文）')
if not link_to_us:
    print('  → 事实：该报道页**只有文字提及，没有任何指向官网的超链接**')
