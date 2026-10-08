#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验收增值税计算器页面：线上内容 + 计算器源码边界逻辑（计算器为客户端组件，边界文案不在首屏 HTML 中）"""
import html as html_entities
import json
import pathlib
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = 'https://www.shuducw.com/tools/vat'
req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0 (audit)'})
raw_html = urllib.request.urlopen(req, timeout=25).read().decode('utf-8', 'replace')
html = html_entities.unescape(raw_html)  # React 会把正文引号转义为 &quot;，必须先解码
print(f'页面: {URL}\nHTML 长度: {len(raw_html)}（已解码实体后比对）\n')

MUST = [
    ('板块：计算口径与政策依据', '计算口径与政策依据'),
    ('板块：增值税常见问题', '增值税常见问题'),
    ('起征点三种计税期间', '按次纳税为每次/日销售额 1000 元'),
    ('判定口径原文：未达到', '销售额未达到起征点的，免征增值税'),
    ('判定口径原文：达到全额', '达到起征点的，依照本法规定全额计算缴纳增值税'),
    ('临界说明：刚好等于也计税', '刚好等于或超过'),
    ('换算公式 ÷(1+征收率)', '销售额 = 含税销售额 ÷（1 + 规定征收率）'),
    ('减按1%折算除以1.01', '减按 1% 征收时除以 1.01'),
    ('1%除外：不动产与土地使用权', '销售、出租不动产，转让土地使用权'),
    ('特殊情形：自用固定资产2%', '3% 减按 2%'),
    ('特殊情形：个人出租住房1.5%', '3% 减按 1.5%'),
    ('一般纳税人：第十四条', '《增值税法》第十四条'),
    ('留抵：第二十一条可申请退还', '第二十一条'),
    ('不得抵扣：第二十二条', '第二十二条'),
    ('税率：13%/9%/6%', '13%（货物、加工修理修配、有形动产租赁等）'),
    ('小规模标准 500 万元', '500 万元'),
    ('问答1：刚好10万要不要交税', '月销售额刚好 10 万元，要不要交增值税？'),
    ('问答2：1%不适用情形', '小规模纳税人 3% 减按 1% 的优惠，有哪些不适用的情况？'),
    ('问答3：含税换算', '含税价怎么换算成不含税销售额？'),
    ('问答4：进项不得抵扣', '一般纳税人增值税怎么算？哪些进项不能抵扣？'),
    ('问答5：留抵是否只能结转', '进项大于销项怎么办？留抵税额只能结转吗？'),
    ('问答6：超过10万是否只算超出部分', '月销售额超过 10 万元，是按超出部分交税吗？'),
    ('口径核验日期声明', '口径核验日期：2026 年 10 月'),
    ('保留内嵌表单', '30 秒留资，顾问回电'),
]
print('===== 线上内容核查 =====')
missing = [name for name, s in MUST if s not in html]
for name, s in MUST:
    print(f'  {"✅" if s in html else "❌"} {name}')

print('\n===== 计算器源码边界逻辑核查 =====')
src = (ROOT / 'src' / 'components' / 'vat-calculator.tsx').read_text(encoding='utf-8')
SRC_CHECKS = [
    ('起征点判定改为"未达到"（< 100000）', 'monthlyExclTax < 100000' in src),
    ('已移除旧的"含本数免征"（<= 100000）', 'monthlyExclTax <= 100000' not in src),
    ('存在临界点标记 atThreshold', 'const atThreshold' in src),
    ('临界提示文案存在', '恰好等于 10 万元起征点' in src),
    ('1% 除外情形提示存在', '不适用于销售、出租不动产与转让土地使用权' in src),
    ('留抵可申请退还提示存在', '申请退还' in src),
    ('依据含 2026 年第 10 号公告', '2026 年第 10 号' in src),
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
      f' / 源码逻辑 {src_ok}/{len(SRC_CHECKS)} / FAQPage {"✅" if faq_q == 6 else "❌"}')
sys.exit(0 if ok else 1)
