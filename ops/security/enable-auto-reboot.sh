#!/bin/bash
set -e
echo "===== 1. 启用自动重启（04:30） ====="
python3 <<'EOF'
import re
p = '/etc/apt/apt.conf.d/50unattended-upgrades'
s = open(p, encoding='utf-8').read()
s2, n1 = re.subn(r'^//\s*Unattended-Upgrade::Automatic-Reboot\s+"false";', 'Unattended-Upgrade::Automatic-Reboot "true";', s, flags=re.M)
s2, n2 = re.subn(r'^//\s*Unattended-Upgrade::Automatic-Reboot-Time\s+"[^"]*";', 'Unattended-Upgrade::Automatic-Reboot-Time "04:30";', s2, flags=re.M)
open(p, 'w', encoding='utf-8').write(s2)
print(f'reboot line: {"set" if n1 else "WARN: pattern not found"}')
print(f'reboot-time line: {"set" if n2 else "WARN: pattern not found"}')
EOF
echo ""
echo "===== 2. 确认生效配置 ====="
grep -E "Automatic-Reboot" /etc/apt/apt.conf.d/50unattended-upgrades | grep -vE '^\s*//' | head -3
echo ""
echo "===== 3. 配置语法验证（dry-run，不安装不重启） ====="
unattended-upgrade --dry-run 2>&1 | tail -3
echo "dry-run exit: $?"
echo ""
echo "===== 4. 当前是否有待重启标记 ====="
ls /var/run/reboot-required 2>/dev/null && cat /var/run/reboot-required 2>/dev/null || echo "无待重启标记（正常）"
echo ""
echo "===== 5. 重启后服务自启确认 ====="
for svc in nginx pm2-root fail2ban ufw ssh; do
  st=$(systemctl is-enabled $svc 2>/dev/null)
  echo "$svc: $st"
done
echo ""
echo "===== 6. 站点在线 ====="
curl -s -o /dev/null -w "home: %{http_code}\n" https://www.shuducw.com/
