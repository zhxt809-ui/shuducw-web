#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""服务名称体系 · 线上验收 v2（2026-10-08 五类体系重整后）
口径（用户决定）：
  五类 = 基础财税服务 / 税务合规与优化服务 / 财务内控管理服务 / 股权与投融资财税服务 / 企业专项定制服务
  三个详情页直接使用五类的名字（取消「财税合规与内审」「财税咨询与风控」等旧页面名）
抓取后先 html.unescape() 再剥离 <!-- --> 注释（React 渲染差异，见 AGENTS 规则 10）。"""
import html as html_entities
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
UA = {'User-Agent': 'Mozilla/5.0 (naming-audit)'}
BASE = 'https://www.shuducw.com'

# 已废弃写法：线上必须为 0
OLD = ['基础财税托管', '基础工商财税服务', '财税合规与内审', '财税规范与合规',
       '财务规范与税务合规', '财税咨询与风控', '财税咨询风控',
       '内部管理与风险控制', '财税顾问与专项咨询', '配套与专项服务']
# 现行五类
NEW = ['基础财税服务', '税务合规与优化服务', '财务内控管理服务',
       '股权与投融资财税服务', '企业专项定制服务']


def fetch(path):
    raw = urllib.request.urlopen(urllib.request.Request(BASE + path, headers=UA), timeout=30).read().decode('utf-8', 'replace')
    return re.sub(r'<!--.*?-->', '', html_entities.unescape(raw), flags=re.S)


pages = {
    '首页': fetch('/'),
    '业务范围': fetch('/services'),
    '基础财税页': fetch('/services/basic'),
    '合规页': fetch('/services/compliance'),
    '咨询页': fetch('/services/consulting'),
    '联系页': fetch('/contact'),
    '交付页': fetch('/services/delivery'),
    'llms.txt': fetch('/llms.txt'),
}

print('=' * 74)
print('  服务名称体系 · 线上验收 v2（五类）')
print('=' * 74)
bad = 0

print('\n  ① 已废弃写法残留（必须全部 0）：')
for s in OLD:
    hits = {k: v.count(s) for k, v in pages.items() if s in v}
    ok = not hits
    bad += 0 if ok else 1
    print(f'    {"✅" if ok else "❌"} {s}: {sum(hits.values())} 处' + (f'  {hits}' if hits else ''))

print('\n  ② 五类名称线上出现情况（应 > 0）：')
for s in NEW:
    hits = {k: v.count(s) for k, v in pages.items() if s in v}
    ok = bool(hits)
    bad += 0 if ok else 1
    print(f'    {"✅" if ok else "❌"} {s}: 共 {sum(hits.values())} 次  {hits}')

print('\n  ③ 业务范围页五类标题 01-05：')
svc = pages['业务范围']
for i, s in enumerate(NEW, 1):
    ok = s in svc
    bad += 0 if ok else 1
    print(f'    {"✅" if ok else "❌"} 0{i} {s}')

print('\n  ④ 业务范围页锚点（导航/页脚深链依赖）：')
for i in range(1, 6):
    ok = f'layer-0{i}' in svc
    bad += 0 if ok else 1
    print(f'    {"✅" if ok else "❌"} id="layer-0{i}"')
ok = 'id="industries"' in svc
bad += 0 if ok else 1
print(f'    {"✅" if ok else "❌"} id="industries"')

print('\n  ⑤ 首页五类服务板块：')
home = pages['首页']
for i, s in enumerate(NEW, 1):
    ok = s in home
    bad += 0 if ok else 1
    print(f'    {"✅" if ok else "❌"} 0{i} {s}')

print('\n  ⑥ llms.txt 五类声明：')
line = next((l for l in pages['llms.txt'].splitlines() if '核心业务体系' in l), '')
ok = all(s in line for s in NEW) and '五类' in line
bad += 0 if ok else 1
print(f'    {"✅" if ok else "❌"} {line.strip()[:120]}')

print('\n  ⑦ 三个详情页名称与五类对齐（页面内自称）：')
for label, key, want in (('基础财税页', '基础财税页', NEW[0]),
                         ('合规页', '合规页', NEW[1]),
                         ('咨询页', '咨询页', NEW[3])):
    ok = want in pages[key]
    bad += 0 if ok else 1
    print(f'    {"✅" if ok else "❌"} {label} 自称「{want}」')

print('\n' + '=' * 74)
print(f'  结果：{"全部通过 ✅" if bad == 0 else f"{bad} 项未通过 ❌"}')
sys.exit(1 if bad else 0)
