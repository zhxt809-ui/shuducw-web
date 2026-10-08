#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""服务名称体系盘点（2026-10-08）
目的：把"服务名称有点乱"变成可核对的数据——同一概念在全站出现了几种写法、各在哪、各多少次。
数据来源：① 仓库源码（导航/页脚/首页/业务范围/详情页/专题/工具）② 线上页面实际文本。
不修改任何文件。"""
import html as html_entities
import os
import re
import sys
import urllib.request
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UA = {'User-Agent': 'Mozilla/5.0 (naming-inventory)'}
BASE = 'https://www.shuducw.com'

# 概念 → 该概念的候选写法（正则片段）
CONCEPTS = {
    '① 第一类 基础财税服务': [r'基础财税服务', r'基础财税托管', r'基础工商财税服务'],
    '② 第二类 税务合规与优化服务': [r'税务合规与优化服务', r'财税合规与内审服务?', r'财税规范与合规', r'财务规范与税务合规'],
    '③ 第三类 财务内控管理服务': [r'财务内控管理服务', r'内部管理与风险控制', r'企业内部管理审计'],
    '④ 第四类 股权与投融资财税服务': [r'股权与投融资财税服务', r'财税咨询与风控服务?', r'财税咨询风控',
                                      r'财税顾问与专项咨询', r'财税顾问咨询'],
    '⑤ 第五类 企业专项定制服务': [r'企业专项定制服务', r'配套与专项服务', r'行业专项财税方案'],
    '⑥ 直播电商': [r'直播电商个体户财税咨询', r'直播电商财税咨询', r'直播电商'],
    '⑦ 区域服务': [r'区域专项服务', r'区域服务', r'服务区域'],
    '⑧ 交付标准': [r'服务交付标准', r'交付标准'],
    '⑨ 工具': [r'财税工具中心', r'财税工具'],
}

SRC_FILES = [
    'src/components/header.tsx', 'src/components/footer.tsx',
    'src/app/page.tsx', 'src/app/services/page.tsx',
    'src/app/services/basic/page.tsx', 'src/app/services/compliance/page.tsx',
    'src/app/services/consulting/page.tsx', 'src/app/services/delivery/page.tsx',
    'src/app/services/live-commerce/page.tsx', 'src/app/contact/page.tsx',
    'src/app/tools/page.tsx', 'public/llms.txt',
]

LIVE_PAGES = ['/', '/services', '/services/basic', '/services/compliance', '/services/consulting',
              '/services/delivery', '/services/live-commerce', '/contact', '/tools', '/llms.txt']


_cache = {}


def fetch(path):
    """线上页面只抓一次并缓存（首版每个名称都重新抓页面，10 概念 × 4 写法 × 10 页 ≈ 400 次请求，直接超时）。"""
    if path not in _cache:
        raw = urllib.request.urlopen(urllib.request.Request(BASE + path, headers=UA), timeout=30).read().decode('utf-8', 'replace')
        _cache[path] = re.sub(r'<!--.*?-->', '', html_entities.unescape(raw), flags=re.S)
    return _cache[path]


print('=' * 78)
print('  服务名称体系盘点（仓库源码 + 线上页面）')
print('=' * 78)

src_text = {}
missing = []
for f in SRC_FILES:
    p = os.path.join(ROOT, f)
    if os.path.exists(p):
        src_text[f] = open(p, encoding='utf-8', errors='replace').read()
    else:
        missing.append(f)
if missing:
    print(f'\n  ⚠️ 以下文件未找到（请检查 ROOT={ROOT}）: {missing}')
if not src_text:
    print('  ❌ 一个源码文件都没读到，盘点结果无意义，已中止（不要据此下结论）')
    sys.exit(1)
print(f'  已读取源码文件 {len(src_text)} 个（ROOT={ROOT}）')

print('\n【一】按概念列出全站写法分布（源码命中文件数 | 线上页面命中次数）')
for concept, pats in CONCEPTS.items():
    print(f'\n  {concept}')
    for pat in pats:
        rx = re.compile(pat)
        files = sorted(f for f, t in src_text.items() if rx.search(t))
        if not files:
            continue
        cnt = 0
        where = []
        for lp in LIVE_PAGES:
            try:
                n = len(rx.findall(fetch(lp)))
            except Exception:  # noqa: BLE001
                n = 0
            if n:
                cnt += n
                where.append(f'{lp}×{n}')
        mark = ' ⚠️ 同一概念存在多种写法' if len([p for p in pats if any(re.search(p, t) for t in src_text.values())]) > 1 else ' ✅'
        print(f'    「{pat}」  源码 {len(files)} 个文件 | 线上 {cnt} 次  {("、" + "、".join(where[:5])) if where else ""}{mark}')

print('\n' + '=' * 78)
print('【二】导航与页脚实际名称（这两处最影响用户认知）')


def nav_footer():
    h = src_text.get('src/components/header.tsx', '')
    f = src_text.get('src/components/footer.tsx', '')
    print('\n  导航下拉（header.tsx）：')
    for m in re.finditer(r"\{ href: '([^']+)', label: '([^']+)' \}", h):
        print(f'    {m.group(2):<22} → {m.group(1)}')
    print('\n  页脚分组（footer.tsx）：')
    for m in re.finditer(r"label: '([^']+)',\s*\n\s*links: \[", f):
        print(f'    【{m.group(1)}】')
    for m in re.finditer(r"\{ label: '([^']+)', href: '([^']+)' \}", f):
        print(f'      {m.group(1):<24} → {m.group(2)}')


nav_footer()

print('\n' + '=' * 78)
print('【三】详情页自己的叫法（H1 与 TDK 标题）')
for f, pat in (('src/app/services/basic/page.tsx', r'<h1[^>]*>([^<]+)</h1>'),
               ('src/app/services/compliance/page.tsx', r'<h1[^>]*>([^<]+)</h1>'),
               ('src/app/services/consulting/page.tsx', r'<h1[^>]*>([^<]+)</h1>')):
    t = src_text.get(f, '')
    h1 = re.search(pat, t)
    title = re.search(r"title: '([^']+)'", t)
    print(f'  {f.split("/")[-2]:<12} H1={h1.group(1) if h1 else "?":<24} TDK={title.group(1) if title else "?"}')
