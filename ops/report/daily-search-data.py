#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""采集官网当日搜索引擎抓取与站点运营数据（只读脚本，不改动服务器任何文件）"""
import collections
import datetime
import json
import os
import re
import subprocess
import sys


def sh(cmd, timeout=180):
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
        return (r.stdout or '') + (r.stderr or '')
    except Exception as e:  # noqa: BLE001
        return f'[命令异常] {e}'


if len(sys.argv) > 1:
    today = datetime.date.fromisoformat(sys.argv[1])
else:
    today = datetime.date.today()
print('=' * 68)
print('  日期:', today.isoformat(), '| 服务器时间:', sh('date "+%F %T %Z"').strip())
print('=' * 68)

# ---------- 1. 日志文件 ----------
logs = [x for x in sh('ls -1 /var/log/nginx/*access*.log* 2>/dev/null').split() if x.strip()]
print('\n【1】nginx 日志文件:', logs if logs else '（未找到）')

stamp = today.strftime('%d/%b/%Y')          # 07/Oct/2026
LINE = re.compile(
    r'^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) ([^"]*?) [^"]*" (\d{3}) (\S+)'
    r'(?: "([^"]*)" "([^"]*)")?'
)

BOTS = [
    ('baiduspider', '百度 Baiduspider'), ('baidu', '百度 其他'),
    ('googlebot', 'Google Googlebot'), ('google', 'Google 其他'),
    ('bingbot', 'Bing bingbot'), ('bingpreview', 'Bing Preview'),
    ('sogou', '搜狗 Sogou'), ('360spider', '360 搜索'), ('haosou', '360 好搜'),
    ('yisouspider', '神马 YisouSpider'), ('yandex', 'Yandex'),
    ('duckduckbot', 'DuckDuckGo'), ('applebot', 'Applebot'),
    ('bytespider', '字节 Bytespider'), ('bytedance', '字节 其他'),
    ('petalbot', '华为 PetalBot'), ('gptbot', 'OpenAI GPTBot'),
    ('oai-searchbot', 'OpenAI SearchBot'), ('chatgpt', 'ChatGPT'),
    ('claudebot', 'Anthropic ClaudeBot'), ('anthropic', 'Anthropic 其他'),
    ('perplexitybot', 'PerplexityBot'), ('ccbot', 'CommonCrawl CCBot'),
    ('amazonbot', 'Amazonbot'), ('meta-externalagent', 'Meta'),
    ('deepseek', 'DeepSeek'), ('qwen', '通义千问'), ('semrush', 'Semrush'),
    ('ahrefs', 'Ahrefs'), ('mj12bot', 'MJ12bot'), ('python-requests', '脚本 python-requests'),
]


def classify(ua):
    low = (ua or '').lower()
    for key, label in BOTS:
        if key in low:
            return label
    return None


def is_bot(ua):
    return classify(ua) is not None


def parse(logfile):
    """只取指定日期的日志行，避免整文件读入；.gz 归档用 zgrep"""
    grep = 'zgrep' if logfile.endswith('.gz') else 'grep'
    out = sh(f'{grep} -F "{stamp}" {logfile} 2>/dev/null | tail -n 400000')
    rows = []
    for line in out.splitlines():
        m = LINE.match(line)
        if not m:
            continue
        ip, ts, method, path, status, size, ref, ua = m.groups()
        rows.append({'ip': ip, 'path': path, 'status': status, 'ref': ref or '', 'ua': ua or ''})
    return rows


all_rows = []
for lf in logs:
    all_rows += parse(lf)

if not all_rows:
    print('  今日暂无日志记录（或日志格式与预期不符）')

tot = len(all_rows)
ips = {r['ip'] for r in all_rows}
bot_rows = [r for r in all_rows if is_bot(r['ua'])]
human = [r for r in all_rows if not is_bot(r['ua'])]
print(f'\n【2】今日请求总览')
print(f'  总请求 {tot} 次 / 独立 IP {len(ips)} 个 / 爬虫 {len(bot_rows)} 次 / 非爬虫 {len(human)} 次')

# ---------- 3. 爬虫明细 ----------
by_bot = collections.Counter(classify(r['ua']) for r in bot_rows)
print('\n【3】今日搜索引擎与 AI 爬虫明细')
if by_bot:
    for name, n in by_bot.most_common():
        sub = [r for r in bot_rows if classify(r['ua']) == name]
        ok = sum(1 for r in sub if r['status'] == '200')
        bad = collections.Counter(r['status'] for r in sub if r['status'] != '200')
        badstr = ('  异常状态: ' + ' '.join(f'{k}×{v}' for k, v in bad.most_common(4))) if bad else ''
        print(f'  {name:<22} {n:>5} 次   200: {ok:<5}{badstr}')
    uas = collections.Counter(r['ua'][:80] for r in bot_rows)
    print('  —— 爬虫 UA 原样（前 6 个，用于识别伪造）——')
    for ua, n in uas.most_common(6):
        print(f'    {n:>4}× {ua}')
else:
    print('  今日无爬虫访问记录')

print('\n【3.5】重点爬虫的请求明细（它们是"成功拿到页面"还是"只拿到跳转/404"）')
for want in ('百度 Baiduspider', 'Google Googlebot', 'ChatGPT', 'OpenAI SearchBot', 'Bing bingbot',
             '华为 PetalBot', '360 搜索', '字节 Bytespider'):
    sub = [r for r in bot_rows if classify(r['ua']) == want]
    if not sub:
        continue
    print(f'  ■ {want}（{len(sub)} 次）')
    for (path, st), n in collections.Counter((r['path'], r['status']) for r in sub).most_common(8):
        print(f'      {n:>3} × {st}  {path[:88]}')

# ---------- 4. 新页面是否被抓 ----------
print('\n【4】今日对"新页面"的抓取（工具中心 / 行业页 / 年终奖页）')
NEW = ['/tools', '/tools/bonus-tax', '/tools/vat', '/tools/income-tax', '/tools/rmb-uppercase',
       '/services/industry/', '/services/live-commerce']
hit_any = False
for p in NEW:
    n = sum(1 for r in bot_rows if r['path'].startswith(p))
    if n:
        hit_any = True
        bots = collections.Counter(classify(r['ua']) for r in bot_rows if r['path'].startswith(p))
        print(f'  {p:<26} {n:>4} 次  ' + ' '.join(f'{k}×{v}' for k, v in bots.most_common(3)))
if not hit_any:
    print('  今日爬虫未抓取上述新页面（IndexNow 已提交，抓取通常有延迟）')

# ---------- 5. 路径与状态码 ----------
print('\n【5】今日 Top 15 请求路径（全部访问）')
for p, n in collections.Counter(r['path'] for r in all_rows).most_common(15):
    print(f'  {n:>5} × {p[:96]}')

print('\n【6】今日状态码分布')
for s, n in collections.Counter(r['status'] for r in all_rows).most_common():
    print(f'  {s}: {n}')
bad404 = collections.Counter(r['path'] for r in all_rows if r['status'] in ('404', '444', '403', '500', '502'))
if bad404:
    print('  —— 非 2xx 的 Top 10 路径 ——')
    for p, n in bad404.most_common(10):
        print(f'    {n:>5} × {p[:96]}')

print('\n【7】非爬虫访问的真实构成（区分浏览器 / 扫描器 / 脚本）')
SCAN_PAT = re.compile(
    r'\.(env|git|svn|ssh|aws|key|pem|sql|bak|zip|rar|7z|log|ini|conf|yml|yaml|json|py|lock|swp|swo|old|orig|map|txt~)(/|$|\?)|'
    r'/(wp-|wordpress|phpmyadmin|admin|administrator|xmlrpc|vendor/|\.git|\.env|\.aws|'
    r'cgi-bin|actuator|config|backup|db\.|docker|jenkins|solr|hudson|console|manager|'
    r'shell|eval|boaform|HNAP1|GponForm|setup\.cgi|login\.cgi|owa/|autodiscover|'
    r'appsettings|service-account|composer|package\.json|settings\.|auth\.json)', re.I
)
BROWSER_UA = re.compile(r'Mozilla/5\.0.*(Chrome|Firefox|Safari|Edg|MicroMessenger|UCBrowser|Quark|HuaweiBrowser|MiuiBrowser|OPR)', re.I)


def kind(r):
    ua = r['ua'] or ''
    if not ua:
        return '无 UA（多为扫描器）'
    if SCAN_PAT.search(r['path'] or ''):
        return '扫描探测路径'
    if BROWSER_UA.search(ua):
        return '浏览器（真实访客）'
    if re.search(r'curl|wget|python|go-http|java|okhttp|node|axios|libwww|scrapy', ua, re.I):
        return '脚本/工具请求'
    return '其他 UA'


kinds = collections.Counter(kind(r) for r in human)
for k, n in kinds.most_common():
    print(f'  {k:<22} {n:>5} 次')

real = [r for r in human if kind(r) == '浏览器（真实访客）']
print(f'\n  —— 真实浏览器访客的 Top 10 页面（共 {len(real)} 次浏览器请求）——')
if real:
    for p, n in collections.Counter(r['path'] for r in real).most_common(10):
        print(f'    {n:>4} × {p[:96]}')
    print(f'  真实浏览器独立 IP: {len({r["ip"] for r in real})} 个')
else:
    print('    今日无浏览器请求记录')
print('\n【7.5】真实访客的来源（referer 前 8）')
refs = collections.Counter(r['ref'] for r in real if r['ref'] and r['ref'] != '-')
if refs:
    for ref, n in refs.most_common(8):
        print(f'  {n:>4} × {ref[:96]}')
else:
    print('  无非空 referer（多为直接访问或站内跳转）')

# ---------- 8. 站内数据 ----------
print('\n【8】站内业务数据')
for name, path in (('咨询记录', '/var/www/shuducw-run/data/consultations.json'),
                   ('文章数据', '/var/www/shuducw-run/data/articles.json')):
    raw = sh(f'cat {path} 2>/dev/null')
    try:
        data = json.loads(raw)
        items = data if isinstance(data, list) else data.get('items', [])
        print(f'  {name}: 共 {len(items)} 条')
        if name == '咨询记录':
            c = collections.Counter((i.get('status') or 'unknown') for i in items)
            print('    状态分布:', dict(c))
            recent = sorted(items, key=lambda x: str(x.get('created_at', '')), reverse=True)[:5]
            for i in recent:
                print(f"    {str(i.get('created_at',''))[:19]}  {i.get('company_name','')[:24]}  {i.get('status','')}")
    except Exception as e:  # noqa: BLE001
        print(f'  {name}: 读取失败（{e}）')

# ---------- 9. 推送状态 ----------
print('\n【9】搜索引擎推送状态')
for name, path in (('百度推送', '/root/baidu-push/.push-state/baidu.json'),
                   ('IndexNow', '/root/indexnow-state.json')):
    raw = sh(f'cat {path} 2>/dev/null').strip()
    if raw:
        print(f'  {name} 状态文件 {path}:')
        print('    ' + raw[:600].replace('\n', '\n    '))
    else:
        print(f'  {name}: 无 {path}')

print('\n【9.5】百度推送日志（含 10-08 早 08:30 的补推）')
for f in ('/root/baidu-push/catchup.log', '/var/log/baidu-push.log'):
    out = sh(f'ls -l {f} 2>/dev/null; tail -n 12 {f} 2>/dev/null').strip()
    print(f'  —— {f} ——')
    print('  ' + (out.replace('\n', '\n  ') if out else '（不存在）'))

print('\n【10】服务与提交计划')
print('  ' + sh('pm2 list 2>/dev/null | head -n 8').replace('\n', '\n  ').strip())
print('  —— 定时任务 ——')
print('  ' + sh('crontab -l 2>/dev/null').replace('\n', '\n  ').strip())
