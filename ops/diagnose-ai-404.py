#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""查清 AI 爬虫的 404/444 到底是什么、以及中文 AI 爬虫是否伪造（只读日志）"""
import glob
import gzip
import os
import re
import socket
import sys
from collections import Counter, defaultdict

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
OUR_IPS = {'8.152.3.67', '85.149.220.12'}
TARGETS = {
    'OAI-SearchBot': r'oai-searchbot',
    'ChatGPT-User': r'chatgpt-user',
    'PerplexityBot': r'perplexitybot',
    'KimiBot': r'kimibot',
    'DeepSeekBot': r'deepseek',
    'QwenBot': r'qwenbot',
    'YuanbaoBot': r'yuanbao|youbot',
    'ClaudeBot': r'claudebot',
}


def ua_of(line):
    parts = re.findall(r'"([^"]*)"', line)
    return parts[-1] if len(parts) >= 3 else ''


def main():
    files, seen = [], set()
    for pattern in ('/var/log/nginx/access.log', '/var/log/nginx/access.log.1', '/var/log/nginx/access.log.*.gz'):
        for path in sorted(glob.glob(pattern)):
            real = os.path.realpath(path)
            if real not in seen:
                seen.add(real)
                files.append(path)

    err = defaultdict(Counter)      # name -> (status, path) counter
    ips = defaultdict(set)
    for path in files:
        opener = gzip.open if path.endswith('.gz') else open
        try:
            with opener(path, 'rt', encoding='utf-8', errors='replace') as f:
                for line in f:
                    ip = line.split(' ', 1)[0]
                    if ip in OUR_IPS or '"' not in line:
                        continue
                    ua = ua_of(line)
                    low = ua.lower()
                    for name, pat in TARGETS.items():
                        if re.search(pat, low):
                            parts = line.split('"')
                            req = parts[1].split(' ') if len(parts) > 1 else ['', '']
                            p = req[1].split('?')[0] if len(req) > 1 else ''
                            m = re.search(r'" (\d{3}) ', line)
                            st = m.group(1) if m else '?'
                            ips[name].add(ip)
                            if st >= '400':
                                err[name][(st, p)] += 1
                            break
        except OSError:
            continue

    for name in TARGETS:
        if name not in ips:
            continue
        print(f'===== {name} =====')
        print(f'  来源 IP 数: {len(ips[name])}')
        if err[name]:
            print(f'  非 2xx/3xx 请求（按状态码+路径）:')
            for (st, p), n in err[name].most_common(12):
                print(f'      {st}  {n:>4} 次  {p[:80]}')
        else:
            print('  无非 2xx/3xx 请求')
        # 抽 2 个 IP 做反向 DNS（判断真伪）
        sample = sorted(ips[name])[:2]
        for ip in sample:
            try:
                ptr = socket.gethostbyaddr(ip)[0]
            except Exception:
                ptr = '(无 PTR)'
            print(f'      IP {ip} -> {ptr}')
        print()


if __name__ == '__main__':
    main()
