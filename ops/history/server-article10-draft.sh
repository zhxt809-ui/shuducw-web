#!/bin/bash
rm -f /var/www/shuducw-run/.next/server/app/sitemap.xml.body /var/www/shuducw-run/.next/server/app/sitemap.xml.meta 2>/dev/null
pm2 restart shuducw >/dev/null 2>&1
sleep 6
echo "=== public article URL (expect 404, draft hidden) ==="
curl -s -o /dev/null -w "public page: %{http_code}\n" http://127.0.0.1:3000/news/zhuce-zijin-renjiao-2026
echo "=== sitemap dropped #10? ==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -c "zhuce-zijin-renjiao-2026"
echo "=== sitemap count (expect 26) ==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -o "<loc>" | wc -l
echo "=== admin API still shows draft (is_published false) ==="
curl -s "http://127.0.0.1:3000/api/articles?limit=50" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; a=[x for x in d if x['slug']=='zhuce-zijin-renjiao-2026'][0]; print('id',a['id'],'published:',a['is_published'])"
echo "=== health ==="
curl -s http://127.0.0.1:3000/api/health
echo
