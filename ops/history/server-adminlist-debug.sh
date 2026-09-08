#!/bin/bash
echo "=== 后台列表接口精确复现 (limit=10&offset=0，无 is_published 过滤) ==="
curl -s "http://127.0.0.1:3000/api/articles?limit=10&offset=0" -D /tmp/h.txt | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
print('返回条数:', len(d))
for a in d:
    mark = 'DRAFT' if not a['is_published'] else 'PUB  '
    print(mark, a['id'], a['slug'])
"
echo "=== 响应头（缓存相关）==="
grep -iE "cache-control|age|etag|date" /tmp/h.txt
echo "=== id 21 单独查询头 ==="
curl -s -o /dev/null -D /tmp/h2.txt "http://127.0.0.1:3000/api/articles/21"
grep -iE "cache-control|age|etag|date" /tmp/h2.txt
echo "=== 直接读数据文件 id 21 ==="
python3 -c "
import json
d = json.load(open('/var/www/shuducw-run/data/articles.json'))
arts = d if isinstance(d, list) else d.get('articles', d.get('data', []))
a = next(x for x in arts if x.get('id')==21)
print('文件里 id21 is_published:', a['is_published'])
"
