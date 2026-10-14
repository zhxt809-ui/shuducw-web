#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""交叉验证爬虫验证不误伤真实爬虫：读今天 nginx 日志中 UA 含 googlebot/bingbot
且拿到 200 的请求，核对源 IP 是否都在 /etc/nginx/bot-allow.conf 官方网段内。
预期：全部命中（0 个会被新规则误拦）。"""
import ipaddress
import re
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

cidrs = []
for ln in open('/etc/nginx/bot-allow.conf', encoding='utf-8'):
    ln = ln.strip()
    if ln and not ln.startswith('#'):
        cidrs.append(ipaddress.ip_network(ln.split()[0]))


def in_allow(ip):
    a = ipaddress.ip_address(ip)
    return any(a in c for c in cidrs)


LINE = re.compile(r'^(\S+) \S+ \S+ \[([^\]]+)\] "\S+ ([^"]*?) [^"]*" (\d{3})')
pat = subprocess.run('ls -1 /var/log/nginx/*access*.log 2>/dev/null',
                     shell=True, capture_output=True, text=True).stdout.split()
total = ok_ip = ok_req = bad_req = 0
bad = {}
seen_ips = set()
for lf in pat:
    out = subprocess.run(f"grep -F \"{__import__('datetime').date.today():%d/%b/%Y}\" {lf} 2>/dev/null",
                         shell=True, capture_output=True, text=True).stdout
    for line in out.splitlines():
        low = line.lower()
        if 'googlebot' not in low and 'bingbot' not in low:
            continue
        m = LINE.match(line)
        if not m:
            continue
        ip, _ts, _p, st = m.groups()
        total += 1
        seen_ips.add(ip)
        if st == '200':
            if in_allow(ip):
                ok_ip += 1
                ok_req += 1
            else:
                bad_req += 1
                bad.setdefault(ip, 0)
                bad[ip] += 1

print(f'今日 googlebot/bingbot UA 请求共 {total} 条，独立 IP {len(seen_ips)} 个')
print(f'  其中拿到 200 的请求 {ok_req + bad_req} 条：')
print(f'    源 IP 在官方网段（放行）: {ok_req} 条 / {ok_ip} 个 IP')
print(f'    源 IP 不在官方网段（新规则会拦截）: {bad_req} 条')
for ip, n in sorted(bad.items(), key=lambda kv: -kv[1]):
    print(f'      {ip} ×{n}')
print('\n结论:', '✅ 真实爬虫零误伤（所有 200 请求均来自官方网段）' if bad_req == 0
      else f'⚠️ 有 {bad_req} 条 200 请求来自非官方网段，需人工确认是否为真 Googlebot/Bingbot')
