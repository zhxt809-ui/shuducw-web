#!/bin/bash
set -e
cp /etc/nginx/sites-available/shuducw /etc/nginx/sites-available/shuducw.bak.$(date +%s)
mv /etc/nginx/sites-available/shuducw.new /etc/nginx/sites-available/shuducw
echo "=== nginx -t ==="
nginx -t 2>&1 || { echo 'NGINX TEST FAILED, restoring backup'; mv /etc/nginx/sites-available/shuducw.bak.* /etc/nginx/sites-available/shuducw; exit 1; }
echo "=== reload ==="
systemctl reload nginx && echo 'nginx reloaded'
sleep 2
echo "=== verify redirects ==="
for h in www.shuducw.com shuducw.com; do
  echo "--- $h ---"
  curl -s -o /dev/null -w 'http  %{http_code} -> %{redirect_url}\n' "http://$h/" -H "Host: $h"
  curl -sk -o /dev/null -w 'https %{http_code} -> %{redirect_url}\n' "https://$h/" -H "Host: $h"
done
curl -sk -o /dev/null -w 'ip https %{http_code} -> %{redirect_url}\n' "https://8.152.3.67/" -H "Host: 8.152.3.67"
echo "=== www still serves ok ==="
curl -s -o /dev/null -w 'www https %{http_code}\n' https://www.shuducw.com/
