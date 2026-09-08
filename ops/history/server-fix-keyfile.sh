#!/bin/bash
echo "=== process user ==="
ps -o user,pid,cmd -p $(pgrep -f 'next-server' | head -1) 2>/dev/null | head -2 || ps aux | grep -E 'node.*server' | grep -v grep | head -2
echo "=== chmod key file to 666 (match others) ==="
chmod 666 /var/www/shuducw-run/public/9c615d0ffcf44fd4a1c860a302b08850.txt
ls -la /var/www/shuducw-run/public/9c615d0ffcf44fd4a1c860a302b08850.txt
echo "=== restart pm2 ==="
pm2 restart shuducw >/dev/null 2>&1
sleep 5
echo "=== retest key at root ==="
curl -s -o /dev/null -w "key(root) after restart: %{http_code}\n" http://127.0.0.1:3000/9c615d0ffcf44fd4a1c860a302b08850.txt
curl -s http://127.0.0.1:3000/9c615d0ffcf44fd4a1c860a302b08850.txt
echo
echo "=== health after restart ==="
curl -s http://127.0.0.1:3000/api/health
echo
