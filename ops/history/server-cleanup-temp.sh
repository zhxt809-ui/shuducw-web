#!/bin/bash
echo "=== 清理服务器临时目录 ==="
du -sh /tmp/old-deploy /tmp/deploy-stage 2>/dev/null
rm -rf /tmp/old-deploy /tmp/deploy-stage
echo "已清理"
echo "=== 确认 /root/standalone-symlink-fix.sh 就位 ==="
ls -la /root/standalone-symlink-fix.sh 2>/dev/null
echo "=== 最终站点状态 ==="
pm2 status shuducw 2>/dev/null | grep -E "online|errored"
curl -s -o /dev/null -w "home: %{http_code}\n" http://127.0.0.1:3000/
curl -s -o /dev/null -w "external https: %{http_code}\n" --max-time 15 https://www.shuducw.com/
echo "=== 磁盘 ==="
df -h / | tail -1
