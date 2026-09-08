#!/bin/bash
pm2 restart shuducw 2>&1 | head -3
sleep 6
echo "=== pm2 status ==="
pm2 status shuducw 2>/dev/null | grep -E "online|errored|stopped|status" | head -3
echo "=== 错误日志 (最近10行) ==="
tail -10 /root/.pm2/logs/shuducw-error.log 2>/dev/null
echo "=== 端口3000 ==="
ss -tlnp 2>/dev/null | grep 3000 || echo "3000 未监听"
echo "=== 首页 ==="
curl -s -o /dev/null -w "home: %{http_code}\n" http://127.0.0.1:3000/
