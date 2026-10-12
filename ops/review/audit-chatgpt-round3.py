#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ChatGPT 第三轮评审 · 逐条断言线上核验（只报事实，不下结论）

规则（AGENTS 规则 10/18）：一律现抓线上 HTML，先 html.unescape() 再剥离 <!-- --> 注释；
源码搜索只作辅助。本脚本输出每一条断言在各页面的命中次数与上下文，供人工判定采纳或反驳。
"""
import html
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
BASE = 'https://www.shuducw.com'
UA = {'User-Agent': 'Mozilla/5.0 (compatible; audit)'}

PAGES = ['/', '/services', '/services/basic', '/services/compliance', '/services/consulting',
         '/services/delivery', '/about', '/cases', '/faq', '/tools', '/privacy', '/contact']

# 断言分组：开头是 ChatGPT 的说法，后面是要核的关键词
CLAIMS = [
    ('P1-1 基础财税页有「企业刚需引流业务」内部用语',
     ['企业刚需引流业务', '刚需引流', '引流业务']),
    ('P1-2 四/五口径不一致（四大服务板块 / 四层核心业务）',
     ['四大服务板块', '四大核心', '四层核心业务', '四层', '四大', '五类', '五类核心业务体系']),
    ('P1-3 案例列表显示「关键词：」',
     ['关键词：', '关键词:', '服务内容：']),
    ('P2-1 绝对化表达（全品类 / 全行业 / 全覆盖 / 确保…见效）',
     ['全品类', '全行业', '全覆盖', '可全覆盖', '确保方案落地见效', '确保落地见效', '专业积淀深厚']),
    ('P2-3 首页标题含「老牌」',
     ['老牌']),
    ('四 FAQ 增值税小规模口径',
     ['1% 或 3%', '1%或3%', '阶段性优惠', '征收率']),
]

# 只在相关页面里找的项，避免全站噪音
SCOPE = {
    '企业刚需引流业务': ['/services/basic'],
    '刚需引流': ['/services/basic'],
    '引流业务': ['/services/basic'],
    '关键词：': ['/cases', '/'],
    '关键词:': ['/cases', '/'],
    '全品类': ['/services'],
    '可全覆盖': ['/about', '/services'],
    '全行业': ['/about', '/services'],
    '确保方案落地见效': ['/about'],
    '确保落地见效': ['/about'],
    '专业积淀深厚': ['/about'],
    '老牌': ['/'],
    '1% 或 3%': ['/faq'],
    '1%或3%': ['/faq'],
    '阶段性优惠': ['/faq'],
}

cache = {}


def get(path):
    if path not in cache:
        raw = urllib.request.urlopen(urllib.request.Request(BASE + path, headers=UA), timeout=30).read().decode('utf-8', 'replace')
        cache[path] = re.sub(r'<!--.*?-->', '', html.unescape(raw), flags=re.S)
    return cache[path]


def snippet(t, kw, span=70):
    i = t.find(kw)
    s = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', t[max(0, i - span):i + span]))
    return s.strip()


print('=' * 74)
print('  ChatGPT 第三轮评审 · 线上逐条核验')
print('=' * 74)
for title, kws in CLAIMS:
    print()
    print(f'【{title}】')
    for kw in kws:
        pages = SCOPE.get(kw, PAGES)
        hits = []
        for p in pages:
            try:
                n = get(p).count(kw)
            except Exception as e:
                n = -1
                print(f'    {kw}: 抓取失败 {p} {e}')
            if n > 0:
                hits.append((p, n))
        if hits:
            print(f'    ⚠️ 命中「{kw}」: ' + ', '.join(f'{p}×{n}' for p, n in hits))
            print(f'       例: ...{snippet(get(hits[0][0]), kw)}...')
        else:
            print(f'    ✅ 未命中「{kw}」（查了 {len(pages)} 页）')
