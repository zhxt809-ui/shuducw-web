#!/bin/bash
echo "=== pm2 error log (tail 60) ==="
tail -60 /root/.pm2/logs/shuducw-error.log 2>/dev/null || echo "no error log"
echo "=== process stability ==="
ps -o pid,etime,cmd -p $(pgrep -f 'server.js' | head -1) 2>/dev/null || echo "no process match"
echo "=== restarts since boot ==="
pm2 jlist 2>/dev/null | python3 -c "import json,sys; a=json.load(sys.stdin)[0]; e=a['pm2_env']; print('restarts:', e.get('restart_time'), '| uptime ms:', e.get('pm_uptime'), '| status:', e.get('status'))" 2>/dev/null || true
