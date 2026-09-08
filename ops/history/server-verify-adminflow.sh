#!/bin/bash
B=http://127.0.0.1:3000
T="${ADMIN_API_PASSWORD:-}"
echo "=== 1. 登录接口 ==="
curl -s -X POST "$B/api/auth/check" -H "Content-Type: application/json" -H "x-admin-token: $T" -d '{}' | head -c 100; echo ""
curl -s -o /dev/null -w "错误密码: %{http_code} (期望401)\n" -X POST "$B/api/auth/check" -H "Content-Type: application/json" -H "x-admin-token: wrong" -d '{}'
echo "=== 2. 文章列表（带token，应含草稿）==="
curl -s -H "x-admin-token: $T" "$B/api/articles?limit=50" | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
drafts = [a['slug'] for a in d if not a['is_published']]
print('总数:', len(d), '| 草稿:', drafts)
"
echo "=== 3. 无token 401 ==="
curl -s -o /dev/null -w "列表无token: %{http_code}\n" "$B/api/articles"
curl -s -o /dev/null -w "咨询无token: %{http_code}\n" "$B/api/consultations"
echo "=== 4. 公开安全 ==="
curl -s -o /dev/null -w "is_published=true 无token: %{http_code} (期望200)\n" "$B/api/articles?is_published=true"
echo "=== 5. 前台 & sitemap ==="
curl -s -o /dev/null -w "首页: %{http_code}\n" "$B/"
curl -s -o /dev/null -w "资讯: %{http_code}\n" "$B/news"
curl -s "$B/sitemap.xml" | grep -o '<loc>' | wc -l | xargs echo "sitemap URL 数:"
