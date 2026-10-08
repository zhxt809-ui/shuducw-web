#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从官方政策法规库抽取《正确填写票据和结算凭证的基本规定》原文，写入本地 UTF-8 文件供引用"""
import pathlib
import re
import ssl
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0'}
URL = 'https://policy.mofcom.gov.cn/claw/clawContent.shtml?id=38763'
OUT = pathlib.Path(__file__).resolve().parent / '_tmp' / '正确填写票据和结算凭证的基本规定-原文.md'


def clean(html):
    html = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', ' ', html)
    html = re.sub(r'(?is)<br\s*/?>|</p>|</div>|</li>|</tr>', '\n', html)
    text = re.sub(r'(?s)<[^>]+>', ' ', html)
    for a, b in [('&nbsp;', ' '), ('&ldquo;', '“'), ('&rdquo;', '”'), ('&amp;', '&'), ('&quot;', '"')]:
        text = text.replace(a, b)
    text = re.sub(r'[ \t\u3000]+', ' ', text)
    return re.sub(r'\n\s*\n+', '\n', text)


ctx = ssl.create_default_context()
html = urllib.request.urlopen(urllib.request.Request(URL, headers=UA), timeout=30, context=ctx).read().decode('utf-8', 'replace')
text = clean(html)

i = text.find('正确填写票据和结算凭证的基本规定')
start = text.find('银行、单位和个人填写的各种票据和结算凭证', i if i != -1 else 0)
if start == -1:
    start = i
seg = text[start:start + 4200] if start != -1 else ''
seg = re.sub(r'\n+', '\n', seg).strip()

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(
    '# 《正确填写票据和结算凭证的基本规定》原文摘录\n\n'
    f'来源：{URL}\n'
    '（中国人民银行《支付结算办法》银发〔1997〕393号 附一；本页为商务部政策法规库转载）\n'
    '抓取时间：2026-10-07\n\n---\n\n' + seg + '\n',
    encoding='utf-8')

print(f'已写入: {OUT}')
print(f'摘录长度: {len(seg)} 字符')
for kw in ['正楷', '为止', '应写', '零', '人民币三字', '预印', '不得更改']:
    print(f'  "{kw}": {seg.count(kw)} 处')
