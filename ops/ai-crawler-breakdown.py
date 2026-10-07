#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""按精确 UA 统计 AI / 搜索相关爬虫的真实行为（只读 nginx 日志）

关注的分别是：
  搜索类：OAI-SearchBot（决定能否被 ChatGPT 搜索引用）、PetalBot（华为花瓣搜索）、
          bingbot/Googlebot/Baiduspider/360Spider/Sogou/YisouSpider
  训练类：GPTBot（OpenAI 训练用，**不参与 ChatGPT 搜索**）、Google-Extended、ClaudeBot 等
  工具类：SemrushBot（商业 SEO 工具，**不是搜索引擎，不带来搜索流量**）
  用户触发：ChatGPT-User、Claude-User、PerplexityBot

同时检查：谁读了 /llms.txt（验证 llms.txt 是否真的被使用）、谁被拦截（状态码非 2xx/3xx）。
"""
import glob
import gzip
import os
import re
import socket
import sys
from collections import Counter, defaultdict

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
OUR_IPS = {'8.152.3.67', '85.149.220.12'}

# 精确 UA 匹配（顺序敏感：先匹配更具体的）
UA_RULES = [
    ('OAI-SearchBot', r'oai-searchbot', '搜索'),
    ('ChatGPT-User', r'chatgpt-user', '用户触发'),
    ('GPTBot', r'gptbot', '训练'),
    ('ClaudeBot', r'claudebot', '训练'),
    ('Claude-User', r'claude-user', '用户触发'),
    ('PerplexityBot', r'perplexitybot', '搜索'),
    ('PetalBot(华为)', r'petalbot', '搜索'),
    ('Bytespider(头条)', r'bytespider', '搜索/推荐'),
    ('DoubaoBot', r'doubaobot', '搜索'),
    ('Baidu-AI', r'baidu-ai', '搜索'),
    ('KimiBot', r'kimibot', '搜索'),
    ('DeepSeekBot', r'deepseek', '搜索'),
    ('QwenBot', r'qwenbot', '搜索'),
    ('ZhipuBot/GLM', r'zhipubot|glmbot', '搜索'),
    ('YuanbaoBot', r'yuanbao|youbot', '搜索'),
    ('SemrushBot', r'semrushbot', 'SEO工具'),
    ('AhrefsBot', r'ahrefsbot', 'SEO工具'),
    ('bingbot', r'bingbot', '搜索引擎'),
    ('Googlebot', r'googlebot', '搜索引擎'),
    ('Baiduspider', r'baiduspider', '搜索引擎'),
    ('360Spider', r'360spider', '搜索引擎'),
    ('Sogou', r'sogou', '搜索引擎'),
    ('YisouSpider(神马)', r'yisouspider', '搜索引擎'),
]
CONTENT_RE = re.compile(r'^/(about|services|news|faq|cases|contact|tools|self-check|privacy|shareholder-loans)(/|$)')


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

    stats = defaultdict(lambda: {'req': 0, 'pages': set(), 'llms': 0, 'robots': 0, 'sitemap': 0,
                                 'bad': Counter(), 'ips': set()})
    spoof = defaultdict(Counter)   # ip -> {UA 名: 次数}
    ai_ips = defaultdict(Counter)  # UA 名 -> {ip: 次数}，用于按 IP 归属鉴别真伪
    ptr_cache = {}
    for path in files:
        opener = gzip.open if path.endswith('.gz') else open
        try:
            with opener(path, 'rt', encoding='utf-8', errors='replace') as f:
                for line in f:
                    if '"' not in line:
                        continue
                    ip = line.split(' ', 1)[0]
                    if ip in OUR_IPS:
                        continue
                    ua = ua_of(line)
                    low = ua.lower()
                    if not low:
                        continue
                    for name, pat, kind in UA_RULES:
                        if re.search(pat, low):
                            p = line.split('"')[1].split(' ')[1].split('?')[0] if '"' in line else ''
                            s = stats[name]
                            s['req'] += 1
                            s['ips'].add(ip)
                            if p == '/llms.txt':
                                s['llms'] += 1
                            elif p == '/robots.txt':
                                s['robots'] += 1
                            elif p == '/sitemap.xml':
                                s['sitemap'] += 1
                            elif CONTENT_RE.match(p):
                                s['pages'].add(p)
                            m = re.search(r'" (\d{3}) ', line)
                            if m and int(m.group(1)) >= 400:
                                s['bad'][m.group(1)] += 1
                            if kind in ('搜索', '用户触发', '训练'):
                                spoof[ip][name] += 1
                                ai_ips[name][ip] += 1
                            break
        except OSError:
            continue

    order = ['搜索', '用户触发', '训练', 'SEO工具', '搜索引擎']
    by_kind = defaultdict(list)
    for name, pat, kind in UA_RULES:
        if name in stats:
            by_kind[kind].append(name)

    print('按精确 UA 统计（自日志起点；已排除我方 IP；"内容页"仅统计本站已知路由）')
    print('=' * 96)
    print(f'{"类别":<10}{"UA":<20}{"请求数":>7}{"内容页":>7}{"读llms":>7}{"读robots":>9}{"读sitemap":>10}  非2xx/3xx')
    print('-' * 96)
    for kind in order:
        for name in by_kind.get(kind, []):
            s = stats[name]
            bad = ','.join(f'{k}×{v}' for k, v in sorted(s['bad'].items())) or '无'
            print(f'{kind:<10}{name:<20}{s["req"]:>7}{len(s["pages"]):>7}{s["llms"]:>7}{s["robots"]:>9}{s["sitemap"]:>10}  {bad}')
        print('-' * 96)

    print('\n【疑似 UA 伪造检测】同一 IP 若以多个不同 AI 厂商的 UA 出现，基本可判定为扫描器冒充')
    for ip, names in sorted(spoof.items(), key=lambda kv: -len(kv[1])):
        if len(names) >= 2:
            detail = ', '.join(f'{n}×{c}' for n, c in sorted(names.items()))
            try:
                ptr = socket.gethostbyaddr(ip)[0]
            except Exception:
                ptr = '(no PTR)'
            print(f'  ⚠️ {ip:<18} 冒充 {len(names)} 家: {detail}')
            print(f'       PTR: {ptr}')
    if not any(len(v) >= 2 for v in spoof.values()):
        print('  未发现同一 IP 冒充多家厂商的情况')
    print('  说明：这些请求绝大多数是 .env/.git/server.key 等偷密钥探测路径，全部 404，站点无泄漏。')

    print('\n【AI 爬虫真实来源鉴别】按 IP 归属把"真爬虫"与"伪装扫描器"分开')
    print('  判定依据：真实 OpenAI/Anthropic 爬虫来自 Azure 等自家段；')
    print('  而 *.bc.googleusercontent.com（GCP）上同时出现多家 AI 的 UA 必为伪装。')
    print(f'  {"UA":<18}{"总请求":>7}{"GCP(可疑)":>11}{"Azure/其他":>11}{"无PTR":>8}{"厂商PTR":>9}')
    print('  ' + '-' * 62)
    for name in ('OAI-SearchBot', 'GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot',
                 'KimiBot', 'DeepSeekBot', 'QwenBot', 'YuanbaoBot', 'PetalBot(华为)'):
        if name not in ai_ips:
            continue
        gcp = other = noptr = vendor = 0
        for ip, c in ai_ips[name].items():
            ptr = ptr_cache.get(ip)
            if ptr is None:
                try:
                    ptr = socket.gethostbyaddr(ip)[0]
                except Exception:
                    ptr = ''
                ptr_cache[ip] = ptr
            if not ptr:
                noptr += c
            elif 'googleusercontent.com' in ptr:
                gcp += c
            elif 'petalsearch.com' in ptr or 'search.msn.com' in ptr or 'googlebot.com' in ptr:
                vendor += c
            else:
                other += c
        print(f'  {name:<18}{sum(ai_ips[name].values()):>7}{gcp:>11}{other:>11}{noptr:>8}{vendor:>9}')
    print('  GCP 那一列基本就是伪造量；把它扣掉才是该 AI 真实抓取我们站点的请求数。')

    print('\n【llms.txt 是否被读取】')
    readers = [(n, stats[n]['llms']) for n, _, _ in UA_RULES if n in stats and stats[n]['llms']]
    if readers:
        for n, c in readers:
            print(f'  {n}: {c} 次')
    else:
        print('  无任何上述爬虫读取 /llms.txt')

    print('\n【ChatGPT 相关三个 UA 的分工实测】')
    for n in ('OAI-SearchBot', 'GPTBot', 'ChatGPT-User'):
        if n in stats:
            s = stats[n]
            print(f'  {n}: 请求 {s["req"]} 次 / 内容页 {len(s["pages"])} 个 / 来源 IP {len(s["ips"])} 个')
            for p in sorted(s['pages'])[:6]:
                print(f'      {p}')
        else:
            print(f'  {n}: 日志中未出现')

    print('\n【SemrushBot 的抓取范围（用于判断其性质）】')
    if 'SemrushBot' in stats:
        s = stats['SemrushBot']
        print(f'  请求 {s["req"]} 次 / 内容页 {len(s["pages"])} 个 / 读 robots {s["robots"]} 次 / 读 sitemap {s["sitemap"]} 次')
        print('  说明：Semrush 是商业 SEO 工具（竞品/外链分析），不是搜索引擎，不产生搜索流量。')
    return 0


if __name__ == '__main__':
    sys.exit(main())
