#!/bin/bash
set -e
echo "===== 1. unattended-upgrades 安装状态 ====="
if dpkg -l unattended-upgrades 2>/dev/null | grep -q "^ii"; then
  echo "已安装"
else
  echo "未安装，正在安装..."
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq unattended-upgrades
fi
echo ""
echo "===== 2. 写入 20auto-upgrades（每日检查+自动安装） ====="
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
cat /etc/apt/apt.conf.d/20auto-upgrades
echo ""
echo "===== 3. 确认升级范围与重启策略（50unattended-upgrades 生效项） ====="
grep -E "^\s*(Unattended-Upgrade::Allowed-Origins|Unattended-Upgrade::Automatic-Reboot|Unattended-Upgrade::Remove-Unused)" /etc/apt/apt.conf.d/50unattended-upgrades 2>/dev/null | grep -v "^//" || echo "(使用默认：仅安全更新 jammy-security，不自动重启)"
echo ""
echo "===== 4. 启用并检查定时器 ====="
systemctl enable --now apt-daily.timer apt-daily-upgrade.timer 2>&1 | tail -2
echo "--- 定时器状态 ---"
systemctl is-active apt-daily-upgrade.timer
systemctl list-timers apt-daily\* --no-pager 2>/dev/null | head -4
echo ""
echo "===== 5. 干跑验证（模拟本次安全更新检查） ====="
unattended-upgrade --dry-run 2>&1 | tail -8 || true
echo ""
echo "===== 6. PM2 开机自启检查（防止重启后站点掉线） ====="
ls -la /root/.pm2/dump.pm2 2>/dev/null && echo "pm2 dump 存在（可 resurrect）" || echo "⚠️ pm2 dump 不存在"
pm2 startup 2>/dev/null | grep -E "systemd|already" | head -2 || true
systemctl is-enabled pm2-root 2>/dev/null || echo "pm2-root 服务未启用"
