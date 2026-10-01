#!/bin/bash
cd /var/log/nginx || exit 1
ALL=$(mktemp)
zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$ALL"

echo "===== 1. 百度是否抓过 sitemap.xml ====="
echo "  Baiduspider 抓 sitemap 次数: $(grep 'Baiduspider' "$ALL" | grep -c 'sitemap')"
grep 'Baiduspider' "$ALL" | grep 'sitemap' | awk '{print "    " $4, $7, $9}' | tail -5
echo ""
echo "===== 2. 百度抓过的 URL 去重（排除 _rsc 预取）====="
grep 'Baiduspider' "$ALL" | awk '{print $7}' | grep -vE '\?_rsc=' | sort | uniq -c | sort -rn | head -20 | sed 's/^/  /'
echo ""
echo "  百度抓取的内容页数量（非首页）: $(grep 'Baiduspider' "$ALL" | awk '{print $7}' | grep -vE '^/(\?|$)|_rsc=' | sort -u | wc -l)"
echo ""
echo "===== 3. 搜狗（Sogou）任何请求 ====="
echo "  Sogou 相关请求总数: $(grep -ci 'sogou' "$ALL")"
grep -i 'sogou' "$ALL" | awk '{print "  " $1, $4, $7, $9}' | tail -10
echo ""
echo "===== 4. 今天各引擎抓取量（10/01）====="
for ua in "Baiduspider" "360Spider" "Sogou" "Googlebot" "bingbot"; do
  n=$(grep "01/Oct/2026" "$ALL" | grep -c "$ua")
  echo "  $ua: $n"
done
echo ""
echo "===== 5. 百度今日抓取明细（最近 20 条）====="
grep "01/Oct/2026" "$ALL" | grep 'Baiduspider' | awk '{print "  " $4, $7, $9}' | tail -20
echo ""
echo "===== 6. 新专题页是否已被任何引擎抓取 ====="
for p in invoice-compliance social-insurance-iit high-tech-enterprise company-deregistration; do
  n=$(grep -c "/$p" "$ALL")
  echo "  /$p : $n 次"
done
rm -f "$ALL"
