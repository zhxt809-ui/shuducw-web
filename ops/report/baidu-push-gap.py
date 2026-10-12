#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""百度推送缺口：推送状态 vs 线上 sitemap（必须在服务器上运行）。
回答"百度收录推进到哪一步了"：还有哪些页面从未主动推送过。"""
import json
import re
import urllib.request

ST = '/root/baidu-push/.push-state/baidu.json'

st = json.load(open(ST, encoding='utf-8'))
print('状态文件字段:', list(st.keys()))
for k, v in st.items():
    if k != 'pushed':
        print(f'  {k} = {v}')

pushed_raw = st.get('pushed', [])
pushed = set(u.rstrip('/') for u in pushed_raw)

sm = urllib.request.urlopen('https://www.shuducw.com/sitemap.xml', timeout=30).read().decode('utf-8', 'replace')
urls = [u.rstrip('/') for u in re.findall(r'<loc>(.*?)</loc>', sm)]

print()
print(f'推送记录: {len(pushed_raw)} 条（去重后 {len(pushed)}）| sitemap: {len(urls)} 条')

gap = [u for u in urls if u not in pushed]
print()
print(f'【从未推送过的页面】{len(gap)} 条:')
for u in gap:
    print('   ', u)

extra = [u for u in pushed if u not in set(urls)]
print()
print(f'【推送过但不在 sitemap 里】{len(extra)} 条:')
for u in extra:
    print('   ', u)
