#!/bin/bash
# 核实：百度站长平台工具（Chrome 48 UA）到底抓了什么；以及这些 IP 是谁
cd /var/log/nginx || exit 1
TMP=$(mktemp); zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"

echo "===== 1. Chrome 48 UA 的全部请求（百度工具特征；也可能是别的老爬虫）====="
grep 'Chrome/48.0.2564.116' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | awk '{print $1, $4, $7, $9}' | tail -40 | sed 's/^/    /'
echo "  合计: $(grep -c 'Chrome/48.0.2564.116' "$TMP") 次"

echo ""
echo "===== 2. 这些 IP 的反向 DNS（判断归属）====="
for ip in $(grep 'Chrome/48.0.2564.116' "$TMP" | awk '{print $1}' | sort -u | head -10); do
  printf "  %-18s -> " "$ip"
  python3 -c "
import socket
try: print(socket.gethostbyaddr('$ip')[0])
except Exception: print('(无 PTR)')
"
done

echo ""
echo "===== 3. 这几个 IP 各自请求了什么（看是不是"抓取诊断"式的成对抓取）====="
for ip in 111.225.214.138 111.225.214.130 113.24.224.37 113.88.72.45; do
  n=$(awk -v ip=$ip '$1==ip' "$TMP" | wc -l)
  echo "  ▸ $ip  共 $n 次"
  awk -v ip=$ip '$1==ip {print "      " $4, $7, $9}' "$TMP" | tail -8
done

echo ""
echo "===== 4. 关键问题：百度爬虫本体(Baiduspider UA)是否读过 sitemap / 抓过文章页 ====="
printf "  Baiduspider 读 /sitemap.xml : %s 次\n" "$(grep -i 'baiduspider' "$TMP" | awk '$7=="/sitemap.xml"' | wc -l)"
printf "  Baiduspider 读 /robots.txt  : %s 次\n" "$(grep -i 'baiduspider' "$TMP" | awk '$7=="/robots.txt"' | wc -l)"
printf "  Baiduspider 抓 /news/ 文章页: %s 次\n" "$(grep -i 'baiduspider' "$TMP" | awk '$7 ~ /^\/news\//' | wc -l)"
printf "  Baiduspider 抓首页 /        : %s 次\n" "$(grep -i 'baiduspider' "$TMP" | awk '$7=="/"' | wc -l)"

echo ""
echo "===== 5. 今天有没有任何来源抓过 /sitemap.xml（含非百度）====="
grep '06/Oct/2026' "$TMP" | awk '$7=="/sitemap.xml"' | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | awk '{print "    " $1, $4, $9}' | tail -10
rm -f "$TMP"
