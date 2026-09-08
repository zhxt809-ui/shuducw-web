#!/bin/bash
echo "=== 1. 从 .pnpm 重建缺失的顶层符号链接 ==="
python3 - <<'EOF'
import os, glob
nm = '/var/www/shuducw-run/node_modules'
count = 0
for d in sorted(glob.glob(nm + '/.pnpm/*/node_modules/*')):
    if not os.path.isdir(d):
        continue
    name = os.path.relpath(d, nm)
    target = os.path.join(nm, name)
    if not os.path.exists(target):
        rel = os.path.relpath(d, nm)
        os.symlink(rel, target)
        print('linked:', name, '->', rel)
        count += 1
print('total linked:', count)
EOF
echo "=== 2. styled-jsx 验证 ==="
ls -la /var/www/shuducw-run/node_modules/styled-jsx/package.json 2>&1 | head -2
echo "=== 3. 直接启动测试 (8s) ==="
cd /var/www/shuducw-run && timeout 8 node server.js 2>&1 | head -12
echo "=== 4. 重启 pm2 ==="
pm2 restart shuducw >/dev/null 2>&1
sleep 5
pm2 status shuducw 2>/dev/null | grep -E "online|errored"
curl -s -o /dev/null -w "home: %{http_code}\n" http://127.0.0.1:3000/
