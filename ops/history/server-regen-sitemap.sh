#!/bin/bash
echo "=== force sitemap regen ==="
rm -rf /var/www/shuducw-run/.next/cache
pm2 restart shuducw >/dev/null 2>&1
sleep 5
echo "=== full sitemap ==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g'
