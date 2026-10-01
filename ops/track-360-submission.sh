#!/bin/bash
cd /var/log/nginx || exit 1
ALL=$(mktemp)
zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$ALL"

echo "===== 1. 360 是否来抓过 sitemap.xml（提交生效的关键证据）====="
n=$(grep "360Spider" "$ALL" | grep -c "sitemap")
echo "  360Spider 抓 sitemap 次数: $n"
grep "360Spider" "$ALL" | grep "sitemap" | awk '{print "    " $4, $7, $9}' | tail -10
echo ""
echo "  其他任何 UA 抓 sitemap.xml 的来源（近 30 条）:"
grep "GET /sitemap.xml" "$ALL" | awk '{print $1, $4, $9}' | tail -12 | sed 's/^/    /'
echo ""
echo "===== 2. 今天（10/01）360Spider 抓取明细 ====="
grep "360Spider" "$ALL" | grep "01/Oct/2026" | awk '{print "  " $4, $7, $9}' | tail -25
echo ""
echo "===== 3. 360Spider 历史抓过的 URL 去重（看是否已深入内容页）====="
grep "360Spider" "$ALL" | awk '{print $7}' | grep -vE '\?_rsc=' | sort -u | sed 's/^/  /'
echo ""
echo "===== 4. 各引擎最近 3 小时抓取量（提交后的动静）====="
for ua in "360Spider" "Baiduspider" "bingbot" "Googlebot" "YandexBot"; do
  n=$(tail -3000 "$ALL" | grep -c "$ua")
  echo "  $ua: 最近 3000 条请求里 $n 次"
done
echo ""
echo "===== 5. sitemap.xml 累计被访问情况 ====="
echo "  总次数: $(grep -c 'GET /sitemap.xml' "$ALL")"
grep "GET /sitemap.xml" "$ALL" | sed 's/.*" "//' | cut -c1-45 | sort | uniq -c | sort -rn | sed 's/^/  /'
rm -f "$ALL"
