#!/bin/bash
# 定位两个验收失败：① /index.html 为什么没进 Node；② 301 落点为何是 localhost:3000
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'

echo "===== 1. /index.html 的 404 是谁返回的（nginx 还是 Node）====="
echo "  经 nginx:"
curl -s -D - -o /tmp/body1 -A "$UA" https://www.shuducw.com/index.html | head -8 | sed 's/^/      /'
echo "      响应体前 120 字节: $(head -c 120 /tmp/body1 | tr -d '\n')"
echo ""
echo "  直连 Node(3000):"
curl -s -D - -o /tmp/body2 -A "$UA" http://127.0.0.1:3000/index.html -H 'Host: www.shuducw.com' | head -8 | sed 's/^/      /'
echo "      响应体前 120 字节: $(head -c 120 /tmp/body2 | tr -d '\n')"

echo ""
echo "===== 2. nginx 站点配置里与 index / try_files / proxy 头相关的行 ====="
CONF=$(ls /etc/nginx/conf.d/*.conf /etc/nginx/sites-enabled/* 2>/dev/null | head -3)
for f in $CONF; do
  echo "  ▸ $f"
  grep -nE 'index |try_files|proxy_pass|proxy_set_header|location |server_name|return 301|Host' "$f" | sed 's/^/      /'
done

echo ""
echo "===== 3. 301 落点问题：Node 收到的 Host 是什么 ====="
echo "  直接看 proxy 生成的 Location（不经 curl 跟随）:"
curl -s -D - -o /dev/null -A "$UA" https://www.shuducw.com/about.html | grep -iE '^(HTTP|location)' | sed 's/^/      /'
echo ""
echo "  用不同 Host 直连 Node，观察 Location 是否随 Host 变化:"
for h in www.shuducw.com shuducw.com localhost:3000; do
  loc=$(curl -s -D - -o /dev/null -A "$UA" http://127.0.0.1:3000/about.html -H "Host: $h" | grep -i '^location' | tr -d '\r')
  printf "      Host: %-20s → %s\n" "$h" "${loc:-（无 Location）}"
done
rm -f /tmp/body1 /tmp/body2
