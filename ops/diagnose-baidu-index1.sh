#!/bin/bash
# 百度索引量=1 的关键排查：百度有没有读我们的 robots.txt / sitemap.xml？读到了会不会解析？
cd /var/log/nginx || exit 1
TMP=$(mktemp); zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"
grep -i 'baiduspider' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' > /tmp/bd.txt
echo "===== 1. Baiduspider 是否读过 robots.txt / sitemap.xml ====="
printf "  /robots.txt   : %s 次\n" "$(awk '$7=="/robots.txt"' /tmp/bd.txt | wc -l)"
printf "  /sitemap.xml  : %s 次\n" "$(awk '$7=="/sitemap.xml"' /tmp/bd.txt | wc -l)"
printf "  /sitemap.txt  : %s 次\n" "$(awk '$7=="/sitemap.txt"' /tmp/bd.txt | wc -l)"
echo "  若两者均为 0，说明百度从未读取过站点地图 —— 这是可直接修的问题"
echo ""
echo "  若有读取，明细："
awk '$7=="/sitemap.xml" || $7=="/robots.txt" {print "    " $1, $4, $7, $9}' /tmp/bd.txt | tail -8

echo ""
echo "===== 2. Baiduspider 抓过的所有"非首页"URL（内容页线索）====="
awk '$7!="/" {print $7}' /tmp/bd.txt | sort | uniq -c | sort -rn | head -20 | sed 's/^/    /'

echo ""
echo "===== 3. 百度渲染爬虫（Baiduspider-render）抓了什么 ====="
grep -i 'baiduspider-render' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | awk '{print "    " $1, $4, $7, $9}' | tail -10

echo ""
echo "===== 4. 对比：Googlebot 读过几次 sitemap（作为"正常应该发生什么"的参照）====="
printf "  Googlebot /sitemap.xml : %s 次\n" "$(grep -i googlebot "$TMP" | awk '$7=="/sitemap.xml"' | wc -l)"
printf "  bingbot   /sitemap.xml : %s 次\n" "$(grep -i bingbot "$TMP" | awk '$7=="/sitemap.xml"' | wc -l)"
printf "  360Spider /sitemap.xml : %s 次\n" "$(grep -i 360spider "$TMP" | awk '$7=="/sitemap.xml"' | wc -l)"

echo ""
echo "===== 5. 站点地图本身是否可正常访问（百度读的时候会不会报错）====="
echo "  /sitemap.xml : HTTP $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/sitemap.xml)  类型: $(curl -s -o /dev/null -w '%{content_type}' https://www.shuducw.com/sitemap.xml)"
echo "  /robots.txt  : HTTP $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/robots.txt)"
echo "  robots.txt 内容:"
curl -s https://www.shuducw.com/robots.txt | sed 's/^/    /'
rm -f "$TMP" /tmp/bd.txt
