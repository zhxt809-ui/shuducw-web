#!/bin/bash
echo "=== server resources ==="
free -m | head -2
uptime
echo "=== pm2 ==="
pm2 list 2>/dev/null | grep shuducw || true
echo "=== pm2 logs (last 30 lines) ==="
pm2 logs shuducw --lines 30 --nostream 2>/dev/null | tail -35 || pm2 logs --nostream 2>/dev/null | grep -A3 -B3 -i 'error' | tail -20
echo "=== timing: 3 warm requests ==="
for i in 1 2 3; do
  curl -s -o /dev/null -w "req$i: %{http_code} %{time_total}s\n" http://127.0.0.1:3000/
done
echo "=== timing: article ==="
curl -s -o /dev/null -w "article: %{http_code} %{time_total}s\n" http://127.0.0.1:3000/news/xian-kaigongsi-leixing-duibi-2026
echo "=== nginx error log tail ==="
tail -5 /var/log/nginx/error.log 2>/dev/null || echo "no nginx error log"
