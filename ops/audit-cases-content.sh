#!/bin/bash
python3 << 'EOF'
import json, re
arts = json.load(open('/var/www/shuducw-run/data/articles.json', encoding='utf-8'))
cases = [a for a in arts if a.get('category') in ('shilu','cases')]
print(f'案例总数: {len(cases)}')
banned = ['应客户要求','节税','避税','节省税款','税负降低','虚开','买票','税筹','税收洼地','核定征收']
for a in cases:
    print('=' * 70)
    print(f"id={a['id']} | slug={a['slug']} | published={a.get('is_published')}")
    print(f"title: {a['title']}")
    print(f"summary: {a.get('summary','')}")
    content = a.get('content','')
    hits = [w for w in banned if w in (a['title'] + a.get('summary','') + content)]
    print(f"违禁词命中: {hits if hits else '无'}")
    # 可识别信息：具体金额/公司名特征
    amounts = re.findall(r'\d[\d,\.]*\s*(?:万元|亿元|万|亿)', content)
    print(f"金额提及: {amounts[:10]}")
    print(f"--- 正文前 2600 字 ---")
    print(content[:2600])
EOF
