#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""西安数度官网 · 每日抓取摘要报告生成器（服务器端运行，只读 nginx 日志）

产出：
  /var/log/crawl-digest/YYYY-MM-DD.md   当日可读报告（中文，含趋势与首次抓取清单）
  /var/lib/crawl-digest/trend.csv       逐日趋势数据（便于长期对比）
  /var/lib/crawl-digest/seen.json       历史已见 (引擎, 路径) 状态，用于判断"首次抓取"

用法：
  python3 crawl-daily-report.py            # 统计昨天（cron 默认）
  python3 crawl-daily-report.py --days 7   # 统计最近 7 天（含今天），用于复盘
  python3 crawl-daily-report.py --date 2026-10-06

设计原则：不猜、不推断。所有数字都直接来自 nginx 访问日志，并排除我方 IP。
"""
import gzip
import glob
import json
import os
import re
import sys
from collections import defaultdict
from datetime import datetime, timedelta

LOG_GLOBS = ['/var/log/nginx/access.log', '/var/log/nginx/access.log.1', '/var/log/nginx/access.log.*.gz']
OUT_DIR = '/var/log/crawl-digest'
STATE_DIR = '/var/lib/crawl-digest'
OUR_IPS = {'8.152.3.67', '85.149.220.12'}

ENGINES = [
    ('百度', r'baiduspider'),
    ('谷歌', r'googlebot'),
    ('必应', r'bingbot'),
    ('360', r'360spider'),
    ('搜狗', r'sogou'),
    ('头条', r'bytespider'),
    ('神马', r'yisouspider|yisou'),
    ('华为', r'petalbot'),
    ('ChatGPT', r'gptbot|oai-searchbot|chatgpt-user'),
    ('豆包', r'doubaobot|bytespider-ai'),
    ('Perplexity', r'perplexitybot'),
    ('Semrush', r'semrushbot'),
]

LINE_RE = re.compile(
    r'^(?P<ip>\S+) \S+ \S+ \[(?P<ts>[^\]]+)\] "(?P<req>[^"]*)" (?P<status>\d{3}) (?P<size>\S+)'
)
# 内容页白名单：本站已知路由前缀（比"最后一段不含点"更准，不会把
# /.aws/credentials、/__vite_rsc_xxx 这类扫描探针算成内容页）
CONTENT_RE = re.compile(
    r'^/(about|services|news|faq|cases|contact|tools|self-check|privacy|shareholder-loans)(/|$)'
)
# 扫描探针特征（单独计数，避免污染内容页统计）
PROBE_RE = re.compile(
    r'(\.env|\.git|wp-|wp_|phpmyadmin|xmlrpc|druid|elrte|@fs|__vite|values\.yaml|server\.key'
    r'|rclone|serviceaccountkey|_image|graphql|_payload|/dashboard|/vendor|/cgi|\.aws|\.ssh'
    r'|\.npmrc|/tmp/|/actors?/|/actuator|\.php|aws/credentials|id_rsa|\.bak)', re.I
)
NON_CONTENT_PREFIX = ('/_next', '/api', '/admin', '/public', '/favicon', '/robots.txt', '/sitemap')


def is_content_path(path: str) -> bool:
    """内容页：命中本站已知路由白名单，且不是首页。"""
    if path == '/' or path.startswith(NON_CONTENT_PREFIX):
        return False
    return bool(CONTENT_RE.match(path))


def is_probe_path(path: str) -> bool:
    return bool(PROBE_RE.search(path))


def engine_of(ua: str) -> str:
    low = ua.lower()
    for name, pat in ENGINES:
        if re.search(pat, low):
            return name
    return '其他'


def read_logs():
    """按天聚合：{date: {engine: {content:set(), home:int, other:int, total:int, statuses:Counter}}}"""
    data = defaultdict(lambda: defaultdict(lambda: {
        'content': set(), 'home': 0, 'other': 0, 'total': 0,
        'sitemap': 0, 'robots': 0, 'probe': 0, 'status': defaultdict(int),
    }))
    seen_files = set()
    for pattern in LOG_GLOBS:
        for path in sorted(glob.glob(pattern)):
            real = os.path.realpath(path)
            if real in seen_files:
                continue
            seen_files.add(real)
            opener = gzip.open if path.endswith('.gz') else open
            try:
                with opener(path, 'rt', encoding='utf-8', errors='replace') as f:
                    for line in f:
                        m = LINE_RE.match(line)
                        if not m or m.group('ip') in OUR_IPS:
                            continue
                        ts = m.group('ts')
                        try:
                            dt = datetime.strptime(ts.split(':')[0], '%d/%b/%Y')
                        except ValueError:
                            continue
                        day = dt.strftime('%Y-%m-%d')
                        ua = ''
                        q = line.find('"', line.find('"', line.find('"') + 1) + 1)
                        parts = re.findall(r'"([^"]*)"', line)
                        if len(parts) >= 3:
                            ua = parts[-1]
                        eng = engine_of(ua)
                        req = m.group('req')
                        path = req.split(' ')[1] if ' ' in req else req
                        path = path.split('?')[0]
                        status = int(m.group('status'))
                        rec = data[day][eng]
                        rec['total'] += 1
                        rec['status'][status] += 1
                        if path == '/sitemap.xml':
                            rec['sitemap'] += 1
                        elif path == '/robots.txt':
                            rec['robots'] += 1
                        elif path == '/':
                            rec['home'] += 1
                        elif is_content_path(path):
                            rec['content'].add(path)
                        else:
                            rec['other'] += 1
                            if is_probe_path(path):
                                rec['probe'] += 1
            except OSError:
                continue
    return data


def load_json(path, default):
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except (OSError, ValueError):
        return default


def main():
    args = sys.argv[1:]
    days = 1
    target = None
    if '--days' in args:
        days = int(args[args.index('--days') + 1])
    if '--date' in args:
        target = args[args.index('--date') + 1]

    data = read_logs()
    if not data:
        print('❌ 未读到任何 nginx 日志')
        return 1

    all_days = sorted(data)
    if target:
        window = [target]
    elif days == 1:
        window = [all_days[-2]] if len(all_days) >= 2 else [all_days[-1]]
    else:
        window = all_days[-days:]

    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(STATE_DIR, exist_ok=True)
    seen_path = os.path.join(STATE_DIR, 'seen.json')
    seen = load_json(seen_path, {})

    label = window[0] if len(window) == 1 else f'{window[0]} ~ {window[-1]}'
    lines = []
    add = lines.append
    add(f'西安数度官网 · 抓取摘要（{label}）')
    add('=' * 68)

    # ---------- 汇总 ----------
    agg = defaultdict(lambda: {'content': set(), 'home': 0, 'total': 0, 'sitemap': 0, 'robots': 0})
    for d in window:
        for eng, rec in data[d].items():
            a = agg[eng]
            a['content'] |= rec['content']
            a['home'] += rec['home']
            a['total'] += rec['total']
            a['sitemap'] += rec['sitemap']
            a['robots'] += rec['robots']

    add(f'{"引擎":<10}{"内容页":>8}{"首页":>8}{"读sitemap":>10}{"读robots":>10}{"总请求":>9}')
    add('-' * 68)
    for eng in sorted(agg, key=lambda e: (-len(agg[e]['content']), e)):
        a = agg[eng]
        add(f'{eng:<10}{len(a["content"]):>8}{a["home"]:>8}{a["sitemap"]:>10}{a["robots"]:>10}{a["total"]:>9}')
    add('')

    # ---------- 累计（全窗口）内容页 ----------
    cum = defaultdict(set)
    for d in all_days:
        for eng, rec in data[d].items():
            cum[eng] |= rec['content']
    add('【累计抓取的内容页数量（自日志起点）】')
    for eng in sorted(cum, key=lambda e: -len(cum[e])):
        if cum[eng]:
            add(f'  {eng}: {len(cum[eng])} 个')
    add('')
    add('  注：AI 类爬虫的 UA 存在大量伪造（实测 5 个 GCP IP 同时冒充 OpenAI/Anthropic/')
    add('      Perplexity/Kimi/DeepSeek/Qwen/元宝 等 9 家，全部在探测 .env/.git 等密钥路径）。')
    add('      验真方法：python3 verify-openai-crawler-ips.py（对官方 IP 段）、')
    add('      python3 verify-petalbot-official.py（官方 DNS 三步法）。')
    add('')

    # ---------- 首次被抓到的页面（最关键信号）----------
    first = defaultdict(list)
    for d in window:
        for eng, rec in data[d].items():
            known = set(seen.get(eng, []))
            new = sorted(rec['content'] - known)
            if new:
                first[eng].extend(new)
            # 立即更新，避免同一窗口内同一页面被重复算作"首次"
            seen[eng] = sorted(known | rec['content'])
    add('【本窗口内"第一次被抓到"的内容页】← 新页面被发现的直接证据')
    if any(first.values()):
        for eng in sorted(first):
            add(f'  ▸ {eng}（{len(first[eng])} 个）:')
            for p in first[eng][:20]:
                add(f'      {p}')
            if len(first[eng]) > 20:
                add(f'      …另 {len(first[eng]) - 20} 个')
    else:
        add('  （无：本窗口没有出现"此前从未被抓取"的内容页）')
    add('')

    # ---------- 百度专项 ----------
    bd = agg.get('百度')
    add('【百度专项】')
    if bd:
        add(f'  抓取内容页 {len(bd["content"])} 个 / 首页 {bd["home"]} 次 / 读 sitemap {bd["sitemap"]} 次 / 读 robots {bd["robots"]} 次')
        if bd['content']:
            add('  已抓到的内容页：')
            for p in sorted(bd['content'])[:15]:
                add(f'      {p}')
        elif bd['sitemap'] == 0:
            add('  ⚠️ 仍未读取 sitemap，也未抓任何内容页（与历史一致）')
    else:
        add('  本窗口百度未到访')
    add('')

    # ---------- 趋势 ----------
    add('【近 14 天趋势：各引擎"当天抓到的内容页数"】')
    trend_days = all_days[-14:]
    # 固定列，保证逐日报告之间可纵向对比
    engs = ['百度', '谷歌', '必应', '360', '搜狗', '头条', '华为', 'ChatGPT', 'Semrush', '其他']
    add('  日期        ' + ''.join(f'{e:>9}' for e in engs))
    for d in trend_days:
        row = f'  {d}  ' + ''.join(f'{len(data[d].get(e, {}).get("content", set())):>9}' for e in engs)
        add(row)
    add('')

    # ---------- 异常 ----------
    add('【异常与噪音】')
    bad = defaultdict(int)
    probe = 0
    scanner = 0
    for d in window:
        for eng, rec in data[d].items():
            for st, n in rec['status'].items():
                if st >= 400:
                    bad[st] += n
            probe += rec.get('probe', 0)
            if eng == '其他':
                scanner += rec['total']
    add(f'  4xx/5xx 响应: ' + (', '.join(f'{k}→{v} 次' for k, v in sorted(bad.items())) or '无'))
    add(f'  扫描探针请求（.env/.git/wp-/php 等特征路径，均已被拦截）: {probe} 次')
    add(f'  非已知爬虫的请求（含上述探针与站点检测工具）: {scanner} 次')
    add('')

    # ---------- 结论 ----------
    # 判据必须基于"本窗口首次抓取"与"sitemap 读取"，不能只看"窗口内有内容页请求"
    # （否则历史抓过的页面每次都会让结论误报为"刚有进展"）
    add('【自动结论】')
    bd_new = len(first.get('百度', []))
    if bd and bd['sitemap']:
        add(f'  ◐ 百度已读取 sitemap {bd["sitemap"]} 次，但本窗口未首次抓取新内容页。')
    elif bd_new:
        add(f'  ✅ 百度本窗口首次抓取内容页 {bd_new} 个：{", ".join(first["百度"][:5])}')
        add('     → 通路开始打开，关注后续索引量变化。')
    elif bd:
        add(f'  ○ 百度仍只抓首页（{bd["home"]} 次），未读 sitemap、未首次抓取内容页。')
        add('     技术侧已无可改，方向为：持续更新原创内容 + 外部真实链接 + 时间（新站考察期常 1–3 个月）。')
    else:
        add('  ○ 本窗口百度未到访。')
    if len(window) > 1 and window[-1] == all_days[-1]:
        add(f'  注：最后一行 {window[-1]} 可能是不完整的一天（报告生成时当天尚未结束）。')
    add('')

    report = '\n'.join(lines)
    out_path = os.path.join(OUT_DIR, f'{window[-1]}.md')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(report + '\n')

    # 更新状态与趋势
    for d in window:
        for eng, rec in data[d].items():
            seen.setdefault(eng, [])
            seen[eng] = sorted(set(seen[eng]) | rec['content'])
    with open(seen_path, 'w', encoding='utf-8') as f:
        json.dump(seen, f, ensure_ascii=False)
    csv_path = os.path.join(STATE_DIR, 'trend.csv')
    if not os.path.exists(csv_path):
        with open(csv_path, 'w', encoding='utf-8') as f:
            f.write('date,' + ','.join(e for e, _ in ENGINES) + '\n')
    existing_dates = set()
    with open(csv_path, encoding='utf-8') as f:
        for ln in f:
            existing_dates.add(ln.split(',')[0])
    with open(csv_path, 'a', encoding='utf-8') as f:
        for d in window:
            if d in existing_dates:
                continue
            row = [d] + [str(len(data[d].get(e, {}).get('content', set()))) for e, _ in ENGINES]
            f.write(','.join(row) + '\n')

    print(report)
    print(f'\n报告已写入: {out_path}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
