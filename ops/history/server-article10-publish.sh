#!/bin/bash
B=http://127.0.0.1:3000
echo "=== 1. #10 发布状态 ==="
curl -s "$B/api/articles?is_published=true" | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
a = next((x for x in d if x['slug']=='zhuce-zijin-renjiao-2026'), None)
print('已发布总数:', len(d))
print('#10 已发布:', bool(a))
if a: print('标题:', a['title'])
"
echo "=== 2. 前台文章页（应为正文 200）==="
curl -s -o /dev/null -w "HTTP: %{http_code}\n" "$B/news/zhuce-zijin-renjiao-2026"
curl -s "$B/news/zhuce-zijin-renjiao-2026" | sed 's/<[^>]*>//g' | grep -oE "尚未发布" | head -1
echo "=== 3. 强制重生成 sitemap（含 #10）==="
rm -f /var/www/shuducw-run/.next/server/app/sitemap.xml.body /var/www/shuducw-run/.next/server/app/sitemap.xml.meta 2>/dev/null
pm2 restart shuducw >/dev/null 2>&1
sleep 5
curl -s "$B/sitemap.xml" > /tmp/sm3.xml
echo "sitemap URL 总数: $(grep -o '<loc>' /tmp/sm3.xml | wc -l)"
echo "含 #10: $(grep -c 'zhuce-zijin-renjiao-2026' /tmp/sm3.xml)"
