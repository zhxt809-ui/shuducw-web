#!/bin/bash
echo "=== 外部 https 可达性（经 nginx）==="
curl -s -o /dev/null -w "https www: %{http_code}\n" --max-time 15 https://www.shuducw.com/
curl -s -o /dev/null -w "https admin: %{http_code}\n" --max-time 15 https://www.shuducw.com/admin
echo "=== sitemap（草稿#10应排除,期望26）==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -c "zhuce-zijin-renjiao-2026"
curl -s http://127.0.0.1:3000/sitemap.xml | grep -o "<loc>" | wc -l
echo "=== 健康检查 ==="
curl -s http://127.0.0.1:3000/api/health
echo
echo "=== 未授权管理请求被 401 拦截（外部视角）==="
curl -s -o /dev/null -w "外部 POST /api/articles 无token: %{http_code}\n" --max-time 15 -X POST -H "Content-Type: application/json" -d '{}' https://www.shuducw.com/api/articles
