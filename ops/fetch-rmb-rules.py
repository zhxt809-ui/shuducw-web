#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""抓取官方页面并抽取"大写金额"相关条款原文（用于文案法规核验）"""
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36'}
KEY = ['中文大写', '大写金额', '壹', '整', '正', '零', '不予受理', '票据无效', '人民币']

URLS = [
    ('票据法（国家税务总局法规库）', 'https://fgk.chinatax.gov.cn/zcfgk/c100009/c5211816/content.html'),
    ('支付结算办法修改决定（司法部）', 'https://www.moj.gov.cn/pub/sfbgw/flfggz/flfggzbmgz/202410/t20241030_508753.html'),
    ('支付结算办法（全球法规网）', 'https://policy.mofcom.gov.cn/claw/clawContent.shtml?id=38763'),
    ('正确填写票据和结算凭证的基本规定（银行转载）', 'https://www.bankofas.com/asbank/cosumerprotection/fgzc/8807.html'),
]


def clean(html):
    html = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', ' ', html)
    html = re.sub(r'(?is)<br\s*/?>|</p>|</div>|</li>|</tr>', '\n', html)
    text = re.sub(r'(?s)<[^>]+>', ' ', html)
    text = text.replace('&nbsp;', ' ').replace('&ldquo;', '“').replace('&rdquo;', '”').replace('&amp;', '&')
    text = re.sub(r'[ \t\u3000]+', ' ', text)
    return re.sub(r'\n\s*\n+', '\n', text)


for name, url in URLS:
    print('=' * 78)
    print(f'{name}\n{url}')
    try:
        req = urllib.request.Request(url, headers=UA)
        raw = urllib.request.urlopen(req, timeout=25).read()
        for enc in ('utf-8', 'gbk', 'gb18030'):
            try:
                html = raw.decode(enc)
                break
            except UnicodeDecodeError:
                continue
        else:
            html = raw.decode('utf-8', 'replace')
            print(f'  ⚠️ 编码回退 utf-8/replace（长度 {len(html)}）')
        text = clean(html)
        print(f'  正文长度: {len(text)}')
        hits = 0
        for line in text.split('\n'):
            s = line.strip()
            if len(s) < 12:
                continue
            if any(k in s for k in ('中文大写', '大写金额', '票据无效', '不予受理')) and any(k in s for k in KEY):
                hits += 1
                print(f'  ▸ {s[:300]}')
                if hits >= 12:
                    break
        if not hits:
            print('  （未抽到关键句，可能页面为 JS 渲染或需登录）')
    except Exception as e:
        print(f'  ❌ 抓取失败: {type(e).__name__}: {str(e)[:120]}')
