# -*- coding: utf-8 -*-
"""articles.json 高危词合规替换（保留案例法律事实，仅换营销化表述）"""
import json, re

path = r'D:\md\数度网站\extracted\projects\data\articles.json'
with open(path, 'r', encoding='utf-8') as f:
    articles = json.load(f)

repls = [
    ('核定征收不是"避税工具"', '核定征收不是"逃税手段"'),
    ('主动申请核定征收的唯一目的就是降低税负', '主动申请核定征收的唯一目的就是少缴税'),
    ('具有明显的避税意图', '具有明显的规避纳税意图'),
    ('利用核定征收降低税负的操作空间正在快速收窄', '利用核定征收少缴税的操作空间正在快速收窄'),
    ('违规享受税收优惠等方式"节税"', '违规享受税收优惠等方式少缴税'),
    ('有避税目的但缺乏商业实质', '以规避纳税为目的但缺乏商业实质'),
    ('对"节税率过高"的方案保持警惕', '对"承诺大幅少缴税"的方案保持警惕'),
    ('四、税负测算：年利润 50 万元，哪种更省税？', '四、税负测算：年利润 50 万元，个体户与有限公司各缴多少？'),
    ('经营所得个税（减半后实际税负降低）', '经营所得个税（减半后应纳税额明显减少）'),
]

total = 0
report = []
for a in articles:
    for field in ('title', 'summary', 'content', 'excerpt'):
        v = a.get(field)
        if not isinstance(v, str):
            continue
        nv = v
        for old, new in repls:
            c = nv.count(old)
            if c:
                nv = nv.replace(old, new)
                report.append({'slug': a.get('slug'), 'field': field, 'old': old[:18], 'n': c})
                total += c
        a[field] = nv

# 复查残余高危词
terms = re.compile('节税|省税|避税|税负降低|降低税负|合理避')
leftover = []
for a in articles:
    text = (a.get('title') or '') + '\n' + (a.get('summary') or '') + '\n' + (a.get('content') or '')
    for m in terms.finditer(text):
        leftover.append({'slug': a.get('slug'), 'ctx': text[max(0, m.start()-15):m.end()+15].replace('\n', ' ')})

with open(path, 'w', encoding='utf-8') as f:
    json.dump(articles, f, ensure_ascii=False, indent=1)

print('replacements:', total)
for r in report:
    print(r)
print('--- leftover hits:', len(leftover), '---')
for r in leftover:
    print(r)
