#!/bin/bash
set -e
echo "=== 1. 解压旧 tarball 到临时目录 ==="
rm -rf /tmp/old-deploy && mkdir -p /tmp/old-deploy
tar -xzf /root/deploy-standalone.tar.gz -C /tmp/old-deploy 2>&1 | head -3 || echo "(旧包解压有警告，继续检查)"
echo "=== 2. 检查旧 node_modules 是否可用 ==="
ls /tmp/old-deploy/node_modules/ 2>/dev/null
if [ -f /tmp/old-deploy/node_modules/styled-jsx/package.json ]; then
  echo "styled-jsx OK: 真实目录"
elif [ -L /tmp/old-deploy/node_modules/styled-jsx ]; then
  echo "styled-jsx 是符号链接 -> $(readlink /tmp/old-deploy/node_modules/styled-jsx)"
else
  echo "styled-jsx 缺失/异常"
fi
echo "=== 3. 检查关键依赖 ==="
for p in next react react-dom; do
  if [ -d /tmp/old-deploy/node_modules/$p ]; then echo "$p: 存在"; else echo "$p: 缺失"; fi
done
ls /tmp/old-deploy/node_modules/.pnpm/ 2>/dev/null | wc -l
