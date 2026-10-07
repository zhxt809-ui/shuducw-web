#!/bin/bash
# 查清"华为"桶到底是什么爬虫：真实 UA、IP 段、反向 DNS、抓了哪些页面、是否遵守 robots
cd /var/log/nginx || exit 1
TMP=$(mktemp); zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"
MINE='^(8\.152\.3\.67|85\.149\.220\.12) '

echo "===== 1. 匹配 petalbot 的完整 User-Agent（去重）====="
grep -i petalbot "$TMP" | grep -vE "$MINE" | sed -E 's/.*"([^"]*)"$/\1/' | sort | uniq -c | sort -rn | sed 's/^/  /'

echo ""
echo "===== 2. 这些请求的源 IP 段与反向 DNS ====="
grep -i petalbot "$TMP" | grep -vE "$MINE" | awk '{print $1}' | sort | uniq -c | sort -rn | head -12 | sed 's/^/  /'
echo "  反向 DNS 抽样："
for ip in $(grep -i petalbot "$TMP" | awk '{print $1}' | sort -u | head -6); do
  printf "    %-18s -> " "$ip"
  python3 -c "
import socket
try: print(socket.gethostbyaddr('$ip')[0])
except Exception: print('(无 PTR)')
"
done

echo ""
echo "===== 3. 它抓了哪些页面（按路径去重，前 30）====="
grep -i petalbot "$TMP" | grep -vE "$MINE" | awk '{u=$7; sub(/\?.*/,"",u); print u}' | sort | uniq -c | sort -rn | head -30 | sed 's/^/  /'

echo ""
echo "===== 4. 是否读过 robots.txt / sitemap.xml ====="
printf "  robots.txt : %s 次\n" "$(grep -i petalbot "$TMP" | awk '$7=="/robots.txt"' | wc -l)"
printf "  sitemap.xml: %s 次\n" "$(grep -i petalbot "$TMP" | awk '$7=="/sitemap.xml"' | wc -l)"

echo ""
echo "===== 5. 状态码分布（有无被我们拦截/报错）====="
grep -i petalbot "$TMP" | grep -vE "$MINE" | awk '{print $9}' | sort | uniq -c | sort -rn | sed 's/^/  /'

echo ""
echo "===== 6. 首次出现时间与最近活动时间 ====="
grep -i petalbot "$TMP" | grep -vE "$MINE" | head -1 | awk '{print "  首次: " $4}'
grep -i petalbot "$TMP" | grep -vE "$MINE" | tail -1 | awk '{print "  最近: " $4}'
rm -f "$TMP"
