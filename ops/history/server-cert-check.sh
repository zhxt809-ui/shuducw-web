#!/bin/bash
echo "=== cert SAN ==="
openssl x509 -in /etc/letsencrypt/live/www.shuducw.com/fullchain.pem -noout -text 2>/dev/null | grep -A1 'Subject Alternative Name'
echo "=== http status for each host (local curl, resolve apex) ==="
for h in www.shuducw.com shuducw.com; do
  echo "--- $h ---"
  curl -sk -o /dev/null -w 'https %{http_code} -> %{redirect_url}\n' "https://$h/" -H "Host: $h"
  curl -s -o /dev/null -w 'http  %{http_code} -> %{redirect_url}\n' "http://$h/" -H "Host: $h"
done
curl -sk -o /dev/null -w 'ip https %{http_code} -> %{redirect_url}\n' "https://8.152.3.67/" -H "Host: 8.152.3.67"
