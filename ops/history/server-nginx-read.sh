#!/bin/bash
echo "=== ls -la sites-enabled ==="
ls -la /etc/nginx/sites-enabled/
echo "=== cat sites-enabled/shuducw ==="
cat /etc/nginx/sites-enabled/shuducw 2>/dev/null | head -120
echo "=== cat conf.d/ratelimit.conf ==="
cat /etc/nginx/conf.d/ratelimit.conf 2>/dev/null | head -30
echo "=== nginx -t ==="
nginx -t 2>&1 | head -5
