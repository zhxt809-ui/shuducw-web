#!/bin/bash
# ============================================================
# 修复 Windows tar 解压后 standalone node_modules 缺失的顶层符号链接
# 背景：Next standalone + pnpm 的 node_modules 用 .pnpm 虚拟存储 + 顶层符号链接。
#       Windows bsdtar 无法忠实保存这些符号链接，在 Linux 解压后
#       styled-jsx/@next/env 等顶层链接缺失，导致 "Cannot find module 'styled-jsx/package.json'"。
# 用法：部署解压后、pm2 restart 前执行本脚本（幂等，可重复运行）。
# 2026-09-06 记录（首次因缺此步骤导致线上宕机）
# ============================================================
cd /var/www/shuducw-run/node_modules || { echo "node_modules 不存在"; exit 1; }
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
    os.symlink(os.path.relpath(d, nm), target)
    print('linked:', name)
    created += 1
print('created:', created)
EOF
echo "=== 校验关键依赖 ==="
for p in styled-jsx next react react-dom; do
  if [ -e "$p/package.json" ]; then echo "$p: OK"; else echo "$p: 缺失!"; fi
done
