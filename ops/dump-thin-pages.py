#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""拉取"最薄的几个页面"的真实可见文本，作为内容深度改写的依据。

只看用户/爬虫能读到的字（剔除 script/style/内联 JSON），不把脚本画的图算成内容。
"""
import re
import ssl
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
CTX = ssl.create_default_context()
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'}

PAGES = [
    ('薄页', 'https://www.shuducw.com/contact'),
    ('薄页', 'https://www.shuducw.com/self-check'),
    ('区县页', 'https://www.shuducw.com/services/district/xincheng'),
    ('区县页', 'https://www.shuducw.com/services/district/lianhu'),
    ('区县页', 'https://www.shuducw.com/services/district/beilin'),
    ('问题文章', 'https://www.shuducw.com/news/2026-shuiwu-cailiang-jizhun'),
]


def visible(html):
    h = re.sub(r'<script\b.*?</script>', ' ', html, flags=re.S | re.I)
    h = re.sub(r'<style\b.*?</style>', ' ', h, flags=re.S | re.I)
    h = re.sub(r'<noscript\b.*?</noscript>', ' ', h, flags=re.S | re.I)
    h = re.sub(r'<[^>]+>', ' ', h)
    h = h.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    h = re.sub(r'&#x?[0-9a-fA-F]+;', ' ', h)
    return re.sub(r'\s+', ' ', h).strip()


for kind, url in PAGES:
    print('=' * 74)
    print(f'[{kind}] {url}')
    print('=' * 74)
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=40, context=CTX) as r:
            html = r.read().decode('utf-8', 'replace')
        txt = visible(html)
        print(f'  可见文本长度: {len(txt)} 字')
        # 剔除全站共有的导航/页脚噪音（简单做法：把反复出现的短句去掉，这里直接打印全文供人工判断）
        print(f'  可见文本全文:\n{txt[:2600]}')
    except Exception as e:
        print(f'  抓取失败: {type(e).__name__}: {str(e)[:120]}')
    print()
