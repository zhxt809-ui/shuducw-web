#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""抓取头条搜索站长平台官方文档（web_fetch 提取器对此站返回 422，改用服务器端 urllib）"""
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

URLS = [
    ('数据提交帮助', 'https://zhanzhang.toutiao.com/page/outer/docs/26881'),
    ('头条搜索移动端页面规范', 'https://zhanzhang.toutiao.com/page/outer/docs/26897'),
]


def fetch(url):
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                      '(KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9',
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = r.read()
    try:
        return raw.decode('utf-8')
    except UnicodeDecodeError:
        return raw.decode('gbk', 'replace')


def strip_html(html):
    html = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', ' ', html)
    text = re.sub(r'(?s)<[^>]+>', '\n', html)
    text = re.sub(r'&nbsp;', ' ', text)
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'&lt;', '<', text)
    text = re.sub(r'&gt;', '>', text)
    lines = [ln.strip() for ln in text.split('\n')]
    return '\n'.join([ln for ln in lines if ln])


for name, url in URLS:
    print(f'===== {name} =====')
    print(f'URL: {url}')
    try:
        html = fetch(url)
        text = strip_html(html)
        print(f'原始 HTML 长度: {len(html)}，正文长度: {len(text)}')
        print('--- 正文（前 3000 字）---')
        print(text[:3000])
    except Exception as e:
        print(f'抓取失败: {type(e).__name__}: {str(e)[:200]}')
    print('')
