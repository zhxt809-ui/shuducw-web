#!/bin/bash
# 验证 4 个新专题页线上效果 + 注册点同步情况（用服务器网络 curl 线上站点）
python3 - <<'PYEOF'
import json, re, urllib.request

BASE = 'https://www.shuducw.com'
PAGES = {
    '/invoice-compliance': '发票合规',
    '/social-insurance-iit': '社保与个税',
    '/high-tech-enterprise': '高新技术企业认定',
    '/company-deregistration': '公司注销与清算',
}

def get(path):
    req = urllib.request.Request(BASE + path, headers={'User-Agent': 'Mozilla/5.0 (compatible; ShuduVerify/1.0)'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.status, r.read().decode('utf-8', 'replace')

print('=' * 100)
print('一、4 个新专题页逐个检查')
print('=' * 100)
allok = True
for path, name in PAGES.items():
    try:
        code, html = get(path)
    except Exception as e:
        print(f'{path}  [{name}]  抓取失败: {str(e)[:90]}')
        allok = False
        continue
    title = (re.search(r'<title>(.*?)</title>', html, re.S) or [None, 'n/a'])[1]
    desc = (re.search(r'<meta name="description" content="(.*?)"', html, re.S) or [None, 'n/a'])[1]
    canon = (re.search(r'<link rel="canonical" href="(.*?)"', html) or [None, 'n/a'])[1]
    h1 = (re.search(r'<h1[^>]*>(.*?)</h1>', html, re.S) or [None, 'n/a'])[1]
    h1 = re.sub(r'<[^>]+>', '', h1).strip()
    # 只取 JSON-LD 脚本内的结构化数据
    ld_blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
    types, qcount = [], 0
    for b in ld_blocks:
        try:
            data = json.loads(b)
        except Exception:
            continue
        for node in (data.get('@graph') if isinstance(data, dict) and '@graph' in data else [data]):
            t = node.get('@type')
            if t:
                types.append(t)
            if t == 'FAQPage':
                qcount = len(node.get('mainEntity', []))
    # 可见问答：FAQ 区块内的 h3 问题数
    faq_section = re.search(r'常见问题</h2>(.*?)延伸阅读', html, re.S)
    visible_q = len(re.findall(r'<h3[^>]*>', faq_section.group(1))) if faq_section else 0
    # 政策原文外链（官方域名）
    official = len(re.findall(r'https://(?:fgk\.chinatax\.gov\.cn|court\.gov\.cn|www\.most\.gov\.cn|www\.moj\.gov\.cn)', html))
    # 章节背景交替
    sections = re.findall(r'<section class="(bg-[a-z\-]+)', html)
    ok = code == 200 and qcount == 4 and visible_q == 4 and official >= 3
    allok = allok and ok
    print(f'\n{path}  [{name}]  HTTP {code}  {"OK" if ok else "需检查"}')
    print(f'  H1      : {h1}')
    print(f'  Title   : {title[:95]}')
    print(f'  Desc    : {desc[:95]}…({len(desc)} 字)')
    print(f'  Canonical: {canon}')
    print(f'  Schema  : {"+".join(types) if types else "缺失!"}')
    print(f'  FAQ     : Schema {qcount} 问 / 页面可见 {visible_q} 问  {"一致" if qcount == visible_q and qcount > 0 else "不一致!"}')
    print(f'  官方政策外链: {official} 条')
    print(f'  页面体积: {len(html) // 1024} KB（未压缩 HTML）')
    print(f'  章节背景序列: {" -> ".join(sections)}')

print()
print('=' * 100)
print('二、注册点同步检查')
print('=' * 100)
code, sm = get('/sitemap.xml')
locs = re.findall(r'<loc>(.*?)</loc>', sm)
print(f'app/sitemap.xml  HTTP {code}  条目数: {len(locs)}（原 51 + 新增 4 = 55）')
for path in PAGES:
    hit = [u for u in locs if u.endswith(path)]
    print(f'  含 {path}: {"是 OK" if hit else "缺失!"}')
    allok = allok and bool(hit)

code, llms = get('/llms.txt')
print(f'\npublic/llms.txt  HTTP {code}')
for path in PAGES:
    print(f'  含 {path}: {"是 OK" if path in llms else "缺失!"}')
    allok = allok and path in llms

code, home = get('/')
print(f'\n首页内链（HTTP {code}）:')
for path in PAGES:
    needle = 'href="' + path + '"'
    hit = '是 OK' if needle in home else '缺失!'
    print(f'  首页 {path}: {hit}')
    allok = allok and needle in home

code, sc = get('/self-check')
print(f'\n/self-check 自查页内链（HTTP {code}）:')
for path in PAGES:
    needle = 'href="' + path + '"'
    hit = '是 OK' if needle in sc else '缺失!'
    print(f'  自查页 {path}: {hit}')

code, sh = get('/shareholder-loans')
q = re.search(r'常见问题</h2>(.*?)延伸阅读', sh, re.S)
vis = len(re.findall(r'<h3[^>]*>', q.group(1))) if q else 0
print(f'\n/shareholder-loans 可见 FAQ: {vis} 问（应为 4，与 FAQPage Schema 对齐）')
allok = allok and vis == 4

print()
print('=' * 100)
print('结论:', '全部通过' if allok else '存在需处理项（见上文“缺失/不一致/需检查”）')
print('=' * 100)
PYEOF
