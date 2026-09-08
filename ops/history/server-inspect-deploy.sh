#!/bin/bash
echo "=== 目录结构 ==="
ls -la /var/www/shuducw-run/ | head -20
echo "=== node_modules 存在？ ==="
ls /var/www/shuducw-run/node_modules 2>/dev/null | head -3; echo "count: $(ls /var/www/shuducw-run/node_modules 2>/dev/null | wc -l)"
echo "=== server.js ==="
ls -la /var/www/shuducw-run/server.js 2>/dev/null
echo "=== .next/standalone 结构 ==="
ls /var/www/shuducw-run/.next/ 2>/dev/null | head -10
echo "=== pm2 启动命令 ==="
pm2 describe shuducw 2>/dev/null | grep -E "script|exec cwd|interpreter|status" | head -8
