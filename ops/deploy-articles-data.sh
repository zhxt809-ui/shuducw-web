#!/bin/bash
set -e
F=/var/www/shuducw-run/data/articles.json
cp "$F" /root/articles-backup-caseprofile-$(date +%Y%m%d-%H%M%S).json
python3 -c "import json; json.load(open('/root/articles.json', encoding='utf-8')); print('新文件 JSON 合法')"
cp /root/articles.json "$F"
chown www-data:www-data "$F" 2>/dev/null || chown pm2:pm2 "$F" 2>/dev/null || true
echo "已替换 articles.json"
ls -la "$F"
