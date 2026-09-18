#!/bin/bash
B="https://www.shuducw.com"
echo "########## 1. 响应头（首页） ##########"
curl -sI "$B/" | grep -iE "^(HTTP|server|strict-transport|content-security|x-frame|x-content-type|referrer-policy|permissions-policy|x-powered|via)"
echo ""
echo "########## 2. 敏感路径暴露检查（期望 403/404） ##########"
for p in /.env /.env.production /.git/HEAD /data/ /data/articles.json /node_modules/ /package.json /src/ /.git/config /server.js /api/articles /api/consultations /admin /api/health; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$B$p")
  echo "$p -> $code"
done
echo ""
echo "########## 3. HTTP→HTTPS 与 301 跳转 ##########"
curl -s -o /dev/null -w "http://www.shuducw.com/ -> %{http_code} Location: %{redirect_url}\n" http://www.shuducw.com/
curl -s -o /dev/null -w "http://shuducw.com/ -> %{http_code} Location: %{redirect_url}\n" http://shuducw.com/
curl -s -o /dev/null -w "https://shuducw.com/ -> %{http_code} Location: %{redirect_url}\n" https://shuducw.com/
echo ""
echo "########## 4. 管理登录限流（连续 6 次，第 6 次应 503/429） ##########"
for i in 1 2 3 4 5 6; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$B/api/auth" -H "Content-Type: application/json" -d '{"password":"wrong-test"}')
  echo "attempt $i -> $code"
done
echo ""
echo "########## 5. 咨询接口防刷（无限流时连发 10 次，验证码/校验观察） ##########"
for i in 1 2 3; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$B/api/consultations" -H "Content-Type: application/json" -d '{"company_name":"安全测试","phone":"13800000000","content":"安全巡检测试，请忽略"}')
  echo "consultation $i -> $code"
done
echo ""
echo "########## 6. TLS 协议与证书 ##########"
echo | openssl s_client -connect www.shuducw.com:443 -servername www.shuducw.com 2>/dev/null | grep -E "Protocol|Cipher|Verify return code"
echo | openssl s_client -connect www.shuducw.com:443 -servername www.shuducw.com 2>/dev/null | openssl x509 -noout -dates -subject -issuer 2>/dev/null
echo ""
echo "########## 7. HTTP 方法（OPTIONS/PUT/DELETE 于首页） ##########"
curl -s -o /dev/null -w "OPTIONS / -> %{http_code}\n" -X OPTIONS "$B/"
curl -s -o /dev/null -w "PUT / -> %{http_code}\n" -X PUT "$B/"
curl -s -o /dev/null -w "DELETE / -> %{http_code}\n" -X DELETE "$B/"
echo ""
echo "########## 8. 目录列表 ##########"
curl -s -o /dev/null -w "GET /data/ -> %{http_code}\n" "$B/data/"
curl -s -o /dev/null -w "GET /static/ -> %{http_code}\n" "$B/static/"
echo ""
echo "########## 9. 错误页信息泄露 ##########"
curl -s -o /dev/null -w "不存在页面 -> %{http_code}\n" "$B/this-page-does-not-exist-xyz"
curl -s "$B/this-page-does-not-exist-xyz" | grep -oiE "stack trace|at .*\.js|nodejs|express|next\.js version" | head -3
echo "(空 = 无技术栈泄露)"
