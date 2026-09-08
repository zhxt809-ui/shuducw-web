#!/bin/bash
B=http://127.0.0.1:3000
T="${ADMIN_API_PASSWORD:-}"
echo "=== A. 公开安全：is_published=true 无需鉴权 ==="
curl -s -o /dev/null -w "GET ?is_published=true 无token: %{http_code} (期望200)\n" "$B/api/articles?is_published=true"
echo "=== B. 草稿泄露已堵死 ==="
curl -s -o /dev/null -w "GET 无参数 无token: %{http_code} (期望401)\n" "$B/api/articles"
curl -s -o /dev/null -w "GET ?is_published=false 无token: %{http_code} (期望401)\n" "$B/api/articles?is_published=false"
echo "=== C. 后台带 token 能看全部含草稿 ==="
curl -s -H "x-admin-token: $T" "$B/api/articles?limit=50" | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
print('返回:', len(d), '篇')
drafts = [a['slug'] for a in d if not a['is_published']]
print('草稿:', drafts)
print('#10 可见:', any(a['slug']=='zhuce-zijin-renjiao-2026' for a in d))
"
echo "=== D. 前台不受影响 ==="
curl -s -o /dev/null -w "资讯列表页: %{http_code}\n" "$B/news"
curl -s "$B/api/articles?is_published=true" | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
print('已发布数:', len(d))
print('含草稿#10:', any(a['slug']=='zhuce-zijin-renjiao-2026' for a in d))
"
echo "=== E. sitemap ==="
curl -s "$B/sitemap.xml" | grep -o "<loc>" | wc -l
