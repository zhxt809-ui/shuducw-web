#!/bin/bash
B=http://127.0.0.1:3000
T="${ADMIN_API_PASSWORD:-}"
echo "=== A. 公开接口仍可用（无需鉴权）==="
curl -s -o /dev/null -w "GET /api/articles 无token: %{http_code} (期望200)\n" "$B/api/articles"
curl -s -o /dev/null -w "GET /api/articles/21 无token: %{http_code} (期望200)\n" "$B/api/articles/21"
curl -s -o /dev/null -w "POST /api/consultations 无token(公开表单): %{http_code} (期望200/400)\n" -X POST -H "Content-Type: application/json" -d '{"company_name":"t","phone":"t","content":"t"}' "$B/api/consultations"
echo "=== B. 管理接口未授权一律 401 ==="
curl -s -o /dev/null -w "POST /api/articles 无token: %{http_code} (期望401)\n" -X POST -H "Content-Type: application/json" -d '{}' "$B/api/articles"
curl -s -o /dev/null -w "POST /api/articles 错token: %{http_code} (期望401)\n" -X POST -H "Content-Type: application/json" -H "x-admin-token: wrong" -d '{}' "$B/api/articles"
curl -s -o /dev/null -w "PUT /api/articles/21 无token: %{http_code} (期望401)\n" -X PUT -H "Content-Type: application/json" -d '{}' "$B/api/articles/21"
curl -s -o /dev/null -w "DELETE /api/articles/999 无token: %{http_code} (期望401)\n" -X DELETE "$B/api/articles/999"
curl -s -o /dev/null -w "GET /api/consultations 无token: %{http_code} (期望401)\n" "$B/api/consultations"
echo "=== C. 正确 token 可登录/写 ==="
curl -s -o /dev/null -w "POST /api/auth/check 正确token: %{http_code} (期望200)\n" -X POST -H "Content-Type: application/json" -H "x-admin-token: $T" -d '{}' "$B/api/auth/check"
curl -s -o /dev/null -w "GET /api/consultations 正确token: %{http_code} (期望200)\n" -H "x-admin-token: $T" "$B/api/consultations"
curl -s -o /dev/null -w "PUT /api/articles/21 正确token(幂等): %{http_code} (期望200)\n" -X PUT -H "Content-Type: application/json" -H "x-admin-token: $T" -d '{"is_published":false}' "$B/api/articles/21"
echo "=== D. 数据完整性 ==="
curl -s "$B/api/articles/21" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print('article21 published:', d['is_published'], '| slug:', d['slug'])"
echo "=== E. 前端页面 ==="
curl -s -o /dev/null -w "www home: %{http_code}\n" http://127.0.0.1:3000/
curl -s -o /dev/null -w "admin page: %{http_code}\n" http://127.0.0.1:3000/admin
