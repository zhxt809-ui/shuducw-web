#!/bin/bash
# 精确核实注销相关法定天数（用于官网发布，数字必须准确）
python3 - <<'PYEOF'
import re, urllib.request

URLS = [
    ('企业注销指引（2025年修订）', 'https://shanghai.chinatax.gov.cn/zcfw/zcfgk/swzsgl/202601/t478906.html'),
    ('公司法2023修订·gov.cn', 'https://www.gov.cn/yaowen/liebiao/202312/content_6923537.htm'),
]

KEYS = ['简易注销', '公示期', '公示20日', '20日', '60日', '45日', '清算组', '公告', '债权人', '承诺书', '异议', '三年', '过渡期']

def clean(html):
    t = re.sub(r'<script.*?</script>', ' ', html, flags=re.S)
    t = re.sub(r'<style.*?</style>', ' ', t, flags=re.S)
    t = re.sub(r'<[^>]+>', ' ', t)
    t = re.sub(r'&[a-z]+;', ' ', t)
    return re.sub(r'\s+', ' ', t)

for name, url in URLS:
    print('=' * 92)
    print(name, url)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        raw = urllib.request.urlopen(req, timeout=30).read()
    except Exception as e:
        print('  抓取失败:', str(e)[:140])
        continue
    html = None
    for enc in ('utf-8', 'gbk', 'gb18030'):
        try:
            html = raw.decode(enc); break
        except Exception:
            pass
    if html is None:
        print('  解码失败'); continue
    text = clean(html)
    print('  正文长度:', len(text))
    for kw in KEYS:
        ms = list(re.finditer(re.escape(kw), text))
        if not ms:
            continue
        shown = 0
        for m in ms:
            s = max(0, m.start() - 90)
            snippet = text[s:m.end() + 90].strip()
            if any(x in snippet for x in ['日', '年', '期限', '公告', '公示']):
                print(f'    [{kw}] …{snippet}…')
                shown += 1
            if shown >= 2:
                break
PYEOF
