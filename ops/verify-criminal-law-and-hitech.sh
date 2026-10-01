#!/bin/bash
# 核实：两高法释〔2024〕4号的关键表述 + 高新技术企业资格有效期
python3 - <<'PYEOF'
import re, urllib.request

URLS = [
    ('两高危害税收征管司法解释', 'https://www.court.gov.cn/fabu/xiangqing/428482.html'),
    ('高新技术企业认定管理办法', 'https://www.most.gov.cn/xxgk/xinxifenlei/fdzdgknr/fgzc/gfxwj/gfxwj2016/201602/t20160205_123998.html'),
]
KEYS = ['施行', '骗抵税款', '不以骗抵', '虚增业绩', '第二百零五条', '有效期', '三年', '资格', '重新认定', '复审']

def clean(h):
    t = re.sub(r'<script.*?</script>', ' ', h, flags=re.S)
    t = re.sub(r'<style.*?</style>', ' ', t, flags=re.S)
    t = re.sub(r'<[^>]+>', ' ', t)
    t = re.sub(r'&[a-z]+;', ' ', t)
    return re.sub(r'\s+', ' ', t)

for name, url in URLS:
    print('=' * 92)
    print(name)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        raw = urllib.request.urlopen(req, timeout=30).read()
    except Exception as e:
        print('  抓取失败:', str(e)[:140]); continue
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
        for m in re.finditer(re.escape(kw), text):
            s = max(0, m.start() - 110)
            print(f'    [{kw}] …{text[s:m.end()+110].strip()}…')
            break
PYEOF
