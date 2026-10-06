#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""在中国的服务器上排查 shuducw.com 的子域名与历史滥用痕迹（本机网络故障，故用服务器视角）。

四路情报交叉验证：
  1) 证书透明度 crt.sh          —— 历史上签过证书的所有子域名
  2) HackerTarget hostsearch    —— 被动 DNS 记录
  3) AlienVault OTX passive_dns —— 历史解析记录（含第三方记录的冒用痕迹）
  4) urlscan.io                 —— 这个域名下被抓取/扫描过的实际页面
再对发现的每个子域名做 DNS 解析与探活。
"""
import json
import socket
import ssl
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
BASE = 'shuducw.com'
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'}


def get(url, timeout=45):
    req = urllib.request.Request(url, headers=UA)
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
        return r.read().decode('utf-8', 'replace')


found = {}

print('=' * 72)
print(f'1) 证书透明度日志 crt.sh —— {BASE} 历史子域名')
print('=' * 72)
try:
    data = json.loads(get(f'https://crt.sh/?q=%25.{BASE}&output=json', 90))
    s = set()
    for row in data:
        for nm in (row.get('name_value') or '').split('\n'):
            nm = nm.strip().lower().lstrip('*.')
            if nm.endswith(BASE):
                s.add(nm)
    for nm in sorted(s):
        found.setdefault(nm, []).append('crt.sh')
    print(f'  发现 {len(s)} 个：')
    for nm in sorted(s):
        print('    ' + nm)
except Exception as e:
    print(f'  ⚠ 失败: {type(e).__name__}: {str(e)[:110]}')

print()
print('=' * 72)
print('2) HackerTarget 被动 DNS')
print('=' * 72)
try:
    txt = get(f'https://api.hackertarget.com/hostsearch/?q={BASE}')
    lines = [l for l in txt.strip().split('\n') if l and 'error' not in l.lower()]
    print(f'  返回 {len(lines)} 条：')
    for l in lines[:40]:
        parts = l.split(',')
        nm = parts[0].strip().lower()
        found.setdefault(nm, []).append('hackertarget')
        print(f'    {nm:44} {parts[1] if len(parts) > 1 else ""}')
except Exception as e:
    print(f'  ⚠ 失败: {type(e).__name__}: {str(e)[:110]}')

print()
print('=' * 72)
print('3) AlienVault OTX 被动 DNS（历史解析，含第三方记录）')
print('=' * 72)
try:
    d = json.loads(get(f'https://otx.alienvault.com/api/v1/indicators/domain/{BASE}/passive_dns'))
    recs = d.get('passive_dns', [])
    print(f'  历史解析记录 {len(recs)} 条：')
    seen = set()
    for r in recs[:60]:
        hn = (r.get('hostname') or '').lower()
        if hn in seen:
            continue
        seen.add(hn)
        found.setdefault(hn, []).append('otx')
        print(f"    {hn:40} {str(r.get('address','')):18} {str(r.get('first',''))[:10]} → {str(r.get('last',''))[:10]}")
except Exception as e:
    print(f'  ⚠ 失败: {type(e).__name__}: {str(e)[:110]}')

print()
print('=' * 72)
print('4) urlscan.io —— 该域名下被抓取过的真实页面（最能暴露冒用内容）')
print('=' * 72)
try:
    d = json.loads(get(f'https://urlscan.io/api/v1/search/?q=domain%3A{BASE}&size=100'))
    res = d.get('results', [])
    print(f'  历史扫描结果 {len(res)} 条：')
    for r in res[:30]:
        pg = r.get('page', {})
        print(f"    {pg.get('domain',''):38} {pg.get('url','')[:70]}")
        print(f"      标题: {(pg.get('title') or '')[:70]}  时间: {r.get('task',{}).get('time','')[:19]}")
except Exception as e:
    print(f'  ⚠ 失败: {type(e).__name__}: {str(e)[:110]}')

print()
print('=' * 72)
print('5) 汇总：去重后所有出现过的子域名 + 当前是否解析')
print('=' * 72)
names = sorted(found.keys())
print(f'  情报源合计提到 {len(names)} 个域名：')
for nm in names:
    try:
        ips = socket.gethostbyname_ex(nm)[2]
    except Exception:
        ips = []
    tag = '✅ 当前仍解析 ' + ','.join(ips) if ips else '— 已不解析'
    print(f"    {nm:44} {tag:28} 来源={','.join(sorted(set(found[nm])))}")
