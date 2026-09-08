#!/bin/bash
cd /var/www/shuducw-run/node_modules
echo "=== 1. 调试 glob ==="
python3 - <<'EOF'
import os, glob
nm = os.getcwd()
matches = glob.glob(nm + '/.pnpm/*/node_modules/*')
print('glob matches:', len(matches))
for d in matches:
    print('  ', os.path.relpath(d, nm), '| isdir=', os.path.isdir(d), '| exists_at_top=', os.path.exists(os.path.join(nm, os.path.relpath(d, nm))))
EOF
echo "=== 2. 强制重建顶层符号链接 ==="
python3 - <<'EOF'
import os, glob
nm = os.getcwd()
created = 0
for d in sorted(glob.glob(nm + '/.pnpm/*/node_modules/*')):
    if not os.path.isdir(d):
        continue
    name = os.path.relpath(d, nm)
    target = os.path.join(nm, name)
    if os.path.exists(target) or os.path.islink(target):
        continue
    rel = os.path.relpath(d, nm)
    os.symlink(rel, target)
    print('linked:', name, '->', rel)
    created += 1
print('created:', created)
EOF
echo "=== 3. 校验 styled-jsx ==="
ls -la styled-jsx/ 2>&1 | head -3
test -f styled-jsx/package.json && echo "styled-jsx package.json OK"
echo "=== 4. 直接启动测试 (10s) ==="
cd /var/www/shuducw-run && timeout 10 node server.js 2>&1 | head -8
echo "test done"
