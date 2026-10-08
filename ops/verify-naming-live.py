#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""服务名称统一性 · 线上验收（2026-10-08）
统一口径（用户决定）：
  一级/页面统一用「基础财税服务」「财税合规与内审」；旧写法「基础财税托管」「基础工商财税服务」
  「财税规范与合规」「财务规范与税务合规」在线上必须为 0。
抓取后先 html.unescape() 再剥离 <!-- --> 注释（React 渲染差异，见 AGENTS 规则 10）。"""
import html as html_entities
import json
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
UA = {'User-Agent': 'Mozilla/5.0 (naming-audit)'}
BASE = 'https://www.shuducw.com'

OLD = ['基础财税托管', '基础工商财税服务', '财税规范与合规', '财务规范与税务合规']
NEW = ['基础财税服务', '财税合规与内审', '内部管理与风险控制', '财税顾问与专项咨询']


def fetch(path):
    raw = urllib.request.urlopen(urllib.request.Request(BASE + path, headers=UA), timeout=30).read().decode('utf-8', 'replace')
    return re.sub(r'<!--.*?-->', '', html_entities.unescape(raw), flags=re.S)


pages = {
    '首页': fetch('/'),
    '业务范围': fetch('/services'),
    '基础财税页': fetch('/services/basic'),
    '合规内审页': fetch('/services/compliance'),
    '联系页': fetch('/contact'),
    '服务交付页': fetch('/services/delivery'),
    'llms.txt': fetch('/llms.txt'),
}

print('=' * 72)
print('  服务名称统一性 · 线上验收')
print('=' * 72)

rows = []
bad = 0

print('\n  ① 旧写法残留（必须全部为 0）：')
for s in OLD:
    hits = {k: v.count(s) for k, v in pages.items() if s in v}
    ok = not hits
    bad += 0 if ok else 1
    print(f'    {"✅" if ok else "❌"} {s}: {sum(hits.values())} 处' + (f'  {hits}' if hits else ''))

print('\n  ② 新写法出现情况（应 > 0）：')
for s in NEW:
    hits = {k: v.count(s) for k, v in pages.items() if s in v}
    ok = bool(hits)
    bad += 0 if ok else 1
    print(f'    {"✅" if ok else "❌"} {s}: 共 {sum(hits.values())} 次  {hits}')

print('\n  ③ 业务范围页四层体系标题：')
svc = pages['业务范围']
for i, s in enumerate(NEW, 1):
    ok = s in svc
    bad += 0 if ok else 1
    print(f'    {"✅" if ok else "❌"} 0{i} {s}')

print('\n  ④ llms.txt 四层体系声明：')
line = next((l for l in pages['llms.txt'].splitlines() if '四层核心业务体系' in l), '')
ok = all(s in line for s in NEW)
bad += 0 if ok else 1
print(f'    {"✅" if ok else "❌"} {line.strip()[:110]}')

print('\n  ⑤ 首页四层体系（服务板块）：')
home = pages['首页']
for i, s in enumerate(NEW, 1):
    ok = s in home
    bad += 0 if ok else 1
    print(f'    {"✅" if ok else "❌"} 0{i} {s}')

print('\n  ⑥ 两个自查工具的服务映射（客户端组件，改由产物核实）：')
print('     说明：risk-check / shareholder-check 为客户端组件，服务端 HTML 不含其内部数据，')
print('     本次由服务器产物 grep 单独核实（见部署后命令输出）。')

print('\n' + '=' * 72)
print(f'  结果：{"全部通过 ✅" if bad == 0 else f"{bad} 项未通过 ❌"}')
sys.exit(1 if bad else 0)
