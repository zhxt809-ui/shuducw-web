#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""查看百度主动推送的状态：已推送哪些 URL、三个工具页是否在内"""
import glob
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
TOOLS = ['/tools/vat', '/tools/income-tax', '/tools/rmb-uppercase']

found = False
for path in glob.glob('/root/**/.push-state/baidu.json', recursive=True) + glob.glob('/var/www/**/.push-state/baidu.json', recursive=True):
    found = True
    try:
        with open(path, encoding='utf-8') as f:
            data = json.load(f)
    except (OSError, ValueError) as e:
        print(f'{path}: 读取失败 {e}')
        continue
    pushed = data.get('pushed', [])
    print(f'状态文件: {path}')
    print(f'  已推送 {len(pushed)} 条')
    for t in TOOLS:
        hit = [u for u in pushed if u.endswith(t)]
        print(f'  {"✅" if hit else "❌"} {t} —— {"已推送" if hit else "未推送"}')
    print('  已推送列表:')
    for u in pushed:
        print(f'    {u}')

if not found:
    print('未找到 .push-state/baidu.json（可能在别的目录，或状态文件在本地仓库）')

print('\n--- 仓库内本地状态文件 ---')
for path in glob.glob('/root/*/.push-state/baidu.json') + glob.glob('/opt/**/.push-state/baidu.json', recursive=True):
    try:
        with open(path, encoding='utf-8') as f:
            data = json.load(f)
        print(f'{path}: {len(data.get("pushed", []))} 条')
        for t in TOOLS:
            print(f'  {"✅" if any(u.endswith(t) for u in data.get("pushed", [])) else "❌"} {t}')
    except (OSError, ValueError) as e:
        print(f'{path}: {e}')
