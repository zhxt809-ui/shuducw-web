#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""尝试从头条搜索站长平台的前端包中找出提交接口（用于判断能否像百度那样自动化推送）"""
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
BASE = 'https://zhanzhang.toutiao.com'
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                    '(KHTML, like Gecko) Chrome/120.0 Safari/537.36'}


def get(url, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode('utf-8', 'replace')


html = get(BASE + '/')
scripts = re.findall(r'src="([^"]+\.js)"', html)
print(f'页面 JS 包数量: {len(scripts)}')
for s in scripts[:8]:
    print('  ' + s)

print('')
print('===== 在各包中搜索提交类接口特征 =====')
patterns = [r'["\'](/[a-z0-9_\-/]*?(?:submit|sitemap|urls?|push|upload|site)[a-z0-9_\-/]*)["\']',
            r'(https?://[a-z0-9.\-]*toutiao\.com/[a-z0-9_\-/]*(?:submit|sitemap|push)[a-z0-9_\-/]*)']
seen = set()
for s in scripts[:8]:
    if s.startswith('//'):
        url = 'https:' + s          # 协议相对地址
    elif s.startswith('http'):
        url = s
    else:
        url = BASE + ('' if s.startswith('/') else '/') + s
    try:
        js = get(url)
    except Exception as e:
        print(f'  [跳过] {url[:70]} -> {type(e).__name__}')
        continue
    hits = []
    for p in patterns:
        for m in re.findall(p, js, re.I):
            if m not in seen:
                seen.add(m)
                hits.append(m)
    if hits:
        print(f'  {url.split("/")[-1][:40]}:')
        for h in hits[:12]:
            print('      ' + h)

if not seen:
    print('  未发现可识别的提交接口路径（前端包内无相关字样）')

print('')
print('===== 完整接口清单（/webmaster/api/ 与 /search/ 等前缀）=====')
allapi = set()
for s in scripts[:8]:
    if s.startswith('//'):
        url = 'https:' + s
    elif s.startswith('http'):
        url = s
    else:
        url = BASE + ('' if s.startswith('/') else '/') + s
    try:
        js = get(url, timeout=40)
    except Exception:
        continue
    for m in re.findall(r'["\'](/webmaster/[a-z0-9_\-/]+)["\']', js, re.I):
        allapi.add(m)
    for m in re.findall(r'["\'](/[a-z0-9_\-/]*(?:sitemap|urlsubmit|url_submit|datasubmit|data_submit|linksubmit)[a-z0-9_\-/]*)["\']', js, re.I):
        allapi.add('★ ' + m)
for a in sorted(allapi):
    print('  ' + a)
