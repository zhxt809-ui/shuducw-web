#!/bin/bash
B="https://www.shuducw.com"
echo "===== 308 跳转目标 ====="
for u in /news/18-1783927822503 /news/5-10-1783086858170; do
  echo "  $u"
  curl -s -o /dev/null -D - "$B$u" | grep -iE '^(HTTP|location)' | sed 's/^/      /'
done
echo ""
echo "===== 首页 301 来源判定 ====="
echo "  https://www.shuducw.com/  -> $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/)"
echo "  http://www.shuducw.com/   -> $(curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}' http://www.shuducw.com/)"
echo "  https://shuducw.com/      -> $(curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}' https://shuducw.com/)"
echo ""
echo "===== 日志里 301 的 UA 分布（谁在走跳转）====="
grep ' 301 ' /var/log/nginx/access.log | sed 's/.*" "//' | cut -c1-40 | sort | uniq -c | sort -rn | head -6 | sed 's/^/  /'
