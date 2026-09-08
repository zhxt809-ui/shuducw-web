#!/bin/bash
echo "=== force sitemap regen (rm ISR cache + restart) ==="
rm -f /var/www/shuducw-run/.next/server/app/sitemap.xml.body /var/www/shuducw-run/.next/server/app/sitemap.xml.meta 2>/dev/null
pm2 restart shuducw >/dev/null 2>&1
sleep 6
echo "=== article page #10 ==="
curl -s -o /dev/null -w "article: %{http_code}\n" http://127.0.0.1:3000/news/zhuce-zijin-renjiao-2026
echo "=== sitemap contains new slug? ==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -c "zhuce-zijin-renjiao-2026"
echo "=== sitemap URL count ==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -o "<loc>" | wc -l
echo "=== llms.txt served with article list? ==="
curl -s http://127.0.0.1:3000/llms.txt | grep -c "zhuce-zijin-renjiao-2026"
echo "=== news tips page includes article? ==="
curl -s http://127.0.0.1:3000/news/tips | grep -c "zhuce-zijin-renjiao-2026"
echo "=== health ==="
curl -s http://127.0.0.1:3000/api/health
echo
