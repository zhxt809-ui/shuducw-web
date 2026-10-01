#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
IndexNow 全量提交（sitemap 驱动版，2026-09 新增）
- 直接从线上 sitemap.xml 解析 URL 列表，避免硬编码列表漏页/误提交已下架文章
- sitemap 本身已按 is_published 过滤，因此不会把未发布文章推给搜索引擎
- 支持 Bing / Yandex / Naver / Seznam 等 IndexNow 参与方
用法：
  python ops/content/submit-indexnow-from-sitemap.py          # 提交
  python ops/content/submit-indexnow-from-sitemap.py --dry-run # 只列出将提交的 URL
"""
import json
import re
import sys
import urllib.error
import urllib.request

KEY = '9c615d0ffcf44fd4a1c860a302b08850'
HOST = 'www.shuducw.com'
SITEMAP = f'https://{HOST}/sitemap.xml'
KEY_LOCATION = f'https://{HOST}/{KEY}.txt'
UA = {'User-Agent': 'Mozilla/5.0 (compatible; ShuduSeoBot/1.0)'}

dry_run = '--dry-run' in sys.argv


def fetch_sitemap_urls() -> list:
    req = urllib.request.Request(SITEMAP, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        xml = r.read().decode('utf-8', 'ignore')
    urls = re.findall(r'<loc>\s*([^<\s]+)\s*</loc>', xml)
    # 去重保序
    seen, out = set(), []
    for u in urls:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out


def main() -> int:
    try:
        urls = fetch_sitemap_urls()
    except Exception as e:
        print('读取 sitemap 失败:', str(e)[:160])
        return 1

    print(f'sitemap 共 {len(urls)} 个 URL')
    for u in urls:
        print('  ', u)

    if dry_run:
        print('\n[dry-run] 未提交。')
        return 0

    body = json.dumps({
        'host': HOST,
        'key': KEY,
        'keyLocation': KEY_LOCATION,
        'urlList': urls,
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.indexnow.org/indexnow',
        data=body,
        headers={'Content-Type': 'application/json; charset=utf-8', **UA},
    )
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            print(f'\nIndexNow 提交 {len(urls)} 条: HTTP {r.status} (200/202 = 已接收)')
    except urllib.error.HTTPError as e:
        print(f'\nIndexNow HTTP {e.code}: {e.read().decode("utf-8", "ignore")[:200]}')
        return 1
    except Exception as e:
        print('\nIndexNow 提交异常:', str(e)[:160])
        return 1

    # key 文件可访问性自检（IndexNow 会校验 keyLocation）
    try:
        with urllib.request.urlopen(urllib.request.Request(KEY_LOCATION, headers=UA), timeout=20) as r:
            body_key = r.read().decode('utf-8', 'ignore').strip()
        print(f'key 文件自检: HTTP {r.status}，内容与 key {"一致" if body_key == KEY else "不一致!"}')
    except Exception as e:
        print('key 文件自检失败:', str(e)[:120])

    return 0


if __name__ == '__main__':
    sys.exit(main())
