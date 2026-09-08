#!/bin/bash
echo "=== 1. tar 顶层结构 ==="
tar -tzf /root/deploy-new.tar.gz | awk -F/ 'NF<=2 {print $1}' | sort -u
echo "=== 2. 当前运行目录 ==="
ls -la /var/www/shuducw-run/
echo "=== 3. .next 存在性 ==="
ls /var/www/shuducw-run/.next/ 2>&1 | head -5
echo "=== 4. pm2 日志（最近错误）==="
pm2 logs shuducw --lines 20 --nostream 2>/dev/null | tail -25
echo "=== 5. node server.js 直接启动测试 ==="
cd /var/www/shuducw-run && timeout 8 node server.js 2>&1 | head -20
