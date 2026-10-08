#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验收人民币大写转换器页面（线上真实 HTML）：规则内容、官方举例、出票日期、FAQ 与结构化数据"""
import html as html_entities
import json
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
URL = 'https://www.shuducw.com/tools/rmb-uppercase'
req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0 (audit)'})
raw_html = urllib.request.urlopen(req, timeout=25).read().decode('utf-8', 'replace')
# 关键：先解码 HTML 实体再比对。React 会把正文里的半角引号转义成 &quot;，
# 若直接拿源码原文写断言会全部匹配失败（曾因此误报"内容缺失"）。
html = html_entities.unescape(raw_html)
print(f'页面: {URL}\nHTML 长度: {len(raw_html)}（已解码实体后比对）\n')

MUST = [
    ('板块标题：大写金额书写规则', '大写金额书写规则（官方口径）'),
    ('板块标题：票据出票日期怎么写', '票据出票日期怎么写'),
    ('板块标题：大写金额常见问题', '大写金额常见问题'),
    ('依据：支付结算办法 银发〔1997〕393 号', '银发〔1997〕393 号'),
    ('依据：附一名称', '正确填写票据和结算凭证的基本规定'),
    ('依据：票据法第八条', '《票据法》第八条'),
    ('依据：支付结算办法第十二条', '第十二条'),
    ('官方举例：￥1,409.50', '￥1,409.50'),
    ('官方举例：￥6,007.14', '￥6,007.14'),
    ('官方举例：￥1,680.32', '￥1,680.32'),
    ('官方举例：￥107,000.53', '￥107,000.53'),
    ('官方举例：￥16,409.02', '￥16,409.02'),
    ('官方举例：￥325.04', '￥325.04'),
    ('官方举例大写：壹仟肆佰零玖元伍角', '壹仟肆佰零玖元伍角'),
    ('官方举例大写：陆仟零柒元壹角肆分', '陆仟零柒元壹角肆分'),
    ('官方举例大写：壹万陆仟肆佰零玖元零贰分', '壹万陆仟肆佰零玖元零贰分'),
    ('官方举例大写：叁佰贰拾伍元零肆分', '叁佰贰拾伍元零肆分'),
    ('出票日期例：零壹月壹拾伍日', '零壹月壹拾伍日'),
    ('出票日期例：零壹拾月零贰拾日', '零壹拾月零贰拾日'),
    ('出票日期：小写填写银行不予受理', '用小写填写的，银行不予受理'),
    ('问答：金额中间有零怎么写', '金额中间有"0"，中文大写怎么写？'),
    ('问答：整和正哪个对', '"整"和"正"哪个对？'),
    ('问答：前面要不要写人民币', '大写金额前面要不要写"人民币"？'),
    ('问答：大小写不一致会怎样', '大写金额和小写金额不一致会怎样？'),
    ('问答：出票日期怎么写', '票据的出票日期怎么写？写错了会怎样？'),
    ('问答：能否涂改/不足1元', '大写写错了能涂改吗？金额不足 1 元怎么写？'),
    ('不足1元实务口径：不加零', '实务标准写法是直接写「肆角贰分」，不加"零"'),
    ('角位0分位有数必须写零', '角位是 0 而分位有数时必须写"零"'),
    ('口径核验日期声明', '口径核验日期：2026 年 10 月'),
    ('保留原工具标题', '人民币大写转换器'),
    ('保留内嵌表单', '30 秒留资，顾问回电'),
]
print('===== 内容核查 =====')
missing = [name for name, s in MUST if s not in html]
for name, s in MUST:
    print(f'  {"✅" if s in html else "❌"} {name}')

print('\n===== 结构化数据 =====')
lds = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
types = []
faq_q = 0
for raw in lds:
    try:
        data = json.loads(raw)
    except ValueError as e:
        print(f'  ❌ JSON-LD 解析失败: {e}')
        continue
    items = data.get('@graph', [data]) if isinstance(data, dict) else data
    for it in items if isinstance(items, list) else [items]:
        t = it.get('@type')
        types.append(t)
        if t == 'FAQPage':
            faq_q = len(it.get('mainEntity', []))
print(f'  JSON-LD 类型: {types}')
print(f'  {"✅" if "WebApplication" in types else "❌"} WebApplication 存在')
print(f'  {"✅" if "FAQPage" in types else "❌"} FAQPage 存在（{faq_q} 问）')

print('\n===== 元数据（从原始 HTML 提取，避免实体解码后引号截断正则）=====')
title = re.search(r'<title>([^<]*)</title>', raw_html)
desc = re.search(r'name="description" content="([^"]*)"', raw_html)
canon = re.search(r'rel="canonical" href="([^"]*)"', raw_html)
desc_len = len(html_entities.unescape(desc.group(1))) if desc else 0
print(f'  title: {title.group(1) if title else "(无)"}')
print(f'  description 长度: {desc_len} 字符（建议 80-160）')
print(f'  canonical: {canon.group(1) if canon else "(无)"}')

ok = (not missing) and 'WebApplication' in types and 'FAQPage' in types and faq_q == 6
print(f'\n  结论: 内容 {"✅ 完整" if not missing else f"❌ 缺 {len(missing)} 项"}'
      f' / 结构化数据 {"✅" if ("WebApplication" in types and "FAQPage" in types and faq_q == 6) else "❌"}')
sys.exit(0 if ok else 1)
