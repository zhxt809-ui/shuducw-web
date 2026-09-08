#!/bin/bash
echo "=== confirm file on server ==="
ls -la /var/www/shuducw-run/public/81d494eacc771fbdb6f8d6faa3f8238b.txt
echo "=== restart (new public file needs process restart) ==="
pm2 restart shuducw >/dev/null 2>&1
sleep 5
echo "=== test at root (via node) ==="
curl -s -o /dev/null -w "root: %{http_code}\n" http://127.0.0.1:3000/81d494eacc771fbdb6f8d6faa3f8238b.txt
curl -s http://127.0.0.1:3000/81d494eacc771fbdb6f8d6faa3f8238b.txt
echo
echo "=== test via nginx https ==="
curl -sk -o /dev/null -w "https: %{http_code}\n" -H "Host: www.shuducw.com" https://127.0.0.1/81d494eacc771fbdb6f8d6faa3f8238b.txt
echo "=== health ==="
curl -s http://127.0.0.1:3000/api/health
echo
