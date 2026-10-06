#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""关键取证：证书透明度日志里，为 shuducw.com 签发的**每一张证书**的详情。
若子域名/主域名曾被指向别人的服务器，那里通常会为我们的域名签免费证书——
签发时间、CA、覆盖的域名就是"被冒用时间段"的硬证据。"""
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
print(f'证书透明度：{BASE} 的全部证书签发记录（按时间排序）')
print('=' * 74)
try:
    d = json.loads(get(f'https://api.certspotter.com/v1/issuances?domain={BASE}'
                       f'&include_subdomains=true&expand=dns_names&expand=issuer&expand=cert'))
    rows = []
    for row in d:
        names = sorted(set(n.strip().lower() for n in row.get('dns_names', [])))
        iss = (row.get('issuer') or {}).get('name', '?')
        rows.append((row.get('not_before', ''), row.get('not_after', ''), iss, names, row.get('id')))
    rows.sort()
    print(f'  共 {len(rows)} 条签发记录：\n')
    for nb, na, iss, names, cid in rows:
        print(f'  签发 {nb[:19]}  到期 {na[:10]}')
        print(f'    CA: {iss}')
        print(f'    覆盖域名: {", ".join(names)}')
        print(f'    certspotter id: {cid}')
        print()
    if not rows:
        print('  （无记录）')
except Exception as e:
    print(f'  ⚠ certspotter 详情查询失败: {type(e).__name__}: {str(e)[:150]}')

print('=' * 74)
print('说明：正常自建站点通常只有少量、由固定 CA（如 Let\'s Encrypt / DigiCert / '
      '阿里云）签发的证书；')
print('      若出现"我们不认识的 CA + 异常时间段 + 覆盖 www 或某个子域名"的记录，')
print('      基本就能定位子域名被冒用的时间段与规模。')
