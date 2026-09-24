#!/bin/bash
set -e
echo "===== 1. .env.production 追加 HOSTNAME/HOST（standalone 读 HOSTNAME） ====="
if grep -qE '^HOSTNAME=' /var/www/shuducw-run/.env.production; then
  echo "HOSTNAME 已存在"
else
  printf '\n# 绑定回环地址，防止 3000 端口暴露公网（2026-09-24 重启后回归修复）\nHOSTNAME=127.0.0.1\nHOST=127.0.0.1\n' >> /var/www/shuducw-run/.env.production
  echo "已追加 HOSTNAME/HOST"
fi
tail -4 /var/www/shuducw-run/.env.production | sed 's/=.*/=<已隐藏>/'
echo ""
echo "===== 2. PM2 进程环境固化 + 重启 ====="
export HOSTNAME=127.0.0.1 HOST=127.0.0.1
pm2 restart shuducw --update-env >/dev/null 2>&1
pm2 save >/dev/null 2>&1
sleep 6
echo "===== 3. 验证绑定地址（期望 127.0.0.1:3000） ====="
ss -tlnp | grep ':3000'
echo ""
echo "===== 4. 验证 dump 已固化 HOSTNAME ====="
grep -oE '"HOSTNAME": "[^"]*"' /root/.pm2/dump.pm2 | head -1
echo ""
echo "===== 5. 站点验证 ====="
curl -s -o /dev/null -w "app-3000: %{http_code}\n" http://127.0.0.1:3000/
curl -s -o /dev/null -w "https: %{http_code}\n" https://www.shuducw.com/
