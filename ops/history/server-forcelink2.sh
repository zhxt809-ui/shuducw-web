#!/bin/bash
cd /var/www/shuducw-run/node_modules
echo "=== 重建顶层符号链接（修正版）==="
python3 - <<'EOF'
import os, glob
nm = os.getcwd()
created = 0
seen = set()
for d in sorted(glob.glob(nm + '/.pnpm/*/node_modules/*')):
    if not os.path.isdir(d):
        continue
    name = d.split('/node_modules/')[-1]   # 包路径（含 @scope/name）
    if name in seen:
        continue
    seen.add(name)
    target = os.path.join(nm, name)
    if os.path.exists(target) or os.path.islink(target):
        continue
    rel = os.path.relpath(d, nm)
    os.symlink(rel, target)
    print('linked:', name, '->', rel)
    created += 1
print('created:', created)
EOF
echo "=== 校验顶层结构 ==="
ls -la /var/www/shuducw-run/node_modules/ | grep -E "styled-jsx|@next|@swc|client-only|^l" | head -12
echo "=== styled-jsx package.json ==="
test -f /var/www/shuducw-run/node_modules/styled-jsx/package.json && echo "OK" || echo "MISSING"
echo "=== 直接启动测试 (10s) ==="
cd /var/www/shuducw-run && timeout 10 node server.js 2>&1 | head -8
echo "test done"
