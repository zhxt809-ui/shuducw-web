#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""按 ChatGPT 复盘里点名的页面逐条抓线上真实页面，核验其断言（只读，不改站）"""
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
BASE = 'https://www.shuducw.com'
PAGES = {
    '首页': '/',
    '基础财税': '/services/basic',
    '财税合规': '/services/compliance',
    '财税咨询': '/services/consulting',
    '雁塔区': '/services/district/yanta',
    '灞桥区': '/services/district/baqiao',
    '关于我们': '/about',
    '联系我们': '/contact',
    'FAQ': '/faq',
    '账务自查': '/self-check',
    '案例': '/cases',
    '股东往来': '/shareholder-loans',
    '发票合规': '/invoice-compliance',
    '社保个税': '/social-insurance-iit',
    '高新企业': '/high-tech-enterprise',
    '公司注销': '/company-deregistration',
    '服务交付': '/services/delivery',
}
CLAIMS = {
    '旧电话 84556877': r'84556877',
    '新电话 88456877': r'88456877',
    '注册税务师': r'注册税务师',
    '税务师(不带注册)': r'(?<!注册)税务师',
    '中端增值': r'中端增值',
    '高端': r'高端',
    '行业公信力扎实': r'行业公信力扎实',
    '专业能力硬核': r'专业能力硬核',
    '精准匹配中高端': r'精准匹配中高端',
    '服务安全可靠': r'服务安全可靠',
    '季度为纳税申报期': r'季度为纳税申报期',
    '各税种都要零申报': r'各税种都要零申报',
    '零申报': r'零申报',
    '四流一致': r'四流一致',
    '金税四期': r'金税四期',
    '视同分红': r'视同分红',
    '万分之五': r'万分之五',
    '按月或按季': r'按月或按季',
    '41 家分支机构': r'41\s*家',
    '中税网': r'中税网',
    '小红书': r'小红书',
    '更新于': r'更新于',
    '30 个高频问题': r'30\s*个高频',
}


def fetch(path):
    req = urllib.request.Request(BASE + path, headers={'User-Agent': 'Mozilla/5.0 (verification script)'})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode('utf-8', 'replace')


def visible(html):
    html = re.sub(r'<script[^>]*>.*?</script>', ' ', html, flags=re.S | re.I)
    html = re.sub(r'<style[^>]*>.*?</style>', ' ', html, flags=re.S | re.I)
    txt = re.sub(r'<[^>]+>', ' ', html)
    txt = (txt.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&ldquo;', '“')
              .replace('&rdquo;', '”').replace('&#x27;', "'").replace('&quot;', '"'))
    return re.sub(r'\s+', ' ', txt)


def main():
    cache = {}
    print('线上实测（www.shuducw.com 当前真实响应，非缓存快照）')
    print('=' * 92)
    header = f'{"页面":<12}' + ''.join(f'{k[:9]:>11}' for k in list(CLAIMS)[:8])
    print(header)
    print('-' * 92)
    keys = list(CLAIMS)
    for name, path in PAGES.items():
        try:
            html = fetch(path)
        except Exception as e:
            print(f'{name:<12}  抓取失败: {e}')
            continue
        txt = visible(html)
        cache[name] = txt
        row = f'{name:<12}'
        for k in keys[:8]:
            n = len(re.findall(CLAIMS[k], txt))
            row += f'{n:>11}'
        print(row)
    print()
    print('=' * 92)
    print('逐条断言核验（在全部已抓页面中统计）')
    print('=' * 92)
    for k, pat in CLAIMS.items():
        hits = {n: len(re.findall(pat, t)) for n, t in cache.items() if re.search(pat, t)}
        if hits:
            detail = ', '.join(f'{n}×{c}' for n, c in sorted(hits.items(), key=lambda kv: -kv[1])[:6])
            print(f'  ▸ "{k}": 出现在 {len(hits)} 个页面 → {detail}')
        else:
            print(f'  ▸ "{k}": 0 个页面出现')
    # 列出关键页面的电话上下文
    print()
    print('各页面电话上下文：')
    for n, t in cache.items():
        for m in re.finditer(r'(029-?\d{7,8}|13359182829)', t):
            s = max(0, m.start() - 25)
            snippet = t[s:m.end() + 15].strip()
            print(f'  {n}: …{snippet}…')
            break


if __name__ == '__main__':
    main()
