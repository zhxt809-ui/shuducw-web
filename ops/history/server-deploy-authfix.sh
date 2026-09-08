#!/bin/bash
set -e
echo "=== 1. 校验 tarball ==="
gzip -t /root/deploy-new.tar.gz && echo "gzip 完整"
echo "=== 2. 解压到临时目录 ==="
rm -rf /tmp/deploy-stage && mkdir -p /tmp/deploy-stage
tar -xzf /root/deploy-new.tar.gz -C /tmp/deploy-stage
ls /tmp/deploy-stage
echo "=== 3. 原子替换（保留 data/.env.production/package.json/scripts）==="
cd /var/www/shuducw-run
rm -rf .next node_modules
mv /tmp/deploy-stage/.next .next
mv /tmp/deploy-stage/node_modules node_modules
cp /tmp/deploy-stage/server.js server.js
cp -r /tmp/deploy-stage/public/. public/
rm -rf /tmp/deploy-stage
echo "=== 4. 重启 ==="
pm2 restart shuducw >/dev/null 2>&1
sleep 6
pm2 status shuducw 2>/dev/null | grep -E "online|errored|stopped" || echo "pm2 status 读取失败"
echo "=== 5. 基础可达性 ==="
curl -s -o /dev/null -w "home: %{http_code}\n" http://127.0.0.1:3000/
curl -s -o /dev/null -w "admin: %{http_code}\n" http://127.0.0.1:3000/admin
