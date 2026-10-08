#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""批量查询 IP 归属与滥用投诉邮箱（RDAP，官方注册数据，非猜测）。
用法: python ops/security/rdap-lookup.py 34.47.57.247 199.102.44.194 ..."""
import json
import sys
import urllib.error
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

IPS = sys.argv[1:] or ['34.47.57.247']

for ip in IPS:
    print('=' * 74)
    print(f'  {ip}')
    data = None
    for base in ('https://rdap.org/ip/', 'https://rdap.arin.net/registry/ip/'):
        try:
            req = urllib.request.Request(base + ip, headers={'Accept': 'application/rdap+json',
                                                             'User-Agent': 'abuse-audit'})
            data = json.loads(urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'replace'))
            break
        except Exception as e:  # noqa: BLE001
            last = f'{type(e).__name__}: {str(e)[:120]}'
    if data is None:
        print(f'  查询失败：{last}')
        continue

    print(f'  网段名称: {data.get("name", "—")}')
    print(f'  地址范围: {data.get("startAddress", "—")} ~ {data.get("endAddress", "—")}')
    for c in (data.get('cidr0_cidrs') or []):
        print(f'  CIDR: {c.get("v4prefix") or c.get("v6prefix")}/{c.get("length")}')

    def walk(ents, depth=0):
        for e in ents or []:
            roles = e.get('roles') or []
            v = e.get('vcardArray')
            fn = org = email = None
            if v and len(v) > 1:
                for item in v[1]:
                    if item[0] == 'fn':
                        fn = item[3]
                    elif item[0] == 'org':
                        org = item[3]
                    elif item[0] == 'email':
                        email = item[3]
            if roles or fn or email:
                tag = ','.join(roles) or '-'
                line = f'  {"  " * depth}· [{tag}] {fn or "—"}'
                if org and org != fn:
                    line += f' / {org}'
                if email:
                    line += f'  ✉ {email}'
                print(line)
            walk(e.get('entities'), depth + 1)

    walk(data.get('entities'))

    # 国家 / 备注
    for r in (data.get('remarks') or []):
        for d in (r.get('description') or [])[:2]:
            print(f'  备注: {d[:120]}')
print('=' * 74)
