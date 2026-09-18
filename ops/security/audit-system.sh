#!/bin/bash
echo "########## 1. 系统信息 ##########"
cat /etc/os-release | grep PRETTY_NAME
uptime
echo ""
echo "########## 2. 监听端口（ss -tlnp） ##########"
ss -tlnp
echo ""
echo "########## 3. UFW 防火墙 ##########"
ufw status verbose 2>/dev/null || echo "ufw not available"
echo ""
echo "########## 4. fail2ban ##########"
fail2ban-client status 2>/dev/null | head -20
echo "--- sshd jail ---"
fail2ban-client status sshd 2>/dev/null | head -20
echo ""
echo "########## 5. SSH 配置 ##########"
grep -E "^(Port|PermitRootLogin|PasswordAuthentication|PubkeyAuthentication|MaxAuthTries|AllowUsers|PermitEmptyPasswords|Protocol)" /etc/ssh/sshd_config 2>/dev/null
echo "--- conf.d ---"
grep -rhE "^(Port|PermitRootLogin|PasswordAuthentication|PubkeyAuthentication|MaxAuthTries|AllowUsers)" /etc/ssh/sshd_config.d/ 2>/dev/null
echo ""
echo "########## 6. 可登录用户 ##########"
grep -E "/(bin/)?(ba)?sh$" /etc/passwd
echo "--- sudo 组成员 ---"
getent group sudo 2>/dev/null || getent group wheel 2>/dev/null
echo ""
echo "########## 7. 待更新软件包 ##########"
apt list --upgradable 2>/dev/null | grep -c upgradable || echo "0"
echo ""
echo "########## 8. 定时任务 ##########"
crontab -l 2>/dev/null | grep -v "^#" | grep -v "^$"
ls /etc/cron.d/ 2>/dev/null
echo ""
echo "########## 9. 磁盘与内存 ##########"
df -h / | tail -1
free -m | head -2
echo ""
echo "########## 10. PM2 绑定 ##########"
pm2 list 2>/dev/null | grep -E "shuducw|online|errored"
ss -tlnp | grep 3000
echo ""
echo "########## 11. Web 目录权限（world-writable 检查） ##########"
find /var/www -type f -perm -o+w 2>/dev/null | head -10
find /var/www -type d -perm -o+w 2>/dev/null | head -10
echo "(空 = 无 world-writable)"
echo ""
echo "########## 12. 最近 SSH 失败登录 ##########"
grep "Failed password" /var/log/auth.log 2>/dev/null | tail -5
echo ""
echo "########## 13. Nginx 版本与配置 ##########"
nginx -v 2>&1
grep -rE "server_tokens|autoindex" /etc/nginx/nginx.conf /etc/nginx/conf.d/ /etc/nginx/sites-enabled/ 2>/dev/null
