#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 nginx 日志中提取"扫描/冒充攻击"来源 IP 清单（只读），供拉黑决策使用。
判据：请求命中敏感探测路径（.env/.git/@fs/config.js/wp- 等），或同一 IP 以多种爬虫身份出现。"""
import collections
import datetime
import gzip
import os
import re
import subprocess

LINE = re.compile(
    r'(?P<ip>\d+\.\d+\.\d+\.\d+) - - \[(?P<ts>[^\]]+)\] "(?P<method>\S+) (?P<path>\S+)[^"]*" '
    r'(?P<status>\d{3}) \S+ "(?P<ref>[^"]*)" "(?P<ua>[^"]*)"'
)
PROBE = re.compile(
    r'\.(env|git|svn|ssh|aws|key|pem|sql|bak|zip|rar|7z|ini|conf|yml|yaml|json|py|lock|swp|swo|old|orig|map)(/|$|\?)|'
    r'/(wp-|wordpress|phpmyadmin|xmlrpc|vendor/|\.git|\.env|\.aws|cgi-bin|actuator|config|backup|db\.|'
    r'docker|jenkins|solr|hudson|console|manager|shell|eval|boaform|HNAP1|GponForm|setup\.cgi|login\.cgi|'
    r'owa/|autodiscover|@fs/|appsettings|service-account|composer|package\.json|settings\.|auth\.json|\.npmrc|'
    r'\.htpasswd|\.boto|\.s3cfg|\.yarnrc|\.eslintrc|webpack\.config|babel\.config|jest\.config|web\.config|application\.properties)', re.I
)
BOTNAME = re.compile(
    r'(Baiduspider|Googlebot|bingbot|YandexBot|ClaudeBot|PerplexityBot|Applebot|GPTBot|ChatGPT-User|'
    r'Bytespider|CCBot|Amazonbot|PetalBot|Sogou|360Spider|SemrushBot|AhrefsBot|DeepSeek|Meta-ExternalAgent)', re.I
)

files = sorted(
    [os.path.join('/var/log/nginx', f) for f in os.listdir('/var/log/nginx') if 'access' in f and 'log' in f],
    key=lambda p: os.path.getmtime(p),
)

days = 4
today = datetime.date.today()
hits = collections.defaultdict(lambda: {'n': 0, 'paths': collections.Counter(), 'uas': collections.Counter(),
                                        'status': collections.Counter(), 'first': None, 'last': None, 'days': set()})
for fp in files:
    opener = gzip.open if fp.endswith('.gz') else open
    try:
        with opener(fp, 'rt', encoding='utf-8', errors='replace') as fh:
            for line in fh:
                m = LINE.search(line)
                if not m:
                    continue
                ts = m.group('ts')
                try:
                    d = datetime.datetime.strptime(ts.split(':')[0], '%d/%b/%Y').date()
                except ValueError:
                    continue
                if (today - d).days > days:
                    continue
                path = m.group('path')
                ua = m.group('ua')
                if not PROBE.search(path) and not re.search(r'\.(env|git|npmrc|htpasswd)', path, re.I):
                    continue
                ip = m.group('ip')
                h = hits[ip]
                h['n'] += 1
                h['paths'][path[:70]] += 1
                h['uas'][ua[:70]] += 1
                h['status'][m.group('status')] += 1
                h['days'].add(str(d))
                h['first'] = ts if h['first'] is None else h['first']
                h['last'] = ts
    except Exception as e:  # noqa: BLE001
        print(f'[跳过 {fp}] {e}')

print('=' * 78)
print(f'  近 {days} 天对本站做敏感路径探测的来源 IP（按请求数排序，只读统计）')
print(f'  服务器时间: {datetime.datetime.now():%Y-%m-%d %H:%M:%S}')
print('=' * 78)
rows = sorted(hits.items(), key=lambda kv: -kv[1]['n'])
for ip, h in rows[:25]:
    ids = {BOTNAME.search(u).group(1) for u in h['uas'] if BOTNAME.search(u)}
    print(f'\n  {ip}   共 {h["n"]} 次   涉及 {len(h["days"])} 天')
    print(f'     状态码: ' + ' '.join(f'{k}×{v}' for k, v in h['status'].most_common(5)))
    print(f'     冒充身份({len(ids)} 种): ' + (', '.join(sorted(ids)) if ids else '（未冒充爬虫）'))
    print(f'     最后请求: {h["last"]}')
    for p, c in h['paths'].most_common(3):
        print(f'       {c:>4} × {p}')

print('\n' + '=' * 78)
print(f'  合计 {len(rows)} 个探测 IP，总请求 {sum(h["n"] for _, h in rows)} 次')
big = [(ip, h) for ip, h in rows if h['n'] >= 20]
print(f'  其中请求数 ≥20 的"主力"攻击 IP：{len(big)} 个')
for ip, h in big:
    ids = {BOTNAME.search(u).group(1) for u in h['uas'] if BOTNAME.search(u)}
    print(f'    {ip:<18} {h["n"]:>4} 次  冒充 {len(ids)} 种身份  状态码 '
          + ' '.join(f'{k}×{v}' for k, v in h['status'].most_common(3)))
print('\n  是否已有 444（nginx 直接关闭连接＝拦截成功）:',
      '是' if any('444' in h['status'] for _, h in rows) else '否')
print('  探测是否拿到过 200（＝可能泄露）:',
      '有 ⚠️' if any(h['status'].get('200') for _, h in rows) else '无 ✅ 未泄露')
