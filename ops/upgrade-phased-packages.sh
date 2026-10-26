#!/bin/bash
# 强制安装被"分阶段推送(phased)"保留的包（2026-10-23）。
# 注意：cloud-init 是被人为 hold 的，本脚本不动它（大版本 23→26 跳变 + 阿里云启动依赖，需单独评估）。
set -u
export DEBIAN_FRONTEND=noninteractive

echo "=== 强制安装 phased 包 ==="
apt-get install -y --only-upgrade snapd tmux ubuntu-advantage-tools \
  -o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold 2>&1 | tail -10

echo "=== 升级后仍保留的包（应只剩 cloud-init 相关）==="
apt list --upgradable 2>/dev/null | grep upgradable || echo "无"

echo "=== hold 状态（cloud-init 应仍被 hold）==="
apt-mark showhold
