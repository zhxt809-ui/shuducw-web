#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验收五类行业专项页：内容、结构化数据、canonical、交叉链接、sitemap/llms/services 入口同步，
并做"内容唯一性"检查——五页之间的问答与痛点不得重复，防止模板化低质页。"""
import html as html_entities
import json
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
UA = {'User-Agent': 'Mozilla/5.0 (audit)'}
BASE = 'https://www.shuducw.com'

PAGES = {
    'tech': {
        'h1': '西安科技与软件企业代理记账',
        'must': [
            '研发费用加计扣除',
            '2023 年第 7 号',
            '100% 在税前加计扣除',
            '200% 在税前摊销',
            '企业所得税法》第二十八条',
            '减按 15% 的税率征收企业所得税',
            '财税〔2011〕100 号',
            '实际税负超过 3% 的部分实行即征即退',
            '已随增值税税率调整降至 13%',
            '研发费用加计扣除是 100% 还是 75%',
        ],
    },
    'trade': {
        'h1': '西安商贸流通企业代理记账',
        'must': [
            '进销存与成本核算',
            '2026 年第 10 号',
            '2023 年第 12 号第三条',
            '减按 25% 计算应纳税所得额',
            '按 20% 的税率缴纳企业所得税',
            '延续执行至 2027 年 12 月 31 日',
            '月销售额刚好 10 万元要交增值税吗',
            '未达到起征点的免征、达到起征点的全额计税',
        ],
    },
    'construction': {
        'h1': '西安建筑安装企业代理记账',
        'must': [
            '跨县（市、区）提供建筑服务',
            '国家税务总局公告 2016 年第 17 号',
            '按照 2％的预征率',
            '按照 3% 的征收率',
            '合法有效凭证，否则不得扣除',
            '可结转下次预缴税款时继续扣除',
            '11% 税率，已按 2019 年第 39 号公告调整为 9%',
            '异地施工要在哪里预缴增值税',
        ],
    },
    'ecommerce': {
        'h1': '西安电商与直播带货企业代理记账',
        'must': [
            '平台流水三方对账',
            '刷单产生的流水要怎么处理',
            '多个店铺要不要多设几个公司',
            '直播带货的坑位费和佣金怎么入账',
            '增值税法》第二十三条',
            '大促月份销售额冲高',
        ],
    },
    'group': {
        'h1': '西安集团与多主体企业财税服务',
        'must': [
            '多主体账务体系搭建',
            '合并报表与管理报表',
            '独立交易原则',
            '税务机关有权按合理方法调整',
            '利息、股息、红利所得适用 20% 的比例税率',
            '股东从公司拿钱需要注意什么',
            '关联交易会被税务机关调整吗',
        ],
    },
}

COMMON = ['面包屑', '口径核验日期：2026 年 10 月', '不构成税务意见', '30 秒留资，顾问回电', '行业专项']

print('===== 逐页线上核查 =====')
pages_html = {}
page_fails = []
for slug, spec in PAGES.items():
    url = f'{BASE}/services/industry/{slug}'
    raw = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25).read().decode('utf-8', 'replace')
    text = re.sub(r'<!--.*?-->', '', html_entities.unescape(raw), flags=re.S)
    pages_html[slug] = (raw, text)
    missing = [s for s in (spec['must'] + COMMON) if s not in text]
    canon = re.search(r'rel="canonical" href="([^"]*)"', raw)
    ok_canon = bool(canon) and canon.group(1).endswith(f'/services/industry/{slug}')
    lds = re.findall(r'<script type="application/ld\+json">(.*?)</script>', raw, re.S)
    types, faq_q = [], 0
    for r in lds:
        try:
            data = json.loads(r)
        except ValueError:
            continue
        graph = data.get('@graph', [data]) if isinstance(data, dict) else data
        for it in graph if isinstance(graph, list) else [graph]:
            types.append(it.get('@type'))
            if it.get('@type') == 'FAQPage':
                faq_q = len(it.get('mainEntity', []))
    ok_schema = 'Service' in types and 'FAQPage' in types and faq_q == 4
    ok_h1 = spec['h1'] in text
    # 交叉链接：其余 4 个行业 + 工具中心 + 全部服务
    others = [s for s in PAGES if s != slug]
    ok_links = all(f'/services/industry/{o}' in text for o in others) and '/tools' in text and '全部财税服务' in text
    print(f'  {slug:<13} H1 {"✅" if ok_h1 else "❌"} / 内容 {len(spec["must"]) + len(COMMON) - len(missing)}/{len(spec["must"]) + len(COMMON)}'
          f' / Schema {"✅" if ok_schema else "❌"}（FAQ {faq_q} 问）/ canonical {"✅" if ok_canon else "❌"}'
          f' / 交叉链接 {"✅" if ok_links else "❌"}')
    if missing:
        page_fails.append(f'{slug} 缺内容: {missing}')
    if not (ok_h1 and ok_schema and ok_canon and ok_links):
        page_fails.append(f'{slug} 结构项未通过')

print('\n===== 内容唯一性（防模板化）=====')
# 从各页 JSON-LD 的 FAQ 里取出问题，两两比对不得重复
faq_sets = {}
for slug, (raw, _) in pages_html.items():
    qs = set()
    for r in re.findall(r'<script type="application/ld\+json">(.*?)</script>', raw, re.S):
        try:
            data = json.loads(r)
        except ValueError:
            continue
        graph = data.get('@graph', [data]) if isinstance(data, dict) else data
        for it in graph if isinstance(graph, list) else [graph]:
            if it.get('@type') == 'FAQPage':
                for m in it.get('mainEntity', []):
                    qs.add(m.get('name', '').strip())
    faq_sets[slug] = qs
dups = []
slugs = list(faq_sets)
for i in range(len(slugs)):
    for j in range(i + 1, len(slugs)):
        common = faq_sets[slugs[i]] & faq_sets[slugs[j]]
        if common:
            dups.append(f'{slugs[i]} 与 {slugs[j]} 重复问答: {sorted(common)}')
print(f'  各页问答数: ' + ' / '.join(f'{s} {len(faq_sets[s])}' for s in slugs))
print(f'  {"✅" if not dups else "❌"} 五页问答两两无重复（共 {sum(len(v) for v in faq_sets.values())} 条唯一问答）')
for d in dups:
    print(f'    ❌ {d}')

print('\n===== 入口与同步 =====')
checks = []
sitemap = urllib.request.urlopen(urllib.request.Request(f'{BASE}/sitemap.xml', headers=UA), timeout=25).read().decode('utf-8', 'replace')
checks.append(('sitemap 含 5 个行业页', all(f'{BASE}/services/industry/{s}</loc>' in sitemap for s in PAGES)))
llms = urllib.request.urlopen(urllib.request.Request(f'{BASE}/llms.txt', headers=UA), timeout=25).read().decode('utf-8', 'replace')
checks.append(('llms.txt 含行业专项条目与 5 个地址', '行业专项财税服务' in llms and all(f'/services/industry/{s}' in llms for s in PAGES)))
svc = urllib.request.urlopen(urllib.request.Request(f'{BASE}/services', headers=UA), timeout=25).read().decode('utf-8', 'replace')
svc = re.sub(r'<!--.*?-->', '', html_entities.unescape(svc), flags=re.S)
checks.append(('services 页含行业方案入口', '行业专项财税方案' in svc and all(f'/services/industry/{s}' in svc for s in PAGES)))
checks.append(('sitemap 仍含工具中心与区县页', f'{BASE}/tools</loc>' in sitemap and '/services/district/' in sitemap))
for name, ok in checks:
    print(f'  {"✅" if ok else "❌"} {name}')
print(f'  ℹ️ sitemap URL 数: {sitemap.count("<url>")}（新增 5 个行业页）')

all_ok = not page_fails and not dups and all(ok for _, ok in checks)
print(f'\n  结论: 行业页 {"✅ 全部通过" if not page_fails else f"❌ {len(page_fails)} 项问题"}'
      f' / 唯一性 {"✅" if not dups else "❌"} / 入口同步 {"✅" if all(ok for _, ok in checks) else "❌"}')
for f in page_fails:
    print(f'    ❌ {f}')
sys.exit(0 if all_ok else 1)
