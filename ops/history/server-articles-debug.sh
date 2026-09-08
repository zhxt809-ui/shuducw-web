#!/bin/bash
echo "=== 1. 数据文件文章数 ==="
python3 -c "
import json
d = json.load(open('/var/www/shuducw-run/data/articles.json'))
arts = d if isinstance(d, list) else d.get('articles', d.get('data', []))
print('文件中文章总数:', len(arts))
for a in arts:
    print(('PUB  ' if a.get('is_published') else 'DRAFT'), a.get('id'), a.get('slug'))
" 2>&1 | head -25
echo "=== 2. 健康检查 ==="
curl -s http://127.0.0.1:3000/api/health
echo ""
echo "=== 3. 列表接口不同参数 ==="
curl -s "http://127.0.0.1:3000/api/articles?limit=50&offset=0" | python3 -c "import sys,json; d=json.load(sys.stdin); print('limit=50 返回:', len(d['data']), '| total:', d.get('total'))"
curl -s "http://127.0.0.1:3000/api/articles?limit=100" | python3 -c "import sys,json; d=json.load(sys.stdin); print('limit=100 返回:', len(d['data']), '| total:', d.get('total'))"
