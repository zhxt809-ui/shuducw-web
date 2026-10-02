#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""检查站点可收录性：noindex 头/标签、canonical、robots 是否误挡 Bing，以及 Bing 验证文件内容。

背景：日志显示 bingbot 抓了 88 次（81 次 200、首页 9 次、sitemap 19 次），
但 Bing 品牌词查询不出现我们的站点。先排除"页面本身不可收录"这类自身原因。
"""
import re
import ssl
import sys
import urllib.error
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
CTX = ssl.create_default_context()
BASE = 'https://www.shuducw.com'
UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

PATHS = ['/', '/about', '/services', '/news', '/news/gongsi-liangtaozhang-fengxian',
         '/services/district/gaoxin', '/faq', '/contact']


def get(path, ua=UA):
    req = urllib.request.Request(BASE + path, headers={'User-Agent': ua})
    try:
        with urllib.request.urlopen(req, timeout=25, context=CTX) as r:
            return r.status, r.read().decode('utf-8', 'replace'), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace'), dict(e.headers)


print('===== 1. 关键页面是否可被收录（noindex / X-Robots-Tag / canonical）=====')
problems = []
for p in PATHS:
    st, html, hdrs = get(p)
    xrt = hdrs.get('X-Robots-Tag')
    metas = re.findall(r'<meta[^>]+name=["\']robots["\'][^>]*>', html, re.I)
    meta_noindex = any('noindex' in m.lower() for m in metas)
    canon = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]*href=["\']([^"\']+)', html, re.I)
    canon_v = canon.group(1) if canon else '(无)'
    ok = (xrt is None) and (not meta_noindex) and canon_v.startswith('https://www.shuducw.com')
    if not ok:
        problems.append(f'{p}: X-Robots-Tag={xrt} meta={metas} canonical={canon_v}')
    print(f'  [{"OK  " if ok else "FAIL"}] {p:42} HTTP {st}  X-Robots-Tag={xrt or "无"}  '
          f'meta robots={metas[0][:40] if metas else "无"}  canonical={canon_v.replace(BASE, "")}')

print('\n===== 2. robots.txt 是否误挡 Bing 系爬虫 =====')
st, robots, _ = get('/robots.txt', ua='Mozilla/5.0')
print(f'  HTTP {st}')
blocked = [l for l in robots.splitlines() if l.strip().lower().startswith('disallow') and l.strip() != 'Disallow:']
for l in robots.splitlines():
    if l.strip() and not l.strip().startswith('#'):
        print('   ', l)
if any('bingbot' in l.lower() for l in robots.splitlines()):
    print('  ⚠ robots 中出现了 bingbot 相关规则，需人工确认是否误挡')
else:
    print('  robots 中无 bingbot 专项规则（Disallow 仅针对 AI 训练类爬虫时需确认不影响搜索型爬虫）')

print('\n===== 3. Bing 验证文件内容（站长平台验证用）=====')
st, body, hdrs = get('/BingSiteAuth.xml', ua='Mozilla/5.0 (compatible; bingbot/2.0)')
print(f'  HTTP {st}  长度 {len(body.encode("utf-8"))} 字节')
print(f'  内容: {body.strip()}')
print(f'  Content-Type: {hdrs.get("Content-Type")}')

print('\n===== 4. 用"bingbot 的 UA"请求首页（确认不会因 UA 被区别对待）=====')
st_bing, html_bing, _ = get('/', ua='Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)')
st_norm, html_norm, _ = get('/', ua='Mozilla/5.0')
print(f'  bingbot UA: HTTP {st_bing}，正文 {len(html_bing)} 字符')
print(f'  普通 UA  : HTTP {st_norm}，正文 {len(html_norm)} 字符')
print(f'  两者正文长度是否一致: {len(html_bing) == len(html_norm)}')

print('\n===== 结论 =====')
if problems:
    print(f'  ✗ 自身可收录性存在问题 {len(problems)} 项：')
    for p in problems:
        print('   ', p)
else:
    print('  ✅ 未发现自身可收录性问题：无 noindex、无 X-Robots-Tag、canonical 自指、robots 未挡 Bing')
    print('     → "Bing 不收录"的原因不在页面自身，需从站长平台验证/外部信号方向排查')
