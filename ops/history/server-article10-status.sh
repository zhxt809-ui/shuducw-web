#!/bin/bash
echo "=== 1. id 21 当前状态 ==="
curl -s "http://127.0.0.1:3000/api/articles/21" | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
print('slug:', d['slug'])
print('is_published:', d['is_published'])
print('updated_at:', d.get('updated_at'))
"
echo "=== 2. 已发布列表是否含 #10 ==="
curl -s "http://127.0.0.1:3000/api/articles?is_published=true&limit=50" | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
print('已发布总数:', len(d))
print('#10 在列表中:', any(a['slug']=='zhuce-zijin-renjiao-2026' for a in d))
"
echo "=== 3. 前台资讯列表页（渲染结果）==="
curl -s http://127.0.0.1:3000/news | grep -c "zhuce-zijin-renjiao-2026" | xargs echo "列表页含 #10 链接:"
curl -s http://127.0.0.1:3000/news | sed 's/<[^>]*>//g' | grep -oE "公司注册资金[^<]{0,20}" | head -3
echo "=== 4. sitemap 是否含 #10 ==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -c "zhuce-zijin-renjiao-2026" | xargs echo "sitemap 含 #10:"
