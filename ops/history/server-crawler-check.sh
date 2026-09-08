#!/bin/bash
echo "=== live robots.txt crawlers ==="
curl -s http://127.0.0.1:3000/robots.txt | grep -E 'User-agent|Sitemap|Host' | head -20
echo "=== verify files (server-side) ==="
for f in baidu_verify_codeva-t1LOLMCF42.html BingSiteAuth.xml ByteDanceVerify.html google28fc85f4f8afed73.html; do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/$f)
  echo "$code $f"
done
echo "=== crawler visits in nginx access log (last 20000 lines) ==="
LOG=/var/log/nginx/access.log
for spider in Bingbot baiduspider Baiduspider Googlebot 360Spider Sogou Bytespider ByteSpider YandexBot; do
  cnt=$(grep -ci "$spider" "$LOG" 2>/dev/null || echo 0)
  echo "$spider: $cnt hits"
done
echo "=== recent Bingbot lines (if any) ==="
grep -i bingbot "$LOG" 2>/dev/null | tail -5 || echo "no bingbot"
echo "=== recent 360Spider lines (if any) ==="
grep -i 360spider "$LOG" 2>/dev/null | tail -3 || echo "no 360spider"
echo "=== log size / lines ==="
wc -l "$LOG" 2>/dev/null
