#!/bin/bash
echo "=== sitemap 全部 URL ==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -oE "<loc>[^<]*</loc>" | sed 's/<[^>]*>//g'
echo "=== 全部文章 slug（含草稿）==="
curl -s "http://127.0.0.1:3000/api/articles?limit=50" | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
for a in d:
    print(('DRAFT ' if not a['is_published'] else '      ') + a['slug'])
"
