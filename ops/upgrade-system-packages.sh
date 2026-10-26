#!/bin/bash
# 系统包升级（2026-10-23）：仅升级现有包，不新装/不删除；配置文件冲突时保留现有版本。
set -u
export DEBIAN_FRONTEND=noninteractive

echo "=== 1. 升级前 ==="
apt list --upgradable 2>/dev/null | grep -c upgradable || true

echo "=== 2. apt-get update ==="
apt-get update -q 2>&1 | tail -3

echo "=== 3. apt-get upgrade（保留现有配置）==="
apt-get upgrade -y -o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold 2>&1 | tail -12

echo "=== 4. 升级后仍可升级的包 ==="
apt list --upgradable 2>/dev/null | grep -c upgradable || true

echo "=== 5. 是否需要重启 ==="
if [ -f /var/run/reboot-required ]; then cat /var/run/reboot-required; else echo "无需重启"; fi
