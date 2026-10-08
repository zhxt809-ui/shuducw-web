#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验收个税计算器页面：线上内容 + 计算器源码（减半征收为客户端状态，源码级核查）"""
import html as html_entities
import json
import pathlib
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = 'https://www.shuducw.com/tools/income-tax'
req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0 (audit)'})
raw_html = urllib.request.urlopen(req, timeout=25).read().decode('utf-8', 'replace')
html = html_entities.unescape(raw_html)
print(f'页面: {URL}\nHTML 长度: {len(raw_html)}（已解码实体后比对）\n')

MUST = [
    ('板块：计算口径与政策依据', '计算口径与政策依据'),
    ('板块：个税常见问题', '个税常见问题'),
    ('板块：专项附加扣除现行标准（7 项）', '专项附加扣除现行标准（7 项）'),
    ('计税办法第七条（应纳税所得额构成）', '《个体工商户个人所得税计税办法》第七条'),
    ('个体户减半征收政策与期限', '2023-01-01 至 2027-12-31，年应纳税所得额不超过 200 万元的部分减半征收个人所得税'),
    ('业主工资不得扣除（第二十一条）', '业主本人的工资薪金支出不得税前扣除（第二十一条）'),
    ('混用支出 40% 扣除（第十六条）', '其中 40% 视为与生产经营有关费用准予扣除（第十六条）'),
    ('亏损结转 5 年（第十七条）', '亏损结转弥补最长不超过 5 年（第十七条）'),
    ('专项附加：子女教育 2000', '子女教育：每个子女每月 2000 元（2023 年由 1000 元提高）'),
    ('专项附加：婴幼儿照护 2000', '3 岁以下婴幼儿照护：每个婴幼儿每月 2000 元'),
    ('专项附加：赡养老人 3000', '赡养老人：每月 3000 元'),
    ('专项附加：继续教育 400/3600', '学历（学位）教育每月 400 元'),
    ('专项附加：房贷利息 1000', '首套住房贷款利息每月 1000 元、最长 240 个月'),
    ('专项附加：住房租金 1500/1100/800', '按城市每月 1500 元 / 1100 元 / 800 元'),
    ('专项附加：大病医疗 15000/80000', '在 80000 元限额内据实扣除'),
    ('经营所得速算扣除数 65500', '65500'),
    ('综合所得速算扣除数 181920', '181920'),
    ('减除费用 6 万元（即每月 5000 元）', '年度减除费用 6 万元（即每月 5000 元）'),
    ('年终奖单独计税至 2027-12-31', '全年一次性奖金可选择单独计税或并入综合所得，政策执行至 2027-12-31'),
    ('问答1：个体户经营所得怎么算', '个体工商户的经营所得个税怎么算？'),
    ('问答2：减半征收怎么算与期限', '个体工商户减半征收个人所得税怎么算？执行到什么时候？'),
    ('问答3：专项附加扣除每月扣多少', '专项附加扣除现在每月能扣多少？'),
    ('问答4：工资 6 万与 5000 元关系', '工资薪金个税怎么算？6 万元和每月 5000 元是什么关系？'),
    ('问答5：经营所得与工资区别', '经营所得和工资薪金有什么区别？主播、工作室按哪个交？'),
    ('问答6：年终奖怎么算', '年终奖怎么算个税更划算？'),
    ('口径核验日期声明', '口径核验日期：2026 年 10 月'),
    ('保留内嵌表单', '30 秒留资，顾问回电'),
]
print('===== 线上内容核查 =====')
missing = [name for name, s in MUST if s not in html]
for name, s in MUST:
    print(f'  {"✅" if s in html else "❌"} {name}')

print('\n===== 计算器源码核查（减半征收为客户端状态）=====')
src = (ROOT / 'src' / 'components' / 'income-tax-calculator.tsx').read_text(encoding='utf-8')
SRC_CHECKS = [
    ('减半征收开关状态 halfReduction', 'useState(true)' in src and 'halfReduction' in src),
    ('减免额 = 应纳税额 × 50%', 'bizTax * 0.5' in src),
    ('200 万元适用上限判断', 'bizTaxable <= 2000000' in src),
    ('超 200 万元警示文案', '超过部分不适用减半征收' in src),
    ('展示减半前应纳税额', '减半前应纳税额' in src),
    ('展示减免额', '个体工商户减半征收减免额' in src),
    ('依据含 2023 年第 12 号公告', '2023 年第 12 号' in src),
    ('已移除未使用的 bizEffective', 'bizEffective' not in src),
]
src_ok = 0
for name, ok in SRC_CHECKS:
    src_ok += 1 if ok else 0
    print(f'  {"✅" if ok else "❌"} {name}')

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
print(f'  JSON-LD 类型: {types}')
print(f'  {"✅" if "WebApplication" in types else "❌"} WebApplication | {"✅" if "FAQPage" in types else "❌"} FAQPage（{faq_q} 问）')

title = re.search(r'<title>([^<]*)</title>', raw_html)
canon = re.search(r'rel="canonical" href="([^"]*)"', raw_html)
print(f'\n  title: {title.group(1) if title else "(无)"}')
print(f'  canonical: {canon.group(1) if canon else "(无)"}')

ok = (not missing) and src_ok == len(SRC_CHECKS) and 'FAQPage' in types and faq_q == 6
print(f'\n  结论: 线上内容 {"✅ 完整" if not missing else f"❌ 缺 {len(missing)} 项"}'
      f' / 源码 {src_ok}/{len(SRC_CHECKS)} / FAQPage {"✅" if faq_q == 6 else "❌"}')
sys.exit(0 if ok else 1)
