#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""在服务器上检查指定措辞是否出现在数据文件里（含上下文），用于全站措辞统一核查"""
import glob
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
DATA_DIR = os.environ.get('DATA_DIR', '/var/www/shuducw-run/data')
PHRASES = sys.argv[1:] or ['西安西咸新区']

print(f'数据目录: {DATA_DIR}')
for path in sorted(glob.glob(os.path.join(DATA_DIR, '*.json'))):
    name = os.path.basename(path)
    try:
        with open(path, encoding='utf-8') as f:
            raw = f.read()
    except OSError as e:
        print(f'  {name}: 读取失败 {e}')
        continue
    total = 0
    for ph in PHRASES:
        n = raw.count(ph)
        total += n
        if n:
            print(f'  ⚠️ {name}: "{ph}" 出现 {n} 次')
            for m in range(n):
                i = raw.find(ph) if m == 0 else raw.find(ph, i + 1)
                print(f'       ...{raw[max(0, i-60):i+60].replace(chr(10), " ")}...')
    if total == 0:
        print(f'  ✅ {name}: {"/".join(PHRASES)} 均未出现')
