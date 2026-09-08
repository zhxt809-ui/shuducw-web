#!/bin/bash
echo "=== server public/ listing ==="
ls -la /var/www/shuducw-run/public/
echo "=== files modified today ==="
find /var/www/shuducw-run/public -type f -newermt "2026-09-04" 2>/dev/null
echo "=== check for 360-style verify files at web root ==="
curl -s -o /dev/null -w "robots: %{http_code}\n" http://127.0.0.1:3000/robots.txt
