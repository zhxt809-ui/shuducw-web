#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证"负责人与专业团队"板块重构：布局结构 + 内容零丢失（线上真实 HTML）"""
import re
import sys
import urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
req = urllib.request.Request('https://www.shuducw.com/', headers={'User-Agent': 'Mozilla/5.0 (audit)'})
html = urllib.request.urlopen(req, timeout=25).read().decode('utf-8', 'replace')

# 截取该板块
start = html.find('负责人与专业团队')
seg = html[start:start + 9000] if start != -1 else ''
print(f'板块 HTML 片段长度: {len(seg)}')

print('\n===== 一、布局结构 =====')
struct = [
    ('两栏等宽容器 lg:grid-cols-2', 'lg:grid-cols-2' in seg, True),
    ('旧的 5 分栏 lg:grid-cols-5 已移除（本板块内）', 'lg:grid-cols-5' in seg, False),
    ('团队卡片改为 2 列铺满 sm:grid-cols-2', 'sm:grid-cols-2' in seg, True),
    ('经历与活动通栏（lg:grid-cols-3）', 'lg:grid-cols-3' in seg, True),
    ('负责人链接用 mt-auto 沉底对齐', 'mt-auto pt-6' in seg, True),
]
for name, got, want in struct:
    print(f'  {"✅" if got == want else "❌"} {name}（实测 {"有" if got else "无"}）')

print('\n===== 二、内容零丢失核查 =====')
must = [
    '陈文华', '总经理 · 财务一线出身', '专业资质',
    '高级会计师', '高级财税合规师', '国际注册会计师',
    '荣誉与社会任职', '中税网金牌讲师', '西安财经大学校外硕士生导师',
    '西安外事学院商学院校外实习实训指导教师',
    '二十余年财税咨询与企业服务实战经验', '专业方向：企业财税管理、税务合规、内部控制与财税咨询',
    '高校官网报道', 'sxy.xaufe.edu.cn', '查看公司详细介绍',
    '/lecture-xaufe-2026.jpg', '2026 年 4 月 · 西安财经大学商学院专题讲座现场',
    '专业团队持证类别（团队资质）', '财税专业服务团队', '/leader-chenwenhua.jpg',
]
missing = [m for m in must if m not in seg]
for m in must:
    print(f'  {"✅" if m not in missing else "❌"} {m}')
print(f'\n  缺失项: {len(missing)} 个' + (f' → {missing}' if missing else ''))

print('\n===== 三、团队卡片数量（应为 3 个持证类别 + 1 个服务团队 = 4 格）=====')
tiles = re.findall(r'text-base font-bold text-brand-navy mb-2">([^<]+)</h3>', seg)
print(f'  卡片标题: {tiles}')
ok = len(tiles) == 4

print(f'\n  结论: 结构 {"✅ 通过" if all(g == w for _, g, w in struct) else "❌ 有偏差"}'
      f' / 内容 {"✅ 完整" if not missing else "❌ 有丢失"} / 卡片 {"✅ 4 格" if ok else f"❌ {len(tiles)} 格"}')
sys.exit(0 if (not missing and ok and all(g == w for _, g, w in struct)) else 1)
