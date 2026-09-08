#!/bin/bash
set -e
echo "========== 1. 替换 nginx 配置（含备份） =========="
cp /etc/nginx/sites-available/shuducw /etc/nginx/sites-available/shuducw.bak-$(date +%Y%m%d%H%M%S)
cp /root/nginx-shuducw.conf /etc/nginx/sites-available/shuducw
echo "已备份并替换，nginx -t 测试："
nginx -t

echo "========== 2. 文件权限修复 =========="
chown -R root:root /var/www/shuducw-run 2>/dev/null || true
chmod 755 /var/www/shuducw-run
chmod 600 /var/www/shuducw-run/.env.production
chmod 600 /var/www/shuducw-run/data/*.json 2>/dev/null || true
chmod 755 /var/www/shuducw-run/data 2>/dev/null || true
echo "修复后权限："
stat -c '%a %U:%G %n' /var/www/shuducw-run /var/www/shuducw-run/.env.production /var/www/shuducw-run/data /var/www/shuducw-run/data/articles.json

echo "========== 3. 重载 nginx =========="
systemctl reload nginx
echo "nginx reloaded"

echo "========== 4. PM2 绑定 127.0.0.1（防御纵深） =========="
pm2 stop shuducw >/dev/null 2>&1 || true
HOSTNAME=127.0.0.1 pm2 restart shuducw --update-env >/dev/null 2>&1 || true
sleep 4
echo "--- 监听状态（3000 应只绑 127.0.0.1） ---"
ss -tlnp 2>/dev/null | grep ':3000\s' || echo "3000 未监听！"
pm2 save >/dev/null 2>&1 || true
echo "pm2 saved"

echo "========== 5. 加固后验证 =========="
echo "--- 站点经 nginx 访问（应 200） ---"
curl -s -o /dev/null -w "https://www.shuducw.com -> %{http_code}\n" https://www.shuducw.com/
echo "--- 响应头 ---"
curl -s -D - -o /dev/null https://www.shuducw.com/ | grep -iE '^(strict-transport|server:|x-powered|permissions-policy|x-frame)' || echo "(未找到相关头)"
echo "--- 本机直连 3000（应 200，来自 nginx 的代理是 127.0.0.1） ---"
curl -s -o /dev/null -w "http://127.0.0.1:3000/ -> %{http_code}\n" http://127.0.0.1:3000/
echo "--- API 鉴权回归 ---"
curl -s -o /dev/null -w "GET /api/articles (无token) -> %{http_code} (应401)\n" https://www.shuducw.com/api/articles
curl -s -o /dev/null -w "GET /api/articles?is_published=true -> %{http_code} (应200)\n" "https://www.shuducw.com/api/articles?is_published=true"
echo "--- 管理登录接口限流验证（连发8次错误密码，应出现503） ---"
for i in $(seq 1 8); do
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "x-admin-token: wrongpass$i" https://www.shuducw.com/api/auth/check)
  echo "第${i}次 -> $code"
done
echo "========== 加固完成 =========="
