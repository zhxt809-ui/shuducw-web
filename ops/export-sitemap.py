#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
导出线上 sitemap 为本地文件（供站长平台提交/存档）
产出两份：
  <base>.xml  原始 XML（与爬虫所见字节完全一致，不做格式化）
  <base>.txt  纯文本格式（每行一个网址），360/百度 均支持该格式，可作为备选
校验：XML 合法性、URL 数量与分组、<loc> 长度（360 要求每行 URL ≤256 字符）、
      协议头、以及未发布文章是否误入
用法：python ops/export-sitemap.py [输出基名，默认 D:\\md\\数度网站\\shuducw-sitemap]
"""
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET

URL = 'https://www.shuducw.com/sitemap.xml'
base = sys.argv[1] if len(sys.argv) > 1 else r'D:\md\数度网站\shuducw-sitemap'
UA = {'User-Agent': 'Mozilla/5.0 (compatible; ShuduSitemapExport/1.0)'}

req = urllib.request.Request(URL, headers=UA)
with urllib.request.urlopen(req, timeout=30) as r:
    raw = r.read()
    status = r.status
print(f'抓取 {URL} -> HTTP {status}，{len(raw)} 字节')

root = ET.fromstring(raw)  # XML 合法性校验，非法会抛异常
ns = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
locs = [e.text.strip() for e in root.findall(f'{ns}url/{ns}loc')]
lastmods = [e.text.strip() for e in root.findall(f'{ns}url/{ns}lastmod')]

xml_path, txt_path = base + '.xml', base + '.txt'
with open(xml_path, 'wb') as f:
    f.write(raw)
with open(txt_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write('\n'.join(locs) + '\n')

print(f'\n已保存:')
print(f'  {xml_path}  ({os.path.getsize(xml_path)} 字节)')
print(f'  {txt_path}  ({os.path.getsize(txt_path)} 字节，纯文本格式备选)')
print(f'URL 总数: {len(locs)}   lastmod 数: {len(lastmods)}')

print('\n=== 360 格式要求自检 ===')
over = [u for u in locs if len(u) > 256]
print(f'  每条 URL ≤256 字符: {"全部符合 OK" if not over else f"超长 {len(over)} 条!"}')
print(f'  全部含协议头: {"OK" if all(u.startswith("http") for u in locs) else "存在缺失!"}')
print(f'  单文件 ≤10MB 且 ≤50000 条: {"OK" if len(raw) < 10 * 1024 * 1024 and len(locs) <= 50000 else "超限!"}')
print(f'  编码: UTF-8')

CATS = {
    'https://www.shuducw.com/news',
    'https://www.shuducw.com/news/cases',
    'https://www.shuducw.com/news/tips',
    'https://www.shuducw.com/news/policies',
    'https://www.shuducw.com/news/shilu',
}
groups = {
    '首页': lambda u: u.rstrip('/') == 'https://www.shuducw.com',
    '区域落地页(9个区)': lambda u: '/services/district/' in u,
    '服务/工具/栏目页': lambda u: ('/services' in u or '/tools' in u or u.rstrip('/') in CATS),
    '文章详情页': lambda u: '/news/' in u and u.rstrip('/') not in CATS,
}
print('\n=== 分组统计 ===')
used = set()
for name, fn in groups.items():
    hit = [u for u in locs if u not in used and fn(u)]
    used.update(hit)
    print(f'  {name}: {len(hit)}')
other = [u for u in locs if u not in used]
print(f'  其他: {len(other)}' + (f' -> {other}' if other else ''))

print('\n=== 未发布文章误入检查（应全部“不在”）===')
for slug in ['wuliangye-zhongxiaoqiye-caiwuhegui', 'xian-canyin-hezhengzhenshou-butui', 'yanfa-jijia-kouchu-yongmei']:
    print(f'  {slug}: ' + ('在库! 需处理' if any(slug in u for u in locs) else '不在 OK'))

print('\n=== 全部 URL ===')
for i, u in enumerate(locs, 1):
    print(f'  {i:>2}. {u}')
