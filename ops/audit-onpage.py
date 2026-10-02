#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""站内页面体检：把"还能做什么"从猜测变成清单。

只做只读检查（GET），不改动任何东西。检查项：
  1. sitemap 中每个 URL 的 HTTP 状态
  2. title 是否存在 / 是否重复 / 长度分布（百度标题展示约 30 字）
  3. description 是否存在 / 是否重复
  4. canonical 是否存在 / 是否自指（错指会造成索引错乱）
  5. H1 数量（应恰好 1 个）
  6. JSON-LD 结构化数据能否被解析（解析失败=结构数据作废）
  7. 不存在的 URL 是否返回真 404（软 404 会浪费抓取配额）
  8. http:// 与 非 www 是否 301 到规范域名
  9. 末尾斜杠是否统一（/about/ 与 /about 双份会造成重复内容）
"""
import json
import re
import ssl
import sys
import urllib.error
import urllib.request
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE = 'https://www.shuducw.com'
UA = 'Mozilla/5.0 (compatible; ShuduAudit/1.0; +https://www.shuducw.com)'
CTX = ssl.create_default_context()


def get(url, timeout=25):
    # 不要发 Accept-Encoding: gzip。曾因解码分支未生效而拿到压缩字节，
    # 导致正文被当成乱码、误判"404 页无品牌化提示"（已纠正）。
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
            return r.status, r.read().decode('utf-8', 'replace'), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace'), dict(e.headers)
    except Exception as e:
        return None, f'ERROR {e}', {}


# ---- 取得待检 URL 列表 ----
status, body, _ = get(f'{BASE}/sitemap.txt')
urls = [u.strip() for u in body.splitlines() if u.strip().startswith('http')]
print(f'===== 站内体检：共 {len(urls)} 个 sitemap URL =====')

rows, issues = [], []
for url in urls:
    st, html, _ = get(url)
    title = re.search(r'<title[^>]*>(.*?)</title>', html, re.S)
    desc = re.search(r'<meta[^>]+name="description"[^>]+content="([^"]*)"', html, re.S)
    canon = re.search(r'<link[^>]+rel="canonical"[^>]+href="([^"]*)"', html, re.S)
    # H1 只能在剥离 script/style 后的可见 HTML 上计数：
    # 否则会把 RSC 载荷里序列化的字符串也算成 H1（曾据此误报 5 个页面）
    visible_html = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', html, flags=re.S | re.I)
    h1 = len(re.findall(r'<h1[\s>]', visible_html))
    ld_blocks = re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', html, re.S)
    ld_bad = 0
    for b in ld_blocks:
        try:
            json.loads(b)
        except Exception:
            ld_bad += 1

    title = (title.group(1).strip() if title else '')
    desc = (desc.group(1).strip() if desc else '')
    canon = (canon.group(1).strip() if canon else '')
    path = url.replace(BASE, '') or '/'

    if st != 200:
        issues.append(f'[{st}] {path}: 非 200')
    if not title:
        issues.append(f'{path}: 缺 title')
    if not desc:
        issues.append(f'{path}: 缺 description')
    if not canon:
        issues.append(f'{path}: 缺 canonical')
    elif canon.rstrip('/') != url.rstrip('/'):
        issues.append(f'{path}: canonical 非自指 → {canon}')
    if h1 != 1:
        issues.append(f'{path}: H1 数量为 {h1}（应为 1）')
    if ld_bad:
        issues.append(f'{path}: {ld_bad} 个 JSON-LD 块解析失败')
    rows.append({'path': path, 'status': st, 'title': title, 'desc': desc,
                 'tlen': len(title), 'dlen': len(desc), 'ld': len(ld_blocks), 'h1': h1})

# ---- 重复性检查 ----
t_dup = [t for t, c in Counter(r['title'] for r in rows if r['title']).items() if c > 1]
d_dup = [d for d, c in Counter(r['desc'] for r in rows if r['desc']).items() if c > 1]
if t_dup:
    for t in t_dup:
        paths = [r['path'] for r in rows if r['title'] == t]
        issues.append(f'title 重复（{len(paths)} 页）: {t[:40]}… → {paths}')
if d_dup:
    for d in d_dup:
        paths = [r['path'] for r in rows if r['desc'] == d]
        issues.append(f'description 重复（{len(paths)} 页）→ {paths}')

print(f'\n--- 基本统计 ---')
print(f'  全部 200: {all(r["status"] == 200 for r in rows)}')
print(f'  title 长度: 最短 {min(r["tlen"] for r in rows)} / 最长 {max(r["tlen"] for r in rows)} / 中位 {sorted(r["tlen"] for r in rows)[len(rows)//2]}')
print(f'  description 长度: 最短 {min(r["dlen"] for r in rows)} / 最长 {max(r["dlen"] for r in rows)}')
print(f'  含 JSON-LD 的页面: {sum(1 for r in rows if r["ld"])}/{len(rows)}')
print(f'  H1 恰为 1 的页面: {sum(1 for r in rows if r["h1"] == 1)}/{len(rows)}')
tlen_over = [r["path"] for r in rows if r["tlen"] > 40]
print(f'  title 超过 40 字的页面: {len(tlen_over)} 个（百度标题展示约 30 字，过长会被截断）')
for p in tlen_over[:8]:
    r = next(x for x in rows if x['path'] == p)
    print(f'      {r["tlen"]} 字  {p}')

# ---- 8. 404 行为 ----
print('\n--- 不存在 URL 的行为（应为 404，软 404 会浪费抓取配额）---')
for bad in ['/this-page-should-not-exist-9f3a', '/services/nonexistent-xyz']:
    st, html, _ = get(BASE + bad)
    # 注意：必须搜完整正文。早先只搜前 3000 字符，而本站页面内联样式很长，
    # 导致品牌化 404 页被误判为"无提示"（已纠正）。
    has_404 = any(k in html for k in ('页面不存在', '404', '找不到'))
    print(f'  {bad} → HTTP {st}  正文含 404 提示: {has_404}（正文 {len(html)} 字符）')
    if st == 200:
        issues.append(f'{bad}: 返回 200（软 404）')
    if st == 404 and not has_404:
        issues.append(f'{bad}: 返回 404 但无品牌化提示页')

# ---- 9. 域名与斜杠规范化 ----
print('\n--- 规范化跳转 ---')
for u in ['http://www.shuducw.com/about', 'https://shuducw.com/about',
          'https://www.shuducw.com/about/', 'https://www.shuducw.com/ABOUT']:
    req = urllib.request.Request(u, headers={'User-Agent': UA}, method='GET')
    try:
        with urllib.request.urlopen(req, timeout=20, context=CTX) as r:
            print(f'  {u} → {r.status} 最终 {r.geturl()}')
    except urllib.error.HTTPError as e:
        print(f'  {u} → {e.code} 最终 {e.headers.get("Location", "-")}')
    except Exception as e:
        print(f'  {u} → 错误 {e}')

print(f'\n===== 发现的问题（{len(issues)} 项）=====')
for i in issues:
    print(f'  ✗ {i}')
if not issues:
    print('  无 ✅')
