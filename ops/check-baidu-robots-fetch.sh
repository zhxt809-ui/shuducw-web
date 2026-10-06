#!/bin/bash
# 验证两件事：① 百度（Robots 工具）刚才是否真的来抓了 robots.txt；② 百度最近有没有开始读 sitemap.xml
cd /var/log/nginx || exit 1
TMP=$(mktemp); zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"
echo "===== 0. 当前时间与日志窗口 ====="
TZ=Asia/Shanghai date '+  北京时间 %Y-%m-%d %H:%M:%S'
echo "  日志: $(head -1 "$TMP" | awk '{print $4}') → $(tail -1 "$TMP" | awk '{print $4}')"

echo ""
echo "===== 1. 今天(10-06) 所有抓取 /robots.txt 的请求（看百度有没有来）====="
grep '06/Oct/2026' "$TMP" | awk '$7=="/robots.txt"' | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | awk '{print "    " $1, $4, $9, substr($0, index($0,"\""))}' | tail -15
echo "  10-06 抓取 robots.txt 的外部来源 IP 去重:"
grep '06/Oct/2026' "$TMP" | awk '$7=="/robots.txt"' | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | awk '{print $1}' | sort -u | head -12 | sed 's/^/    /'

echo ""
echo "===== 2. 百度 IP 段(220.181./116.179./111.206./182.61. 等) 今天是否抓了 robots.txt 或 sitemap ====="
grep '06/Oct/2026' "$TMP" | grep -E '^(220\.181\.|116\.179\.|111\.206\.|182\.61\.|180\.76\.|106\.12\.)' | awk '$7=="/robots.txt" || $7=="/sitemap.xml" || $7=="/sitemap.txt" {print "    " $1, $4, $7, $9}' | tail -20
echo "  （空 = 百度今天还没来读 robots/sitemap）"

echo ""
echo "===== 3. 最近的 Baiduspider 请求（最后 15 条，含状态码）====="
grep -i 'baiduspider' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | tail -15 | awk '{print "    " $1, $4, $7, $9}'

echo ""
echo "===== 4. Baiduspider 今天抓过的 URL 去重（除首页外）====="
grep -i 'baiduspider' "$TMP" | grep '06/Oct/2026' | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | awk '$7!="/" {print $7}' | sort | uniq -c | sort -rn | head -12 | sed 's/^/    /'

echo ""
echo "===== 5. 09-26 以来 百度是否碰过任何一篇文章页 ====="
grep -i 'baiduspider' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | awk '$7 ~ /^\/news\// {print "    " $1, $4, $7, $9}' | head -20
echo "  文章页被抓次数: $(grep -i 'baiduspider' "$TMP" | awk '$7 ~ /^\/news\//' | wc -l)"
rm -f "$TMP"
