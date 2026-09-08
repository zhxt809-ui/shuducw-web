#!/bin/bash
echo "========== 1. DNS 记录枚举 =========="
for sub in shuducw.com www.shuducw.com m.shuducw.com app.shuducw.com api.shuducw.com blog.shuducw.com admin.shuducw.com mail.shuducw.com test.shuducw.com vpn.shuducw.com; do
  r=$(dig +short "$sub" A 2>/dev/null | head -3 | tr '\n' ' ')
  echo "$sub -> ${r:-无记录}"
done
echo "--- NS ---"
dig +short shuducw.com NS 2>/dev/null | tr '\n' ' '; echo
echo "--- MX ---"
dig +short shuducw.com MX 2>/dev/null | tr '\n' ' '; echo
echo "--- TXT ---"
dig +short shuducw.com TXT 2>/dev/null | tr '\n' ' '; echo
echo "--- 泛解析检查 (*.shuducw.com) ---"
dig +short "random-audit-check-20260905.shuducw.com" A 2>/dev/null | tr '\n' ' '; echo
echo "========== 2. nginx 未知 Host → 444 验证 =========="
curl -s -o /dev/null -w "random.shuducw.com: %{http_code}\n" -H "Host: random-audit-check-20260905.shuducw.com" https://127.0.0.1/ -k
curl -s -o /dev/null -w "IP direct: %{http_code}\n" https://127.0.0.1/ -k
curl -s -o /dev/null -w "www.shuducw.com: %{http_code}\n" -H "Host: www.shuducw.com" https://127.0.0.1/ -k
echo "========== 3. 服务器安全基线 =========="
echo "--- ufw ---"
ufw status 2>/dev/null | head -15 || echo "ufw not installed"
echo "--- fail2ban ---"
systemctl is-active fail2ban 2>/dev/null || echo "fail2ban not active"
echo "--- sshd 配置关键项 ---"
grep -E '^(PermitRootLogin|PasswordAuthentication|PubkeyAuthentication|Port) ' /etc/ssh/sshd_config 2>/dev/null || echo "sshd_config 未读取到"
echo "--- 可疑进程 ---"
ps aux --sort=-%cpu 2>/dev/null | head -12 | awk '{printf "%s %s %s %s %s\n", $1,$2,$3,$4,$11}'
echo "--- 监听端口 ---"
ss -tlnp 2>/dev/null | awk 'NR==1 || $4 ~ /:(22|80|443|3000|5000|8080|8888|3306|6379)\b/' | head -15
echo "--- 最近登录 ---"
last -10 2>/dev/null | head -12 || echo "last unavailable"
echo "--- 可疑文件（/tmp /dev/shm）---"
ls -la /tmp 2>/dev/null | head -8
ls -la /dev/shm 2>/dev/null | head -8
