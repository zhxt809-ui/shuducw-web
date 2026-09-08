#!/bin/bash
echo "=== actual slugs in data file ==="
python3 -c "
import json
arts = json.load(open('/var/www/shuducw-run/data/articles.json'))
for a in arts:
    print(a['id'], '|', a['slug'], '|', a['title'][:25])
"
echo "=== DATA_DIR in running process ==="
ps aux | grep -E 'next-server|server.js' | grep -v grep | head -2
echo "=== env DATA_DIR ==="
pm2 env 0 2>/dev/null | grep -i DATA_DIR || cat /var/www/shuducw-run/.env.production | grep -i DATA_DIR
