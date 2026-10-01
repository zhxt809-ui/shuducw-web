#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 扫描器探测的敏感路径是否真暴露（应全部 404/403）====="
for p in "/.env" "/.env.local" "/.env.production" "/server.key" "/serviceAccountKey.json" "/.ssh/config" "/values.yaml" "/read-document" "/inngest" "/api/fs/exec" "/api/account" "/v1/graphql" "/api/v1/validate/code" "/static/app/.env" "/api/session/properties" "/.git/config" "/package.json" "/data/articles.json"; do
  r=$(curl -s -o /tmp/sec.html -w '%{http_code}' "$B$p")
  sz=$(wc -c < /tmp/sec.html)
  flag="OK"
  if [ "$r" = "200" ] && [ "$sz" -gt 500 ]; then flag="!! 需检查"; fi
  printf "  %-32s HTTP=%s 字节=%-7s %s\n" "$p" "$r" "$sz" "$flag"
done
echo ""
echo "===== 2. 后台与数据接口是否需鉴权（含客户手机号，绝不能公开）====="
for p in "/admin" "/api/articles" "/api/consultations" "/api/health"; do
  r=$(curl -s -o /tmp/adm.html -w '%{http_code}' "$B$p")
  sz=$(wc -c < /tmp/adm.html)
  # 检查返回内容里是否含手机号或客户信息
  phone=$(grep -oE '1[3-9][0-9]{9}' /tmp/adm.html | head -3 | tr '\n' ' ')
  printf "  %-22s HTTP=%s 字节=%-7s 手机号泄漏=%s\n" "$p" "$r" "$sz" "${phone:-无}"
done
echo ""
echo "===== 3. 未登录 POST 咨询接口是否被限流/校验（防灌水）====="
r=$(curl -s -o /tmp/post.html -w '%{http_code}' -X POST "$B/api/consultations" -H 'Content-Type: application/json' -d '{"company_name":"","phone":"","content":""}')
echo "  空数据 POST -> HTTP=$r  响应: $(head -c 200 /tmp/post.html)"
echo ""
echo "===== 4. robots 屏蔽的 /admin 是否仅靠 robots（形同虚设？）====="
echo "  /admin 是否有登录跳转:"
curl -s -o /dev/null -D - "$B/admin" | grep -iE '^(HTTP|location|set-cookie)' | sed 's/^/      /'
