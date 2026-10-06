#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""用 Wayback Machine 查 shuducw.com 的历史快照——判断那几个月域名是否被指向过别的服务器。"""
import json
import ssl
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
BASE = 'shuducw.com'
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'}


def get(url, timeout=60):
    req = urllib.request.Request(url, headers=UA)
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
        return r.read().decode('utf-8', 'replace')


print('=' * 74)
print(f'Wayback Machine 快照清单：{BASE}（含子域名）')
print('=' * 74)
try:
    txt = get(f'http://web.archive.org/cdx/search/cdx?url={BASE}&matchType=domain'
              f'&output=json&limit=500&fl=timestamp,original,statuscode,mimetype,digest&collapse=digest')
    rows = json.loads(txt)
    if len(rows) <= 1:
        print('  ❌ 互联网档案馆从未收录过这个域名（没有任何历史快照）')
        print('     含义：该域名此前没有公开可抓取的内容历史 —— 对搜索引擎来说它是"全新的"，')
        print('     这也解释了 Bing/百度/头条为何按"全新域名"对待（信任度从零开始）。')
    else:
        body = rows[1:]
        print(f'  共 {len(body)} 条快照：')
        print(f'  最早: {body[0][0]}   {body[0][1]}')
        print(f'  最新: {body[-1][0]}   {body[-1][1]}')
        print()
        print('  全部快照（时间 / URL / 状态 / 类型）：')
        for r in body:
            print(f'    {r[0]}  {r[1][:60]:60} {r[2]} {r[3][:24]}')
except Exception as e:
    print(f'  ⚠ CDX 查询失败: {type(e).__name__}: {str(e)[:150]}')

print()
print('=' * 74)
print('若上面有快照：抓取几页看标题，判断历史上是否出现过非本公司内容')
print('=' * 74)
try:
    import re
    txt = get(f'http://web.archive.org/cdx/search/cdx?url={BASE}&matchType=domain'
              f'&output=json&limit=8&fl=timestamp,original')
    rows = json.loads(txt)[1:]
    for ts, orig in rows:
        try:
            html = get(f'http://web.archive.org/web/{ts}id_/{orig}', 60)
            t = re.search(r'<title[^>]*>(.*?)</title>', html, re.S | re.I)
            title = re.sub(r'\s+', ' ', t.group(1)).strip()[:80] if t else '(无标题)'
            print(f'  {ts}  {orig[:50]:50}  标题: {title}')
        except Exception as e:
            print(f'  {ts}  {orig[:50]:50}  抓取失败: {type(e).__name__}')
except Exception as e:
    print(f'  ⚠ 失败: {type(e).__name__}: {str(e)[:120]}')
