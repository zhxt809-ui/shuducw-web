#!/bin/bash
# 用服务器网络打开官方政策原文，提取文号 / 成文日期 / 标题（不依赖第三方转述）
python3 - <<'PYEOF'
import re, urllib.request

URLS = [
    'https://fgk.chinatax.gov.cn/zcfgk/c102416/c5201978/content.html',  # 研发费用加计扣除
    'https://fgk.chinatax.gov.cn/zcfgk/c102424/c5219665/content.html',  # 优化税务注销办理程序
    'https://fgk.chinatax.gov.cn/zcfgk/c102416/c5211524/content.html',  # 全年一次性奖金
    'https://shanghai.chinatax.gov.cn/xwdt/ztzl/ssyhzl/node5243/whcy/rdbz/202412/t474268.html',  # 高新认定标准
    'https://www.most.gov.cn/xxgk/xinxifenlei/fdzdgknr/fgzc/gfxwj/gfxwj2016/201602/t20160205_123998.html',  # 高新认定管理办法
]

PATTERNS = r'(公告20\d{2}年第\d+号|税总发〔20\d{2}〕\d+号|国令第\d+号|国科发火〔20\d{2}〕\d+号|〔20\d{2}〕\d+号|法释〔20\d{2}〕\d+号|成文日期：\s*[\d\-]+|自20\d{2}年\d+月\d+日起)'

for url in URLS:
    print('=' * 90)
    print(url)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        raw = urllib.request.urlopen(req, timeout=30).read()
    except Exception as e:
        print('  抓取失败:', str(e)[:120])
        continue
    html = None
    for enc in ('utf-8', 'gbk', 'gb18030'):
        try:
            html = raw.decode(enc)
            break
        except Exception:
            continue
    if html is None:
        print('  解码失败')
        continue
    t = re.search(r'<title>(.*?)</title>', html, re.S)
    print('  标题:', (t.group(1).strip()[:90] if t else 'n/a'))
    text = re.sub(r'<script.*?</script>', ' ', html, flags=re.S)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'&[a-z]+;', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    hits = sorted(set(re.findall(PATTERNS, text)))
    print('  文号/日期命中:')
    for h in hits[:10]:
        print('    -', h.strip())
    # 关键条款摘录
    for kw in ['100%在税前加计扣除', '承诺制', '即时办结', '研发费用总额占', '科技人员占', '收入占', '不低于60%', '不低于10%', '20日内', '45日', '公示']:
        for m in re.finditer(re.escape(kw), text):
            s = max(0, m.start() - 70)
            print(f'    [{kw}] …{text[s:m.end()+70].strip()}…')
            break
PYEOF
