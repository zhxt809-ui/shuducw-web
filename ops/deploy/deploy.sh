#!/bin/bash
set -e
echo "=== 1. 校验 tarball ==="
gzip -t /root/deploy-new.tar.gz && echo "gzip OK"
echo "=== 2. 解压到临时目录 ==="
rm -rf /tmp/deploy-stage && mkdir -p /tmp/deploy-stage
tar -xzf /root/deploy-new.tar.gz -C /tmp/deploy-stage
echo "=== 3. 原子替换（保留 data/.env.production/package.json/scripts）==="
cd /var/www/shuducw-run
rm -rf .next node_modules
mv /tmp/deploy-stage/.next .next
mv /tmp/deploy-stage/node_modules node_modules
cp /tmp/deploy-stage/server.js server.js
cp -r /tmp/deploy-stage/public/. public/
rm -rf /tmp/deploy-stage
echo "=== 4. standalone 符号链接修复（关键步骤，2026-09-06 事故教训）==="
python3 - <<'EOF'
import os, glob
nm = '/var/www/shuducw-run/node_modules'
created = 0
seen = set()
for d in sorted(glob.glob(nm + '/.pnpm/*/node_modules/*')):
    if not os.path.isdir(d):
        continue
    name = d.split('/node_modules/')[-1]
    if name in seen:
        continue
    seen.add(name)
    target = os.path.join(nm, name)
    if os.path.exists(target) or os.path.islink(target):
        continue
    os.symlink(os.path.relpath(d, nm), target)
    print('linked:', name)
    created += 1
print('symlinks created:', created)
EOF
test -f /var/www/shuducw-run/node_modules/styled-jsx/package.json && echo "styled-jsx OK" || { echo "styled-jsx MISSING - 中止"; exit 1; }
echo "=== 5. 重启 ==="
pm2 restart shuducw >/dev/null 2>&1
sleep 6
pm2 status shuducw 2>/dev/null | grep -E "online|errored"
curl -s -o /dev/null -w "home: %{http_code}\n" http://127.0.0.1:3000/
