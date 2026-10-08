#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""抓取官方页面正文并存为 UTF-8 文本文件（用于法规原文核验，避免控制台编码干扰）

用法: python ops/fetch-official-text.py <URL> <输出文件名>
"""
import pathlib
import re
import ssl
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0 Safari/537.36'}
OUT_DIR = pathlib.Path(__file__).resolve().parent / '_tmp'


def clean(html):
    html = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', ' ', html)
    html = re.sub(r'(?is)<br\s*/?>|</p>|</div>|</li>|</tr>|</h\d>', '\n', html)
    text = re.sub(r'(?s)<[^>]+>', ' ', html)
    for a, b in [('&nbsp;', ' '), ('&ldquo;', '“'), ('&rdquo;', '”'), ('&amp;', '&'), ('&quot;', '"'), ('&mdash;', '—')]:
        text = text.replace(a, b)
    text = re.sub(r'[ \t\u3000]+', ' ', text)
    return re.sub(r'\n\s*\n+', '\n', text).strip()


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 1
    url, name = sys.argv[1], sys.argv[2]
    ctx = ssl.create_default_context()
    req = urllib.request.Request(url, headers=UA)
    raw = urllib.request.urlopen(req, timeout=40, context=ctx).read()
    html = None
    for enc in ('utf-8', 'gbk', 'gb18030'):
        try:
            html = raw.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    if html is None:
        html = raw.decode('utf-8', 'replace')
    text = clean(html)
    out = OUT_DIR / name
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(f'来源: {url}\n抓取: 2026-10-07\n\n---\n\n{text}\n', encoding='utf-8')
    print(f'已写入 {out}（正文 {len(text)} 字符）')
    return 0


if __name__ == '__main__':
    sys.exit(main())
