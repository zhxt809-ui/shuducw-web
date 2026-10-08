#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""埋点审计：核对线上百度统计是否在跑 + 汇总站内所有埋点事件（只读）"""
import pathlib
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = 'https://www.shuducw.com'
PAGES = ['/', '/faq', '/self-check', '/shareholder-loans', '/contact',
         '/services/basic', '/invoice-compliance', '/cases']

print('===== 一、线上百度统计基础代码核验 =====')
ids = set()
for p in PAGES:
    try:
        req = urllib.request.Request(BASE + p, headers={'User-Agent': 'Mozilla/5.0 (audit)'})
        html = urllib.request.urlopen(req, timeout=25).read().decode('utf-8', 'replace')
    except Exception as e:
        print(f'  ❌ {p} 抓取失败: {e}')
        continue
    m = re.search(r'hm\.baidu\.com/hm\.js\?([0-9a-f]+)', html)
    inline = '_hmt' in html
    if m:
        ids.add(m.group(1))
    print(f'  {"✅" if m else "❌"} {p:<24} hm.js: {m.group(1) if m else "未找到"}  内联_hmt: {"有" if inline else "无"}')
print(f'\n  统计 ID 一致性: {sorted(ids)}  → {"✅ 全站一致" if len(ids) == 1 else "⚠️ 存在多个 ID"}')

print('\n===== 二、站内埋点事件清单（从源码提取真实调用）=====')
events = []
for f in sorted(ROOT.glob('src/**/*.tsx')) + sorted(ROOT.glob('src/**/*.ts')):
    txt = f.read_text(encoding='utf-8', errors='replace')
    rel = f.relative_to(ROOT).as_posix()
    for m in re.finditer(r"trackEvent\(\s*'([^']+)'\s*,\s*'([^']+)'\s*(?:,\s*([^,)]+))?", txt):
        events.append((m.group(1), m.group(2), m.group(3) or '', rel))
    for m in re.finditer(r"trackToolUse\(\s*'([^']+)'", txt):
        events.append(('工具', '使用', m.group(1), rel))
    for m in re.finditer(r"trackLeadClick\(\s*'([^']+)'", txt):
        events.append(('线索', m.group(1), '(页面路径)', rel))

seen = set()
for cat, act, label, rel in events:
    key = (cat, act, label)
    if key in seen:
        continue
    seen.add(key)
    print(f'  [{cat}] {act:<10} 标签={label:<24} ← {rel}')

print('\n===== 三、ChatGPT 建议的 8 项指标 —— 现有埋点覆盖情况 =====')
COVER = [
    ('① 小红书→官网访问量', '◐ 部分', '有「线索/点击小红书」出站点击统计；但进站来源归因需在小红书链接上加 UTM 参数（详见取数指南）'),
    ('② 官网专题页访问量', '✅ 已覆盖', '百度统计自带「页面浏览量/访客数」，按 URL 直接看，无需额外埋点'),
    ('③ 风险自查启动人数', '✅ 已覆盖', '「工具/开始自查」×（账务风险自查、股东往来自查）'),
    ('④ 风险自查完成率', '✅ 已覆盖', '「开始自查」÷「完成自查」即得完成率；完成事件还带需关注项数'),
    ('⑤ 计算器使用人数', '✅ 已覆盖', '「工具/使用」×（增值税、个税、人民币大写）'),
    ('⑥ 咨询表单提交量', '✅ 已覆盖', '「表单/提交成功」并区分入口标签（含首页内联表单、悬浮弹窗30秒留资、联系页等）'),
    ('⑦ 电话点击量', '✅ 已覆盖', '「线索/点击电话」（全站委托监听，含所在页面路径）'),
    ('⑧ 实际成交线索数', '❌ 未覆盖', '成交发生在线下，网站统计不到；后台 consultation 记录有 status(pending/contacted/closed) 字段，需人工/后台侧统计'),
]
for name, state, detail in COVER:
    print(f'  {state:<8} {name:<18} {detail}')
print('\n  覆盖率：6 项已完整覆盖，1 项部分覆盖（缺 UTM 归因），1 项属线下环节（网站侧无法统计）')
