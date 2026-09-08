#!/bin/bash
rm -f /var/www/shuducw-run/.next/server/app/sitemap.xml.body /var/www/shuducw-run/.next/server/app/sitemap.xml.meta 2>/dev/null
pm2 restart shuducw >/dev/null 2>&1
sleep 5
curl -s http://127.0.0.1:3000/sitemap.xml > /tmp/sm2.xml
echo "loc 出现次数: $(grep -o '<loc>' /tmp/sm2.xml | wc -l)"
echo "url 条目: $(grep -c '<url>' /tmp/sm2.xml)"
echo "=== 文章 URL 数 ==="
grep -oE '<loc>[^<]*/news/[^<]*</loc>' /tmp/sm2.xml | wc -l
echo "=== #10 是否排除 ==="
grep -c "zhuce-zijin-renjiao-2026" /tmp/sm2.xml
