#!/bin/bash
# 严格口径复核：真正的 bingbot（微软 IP + 反查确认）到底抓了什么
# 排除：我方服务器 8.152.3.67、我本地机器 85.149.220.12（曾用伪造的 bingbot UA 做测试）
cd /var/log/nginx || exit 1
TMP=$(mktemp); zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"

echo "===== 1. 严格口径：排除我方 IP 后的 bingbot 请求 ====="
grep -i 'bingbot' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' > /tmp/bing_real.txt
echo "  含我方伪造 UA 的原始计数: $(grep -ci 'bingbot' "$TMP")"
echo "  排除我方后的计数: $(wc -l < /tmp/bing_real.txt)"

echo ""
echo "===== 2. 逐个 IP 反查身份（必须是微软 msnbot/search.msn.com 段）====="
for ip in $(awk '{print $1}' /tmp/bing_real.txt | sort -u); do
  RDNS=$(python3 -c "
import socket
try: print(socket.gethostbyaddr('$ip')[0])
except Exception: print('(无 PTR)')
")
  N=$(grep -c "^$ip " /tmp/bing_real.txt)
  echo "  $ip  请求 $N 次  PTR=$RDNS"
done

echo ""
echo "===== 3. 真 bingbot 抓取的 URL 清单（按次数）====="
awk '{print $7}' /tmp/bing_real.txt | sort | uniq -c | sort -rn | head -30 | sed 's/^/    /'

echo ""
echo "===== 4. 真 bingbot 抓首页的记录 ====="
awk '$7=="/"' /tmp/bing_real.txt | awk '{print "    " $1, $4, $9}'
echo "  首页累计: $(awk '$7=="/"' /tmp/bing_real.txt | wc -l) 次"

echo ""
echo "===== 5. 真 bingbot 抓取的时间分布（按天）====="
awk '{print $4}' /tmp/bing_real.txt | cut -d: -f1 | tr -d '[' | sort | uniq -c | sed 's/^/    /'

echo ""
echo "===== 6. 状态码分布（确认没有被拦）====="
awk '{print $9}' /tmp/bing_real.txt | sort | uniq -c | sort -rn | sed 's/^/    /'

echo ""
echo "===== 7. 最近 8 次真 bingbot 抓取 ====="
tail -8 /tmp/bing_real.txt | awk '{print "    " $1, $4, $7, $9}'

echo ""
echo "===== 8. 抓取内容页数量（排除 sitemap/robots/静态资源）====="
echo "  内容页（非 sitemap/robots）: $(awk '{print $7}' /tmp/bing_real.txt | grep -vE 'sitemap|robots|\.(css|js|png|jpg|svg|ico|xml|txt)' | sort -u | wc -l) 个不同 URL"
rm -f "$TMP" /tmp/bing_real.txt
