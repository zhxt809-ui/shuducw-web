#!/bin/bash
python3 << 'EOF'
import json
arts = json.load(open('/var/www/shuducw-run/data/articles.json', encoding='utf-8'))
cases = [a for a in arts if a.get('category') in ('shilu','cases')]
print('案例类文章清单（category=shilu|cases）:')
for a in sorted(cases, key=lambda x: x['id']):
    print(f"  id={a['id']} | {a.get('category')} | pub={a.get('is_published')} | {a['slug']}")
    print(f"      {a['title'][:60]}")
EOF
