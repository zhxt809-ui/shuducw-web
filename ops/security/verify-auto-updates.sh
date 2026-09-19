#!/bin/bash
echo "===== 升级源范围（生效的非注释行） ====="
awk -F'"' '/Allowed-Origins/,/;/' /etc/apt/apt.conf.d/50unattended-upgrades | grep '"' | grep -vE '^\s*//' | head -8
echo ""
echo "===== 自动重启策略 ====="
grep -E "Automatic-Reboot" /etc/apt/apt.conf.d/50unattended-upgrades | grep -vE '^\s*//' | head -3
echo "(空 = 默认不自动重启)"
echo ""
echo "===== 干跑验证（此时应无锁） ====="
sleep 2
unattended-upgrade --dry-run 2>&1 | tail -6
echo "exit: $?"
