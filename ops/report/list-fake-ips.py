#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""列出"一个 IP 冒充多种爬虫身份"的伪装扫描器 IP（读 nginx 日志，只读）。

复用 daily-search-data.py 的日志解析与爬虫识别逻辑，只输出多身份 IP，
按冒充身份数从多到少排序。用法：/usr/bin/python3 list-fake-ips.py [天数]
（默认最近 4 天）。
"""
import collections
import datetime
import re
import subprocess
import sys


def sh(cmd, timeout=180):
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
        return (r.stdout or '') + (r.stderr or '')
    except Exception as e:  # noqa: BLE001
        return f'[命令异常] {e}'


days = int(sys.argv[1]) if len(sys.argv) > 1 else 4
today = datetime.date.today()

BOTS = [
    'baiduspider', 'baidu', 'googlebot', 'google', 'bingbot', 'bingpreview',
    'sogou', '360spider', 'haosou', 'yisouspider', 'yandex', 'duckduckbot',
    'applebot', 'bytespider', 'bytedance', 'petalbot', 'gptbot', 'oai-searchbot',
    'chatgpt', 'claudebot', 'anthropic', 'perplexitybot', 'ccbot', 'amazonbot',
    'meta-externalagent', 'deepseek', 'qwen', 'semrush', 'ahrefs', 'mj12bot',
    'python-requests',
]
LINE = re.compile(
    r'^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) ([^"]*?) [^"]*" (\d{3}) (\S+)'
    r'(?: "([^"]*)" "([^"]*)")?'
)


def classify(ua):
    low = (ua or '').lower()
    for key in BOTS:
        if key in low:
            return key
    return None


logs = [x for x in sh('ls -1 /var/log/nginx/*access*.log* 2>/dev/null').split() if x.strip()]

ip_ids = collections.defaultdict(set)
ip_total = collections.Counter()
ip_200 = collections.Counter()
ip_ua = {}

for i in range(days):
    d = today - datetime.timedelta(days=i)
    stamp = d.strftime('%d/%b/%Y')
    for lf in logs:
        grep = 'zgrep' if lf.endswith('.gz') else 'grep'
        out = sh(f'{grep} -F "{stamp}" {lf} 2>/dev/null | tail -n 400000')
        for line in out.splitlines():
            m = LINE.match(line)
            if not m:
                continue
            ip, _ts, _m, path, status, _s, _r, ua = m.groups()
            bot = classify(ua)
            if bot is None:
                continue
            ip_ids[ip].add(bot)
            ip_total[ip] += 1
            if status == '200':
                ip_200[ip] += 1
            ip_ua.setdefault(ip, set()).add((ua or '')[:90])

print(f'近 {days} 天：同一 IP 出现 >=2 种爬虫身份的伪装扫描器共 {len(ip_ids)} 个：\n')
for ip, ids in sorted(ip_ids.items(), key=lambda kv: -len(kv[1])):
    print(f'  {ip}  冒充 {len(ids)} 种身份  总请求 {ip_total[ip]} 次(200×{ip_200[ip]})')
    print(f'      身份: {", ".join(sorted(ids))}')
    for ua in list(ip_ua[ip])[:2]:
        print(f'      UA 例: {ua}')
    print()
