#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""P0 三项修改的线上验收（2026-10-08）
关键：React 渲染的 HTML 必须先 html.unescape() 再剥离 <!-- --> 注释，否则会误报内容缺失。"""
import html as html_entities
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
UA = {'User-Agent': 'Mozilla/5.0 (p0-audit)'}
BASE = 'https://www.shuducw.com'


def fetch(path):
    raw = urllib.request.urlopen(urllib.request.Request(BASE + path, headers=UA), timeout=30).read().decode('utf-8', 'replace')
    return re.sub(r'<!--.*?-->', '', html_entities.unescape(raw), flags=re.S)


home = fetch('/')
basic = fetch('/services/basic')

checks = [
    ('P0-1 /services/basic 已删除内部话术"企业刚需引流业务"', '企业刚需引流业务' not in basic,
     '线上仍存在' if '企业刚需引流业务' in basic else '线上已无此表述'),
    ('P0-1 /services/basic 新副标题已上线', '工商注册 · 代理记账 · 汇算清缴 · 社保托管' in basic,
     '新副标题已上线' if '工商注册 · 代理记账 · 汇算清缴 · 社保托管' in basic else '未找到新副标题'),
    ('P0-2 首页已删除固定数字"28 个高频问题解答"', not re.search(r'28 ?个高频问题解答', home),
     '线上残留' if re.search(r'28 ?个高频问题解答', home) else '线上已无该表述'),
    ('P0-2 首页新副标题已上线', '老板最常问的问题，都在这里' in home,
     '新副标题已上线' if '老板最常问的问题，都在这里' in home else '未找到新副标题'),
    ('P0-2 首页 FAQ 标题保留（不写数量）', '老板关心的财税问题，这里都有答案' in home,
     '标题在位' if '老板关心的财税问题，这里都有答案' in home else '标题缺失'),
    ('P0-3 首页已删除"不留公司名"承诺', '不留公司名' not in home,
     '线上残留' if '不留公司名' in home else '线上已无该表述'),
    ('P0-3 首页新承诺"无需注册，顾问直接回电"已上线', '无需注册，顾问直接回电' in home,
     '新文案已上线' if '无需注册，顾问直接回电' in home else '未找到新文案'),
    ('P0-3 表单仍为 3 项必填（与"只需 3 项信息"一致）',
     all(k in home for k in ('企业类型', '咨询问题', '手机号')) and '企业名称' not in home.split('30 秒留资')[1][:900],
     '首页表单 3 项且无"企业名称"字段'),
]

print('=' * 70)
print('  P0 三项修改 · 线上验收（2026-10-08 部署后实测）')
print('=' * 70)
bad = 0
for name, ok, ev in checks:
    print(f'  {"✅" if ok else "❌"} {name}')
    print(f'       {ev}')
    bad += 0 if ok else 1
print('=' * 70)
print(f'  结果：{len(checks) - bad}/{len(checks)} 通过' + ('' if bad == 0 else f'，{bad} 项未通过'))
sys.exit(1 if bad else 0)
