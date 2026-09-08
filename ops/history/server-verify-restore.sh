#!/bin/bash
rm -f /var/www/shuducw-run/.next/server/app/sitemap.xml.body /var/www/shuducw-run/.next/server/app/sitemap.xml.meta 2>/dev/null
pm2 restart shuducw >/dev/null 2>&1
sleep 5
echo "=== sitemap 验证 ==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -c "xian-kaigongsi-leixing-duibi-2026" | xargs echo "xian-kaigongsi 在 sitemap:"
curl -s http://127.0.0.1:3000/sitemap.xml | grep -o "<loc>" | wc -l | xargs echo "sitemap 总数:"
echo "=== #10 文章页（草稿，应显示未发布）==="
curl -s -o /dev/null -w "HTTP: %{http_code}\n" http://127.0.0.1:3000/news/zhuce-zijin-renjiao-2026
echo "=== 资讯列表已发布数 ==="
curl -s "http://127.0.0.1:3000/api/articles?is_published=true&limit=50" | python3 -c "import sys,json; print('已发布:', len(json.load(sys.stdin)['data']))"
