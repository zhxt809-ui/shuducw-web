#!/bin/bash
# cleanup deploy temp + final health confirmation
rm -f /root/shuducw-deploy.tar.gz
echo "=== final health ==="
curl -s http://127.0.0.1:3000/api/health
echo
echo "=== process stable (no recent crash) ==="
pm2 jlist 2>/dev/null | python3 -c "
import json,sys
a=json.load(sys.stdin)[0]; e=a['pm2_env']
print('status:', e.get('status'), '| restarts:', e.get('restart_time'))
"
echo "=== data intact ==="
ls /var/www/shuducw-run/data/
echo "=== backup dir ==="
ls /var/www/backup-precanon/ 2>/dev/null
echo "=== last crash in error log? ==="
grep -c 'MODULE_NOT_FOUND' /root/.pm2/logs/shuducw-error.log 2>/dev/null || echo 0
echo "=== recent successful boots (should be few) ==="
grep -c 'Ready in' /root/.pm2/logs/shuducw-out.log 2>/dev/null || echo 0
