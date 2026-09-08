#!/bin/bash
echo "=== nginx sites ==="
ls -la /etc/nginx/sites-enabled/ 2>/dev/null
echo "=== shuducw conf ==="
cat /etc/nginx/sites-available/shuducw 2>/dev/null || cat /etc/nginx/sites-enabled/*shuducw* 2>/dev/null || find /etc/nginx -name '*shuducw*' -exec cat {} \;
echo "=== default conf ==="
cat /etc/nginx/sites-enabled/default 2>/dev/null | head -40
