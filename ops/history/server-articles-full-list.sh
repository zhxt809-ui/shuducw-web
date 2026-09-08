#!/bin/bash
echo "=== 全部文章（含草稿）状态 ==="
curl -s "http://127.0.0.1:3000/api/articles?limit=50" | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
print('总数:', len(d))
for a in sorted(d, key=lambda x: x['id']):
    print(('PUB  ' if a['is_published'] else 'DRAFT'), a['id'], a['slug'])
"
