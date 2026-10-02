#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""决定性判定：文章正文对"不执行 JS 的爬虫"是否可见。

方法：
  1. 直接取 HTML 原始字节
  2. visible = 剥离 <script>/<style> 与标签后的可见文本
  3. payload = 拼接所有 <script> 内容并做 JSON 反转义（Next.js RSC 载荷）
  4. 从 payload 中取一段 40 字以上的连续中文，检查它是否出现在 visible 中
     - 在 visible 中 → 正文是服务端可见文本（爬虫可直接读）
     - 只在 payload 中 → 正文仅存在于序列化数据里，不执行 JS 的爬虫拿不到正文
"""
import re
import ssl
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
CTX = ssl.create_default_context()
UA = 'Mozilla/5.0 (compatible; ShuduAudit/1.0)'
BASE = 'https://www.shuducw.com'


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
        return r.read().decode('utf-8', 'replace')


def visible_text(html):
    html = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', html, flags=re.S | re.I)
    html = re.sub(r'<[^>]+>', '', html)
    html = html.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&quot;', '"')
    return re.sub(r'[\s\u200b]+', '', html)


def payload_text(html):
    chunks = re.findall(r'<script[^>]*>(.*?)</script>', html, re.S)
    joined = '\n'.join(chunks)
    # RSC 载荷的常见转义
    joined = joined.replace('\\u003c', '<').replace('\\u003e', '>').replace('\\u0026', '&')
    joined = joined.replace('\\"', '"').replace('\\n', '\n').replace('\\/', '/')
    return joined


def analyze(url, label):
    html = get(url)
    vis = visible_text(html)
    pay = payload_text(html)
    runs = re.findall(r'[\u4e00-\u9fa5，。、；：？！0-9%]{40,}', pay)
    print(f'\n  {label}  {url}')
    print(f'      HTML 字节长度: {len(html)}')
    print(f'      可见文本长度（剥 script/style/标签后）: {len(vis)}')
    print(f'      RSC 载荷中的 40+ 连续中文段: {len(runs)} 段')
    if not runs:
        print('      ⚠ 载荷中未找到长中文段，无法判定')
        return
    longest = max(runs, key=len)
    in_vis = longest in vis
    # 再看：载荷里有多少长段落能在可见文本中找到
    hit = sum(1 for r in runs if r in vis)
    print(f'      最长中文段（{len(longest)} 字）: {longest[:60]}…')
    print(f'      该段是否出现在可见文本中: {in_vis}')
    print(f'      载荷长段中能在可见文本找到的比例: {hit}/{len(runs)}')
    verdict = ('✅ 正文是服务端可见文本（不执行 JS 也能读到）' if hit > len(runs) * 0.6
               else '❌ 正文主要只存在于 RSC 序列化载荷中，不执行 JS 的爬虫读不到正文')
    print(f'      判定: {verdict}')


print('===== 文章正文可见性判定 =====')
analyze(f'{BASE}/news/xian-wanglaizhang-guazhang-80wan', '典型文章页')
analyze(f'{BASE}/news/gongsi-liangtaozhang-fengxian', '典型文章页(2)')
analyze(f'{BASE}/about', '静态页对照')
analyze(f'{BASE}/news', '列表页对照')

print('\n===== sitemap 是否仍包含「文章不存在」的 URL =====')
sm = get(f'{BASE}/sitemap.txt')
for slug in ['xian-shipin-yecai-shui-yitihua-anli', 'xian-gaoxin-jishu-qiye-caiwu-guwen-anli',
             'xian-baoxian-caiwu-zixun-shuiwu-hegui-anli']:
    print(f'  {slug}: {"仍在 sitemap 中 ⚠" if slug in sm else "已不在 sitemap 中（正文页显示文章不存在属未发布/数据已变）"}')
print(f'  sitemap 总条数: {len([l for l in sm.splitlines() if l.strip()])}')
