#!/bin/bash
rm -f /root/shuducw-deploy.tar.gz
echo "=== final state ==="
curl -s http://127.0.0.1:3000/api/health
echo
pm2 jlist 2>/dev/null | python3 -c "import json,sys; a=json.load(sys.stdin)[0]; e=a['pm2_env']; print('status:', e.get('status'), '| restarts:', e.get('restart_time'))"
echo "=== data count ==="
python3 -c "import json; print('articles:', len(json.load(open('/var/www/shuducw-run/data/articles.json'))))"
