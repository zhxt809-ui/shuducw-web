#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""按花瓣搜索官方文档的三步法核验 PetalBot 身份（只读 nginx 日志）

官方三步（来源：https://webmaster.petalsearch.com/site/petalbot 第 1.5 节）：
  1. 对日志里的访问 IP 做反向 DNS，得到域名
  2. 确认域名属于 petalsearch.com
  3. 对该域名做正向 DNS，确认解析回原 IP

用法：python3 verify-petalbot-official.py [--ua petalbot] [--limit 10]
"""
import glob
import gzip
import os
import re
import socket
import sys
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
OUR_IPS = {'8.152.3.67', '85.149.220.12'}


def ua_of(line):
    parts = re.findall(r'"([^"]*)"', line)
    return parts[-1] if len(parts) >= 3 else ''


def collect(ua_key, limit):
    counter = Counter()
    files = set()
    for pattern in ('/var/log/nginx/access.log', '/var/log/nginx/access.log.1', '/var/log/nginx/access.log.*.gz'):
        for path in sorted(glob.glob(pattern)):
            real = os.path.realpath(path)
            if real in files:
                continue
            files.add(real)
            opener = gzip.open if path.endswith('.gz') else open
            try:
                with opener(path, 'rt', encoding='utf-8', errors='replace') as f:
                    for line in f:
                        low = line.lower()
                        if ua_key not in low:
                            continue
                        ip = line.split(' ', 1)[0]
                        if ip in OUR_IPS:
                            continue
                        counter[ip] += 1
            except OSError:
                continue
    return counter.most_common(limit)


def main():
    ua_key = 'petalbot'
    limit = 10
    if '--ua' in sys.argv:
        ua_key = sys.argv[sys.argv.index('--ua') + 1].lower()
    if '--limit' in sys.argv:
        limit = int(sys.argv[sys.argv.index('--limit') + 1])

    rows = collect(ua_key, limit)
    if not rows:
        print(f'日志中未找到 UA 含 "{ua_key}" 的请求')
        return 1

    print(f'按官方三步法核验 UA 含 "{ua_key}" 的访问来源（共取 {len(rows)} 个最高频 IP）')
    print('-' * 100)
    print(f'{"IP":<18}{"请求数":>7}  {"反向 DNS(PTR)":<48}{"域名归属":<10}{"正向一致":<10}{"判定"}')
    print('-' * 100)
    all_ok = True
    for ip, cnt in rows:
        try:
            ptr = socket.gethostbyaddr(ip)[0]
        except Exception:
            ptr = ''
        fwd_match = '—'
        if ptr:
            try:
                addrs = {x[4][0] for x in socket.getaddrinfo(ptr, None)}
                fwd_match = 'YES' if ip in addrs else 'NO'
            except Exception:
                fwd_match = 'ERR'
        domain_ok = 'YES' if ptr.endswith('petalsearch.com') else 'NO'
        verdict = '真 PetalBot' if (domain_ok == 'YES' and fwd_match == 'YES') else '可疑/非官方'
        if verdict != '真 PetalBot':
            all_ok = False
        print(f'{ip:<18}{cnt:>7}  {ptr[:47]:<48}{domain_ok:<10}{fwd_match:<10}{verdict}')
    print('-' * 100)
    print(f'结论：{"全部通过官方三步核验，确认为花瓣搜索官方爬虫" if all_ok else "存在未通过核验的来源，需按 UA 伪造处理"}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
