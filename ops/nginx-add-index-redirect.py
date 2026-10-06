#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""在 nginx 站点配置中，为旧地址 /index.html 与 /index.htm 增加 301 归位规则。

背景：nginx 有一条反扫描规则 `location ~* ^/index { return 404; }`（拦扫描器探测
/index.php 等），但它把证据最硬的旧地址 /index.html 一起拦了——日志显示 360Spider
在 9/22–10/6 期间请求它 54 次、Googlebot 请求 1 次，全部拿到 404。

做法：在该反扫描规则**之前**插入一条更精确的规则（nginx 正则 location 按出现顺序匹配），
仅把 /index.html 与 /index.htm 301 到首页，其余 /index* 仍 404。

安全：改前备份 → nginx -t 校验 → 失败自动回滚 → 成功才 reload。
"""
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
CONF = '/etc/nginx/sites-enabled/shuducw'
MARK = '# 旧静态首页地址归位（2026-10-06）：/index.html 是旧站入口，日志证据 360Spider 54 次 + Googlebot 1 次'
RULE = '    location ~* ^/index\\.html?$ { return 301 https://www.shuducw.com/; }\n'
ANCHOR = re.compile(r'^\s*location\s+~\*\s+\^/index\s*\{', re.M)

if not os.path.exists(CONF):
    print(f'❌ 找不到 {CONF}')
    sys.exit(1)

with open(CONF, encoding='utf-8') as f:
    conf = f.read()

if '^/index\\.html?$' in conf:
    print('✅ 规则已存在，无需重复添加')
    sys.exit(0)

m = ANCHOR.search(conf)
if not m:
    print('❌ 未找到反扫描规则锚点 `location ~* ^/index {`，需人工确认配置文件结构')
    sys.exit(1)

# 在锚点所在行的行首插入新规则
line_start = conf.rfind('\n', 0, m.start()) + 1
new_conf = conf[:line_start] + MARK + '\n' + RULE + conf[line_start:]

bak = f'/root/nginx-shuducw.bak-{datetime.now():%Y%m%d-%H%M}-index'
shutil.copy2(CONF, bak)
print(f'✅ 已备份（放在 /root，不放进 sites-enabled，避免被 nginx 当作第二份配置加载）: {bak}')

# 清理历史遗留：曾误放在 sites-enabled 里的备份会与主配置冲突（limit_req_zone 重复定义）
stray = [f for f in os.listdir(os.path.dirname(CONF)) if f.startswith('shuducw.bak-')]
for f in stray:
    p = os.path.join(os.path.dirname(CONF), f)
    os.remove(p)
    print(f'🧹 已清理冲突备份: {p}')

with open(CONF, 'w', encoding='utf-8') as f:
    f.write(new_conf)

# 打印改动处上下文
print('\n改动处上下文：')
lines = new_conf.split('\n')
for i, ln in enumerate(lines):
    if '^/index\\.html?$' in ln:
        for j in range(max(0, i - 3), min(len(lines), i + 4)):
            print(f'    {j+1}: {lines[j]}')
        break

print('\n--- nginx -t 校验 ---')
r = subprocess.run(['nginx', '-t'], capture_output=True, text=True)
print((r.stdout + r.stderr).strip())

if r.returncode != 0:
    shutil.copy2(bak, CONF)
    print('\n❌ 校验失败，已回滚配置（nginx 未 reload）')
    sys.exit(1)

r2 = subprocess.run(['systemctl', 'reload', 'nginx'], capture_output=True, text=True)
print('\n--- reload ---')
print((r2.stdout + r2.stderr).strip() or '  已发送 reload')
print(f'  reload 退出码: {r2.returncode}')
