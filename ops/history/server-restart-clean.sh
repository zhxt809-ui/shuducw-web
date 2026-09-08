#!/bin/bash
set -e
cd /var/www/shuducw-run

echo "=== stop & delete old process (clean env) ==="
pm2 delete shuducw 2>/dev/null || true
sleep 2

echo "=== start fresh (no stale env) ==="
pm2 start server.js --name shuducw --node-args="--max-old-space-size=384"
pm2 save
sleep 5

echo "=== pm2 status ==="
pm2 list 2>/dev/null | grep -E 'shuducw|online' || pm2 list

echo "=== process env COZE check ==="
pm2 jlist 2>/dev/null | python3 -c '
import json,sys
data=json.load(sys.stdin)
a=data[0] if data else {}
env=a.get("pm2_env",{}).get("env",{})
print("env COZE_PROJECT_DOMAIN_DEFAULT =", repr(env.get("COZE_PROJECT_DOMAIN_DEFAULT")))
'
echo "=== health ==="
curl -s http://127.0.0.1:3000/api/health || echo "health fail"
echo
echo "=== sitemap hosts (local) ==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed -E 's#https?://([^/]+).*#\1#' | sort -u
