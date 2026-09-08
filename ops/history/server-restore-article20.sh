#!/bin/bash
echo "=== id 20 更新记录 ==="
python3 -c "
import json
d = json.load(open('/var/www/shuducw-run/data/articles.json'))
arts = d if isinstance(d, list) else d.get('articles', d.get('data', []))
a = next(x for x in arts if x.get('id') == 20)
print('slug:', a['slug'])
print('updated_at:', a.get('updated_at'))
print('published_at:', a.get('published_at'))
print('title_len:', len(a.get('title','')))
"
echo "=== 恢复发布 id 20 ==="
curl -s -X PUT "http://127.0.0.1:3000/api/articles/20" -H "Content-Type: application/json" -H "x-admin-token: ${ADMIN_API_PASSWORD:-}" -d '{"is_published":true}' | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print('恢复后 is_published:', d['is_published'])"
echo "=== 验证列表 ==="
curl -s "http://127.0.0.1:3000/api/articles?limit=50" | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
print('列表文章数:', len(d))
print('xian-kaigongsi 在列表:', any(a['slug']=='xian-kaigongsi-leixing-duibi-2026' for a in d))
"
