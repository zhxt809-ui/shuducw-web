#!/bin/bash
echo "=== 1. 旧部署 node_modules 结构 ==="
ls -la /tmp/old-deploy/node_modules/ 2>/dev/null | head -10
echo "--- 旧包 .pnpm 里 styled-jsx? ---"
ls -d /tmp/old-deploy/node_modules/.pnpm/*styled* 2>/dev/null
echo "--- 旧包 styled-jsx 实体 package.json ---"
ls /tmp/old-deploy/node_modules/.pnpm/styled-jsx*/node_modules/styled-jsx/package.json 2>/dev/null
echo "=== 2. 当前服务器 .pnpm styled-jsx ==="
ls -d /var/www/shuducw-run/node_modules/.pnpm/*styled* 2>/dev/null
ls /var/www/shuducw-run/node_modules/.pnpm/styled-jsx*/node_modules/styled-jsx/package.json 2>/dev/null
echo "=== 3. require-hook.js 解析逻辑 (行 30-45) ==="
sed -n '25,50p' /var/www/shuducw-run/node_modules/next/dist/server/require-hook.js
echo "=== 4. 旧部署直接启动测试 (10s) ==="
cd /tmp/old-deploy && timeout 10 node server.js 2>&1 | head -10
echo "exit test done"
