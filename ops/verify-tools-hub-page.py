#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验收财税工具中心页 /tools：内容、结构化数据、站内互链、sitemap 与 llms.txt 同步"""
import html as html_entities
import json
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
URL = 'https://www.shuducw.com/tools'
UA = {'User-Agent': 'Mozilla/5.0 (audit)'}
TOOL_PAGES = ['vat', 'income-tax', 'rmb-uppercase', 'bonus-tax']


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    raw = urllib.request.urlopen(req, timeout=25).read().decode('utf-8', 'replace')
    text = html_entities.unescape(raw)
    text = re.sub(r'<!--.*?-->', '', text, flags=re.S)
    return raw, text


raw_html, html = fetch(URL)
print(f'页面: {URL}\nHTML 长度: {len(raw_html)}\n')

MUST = [
    ('H1 标题', '财税工具中心'),
    ('面包屑导航', 'aria-label="面包屑"'),
    ('免注册承诺', '全部免费 · 免注册 · 浏览器内计算'),
    ('工具数说明', '5 个免费工具'),
    ('工具一：账务风险自查', '账务风险自查'),
    ('工具二：增值税计算器', '增值税计算器'),
    ('工具三：个税计算器', '个税计算器'),
    ('工具四：年终奖试算', '年终奖试算'),
    ('工具五：金额大写转换', '金额大写转换'),
    ('每个工具的适用对象字段', '适合谁用：'),
    ('每个工具的依据字段', '依据：'),
    ('增值税法依据文号', '中华人民共和国增值税法'),
    ('优惠政策衔接公告年份', '2026 年第 10 号'),
    ('年终奖政策文号与期限', '财政部 税务总局公告 2023 年第 30 号及其所附'),
    ('个税减半政策文号', '2023 年第 12 号'),
    ('大写工具依据（票据规定）', '正确填写票据和结算凭证的基本规定'),
    ('口径来源章节', '这些工具的计算口径从哪来'),
    ('口径核验日期', '口径核验日期：2026 年 10 月'),
    ('政策台账承诺', '政策更新台账'),
    ('不构成税务意见声明', '不构成税务意见'),
    ('问答一：免费与隐私', '这些工具免费吗？需要注册吗？会保存我输入的数据吗？'),
    ('问答二：准确性与依据', '工具算出来的结果准确吗？依据是什么？'),
    ('问答三：与扣缴不一致', '工具算的税额和实际扣缴的不一样，为什么？'),
    ('问答四：起征点临界值', '刚好达到起征点要不要交税？'),
    ('问答五：个体户减半', '个体工商户的个税该用哪个工具？减半征收怎么算？'),
    ('问答六：政策到期更新', '政策有执行期限，到期后工具会更新吗？'),
    ('隐私说明：输入不上传', '不会被保存，也不会上传到服务器'),
    ('咨询表单保留', '30 秒留资，顾问回电'),
    ('区域服务入口', '西安各区财税服务'),
]
print('===== 线上内容核查 =====')
for name, s in MUST:
    print(f'  {"✅" if s in html else "❌"} {name}')
missing = [n for n, s in MUST if s not in html]

print('\n===== 结构化数据 =====')
lds = re.findall(r'<script type="application/ld\+json">(.*?)</script>', raw_html, re.S)
types, items, faq_q = [], 0, 0
for raw in lds:
    try:
        data = json.loads(raw)
    except ValueError as e:
        print(f'  ❌ JSON-LD 解析失败: {e}')
        continue
    graph = data.get('@graph', [data]) if isinstance(data, dict) else data
    for it in graph if isinstance(graph, list) else [graph]:
        types.append(it.get('@type'))
        if it.get('@type') == 'ItemList':
            items = len(it.get('itemListElement', []))
        if it.get('@type') == 'FAQPage':
            faq_q = len(it.get('mainEntity', []))
print(f'  类型: {types} / ItemList {items} 项 / FAQ {faq_q} 问')
ok_schema = 'CollectionPage' in types and 'ItemList' in types and items == 5 and 'FAQPage' in types and faq_q == 6
print(f'  {"✅" if ok_schema else "❌"} CollectionPage + ItemList(5) + FAQPage(6)')

canon = re.search(r'rel="canonical" href="([^"]*)"', raw_html)
title = re.search(r'<title>([^<]*)</title>', raw_html)
desc = re.search(r'name="description" content="([^"]*)"', raw_html)
print(f'  canonical: {canon.group(1) if canon else "(无)"}')
ok_canon = bool(canon) and canon.group(1).endswith('/tools')
if title:
    print(f'  title 长度: {len(title.group(1))}')
if desc:
    print(f'  description 长度: {len(desc.group(1))}')

print('\n===== 站内互链与同步 =====')
checks = []
_, home = fetch('https://www.shuducw.com/')
checks.append(('首页含"查看全部财税工具"入口', '/tools' in home and '查看全部财税工具' in home))
_, sitemap = fetch('https://www.shuducw.com/sitemap.xml')
checks.append(('sitemap 含 /tools', '<loc>https://www.shuducw.com/tools</loc>' in sitemap))
checks.append(('sitemap 仍含 4 个工具页', all(f'/tools/{p}</loc>' in sitemap for p in TOOL_PAGES)))
_, llms = fetch('https://www.shuducw.com/llms.txt')
checks.append(('llms.txt 含工具中心条目', '财税工具中心' in llms))
for p in TOOL_PAGES:
    _, t = fetch(f'https://www.shuducw.com/tools/{p}')
    checks.append((f'{p} 页含回工具中心链接', '财税工具中心' in t and 'href="/tools"' in t))
_, sc = fetch('https://www.shuducw.com/self-check')
checks.append(('self-check 可访问且为 200', '自查' in sc or '自测' in sc))
for name, ok in checks:
    print(f'  {"✅" if ok else "❌"} {name}')

all_ok = (not missing) and ok_schema and ok_canon and all(ok for _, ok in checks)
print(f'\n  结论: 内容 {"✅ 完整" if not missing else f"❌ 缺 {len(missing)} 项"}'
      f' / 结构化数据 {"✅" if ok_schema else "❌"}'
      f' / canonical {"✅" if ok_canon else "❌"}'
      f' / 互链同步 {"✅" if all(ok for _, ok in checks) else "❌"}')
sys.exit(0 if all_ok else 1)
