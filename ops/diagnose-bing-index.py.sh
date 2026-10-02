#!/bin/bash
# 诊断"Bing 搜不到公司主页"：看 bingbot 抓了什么、状态码如何、是否被拦、验证文件是否被校验过
echo "===== 1. bingbot 抓取总览（全部日志）====="
cd /var/log/nginx || exit 1
TMP=$(mktemp)
zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"
TOTAL=$(wc -l < "$TMP")
echo "  日志总请求数: $TOTAL"
echo "  bingbot 请求数: $(grep -ci 'bingbot' "$TMP")"
echo "  BingPreview 请求数: $(grep -ci 'BingPreview' "$TMP")"
echo "  msnbot 请求数: $(grep -ci 'msnbot' "$TMP")"
echo ""
echo "  --- bingbot 状态码分布 ---"
grep -i 'bingbot' "$TMP" | awk '{print $9}' | sort | uniq -c | sort -rn | sed 's/^/    /'
echo ""
echo "  --- bingbot 抓过的 URL（去重计数，前 25）---"
grep -i 'bingbot' "$TMP" | awk '{print $7}' | sort | uniq -c | sort -rn | head -25 | sed 's/^/    /'
echo ""
echo "  --- bingbot 最近 10 次请求 ---"
grep -i 'bingbot' "$TMP" | awk '{print "    " $1, $4, $6, $7, $9}' | tail -10
echo ""
echo "  --- bingbot 首次与最后一次 ---"
grep -i 'bingbot' "$TMP" | head -1 | awk '{print "    首次: " $4, $7, $9}'
grep -i 'bingbot' "$TMP" | tail -1 | awk '{print "    最后: " $4, $7, $9}'

echo ""
echo "===== 2. 首页被 bingbot 抓取的情况（关键）====="
echo "  bingbot 抓首页 (/ 或 /index) 的次数: $(grep -i 'bingbot' "$TMP" | awk '$7=="/" || $7=="/index.html"' | wc -l)"
grep -i 'bingbot' "$TMP" | awk '$7=="/"' | awk '{print "    " $4, $9}' | tail -5

echo ""
echo "===== 3. 验证文件与 sitemap 是否被 Bing 访问过 ====="
echo "  /BingSiteAuth.xml 请求数: $(grep -c 'BingSiteAuth' "$TMP")"
grep 'BingSiteAuth' "$TMP" | awk '{print "    " $1, $4, $7, $9}' | tail -5
echo "  sitemap.xml 被 Bing 系抓取次数: $(grep -iE 'bingbot|BingPreview|msnbot' "$TMP" | grep -c 'sitemap')"
grep -iE 'bingbot|BingPreview' "$TMP" | grep 'sitemap' | awk '{print "    " $1, $4, $7, $9}' | tail -5
echo "  robots.txt 被 Bing 系抓取次数: $(grep -iE 'bingbot|BingPreview|msnbot' "$TMP" | grep -c 'robots.txt')"

echo ""
echo "===== 4. bingbot 来源 IP 反查（确认是真 Bing，不是伪装）====="
for ip in $(grep -i 'bingbot' "$TMP" | awk '{print $1}' | sort -u | head -8); do
  echo -n "  $ip -> "
  python3 -c "
import socket
try: print(socket.gethostbyaddr('$ip')[0])
except Exception: print('(无 PTR)')
"
done

echo ""
echo "===== 5. nginx 是否拦截了任何爬虫（UA 规则）====="
grep -rn "bingbot\|msnbot\|BingPreview\|deny\|return 403\|user_agent" /etc/nginx/sites-enabled/ 2>/dev/null | head -20 | sed 's/^/    /'
echo "  （以上为空表示 nginx 层没有针对爬虫的拦截规则）"

echo ""
echo "===== 6. 近 3 天所有搜索引擎爬虫对比（看 Bing 是否明显落后）====="
for ua in Googlebot bingbot Baiduspider 360Spider YisouSpider Sogou Bytespider GPTBot ClaudeBot OAI-SearchBot Applebot; do
  n=$(grep -ci "$ua" "$TMP")
  echo "  $ua: $n"
done
rm -f "$TMP"
