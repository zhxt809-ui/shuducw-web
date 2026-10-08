#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""逐条核验外部评审（2026-10-08）对本站的说法：全部以当前线上页面为准，
不依赖任何搜索缓存。输出可直接作为"采纳/驳回"的证据。"""
import html as html_entities
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
UA = {'User-Agent': 'Mozilla/5.0 (claim-audit)'}
BASE = 'https://www.shuducw.com'


def fetch(path):
    raw = urllib.request.urlopen(urllib.request.Request(BASE + path, headers=UA), timeout=30).read().decode('utf-8', 'replace')
    text = re.sub(r'<!--.*?-->', '', html_entities.unescape(raw), flags=re.S)
    return raw, text


home_raw, home = fetch('/')
faq_raw, faq = fetch('/faq')
contact_raw, contact = fetch('/contact')
basic_raw, basic = fetch('/services/basic')
svc_raw, svc = fetch('/services')
consult_raw, consult = fetch('/services/consulting')

results = []


def check(name, ok, evidence):
    results.append((name, ok, evidence))


# A. 首页 FAQ 数量 vs FAQ 页实际条数
m = re.search(r'(\d+)\s*个高频问题解答', home)
home_n = m.group(1) if m else None
faq_qs = len(re.findall(r'<h3[^>]*>|data-faq-item', faq))
# FAQ 页用 details/summary 或 h3 渲染，两种都数一遍
faq_qs = max(faq_qs, faq.count('常见问题') and len(re.findall(r'class="[^"]*faq', faq)))
faq_items = len(re.findall(r'<summary', faq)) or len(re.findall(r'question', faq, re.I))
check('A1 首页写"28 个高频问题解答"', home_n == '28', f'首页实际写的是：{home_n} 个' if home_n else '首页未找到该表述')
check('A2 FAQ 页问题条数', True, f'页面内问题条数（summary/问题块）= {faq_items}；页面出现的"更新于"字样：'
      + (re.search(r'更新于[^<]{0,20}', faq).group(0) if re.search(r'更新于[^<]{0,20}', faq) else '未找到'))
check('A3 首页数字与 FAQ 实际条数是否一致', home_n is not None and str(faq_items) == home_n,
      f'首页 {home_n} vs 实际 {faq_items} —— {"一致" if str(faq_items) == home_n else "不一致"}')

# B/C. 表单口径
check('B1 首页承诺"不用注册、不留公司名"', '不留公司名' in home,
      '首页／内嵌表单文案：' + (re.search(r'只需 ?3 ?项信息[^<]{0,30}', home).group(0) if re.search(r'只需 ?3 ?项信息[^<]{0,30}', home) else '未找到'))
req = re.findall(r'企业名称[^<]{0,12}', contact)
check('B2 联系页要求"企业名称"', bool(req), '联系页出现：' + (' / '.join(sorted(set(req))[:3]) if req else '未找到'))
check('B3 两页口径是否冲突', ('不留公司名' in home) and bool(req),
      '首页说"不留公司名"，联系页要求"企业名称" —— 冲突成立' if ('不留公司名' in home) and req else '无冲突')

# D/E. 案例标签与"关键词"痕迹
check('D1 首页案例是否仍显示"关键词："', '关键词：' in home or '关键词:' in home,
      '首页案例区域含"关键词："字样' if ('关键词：' in home) else '首页已无"关键词："字样')
has_tags = bool(re.search(r'行业[:：]|服务周期|企业阶段|服务类型[:：]|服务内容[:：]', home))
check('E1 首页案例是否已有"行业/周期/类型"标签', has_tags,
      '已发现标签类文案' if has_tags else '首页案例目前只有标题，没有标签行')
cases = re.findall(r'(?:业财税一体化|A ?轮融资|41 ?家省级分支机构)[^<]{0,40}', home)
check('E2 首页案例标题', bool(cases), ' / '.join(cases[:3]) if cases else '未找到案例标题')

# F. 基础财税页首屏
m2 = re.search(r'企业刚需引流业务', basic)
check('F1 /services/basic 出现"企业刚需引流业务"', bool(m2),
      '出现位置（前文）：' + (basic[max(0, m2.start() - 40):m2.start() + 20].replace('\n', ' ') if m2 else '未找到'))

# G/H. 其他文案
check('G1 首页 title 含"老牌"', '老牌' in home_raw[:4000], '首页 <title> 含"老牌"')
check('H1 咨询页含"税负合规计划"', '税负合规计划' in consult, '咨询页出现该名称')
check('H2 咨询页含"税务稽查全程协助"', '税务稽查全程协助' in consult, '咨询页出现该表述')
check('H3 咨询页是否有"协助梳理资料/沟通材料"式表述',
      bool(re.search(r'梳理[^<]{0,10}(资料|材料)|沟通材料|说明材料', consult)),
      '已有限定式表述' if re.search(r'梳理[^<]{0,10}(资料|材料)|沟通材料|说明材料', consult) else '目前只有"全程协助"式表述')

# I. 名称统一性（2026-10-08 决定：全站统一用「基础财税服务」）
names = {
    '基础财税服务': 0, '基础财税托管': 0, '基础工商财税服务': 0,
}
pages = {'首页': home, '服务页': svc, '基础财税页': basic, '联系页': contact}
detail = []
for n in names:
    for pname, ptext in pages.items():
        c = ptext.count(n)
        names[n] += c
        if c:
            detail.append(f'{pname}×{c}')
check('I1 「基础财税」叫法已统一为「基础财税服务」',
      names['基础财税托管'] == 0 and names['基础工商财税服务'] == 0 and names['基础财税服务'] > 0,
      '；'.join(f'{k} {v} 次' for k, v in names.items()) + ' | ' + ', '.join(detail))

# J. 五类服务体系（2026-10-08 按公司服务清单重整）
five = ['基础财税服务', '税务合规与优化服务', '财务内控管理服务', '股权与投融资财税服务', '企业专项定制服务']
hit = [f for f in five if f in svc]
check('J1 服务页五类体系命名', len(hit) == 5, f'命中 {len(hit)}/5：' + '、'.join(hit))

print('=' * 72)
print('  外部评审说法逐条核验（以当前线上页面为准，不依赖搜索缓存）')
print('=' * 72)
ok_n = 0
for name, ok, ev in results:
    print(f'  {"✅ 属实" if ok else "❌ 不成立"}  {name}')
    print(f'         证据：{ev}')
    ok_n += 1 if ok else 0
print('=' * 72)
print(f'  合计：{ok_n}/{len(results)} 条说法经线上核实成立')
