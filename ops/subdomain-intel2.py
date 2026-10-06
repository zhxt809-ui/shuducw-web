#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""第二轮：用其他免费情报源找 shuducw.com 的历史子域名 + 检查域名 DNS 卫生。"""
import json
import ssl
import subprocess
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
BASE = 'shuducw.com'
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'}


def get(url, timeout=40):
    req = urllib.request.Request(url, headers=UA)
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
        return r.read().decode('utf-8', 'replace')


def dig(rr):
    try:
        out = subprocess.run(['dig', '+short', BASE, rr], capture_output=True, text=True, timeout=20)
        return [l.strip() for l in out.stdout.splitlines() if l.strip()]
    except Exception as e:
        return [f'({type(e).__name__})']


print('=' * 72)
print('A. 域名 DNS 记录（NS / MX / TXT / CAA）—— 判断域名是否被用于发垃圾邮件等')
print('=' * 72)
for rr in ('NS', 'MX', 'TXT', 'CAA'):
    print(f'  {rr}: {dig(rr)}')

print()
print('=' * 72)
print('B. 子域名情报源（逐个尝试，标注失败原因，不隐藏）')
print('=' * 72)
found = set()

# B1 subdomain.center
try:
    txt = get(f'https://api.subdomain.center/?domain={BASE}')
    subs = [s.strip().lower() for s in txt.replace(',', '\n').split('\n') if s.strip()]
    print(f'  ▸ subdomain.center: {len(subs)} 个')
    for s in subs[:50]:
        print('      ' + s)
        if s.endswith(BASE):
            found.add(s)
    if not subs:
        print('      （为空）')
except Exception as e:
    print(f'  ▸ subdomain.center 失败: {type(e).__name__}: {str(e)[:90]}')

# B2 threatminer
try:
    d = json.loads(get(f'https://api.threatminer.org/v2/domain.php?q={BASE}&rt=5'))
    res = d.get('results', []) or []
    print(f'  ▸ threatminer 子域名: {len(res)} 个')
    for s in res[:50]:
        print('      ' + s)
        if s.endswith(BASE):
            found.add(s)
except Exception as e:
    print(f'  ▸ threatminer 失败: {type(e).__name__}: {str(e)[:90]}')

# B3 certspotter
try:
    d = json.loads(get(f'https://api.certspotter.com/v1/issuances?domain={BASE}&include_subdomains=true&expand=dns_names'))
    subs = set()
    for row in d:
        for nm in row.get('dns_names', []):
            nm = nm.strip().lower().lstrip('*.')
            if nm.endswith(BASE):
                subs.add(nm)
    print(f'  ▸ certspotter: {len(subs)} 个')
    for s in sorted(subs)[:60]:
        print('      ' + s)
        found.add(s)
except Exception as e:
    print(f'  ▸ certspotter 失败: {type(e).__name__}: {str(e)[:90]}')

# B4 rapidDNS（HTML）
try:
    html = get(f'https://rapiddns.io/subdomain/{BASE}?full=1', 45)
    import re
    subs = set(re.findall(r'([a-zA-Z0-9_\-\.]+\.' + BASE.replace('.', r'\.') + r')', html))
    print(f'  ▸ rapidDNS: {len(subs)} 个')
    for s in sorted(subs)[:60]:
        print('      ' + s)
        found.add(s.lower())
except Exception as e:
    print(f'  ▸ rapidDNS 失败: {type(e).__name__}: {str(e)[:90]}')

# B5 crt.sh 再试一次
try:
    data = json.loads(get(f'https://crt.sh/?q=%25.{BASE}&output=json', 90))
    subs = set()
    for row in data:
        for nm in (row.get('name_value') or '').split('\n'):
            nm = nm.strip().lower().lstrip('*.')
            if nm.endswith(BASE):
                subs.add(nm)
    print(f'  ▸ crt.sh（重试）: {len(subs)} 个')
    for s in sorted(subs)[:60]:
        print('      ' + s)
        found.add(s)
except Exception as e:
    print(f'  ▸ crt.sh 重试失败: {type(e).__name__}: {str(e)[:90]}')

print()
print('=' * 72)
print('C. 汇总')
print('=' * 72)
if found:
    print(f'  情报源共发现 {len(found)} 个域名：')
    for s in sorted(found):
        print('    ' + s)
else:
    print('  ❌ 所有情报源都没发现除主域名以外的子域名')
    print('     可能原因：① 历史子域名从未签过 HTTPS 证书、也未被这些源采样到；')
    print('               ② 冒用发生在我们自己的 DNS 记录层面但未公开签证书；')
    print('               ③ 情报源本身不可用（见上面每条的失败原因）')
    print('     → 这种情况必须靠"你手里的原始信息"（哪个子域名、什么时候）来定位，')
    print('       以及靠搜索引擎侧证据（站长后台索引里出现过的子域名 URL）。')
