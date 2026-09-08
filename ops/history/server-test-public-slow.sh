#!/bin/bash
echo "=== server -> public IP (same network, out-and-back) ==="
for i in 1 2 3; do
  curl -sk -o /dev/null -w "public req$i: %{http_code} %{time_total}s (ttfb %{time_starttransfer}s)\n" https://www.shuducw.com/
done
echo "=== also via direct IP with Host header ==="
curl -sk -o /dev/null -w "ip+host: %{http_code} %{time_total}s\n" -H "Host: www.shuducw.com" https://8.152.3.67/
echo "=== external request timing from access log (with response sizes) ==="
tail -20 /var/log/nginx/access.log
