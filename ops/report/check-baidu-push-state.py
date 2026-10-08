#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""核查百度推送状态：新页面是否已推送、sitemap 抓取为何只有 55 条（只读）"""
import json
import subprocess
import urllib.request


def sh(cmd):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=120).stdout


st = json.load(open('/root/baidu-push/.push-state/baidu.json', encoding='utf-8'))
pushed = st.get('pushed', st if isinstance(st, list) else [])
print('状态文件条目数:', len(pushed))
NEW = ['/tools', '/tools/bonus-tax', '/tools/income-tax', '/tools/rmb-uppercase',
       '/services/industry/tech', '/services/industry/trade', '/services/industry/construction',
       '/services/industry/ecommerce', '/services/industry/group']
print('\n新页面是否已在"已推送"清单：')
for p in NEW:
    hit = [u for u in pushed if u.rstrip('/').endswith(p)]
    print(f'  {"✅ 已推" if hit else "❌ 未推"}  {p}' + (f'  ({hit[0]})' if hit else ''))
print('\n清单里与 industry/tools 相关的全部条目：')
for u in pushed:
    if 'industry' in u or '/tools' in u:
        print('   ', u)

print('\n线上 sitemap 实际条数：')
raw = urllib.request.urlopen(urllib.request.Request(
    'https://www.shuducw.com/sitemap.xml', headers={'User-Agent': 'audit'}), timeout=30).read().decode()
print('   ', raw.count('<url>'), '条')
print('    含 industry:', raw.count('/services/industry/'), '条；含 /tools:', raw.count('/tools'))

print('\n服务器本机抓 sitemap（推送脚本走的就是这条路径）：')
local = sh('curl -s -m 20 https://www.shuducw.com/sitemap.xml | grep -c "<url>"')
print('    ', local.strip(), '条')
print('\n推送脚本读取 sitemap 的实现：')
print(sh("grep -n 'sitemap' /root/baidu-push/push-baidu.py | head -n 12"))
print('\n推送脚本的 URL 过滤逻辑：')
print(sh("grep -n -A3 -B3 'sitemap.xml' /root/baidu-push/push-baidu.py | head -n 40"))
