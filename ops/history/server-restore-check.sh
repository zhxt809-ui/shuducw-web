#!/bin/bash
echo "=== /root 下旧 tarball ==="
ls -la /root/*.tar.gz /root/*.tgz 2>/dev/null
echo "=== 当前 node_modules 符号链接状态 ==="
ls -la /var/www/shuducw-run/node_modules/ 2>/dev/null
echo "=== .pnpm 是否完好 ==="
ls /var/www/shuducw-run/node_modules/.pnpm/ 2>/dev/null | head -10
echo "=== styled-jsx 具体状态 ==="
ls -la /var/www/shuducw-run/node_modules/styled-jsx 2>/dev/null
file /var/www/shuducw-run/node_modules/styled-jsx 2>/dev/null
