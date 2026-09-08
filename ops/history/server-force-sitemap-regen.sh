#!/bin/bash
echo "=== remove persisted ISR sitemap body ==="
rm -f /var/www/shuducw-run/.next/server/app/sitemap.xml.body
rm -f /var/www/shuducw-run/.next/server/app/sitemap.xml.meta
rm -f /var/www/shuducw-run/.next/server/app/sitemap.xml
pm2 restart shuducw >/dev/null 2>&1
sleep 5
echo "=== sitemap after forced regen ==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g'
echo "=== count ==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -c '<loc>'
