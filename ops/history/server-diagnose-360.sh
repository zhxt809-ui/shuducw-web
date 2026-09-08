#!/bin/bash
echo "=== recent 360 requests in access log ==="
grep -i '360' /var/log/nginx/access.log 2>/dev/null | tail -10 || echo "no 360 in log"
echo "=== recent requests to verify file (any UA) ==="
grep '81d494eacc771fbdb6f8d6faa3f8238b' /var/log/nginx/access.log 2>/dev/null | tail -10 || echo "no verify-file requests logged"
echo "=== last 15 log lines (what's happening) ==="
tail -15 /var/log/nginx/access.log
echo "=== server-side: verify file over http (expect 301->https) ==="
curl -s -o /dev/null -w "http: %{http_code} -> %{redirect_url}\n" "http://127.0.0.1:3000/81d494eacc771fbdb6f8d6faa3f8238b.txt" -H "X-Forwarded-Proto: http"
echo "=== https verify ==="
curl -sk -o /dev/null -w "https: %{http_code}\n" -H "Host: www.shuducw.com" "https://127.0.0.1/81d494eacc771fbdb6f8d6faa3f8238b.txt"
echo "=== nginx http->https for verify file ==="
curl -s -o /dev/null -w "nginx http: %{http_code} -> %{redirect_url}\n" -H "Host: www.shuducw.com" "http://127.0.0.1/81d494eacc771fbdb6f8d6faa3f8238b.txt"
