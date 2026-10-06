#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""服务器侧：把 data/articles.json 的正文与摘要里的旧电话替换为新电话。

安全措施：
  · 先备份为 articles.json.bak-YYYYmmdd-HHMM-phone
  · 只改 articles 数组里每条的 content / summary 字段，其余字段与结构原样保留
  · 咨询记录 data/consultations.json 属客户数据，**绝不改动**
"""
import json
import os
import shutil
import sys
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
DATA_DIR = os.environ.get('DATA_DIR', '/var/www/shuducw-run/data')
ARTICLES = os.path.join(DATA_DIR, 'articles.json')
OLD = '8455' + '6877'
NEW = '8845' + '6877'

if not os.path.exists(ARTICLES):
    print(f'❌ 找不到 {ARTICLES}')
    sys.exit(1)

bak = f'{ARTICLES}.bak-{datetime.now():%Y%m%d-%H%M}-phone'
shutil.copy2(ARTICLES, bak)
print(f'✅ 已备份: {bak}  ({os.path.getsize(bak)} 字节)')

with open(ARTICLES, encoding='utf-8') as f:
    raw = f.read()
data = json.loads(raw)
arts = data if isinstance(data, list) else data.get('articles', [])
print(f'文章总数: {len(arts)}')

total = 0
affected = []
for a in arts:
    n = 0
    for field in ('content', 'summary'):
        v = a.get(field)
        if isinstance(v, str) and OLD in v:
            n += v.count(OLD)
            a[field] = v.replace(OLD, NEW)
    if n:
        affected.append((a.get('slug'), n))
        total += n

print(f'\n受影响文章 {len(affected)} 篇，共 {total} 处：')
for slug, n in affected:
    print(f'  {n:3} 处  {slug}')

if total == 0:
    print('  （无需修改）')
else:
    with open(ARTICLES, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'\n✅ 已写入 {ARTICLES}')

# 复核
with open(ARTICLES, encoding='utf-8') as f:
    check = f.read()
print(f'\n复核：新号码出现 {check.count(NEW)} 处，旧号码残留 {check.count(OLD)} 处')

# 确认客户数据未被触碰
cons = os.path.join(DATA_DIR, 'consultations.json')
if os.path.exists(cons):
    print(f'客户咨询数据 {cons}: {os.path.getsize(cons)} 字节（本次未改动）')
