#!/bin/bash
echo "=== local via nginx (127.0.0.1:443) ==="
for i in 1 2 3; do
  curl -sk -o /dev/null -w "req$i: %{http_code} %{time_total}s (ttfb %{time_starttransfer}s)\n" -H "Host: www.shuducw.com" https://127.0.0.1/
done
echo "=== local via node (bypass nginx) ==="
curl -s -o /dev/null -w "node: %{http_code} %{time_total}s\n" http://127.0.0.1:3000/
echo "=== nginx access log tail (with timing if available) ==="
tail -6 /var/log/nginx/access.log 2>/dev/null
echo "=== nginx log format config ==="
grep -r 'log_format' /etc/nginx/ 2>/dev/null | head -3
echo "=== nginx worker processes ==="
ps aux | grep 'nginx: worker' | grep -v grep | wc -l
echo "=== nginx -V worker_connections ==="
nginx -T 2>/dev/null | grep -E 'worker_processes|worker_connections|keepalive_timeout' | head -5
