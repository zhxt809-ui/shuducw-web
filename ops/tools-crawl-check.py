#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""统计搜索引擎对工具页（/tools/*）的抓取情况：按 UA × 路径 × 状态码"""
import gzip
import io
import os
import re
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
LOG_DIR = '/var/log/nginx'
FILES = ['access.log', 'access.log.1'] + sorted(
    f for f in os.listdir(LOG_DIR) if re.match(r'access\.log\.\d+\.gz$', f)) if os.path.isdir(LOG_DIR) else []

UA_MAP = [
    ('Baiduspider', '百度'), ('Googlebot', '谷歌'), ('bingbot', '必应'), ('360Spider', '360'),
    ('Sogou', '搜狗'), ('Toutiao', '头条'), ('Bytespider', '头条'), ('PetalBot', '华为'),
    ('YisouSpider', '神马'), ('OAI-SearchBot', 'ChatGPT'), ('GPTBot', 'GPTBot'),
    ('SemrushBot', 'Semrush'), ('AhrefsBot', 'Ahrefs'), ('YandexBot', 'Yandex'),
]
TOOL_RE = re.compile(r'^/tools/(vat|income-tax|rmb-uppercase)(/|$|\?)')
LOG_RE = re.compile(r'^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+)[^"]*" (\d{3}) \S+ "([^"]*)" "([^"]*)"')

stats = defaultdict(lambda: defaultdict(int))
status_by_engine = defaultdict(lambda: defaultdict(int))
paths = defaultdict(int)

for name in FILES:
    path = os.path.join(LOG_DIR, name)
    if not os.path.exists(path):
        continue
    opener = gzip.open if path.endswith('.gz') else open
    try:
        with opener(path, 'rt', encoding='utf-8', errors='replace') as f:
            for line in f:
                m = LOG_RE.match(line)
                if not m:
                    continue
                _ip, _t, _meth, url, code, _ref, ua = m.groups()
                if not TOOL_RE.match(url):
                    continue
                if 'shuducw' in ua.lower() and 'spider' not in ua.lower():
                    continue
                eng = '其他/浏览器'
                for key, label in UA_MAP:
                    if key.lower() in ua.lower():
                        eng = label
                        break
                clean = url.split('?')[0]
                paths[clean] += 1
                stats[eng][clean] += 1
                status_by_engine[eng][code] += 1
    except OSError as e:
        print(f'  读取 {name} 失败: {e}')

print('===== 工具页被抓取次数（按引擎，全部日志窗口）=====')
if not stats:
    print('  （无任何对 /tools/* 的请求记录）')
for eng in sorted(stats, key=lambda e: -sum(stats[e].values())):
    total = sum(stats[eng].values())
    detail = ', '.join(f'{p.replace("/tools/", "")}×{n}' for p, n in sorted(stats[eng].items(), key=lambda kv: -kv[1]))
    codes = ', '.join(f'{c}:{n}' for c, n in sorted(status_by_engine[eng].items()))
    print(f'  {eng:<12} 共 {total:>4} 次 | {detail} | 状态 {codes}')

print('\n===== 各工具页合计 =====')
for p in ['/tools/vat', '/tools/income-tax', '/tools/rmb-uppercase']:
    print(f'  {p:<26} {paths.get(p, 0)} 次')
print(f'  {"（含其他 /tools/ 路径）":<24} {sum(v for k, v in paths.items() if k not in ("/tools/vat", "/tools/income-tax", "/tools/rmb-uppercase"))} 次')
