#!/bin/bash
# 验证"缺 X-Forwarded-Host 导致 Next 生成 localhost 落点"的假设，并排查同类问题
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'

echo "===== 1. 假设验证：补上 X-Forwarded-Host 后，Location 是否变正确 ====="
echo "  只给 Host:"
curl -s -D - -o /dev/null http://127.0.0.1:3000/about.html -H 'Host: www.shuducw.com' | grep -i '^location' | tr -d '\r' | sed 's/^/      /'
echo "  给 Host + X-Forwarded-Host + X-Forwarded-Proto:"
curl -s -D - -o /dev/null http://127.0.0.1:3000/about.html \
  -H 'Host: www.shuducw.com' -H 'X-Forwarded-Host: www.shuducw.com' -H 'X-Forwarded-Proto: https' \
  | grep -i '^location' | tr -d '\r' | sed 's/^/      /'

echo ""
echo "===== 2. 同类问题排查：Next 自己产生的跳转是否也指向 localhost ====="
echo "  线上请求 /about/（尾斜杠，Next 通常会自动跳转）:"
curl -s -D - -o /dev/null -A "$UA" https://www.shuducw.com/about/ | grep -iE '^(HTTP|location)' | tr -d '\r' | sed 's/^/      /'
echo "  线上请求 /news/（尾斜杠）:"
curl -s -D - -o /dev/null -A "$UA" https://www.shuducw.com/news/ | grep -iE '^(HTTP|location)' | tr -d '\r' | sed 's/^/      /'
echo "  线上请求 /ABOUT（大小写）:"
curl -s -D - -o /dev/null -A "$UA" https://www.shuducw.com/ABOUT | grep -iE '^(HTTP|location)' | tr -d '\r' | sed 's/^/      /'

echo ""
echo "===== 3. nginx 里所有 proxy_pass 段落是否都设了 Host 与 X-Forwarded-* ====="
grep -nE 'location|proxy_pass|proxy_set_header' /etc/nginx/sites-enabled/shuducw | sed 's/^/      /'

echo ""
echo "===== 4. 反扫描规则清单（第 90-95 行附近），确认改哪一行 ====="
sed -n '88,96p' /etc/nginx/sites-enabled/shuducw | sed 's/^/      /'

echo ""
echo "===== 5. 完整 301 链条现状（nginx 级 http→https / 裸域→www 是否仍正确）====="
for u in http://shuducw.com/index.html http://www.shuducw.com/about.html https://shuducw.com/about.html; do
  lake=$(curl -s -D - -o /dev/null -A "$UA" "$u" | grep -iE '^(HTTP|location)' | tr -d '\r' | tr '\n' ' ')
  printf "      %-40s %s\n" "$u" "$lake"
done
