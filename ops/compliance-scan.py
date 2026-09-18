# -*- coding: utf-8 -*-
"""扫描 articles.json 中高危词上下文，输出分布（不修改文件）"""
import json, re

path = r'D:\md\数度网站\extracted\projects\data\articles.json'
with open(path, 'r', encoding='utf-8') as f:
    articles = json.load(f)

terms = ['节税', '省税', '避税', '税负降低', '降低税负', '合理避']
pat = re.compile('|'.join(terms))
report = []
for a in articles:
    text = (a.get('title') or '') + '\n' + (a.get('summary') or '') + '\n' + (a.get('content') or '')
    hits = []
    for m in pat.finditer(text):
        start = max(0, m.start() - 20)
        end = min(len(text), m.end() + 20)
        hits.append(text[start:end].replace('\n', ' '))
    if hits:
        report.append({'slug': a.get('slug'), 'count': len(hits), 'samples': hits[:6]})

out = json.dumps(report, ensure_ascii=False, indent=1)
with open(r'D:\md\数度网站\extracted\projects\ops\_compliance-scan.json', 'w', encoding='utf-8') as f:
    f.write(out)
print('articles with hits:', len(report))
