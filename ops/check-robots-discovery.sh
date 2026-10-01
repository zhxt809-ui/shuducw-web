#!/bin/bash
echo "===== 1. 线上 robots.txt 实际输出 ====="
curl -s https://www.shuducw.com/robots.txt

echo ""
echo "===== 2. 百度是否读过 robots.txt ====="
cd /var/log/nginx || exit 1
ALL=$(mktemp)
zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$ALL"
echo "  Baiduspider 请求 robots.txt 次数: $(grep 'Baiduspider' "$ALL" | grep -c 'robots.txt')"
grep 'Baiduspider' "$ALL" | grep 'robots.txt' | awk '{print "    " $4, $7, $9}' | tail -5
echo ""
echo "  Baiduspider 请求 sitemap.xml 次数: $(grep 'Baiduspider' "$ALL" | grep -c 'sitemap.xml')"
echo "  Googlebot 请求 sitemap.xml 次数: $(grep 'Googlebot' "$ALL" | grep -c 'sitemap.xml')"
echo "  360Spider 请求 sitemap.xml 次数: $(grep '360Spider' "$ALL" | grep -c 'sitemap.xml')"
echo ""
echo "===== 3. 新专题页访问来源 UA（确认是否为引擎抓取还是我自己的验证请求）====="
for p in invoice-compliance social-insurance-iit high-tech-enterprise company-deregistration; do
  echo "  /$p:"
  grep "/$p" "$ALL" | awk '{print $1, $4, $9, $12}' | sed 's/^/    /' | tail -4
done
echo ""
echo "===== 4. 各引擎对 robots.txt 的访问（发现 sitemap 的入口）====="
grep 'robots.txt' "$ALL" | sed 's/.*" "//' | cut -c1-40 | sort | uniq -c | sort -rn | head -8 | sed 's/^/  /'
rm -f "$ALL"
