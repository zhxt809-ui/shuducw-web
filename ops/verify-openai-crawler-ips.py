#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""用 OpenAI 官方公布的 IP 段核验 OAI-SearchBot / GPTBot 请求的真伪（只读日志）

数据来源（官方公开、机器可读，官方要求站长以此核验而非仅看 UA）：
  OAI-SearchBot: https://openai.com/searchbot.json
  GPTBot:        https://openai.com/gptbot.json
  抓取日期：2026-10-07（OpenAI 会更新该清单，如需刷新请重新下载后替换下方常量）

结论口径：
  命中官方段 = 真实 OpenAI 爬虫；未命中 = 伪造 UA（多为 GCP 上的扫描器）
"""
import glob
import gzip
import ipaddress
import os
import re
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
OUR_IPS = {'8.152.3.67', '85.149.220.12'}

# 官方 searchbot.json（2026-10-07 抓取）
SEARCHBOT_PREFIXES = """
104.210.140.128/28 13.66.216.176/28 135.234.64.0/24 172.182.193.224/28 172.182.193.80/28
172.182.194.144/28 172.182.194.32/28 172.182.195.48/28 172.182.209.208/28 172.182.211.192/28
172.182.213.192/28 172.182.224.0/28 172.203.190.112/28 172.203.190.128/28 172.203.190.80/28
20.14.99.96/28 20.168.18.32/28 20.169.6.224/28 20.169.7.48/28 20.169.77.0/25
20.171.123.64/28 20.171.53.224/28 20.25.151.224/28 20.42.10.176/28 23.102.145.48/28
4.227.36.0/25 40.67.175.0/25 40.90.214.16/28 51.8.102.0/24 74.7.175.128/25
74.7.228.0/25 74.7.228.128/25 74.7.229.0/25 74.7.229.128/25 74.7.230.0/25
74.7.241.128/25 74.7.242.128/25 74.7.243.0/25 74.7.244.0/25
"""

# 官方 gptbot.json（2026-10-07 抓取）
GPTBOT_PREFIXES = """
136.226.18.128/28 136.226.19.96/28 136.226.22.112/28 136.226.253.16/28 136.226.254.128/28
172.182.193.224/28 172.182.193.80/28 172.182.194.144/28 172.182.194.32/28 172.182.195.48/28
172.182.209.208/28 172.182.211.192/28 172.182.213.192/28 172.182.224.0/28 172.203.190.112/28
172.203.190.128/28 172.203.190.80/28 20.14.99.96/28 20.168.18.32/28 20.169.6.224/28
20.169.7.48/28 20.169.77.0/25 20.171.123.64/28 20.171.53.224/28 20.25.151.224/28
20.42.10.176/28 23.102.145.48/28 4.227.36.0/25 40.67.175.0/25 40.90.214.16/28
51.8.102.0/24 74.7.175.128/25 74.7.227.0/25 74.7.228.0/25 74.7.228.128/25
74.7.229.0/25 74.7.229.128/25 74.7.230.0/25 74.7.241.128/25 74.7.242.128/25
74.7.243.0/25 74.7.244.0/25
"""

CONTENT_RE = re.compile(r'^/(about|services|news|faq|cases|contact|tools|self-check|privacy|shareholder-loans)(/|$)')


def nets(text):
    return [ipaddress.ip_network(x) for x in text.split() if '/' in x]


def ua_of(line):
    parts = re.findall(r'"([^"]*)"', line)
    return parts[-1] if len(parts) >= 3 else ''


def main():
    search = nets(SEARCHBOT_PREFIXES)
    gpt = nets(GPTBOT_PREFIXES)
    files, seen = [], set()
    for pattern in ('/var/log/nginx/access.log', '/var/log/nginx/access.log.1', '/var/log/nginx/access.log.*.gz'):
        for path in sorted(glob.glob(pattern)):
            real = os.path.realpath(path)
            if real not in seen:
                seen.add(real)
                files.append(path)

    stat = {
        'OAI-SearchBot': {'real': 0, 'fake': 0, 'real_pages': set(), 'fake_ips': set()},
        'GPTBot': {'real': 0, 'fake': 0, 'real_pages': set(), 'fake_ips': set()},
    }
    for path in files:
        opener = gzip.open if path.endswith('.gz') else open
        try:
            with opener(path, 'rt', encoding='utf-8', errors='replace') as f:
                for line in f:
                    ip = line.split(' ', 1)[0]
                    if ip in OUR_IPS or '"' not in line:
                        continue
                    low = ua_of(line).lower()
                    key = nets_ = None
                    if 'oai-searchbot' in low:
                        key, nets_ = 'OAI-SearchBot', search
                    elif 'gptbot' in low:
                        key, nets_ = 'GPTBot', gpt
                    if not key:
                        continue
                    try:
                        addr = ipaddress.ip_address(ip)
                    except ValueError:
                        continue
                    official = any(addr in n for n in nets_)
                    bucket = 'real' if official else 'fake'
                    stat[key][bucket] += 1
                    if official:
                        parts = line.split('"')
                        p = parts[1].split(' ')[1].split('?')[0] if len(parts) > 1 and ' ' in parts[1] else ''
                        if CONTENT_RE.match(p):
                            stat[key]['real_pages'].add(p)
                    else:
                        stat[key]['fake_ips'].add(ip)
        except OSError:
            continue

    print('用 OpenAI 官方公布 IP 段核验（来源：openai.com/searchbot.json、openai.com/gptbot.json）')
    print('=' * 84)
    for key in ('OAI-SearchBot', 'GPTBot'):
        s = stat[key]
        total = s['real'] + s['fake']
        print(f'\n【{key}】总请求 {total} 次')
        print(f'  ✅ 命中官方 IP 段（真实）: {s["real"]} 次，抓到内容页 {len(s["real_pages"])} 个')
        print(f'  ❌ 未命中官方 IP 段（伪造）: {s["fake"]} 次，涉及 {len(s["fake_ips"])} 个 IP')
        if s['fake_ips']:
            sample = ', '.join(sorted(s['fake_ips'])[:5])
            print(f'     伪造 IP 示例: {sample}')
        if s['real_pages']:
            print('     真实抓到的页面示例:')
            for p in sorted(s['real_pages'])[:5]:
                print(f'       {p}')
    print('\n' + '=' * 84)
    sb = stat['OAI-SearchBot']
    print(f'结论：ChatGPT 搜索爬虫（OAI-SearchBot）真实抓取 {len(sb["real_pages"])} 个内容页，'
          f'占其总请求的 {sb["real"]}/{sb["real"] + sb["fake"]}；其余为伪造 UA 的扫描器。')
    return 0


if __name__ == '__main__':
    sys.exit(main())
