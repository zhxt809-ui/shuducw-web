#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""排查 shuducw.com 的子域名：有哪些、哪些还活着、活着的在提供什么内容。

方法（两路交叉验证）：
  1) 证书透明度日志（crt.sh）—— 历史上为该域名签过证书的子域名，冒用者常留下痕迹
  2) 常见子域名字典 DNS 解析（本地 + 服务器两个 DNS 视角）
  对解析成功的一律探活：HTTP 状态、标题、Server 头，标记可疑。
"""
import json
import socket
import ssl
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
BASE = 'shuducw.com'

COMMON = """www m mobile wap blog shop store mall cdn static img image images file files
down download up upload api app apps admin manage manager oa erp crm hr hrm wiki git gitlab
jenkins ci cd test dev dev1 dev2 test1 test2 staging uat demo sandbox beta alpha old new
backup bak temp tmp db mysql sql mssql redis mongo es elastic search log logs monitor status
mail smtp pop imap webmail mailer mx ns1 ns2 dns dns1 vpn ftp sftp ssh panel cp cpanel whm
portal portal2 news bbs forum tieba chat im kf service help support docs doc helpdesk
vhost host server srv node1 node2 web1 web2 app1 app2 cloud data datacenter
pay payment piao invoice fapiao shui tax caiwu finance acc accounting book keeper kuaiji
xian xa sxxa shanxi company corp group hr2 job jobs zhaopin recruit edu learn train
video media mp weixin wechat qq alipay wx wap2 touch h5 pc web w3 assets res source
static1 static2 css js img1 img2 pic photo video1 pdf excel word zip
proxy gw gateway auth sso id login sso1 cas radius
1 2 3 a b c d e f g h i j k l x y z aa bb cc dd test3 dev3""".split()


def resolve(name: str):
    try:
        return name, socket.gethostbyname_ex(name)[2]
    except Exception:
        return name, []


def check_http(name: str):
    out = {'name': name, 'status': None, 'title': '', 'server': '', 'err': ''}
    for scheme in ('https', 'http'):
        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            req = urllib.request.Request(f'{scheme}://{name}/',
                                         headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, timeout=12, context=ctx) as r:
                raw = r.read(60000)
                out['status'] = r.status
                out['server'] = r.headers.get('Server', '')
                html = raw.decode('utf-8', 'replace')
                i = html.lower().find('<title')
                if i >= 0:
                    j = html.find('>', i)
                    k = html.lower().find('</title', j)
                    out['title'] = html[j + 1:k].strip()[:90]
                return out
        except urllib.error.HTTPError as e:
            out['status'] = e.code
            out['err'] = f'HTTP {e.code}'
        except Exception as e:
            out['err'] = type(e).__name__
    return out


print('=' * 70)
print(f'一、证书透明度日志（crt.sh）里出现过的 {BASE} 子域名')
print('=' * 70)
names = set()
try:
    url = f'https://crt.sh/?q=%25.{BASE}&output=json'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=90) as r:
        data = json.loads(r.read().decode('utf-8', 'replace'))
    for row in data:
        for nm in (row.get('name_value') or '').split('\n'):
            nm = nm.strip().lower().lstrip('*.')
            if nm.endswith(BASE):
                names.add(nm)
    print(f'  证书日志共发现 {len(names)} 个不同的域名/子域名：')
    for nm in sorted(names):
        print('    ' + nm)
except Exception as e:
    print(f'  ⚠ crt.sh 查询失败: {type(e).__name__}: {str(e)[:120]}')
    print('  （失败不影响下面第 2 路：DNS 字典解析）')

print()
print('=' * 70)
print('二、常见子域名字典 DNS 解析（哪些现在还解析得出来）')
print('=' * 70)
cands = [f'{p}.{BASE}' for p in COMMON] + [BASE]
with ThreadPoolExecutor(max_workers=30) as ex:
    resolved = list(ex.map(resolve, cands))
alive = [(n, ips) for n, ips in resolved if ips]
wildcard = False
for probe in ('this-name-should-not-exist-12345.' + BASE, 'zzz-qqq-random.' + BASE):
    if resolve(probe)[1]:
        wildcard = True
print(f'  泛解析（*.{BASE} 全解析）: {"⚠️ 存在——任何子域名都指向服务器，冒用风险高" if wildcard else "无（好）"}')
print(f'  解析成功的子域名 {len(alive)} 个：')
for n, ips in sorted(alive):
    print(f'    {n:38} {", ".join(ips)}')

print()
print('=' * 70)
print('三、对解析成功的域名逐个探活（看是否在提供内容、内容是否可疑）')
print('=' * 70)
SUSPECT = ('彩票', '博彩', '赌', 'casino', 'bet', '棋牌', '娱乐', 'AV', '色情', 'sexy',
           'porn', 'av在线', '成人', '贷款', '发票代开', '代开', '私服', 'sf', '外挂',
           '开户', '六合', '时时彩', '快三', '菠菜')
targets = sorted({n for n, _ in alive} | {BASE})
with ThreadPoolExecutor(max_workers=12) as ex:
    results = list(ex.map(check_http, targets))
problems = []
for r in results:
    title = r['title']
    hit = [s for s in SUSPECT if s.lower() in title.lower()]
    flag = '⚠️ 可疑' if hit else ('活' if r['status'] else '不通')
    if hit:
        problems.append((r['name'], title, hit))
    print(f"  {flag:8} {r['name']:38} 状态={r['status']}  Server={r['server'][:20]:20} 标题={title[:50]}")

print()
print('=' * 70)
print('四、结论')
print('=' * 70)
if problems:
    print('  ⚠️ 发现可疑内容页：')
    for n, t, hit in problems:
        print(f'    {n} → {t} （命中敏感词 {hit}）')
else:
    print('  当前没有探测到可疑内容的子域名。')
print(f'  说明范围：本次只覆盖证书日志 + {len(COMMON)} 个常见子域名字典；')
print('  若有历史冒用且现已下线/不再解析，DNS 上查不到，需靠搜索引擎侧证据（站长后台索引/死链）确认。')
