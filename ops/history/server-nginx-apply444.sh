#!/bin/bash
set -e
echo "=== backup ==="
cp /etc/nginx/sites-available/shuducw /etc/nginx/sites-available/shuducw.bak-20260906 2>/dev/null || echo "backup done"
echo "=== install new config ==="
cp /root/nginx-shuducw-v2.conf /etc/nginx/sites-available/shuducw
echo "=== nginx -t ==="
nginx -t 2>&1
if nginx -t 2>&1 | grep -q "successful"; then
  echo "=== reload ==="
  systemctl reload nginx
  sleep 2
  echo "=== verify: unknown host on 443 (expect 444) ==="
  curl -s -o /dev/null -w "random.shuducw.com: %{http_code}\n" -H "Host: random-audit-check-20260905.shuducw.com" https://127.0.0.1/ -k
  echo "=== verify: bare IP on 443 (expect 444) ==="
  curl -s -o /dev/null -w "IP: %{http_code}\n" -H "Host: 8.152.3.67" https://127.0.0.1/ -k
  echo "=== verify: www (expect 200) ==="
  curl -s -o /dev/null -w "www: %{http_code}\n" -H "Host: www.shuducw.com" https://127.0.0.1/ -k
  echo "=== verify: apex (expect 301) ==="
  curl -s -o /dev/null -w "apex: %{http_code}\n" -H "Host: shuducw.com" https://127.0.0.1/ -k
else
  echo "!!! nginx -t FAILED, restoring backup"
  cp /etc/nginx/sites-available/shuducw.bak-20260906 /etc/nginx/sites-available/shuducw
  nginx -t 2>&1
fi
