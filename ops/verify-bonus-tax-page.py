#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验收年终奖个税试算页：线上内容、临界点表、结构化数据、站内入口、sitemap 与 llms.txt 同步"""
import html as html_entities
import json
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
URL = 'https://www.shuducw.com/tools/bonus-tax'
UA = {'User-Agent': 'Mozilla/5.0 (audit)'}


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    raw = urllib.request.urlopen(req, timeout=25).read().decode('utf-8', 'replace')
    # 规范化后再比对，两种情况都会让"源码原文式断言"失败：
    # 1) React 把正文半角引号转义为 &quot; → 需 html.unescape
    # 2) React 在"表达式 + 文本"之间插入 <!-- --> 文本分隔注释（如 {金额} 元）→ 需剥离注释
    text = html_entities.unescape(raw)
    text = re.sub(r'<!--.*?-->', '', text, flags=re.S)
    return raw, text


raw_html, html = fetch(URL)
print(f'页面: {URL}\nHTML 长度: {len(raw_html)}（已解码实体后比对）\n')

MUST = [
    ('H1 标题', '年终奖个税计算器'),
    ('计算公式原文', '应纳税额＝全年一次性奖金收入×适用税率－速算扣除数'),
    ('奖金÷12 查表口径', '奖金 ÷ 12'),
    ('政策文号', '2023 年第 30 号'),
    ('执行期限 2027-12-31', '2027 年 12 月 31 日'),
    ('依据文件 国税发〔2005〕9 号', '国税发〔2005〕9 号'),
    ('月度表：3000 3%', '3000-12000 元 10%/210'),
    ('月度表：12000-25000 20%', '12000-25000 元 20%/1410'),
    ('月度表：25000-35000 25%', '25000-35000 元 25%/2660'),
    ('月度表：35000-55000 30%', '35000-55000 元 30%/4410'),
    ('月度表：55000-80000 35%', '55000-80000 元 35%/7160'),
    ('月度表：超 80000 45%', '超过 80000 元 45%/15160'),
    ('单独计税一年一次', '只允许采用一次'),
    ('临界点表：400000 级次 36000', '36,000 元'),
    ('临界点表：区间右端 38566.67', '38,566.67 元'),
    ('临界点表：多发 1 元多缴 2310.10', '2,310.10 元'),
    ('临界点表：144000 区间右端 160500', '160,500 元'),
    ('临界点表：300000 区间右端 318333.33', '318,333.33 元'),
    ('临界点表：420000 临界点', '420,000'),
    ('临界点表：660000 临界点', '660,000'),
    ('临界点表：960000 临界点', '960,000'),
    ('问答1：怎么算与公式', '年终奖个税怎么算？单独计税的计算公式是什么？'),
    ('问答2：哪种更划算', '年终奖单独计税和并入综合所得，哪种更划算？'),
    ('问答3：多发一元多缴几千', '为什么说年终奖"多发一元，多缴几千"？临界点有哪些？'),
    ('问答4：一年几次', '年终奖单独计税一年可以用几次？'),
    ('问答5：执行到什么时候', '年终奖政策执行到什么时候？之后会怎样？'),
    ('问答6：拆分发放能否省税', '把年终奖拆成"工资+年终奖"发放，能省税吗？'),
    ('口径核验日期声明', '口径核验日期：2026 年 10 月'),
    ('保留内嵌表单', '30 秒留资，顾问回电'),
    ('更多工具：个税计算器', '/tools/income-tax'),
    ('更多工具：增值税计算器', '/tools/vat'),
]
print('===== 线上内容核查 =====')
missing = [name for name, s in MUST if s not in html]
for name, s in MUST:
    print(f'  {"✅" if s in html else "❌"} {name}')

print('\n===== 结构化数据 =====')
lds = re.findall(r'<script type="application/ld\+json">(.*?)</script>', raw_html, re.S)
types, faq_q = [], 0
for raw in lds:
    try:
        data = json.loads(raw)
    except ValueError as e:
        print(f'  ❌ JSON-LD 解析失败: {e}')
        continue
    items = data.get('@graph', [data]) if isinstance(data, dict) else data
    for it in items if isinstance(items, list) else [items]:
        types.append(it.get('@type'))
        if it.get('@type') == 'FAQPage':
            faq_q = len(it.get('mainEntity', []))
print(f'  类型: {types}')
ok_schema = 'WebApplication' in types and 'FAQPage' in types and faq_q == 6
print(f'  {"✅" if ok_schema else "❌"} WebApplication + FAQPage（{faq_q} 问）')

title = re.search(r'<title>([^<]*)</title>', raw_html)
canon = re.search(r'rel="canonical" href="([^"]*)"', raw_html)
print(f'\n  title: {title.group(1) if title else "(无)"}')
print(f'  canonical: {canon.group(1) if canon else "(无)"}')
ok_canon = bool(canon) and canon.group(1).endswith('/tools/bonus-tax')

print('\n===== 站内入口与同步检查 =====')
checks = []
_, home = fetch('https://www.shuducw.com/')
checks.append(('首页工具区含年终奖入口', '/tools/bonus-tax' in home))
_, sitemap = fetch('https://www.shuducw.com/sitemap.xml')
checks.append(('sitemap 含 /tools/bonus-tax', '/tools/bonus-tax' in sitemap))
sitemap_count = sitemap.count('<url>')
_, llms = fetch('https://www.shuducw.com/llms.txt')
checks.append(('llms.txt 含年终奖工具条目', '年终奖个税计算器' in llms and '2023年第30号' in llms))
for page in ['vat', 'income-tax', 'rmb-uppercase']:
    _, p = fetch(f'https://www.shuducw.com/tools/{page}')
    checks.append((f'{page} 页含交叉链接', '/tools/bonus-tax' in p))
for name, ok in checks:
    print(f'  {"✅" if ok else "❌"} {name}')
print(f'  ℹ️ sitemap 当前 URL 数: {sitemap_count}')

all_ok = (not missing) and ok_schema and ok_canon and all(ok for _, ok in checks)
print(f'\n  结论: 内容 {"✅ 完整" if not missing else f"❌ 缺 {len(missing)} 项"}'
      f' / 结构化数据 {"✅" if ok_schema else "❌"}'
      f' / canonical {"✅" if ok_canon else "❌"}'
      f' / 入口同步 {"✅" if all(ok for _, ok in checks) else "❌"}')
sys.exit(0 if all_ok else 1)
