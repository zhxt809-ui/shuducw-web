#!/bin/bash
echo "===== 重启后恢复验证 ====="
uptime
echo ""
echo "===== 站点 ====="
curl -s -o /dev/null -w "home: %{http_code}\n" https://www.shuducw.com/
echo ""
echo "===== 服务状态 ====="
pm2 status shuducw 2>/dev/null | grep -E "online|errored"
systemctl is-active nginx fail2ban ufw ssh
echo ""
echo "===== 待重启标记（应为空/不存在） ====="
ls /var/run/reboot-required 2>/dev/null && echo "STILL PRESENT" || echo "已清除 ✅"
echo ""
echo "===== 最近登录/启动日志 ====="
last reboot | head -3
