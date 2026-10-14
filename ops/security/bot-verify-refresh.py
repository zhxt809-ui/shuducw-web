#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""爬虫验证（Bot Verification）：只放行来自官方 IP 段的 Googlebot / Bingbot。

两个模式（分机运行，因为阿里云服务器拉不到 developers.google.com——实测超时）：
  python3 bot-verify-refresh.py --fetch-local    # 在本机（能访问 Google）运行：
                                                 # 下载官方 JSON → 生成 bot-allow.conf
  python3 bot-verify-refresh.py --apply-server   # 在服务器运行（无网络依赖）：
                                                 # 写 map/geo + server 规则 + 站点 include
                                                 # → nginx -t → reload → 机制自测

原理：UA 声称 Googlebot/Bingbot 但源 IP 不在官方网段 → return 444 丢弃。
保留策略：
- 只验证 Googlebot/Bingbot（有官方机器可读 IP 清单）；
- 百度/360/搜狗/神马无官方清单（官方验证为 PTR 反查），不做 IP 段硬拦，避免误伤真收录，
  其伪造流量由 list-fake-ips.py 检测 + 人工封禁；
- AI 爬虫未提供官方 IP 清单，不硬拦；
- 真实用户浏览器 UA 不含 googlebot/bingbot，不受影响。
安全：改前备份 → nginx -t → 失败回滚 → 成功才 reload；自测等待 reload 2 秒（新 worker 接管）。
"""
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.request
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

GOOGLE = 'https://developers.google.com/static/search/apis/ipranges/googlebot.json'
BING = 'https://www.bing.com/toolbox/bingbot.json'
SITE = '/etc/nginx/sites-enabled/shuducw'
ALLOW = '/etc/nginx/bot-allow.conf'        # 勿放 conf.d/（*.conf 自动包含，CIDR 行在 http 级非法）
MAP = '/etc/nginx/conf.d/bot-verify-map.conf'  # map/geo 是 http 级指令，放 conf.d 合法
SERVER_RULE = '/etc/nginx/bot-verify-server.conf'  # if 只能出现在 server 块，勿放 conf.d/（会被自动包含到 http 级）
MARK = 'bot-verify-server'


def sh(cmd, timeout=120):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
    return (r.stdout or '') + (r.stderr or '')


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (bot-verify-refresh)'})
    return json.loads(urllib.request.urlopen(req, timeout=60).read().decode('utf-8'))


def main_fetch_local():
    prefixes = []
    for name, url in [('Googlebot', GOOGLE), ('Bingbot', BING)]:
        data = fetch(url)
        n = len(data.get('prefixes', []))
        prefixes += [p.get('ipv4Prefix') or p.get('ipv6Prefix') for p in data['prefixes']]
        print(f'  {name}: {url.split("/")[-1]} 共 {n} 条网段')
    cidrs = sorted(p for p in prefixes if p)
    print(f'  合并 {len(cidrs)} 条（IPv4+IPv6）')
    with open('bot-allow.conf', 'w', encoding='utf-8') as f:
        f.write(f'# 官方爬虫 IP 段放行清单  生成 {datetime.now():%Y-%m-%d %H:%M}  共 {len(cidrs)} 条\n'
                '# Googlebot: developers.google.com 官方 googlebot.json；Bingbot: bing.com/toolbox/bingbot.json\n'
                '# 上传目标：/etc/nginx/bot-allow.conf（勿放 conf.d/，会被 *.conf 自动包含）\n')
        for c in cidrs:
            f.write(f'{c} 1;\n')
    print('  ✅ 已生成 ./bot-allow.conf，请 sftp 上传到 /etc/nginx/bot-allow.conf 后运行 --apply-server')


def main_apply_server():
    if not os.path.exists(ALLOW):
        print(f'❌ 缺少 {ALLOW}（请先从本机上传 bot-allow.conf）')
        sys.exit(1)
    with open(MAP, 'w', encoding='utf-8') as f:
        f.write('# 爬虫验证（Bot Verification）：声称 Googlebot/Bingbot 时仅放行官方 IP 段\n'
                'map $http_user_agent $verified_bot {\n'
                "    default '';\n"
                "    '~*googlebot'  1;\n"
                "    '~*bingbot'    1;\n"
                '}\n'
                'geo $bot_ip_ok {\n'
                '    default 0;\n'
                f'    include {ALLOW};\n'
                '}\n'
                'map "$verified_bot$bot_ip_ok" $bot_action {\n'
                "    default '';\n"
                "    '10' deny;   # 声称是官方爬虫，但源 IP 不在官方网段\n"
                "    '11' pass;\n"
                '}\n')
    with open(SERVER_RULE, 'w', encoding='utf-8') as f:
        f.write('# 爬虫验证执行规则（include 进正式站点 server 块）\n'
                'if ($bot_action = deny) {\n'
                '    return 444;\n'
                '}\n')
    print('  ✅ 已写 map/geo 与 server 规则')

    conf = open(SITE, encoding='utf-8').read()
    bak = None
    if MARK in conf:
        print('  ✅ 站点配置已包含爬虫验证规则（跳过）')
    else:
        anchor = '    server_name www.shuducw.com;\n'
        if anchor not in conf:
            print('  ❌ 未找到正式站点 server 块锚点，需人工处理')
            sys.exit(1)
        bak = f'/root/nginx-shuducw.bak-{datetime.now():%Y%m%d-%H%M}-botverify'
        shutil.copy2(SITE, bak)
        print(f'  ✅ 已备份: {bak}')
        open(SITE, 'w', encoding='utf-8').write(
            conf.replace(anchor, anchor + f'    include {SERVER_RULE};   # {MARK} 爬虫验证（{datetime.now():%m-%d}）\n', 1))
        print('  ✅ 已在正式站点 server 块插入 include')

    t = sh('nginx -t 2>&1')
    if 'successful' not in t:
        print('  ❌ nginx -t 失败，正在回滚站点配置：\n' + t.strip())
        if bak:
            shutil.copy2(bak, SITE)
            sh('systemctl reload nginx 2>&1')
            print('  ✅ 已回滚站点配置并 reload')
        sys.exit(1)
    sh('systemctl reload nginx 2>&1')
    time.sleep(2)
    print('  ✅ nginx -t + reload 成功')

    def curl(ua):
        return sh(f"curl -s -o /dev/null -w '%{{http_code}}' -k -m 10 --resolve www.shuducw.com:443:127.0.0.1 "
                  f"-A '{ua}' https://www.shuducw.com/api/health").strip()

    def test(tag, ua, expect):
        code = curl(ua)
        ok = code == expect
        print(f'    {"✅" if ok else "❌"} {tag}: → {code}（期望 {expect}）')
        return ok

    # 注：nginx return 444 = 直接断开连接、不发任何响应，curl 报 000（实测 0.008s 即断连、
    # SSL unexpected eof），故"被拦截"的期望码写 000 而非 444。
    ok = True
    ok &= test('真实用户浏览器', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0', '200')
    ok &= test('冒充 Googlebot（非官方网段）', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', '000')
    ok &= test('冒充 Bingbot（非官方网段）', 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)', '000')
    allow = open(ALLOW, encoding='utf-8').read()
    open(ALLOW, 'w', encoding='utf-8').write(allow + '127.0.0.1 1;   # 临时自测\n')
    sh('systemctl reload nginx 2>&1')
    time.sleep(2)
    ok &= test('放行后 Googlebot（127.0.0.1 模拟官方网段）', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', '200')
    open(ALLOW, 'w', encoding='utf-8').write(allow)
    sh('systemctl reload nginx 2>&1')
    time.sleep(2)
    ok &= test('移除放行后恢复拦截', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', '000')
    n = sum(1 for _ in open(ALLOW, encoding='utf-8') if _.strip() and not _.startswith('#'))
    print(f'\n  放行网段 {n} 条 | 结果：{"全部通过 ✅" if ok else "有失败项 ❌"}')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else ''
    if mode == '--fetch-local':
        main_fetch_local()
    elif mode == '--apply-server':
        main_apply_server()
    else:
        print('用法: bot-verify-refresh.py --fetch-local | --apply-server')
        sys.exit(1)
