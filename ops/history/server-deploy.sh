#!/bin/bash
set -e
APP=/var/www/shuducw-run
TS=/root/shuducw-deploy.tar.gz

echo "=== backup critical (data + env) ==="
mkdir -p /var/www/backup-precanon
rm -rf /var/www/backup-precanon/data
cp -r "$APP/data" /var/www/backup-precanon/data
cp "$APP/.env.production" /var/www/backup-precanon/.env.production
echo "backed up: $(ls /var/www/backup-precanon)"

echo "=== clean old .next (keep node_modules/data/.env/public) ==="
rm -rf "$APP/.next"

echo "=== extract new build ==="
cd "$APP"
tar -xzf "$TS"
echo "extracted"

echo "=== verify styled-jsx in kept node_modules ==="
ls node_modules/styled-jsx/package.json >/dev/null && echo "styled-jsx OK" || echo "styled-jsx MISSING"

echo "=== clear cache (fresh ISR) ==="
rm -rf "$APP/.next/cache"

echo "=== restart pm2 ==="
pm2 restart shuducw --update-env >/dev/null 2>&1 || pm2 restart shuducw >/dev/null
sleep 6
pm2 list 2>/dev/null | grep -E 'shuducw' || true

echo "=== health ==="
curl -s http://127.0.0.1:3000/api/health
echo
echo "=== canonical checks ==="
echo "home: $(curl -s http://127.0.0.1:3000/ | grep -o '<link rel=\"canonical\" href=\"[^\"]*\"' | head -1)"
echo "article: $(curl -s http://127.0.0.1:3000/news/xian-kaigongsi-leixing-duibi-2026 | grep -o '<link rel=\"canonical\" href=\"[^\"]*\"' | head -1)"
echo "faq: $(curl -s http://127.0.0.1:3000/faq | grep -o '<link rel=\"canonical\" href=\"[^\"]*\"' | head -1)"
echo "=== sitemap host check ==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -o '<loc>[^<]*</loc>' | head -2
