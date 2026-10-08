#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""诊断：deny 放在 http 级 vs server 级，哪个真正生效（对照实验，改前后自动还原）。"""
import datetime
import os
import subprocess
import time

SITE = '/etc/nginx/sites-enabled/shuducw'
STAMP = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
TEST = ("curl -s -o /dev/null -w '%{http_code}' -k -m 10 "
        "--resolve www.shuducw.com:443:127.0.0.1 https://www.shuducw.com/api/health")
TEST_ROOT = ("curl -s -o /dev/null -w '%{http_code}' -k -m 10 "
             "--resolve www.shuducw.com:443:127.0.0.1 https://www.shuducw.com/")


def sh(cmd, timeout=120):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
    return (r.stdout or '') + (r.stderr or '')


def write(path, body):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(body)


def apply_and_test(tag, extra_http=None, extra_server=None):
    site = original
    if extra_server:
        site = site.replace('    server_name www.shuducw.com;',
                            '    server_name www.shuducw.com;\n' + extra_server, 1)
    write(SITE, site)
    inc = '/etc/nginx/conf.d/block-scan-ips.conf'
    if extra_http is not None:
        write(inc, extra_http)
    t = sh('nginx -t 2>&1')
    if 'successful' not in t:
        write(SITE, original)
        print(f'  [{tag}] nginx -t 失败，已还原：{t.strip()[:200]}')
        return None
    sh('systemctl reload nginx 2>&1')
    time.sleep(2)
    code = sh(TEST).strip()
    code_root = sh(TEST_ROOT).strip()
    print(f'  [{tag}] /api/health = {code}   / = {code_root}')
    return code


print('=' * 74)
print('  deny 生效层级对照实验')
print('=' * 74)

print('\n  ① nginx 是否真的加载了 conf.d 里的封锁文件：')
loaded = sh("nginx -T 2>/dev/null | grep -c 'block-scan-ips'")
print(f'     配置转储中出现 block-scan-ips 的次数: {loaded.strip()}')
print('     ' + sh("nginx -T 2>/dev/null | grep -m3 -n 'deny ' | head -n 3").strip().replace('\n', '\n     '))
print('     是否 include 了 conf.d: ' + ('是' if 'conf.d' in sh('nginx -T 2>/dev/null | head -n 30') else '否'))

original = open(SITE, encoding='utf-8').read()
write(f'/root/shuducw.nginx.bak.{STAMP}', original)
print(f'\n  站点配置已备份: /root/shuducw.nginx.bak.{STAMP}')

print('\n  ② 基线（无任何临时 deny）：')
apply_and_test('基线')

print('\n  ③ 实验A：deny 127.0.0.1 放在 http 级（conf.d 文件里）：')
cur = open('/etc/nginx/conf.d/block-scan-ips.conf', encoding='utf-8').read()
write('/root/block-scan-ips.conf.bak.' + STAMP, cur)
apply_and_test('http 级 deny', extra_http=cur + '\ndeny 127.0.0.1;\n')

print('\n  ④ 实验B：deny 127.0.0.1 放进 www 的 server 块：')
apply_and_test('server 级 deny', extra_http=cur, extra_server='    deny 127.0.0.1;  # 对照实验')

# 还原
write(SITE, original)
write('/etc/nginx/conf.d/block-scan-ips.conf', cur)
sh('nginx -t 2>&1')
sh('systemctl reload nginx 2>&1')
time.sleep(2)
print('\n  ⑤ 还原后复核：/api/health = ' + sh(TEST).strip() + '   （期望 200）')
print('     站点配置是否与备份一致:',
      '✅ 一致' if open(SITE, encoding='utf-8').read() == original else '❌ 不一致！')
print('     封锁文件是否与备份一致:',
      '✅ 一致' if open('/etc/nginx/conf.d/block-scan-ips.conf', encoding='utf-8').read() == cur else '❌ 不一致！')
print('     封锁条数:', sh("grep -c '^deny' /etc/nginx/conf.d/block-scan-ips.conf").strip())
