#!/bin/bash
# 数度网站全量安全审查（2026-09-07 运行）
echo "=================== 1. DNS 枚举 ==================="
for sub in shuducw.com www.shuducw.com m.shuducw.com app.shuducw.com api.shuducw.com blog.shuducw.com admin.shuducw.com mail.shuducw.com test.shuducw.com vpn.shuducw.com shop.shuducw.com; do
  r=$(dig +short "$sub" A 2>/dev/null | head -3 | tr '\n' ' ')
  echo "$sub -> ${r:-无记录}"
done
echo "--- 泛解析探测 (random-$(date +%s).shuducw.com) ---"
dig +short "audit-$(date +%s).shuducw.com" A 2>/dev/null | tr '\n' ' '; echo "(空=无泛解析)"
echo "--- NS / MX / TXT ---"
dig +short shuducw.com NS | tr '\n' ' '; echo
dig +short shuducw.com MX | tr '\n' ' '; echo
dig +short shuducw.com TXT | tr '\n' ' '; echo

echo "=================== 2. 未知 Host / IP 直连 → 444 验证 ==================="
curl -s -o /dev/null -w "random.shuducw.com: %{http_code}\n" -H "Host: audit-$(date +%s).shuducw.com" https://127.0.0.1/ -k
curl -s -o /dev/null -w "IP direct 443: %{http_code}\n" https://127.0.0.1/ -k
curl -s -o /dev/null -w "IP direct 80: %{http_code}\n" http://127.0.0.1/ -k
curl -s -o /dev/null -w "www.shuducw.com: %{http_code}\n" -H "Host: www.shuducw.com" https://127.0.0.1/ -k
curl -s -o /dev/null -w "裸域重定向: %{http_code}\n" -H "Host: shuducw.com" https://127.0.0.1/ -k

echo "=================== 3. 服务器安全基线 ==================="
echo "--- ufw ---"; ufw status 2>/dev/null | head -15 || echo "ufw not installed"
echo "--- fail2ban ---"; systemctl is-active fail2ban 2>/dev/null || echo "fail2ban not active"
echo "--- sshd 关键配置 ---"
grep -E '^(PermitRootLogin|PasswordAuthentication|PubkeyAuthentication|Port|PermitEmptyPasswords) ' /etc/ssh/sshd_config 2>/dev/null || echo "无法读取"
echo "--- 高占用进程 Top8 ---"; ps aux --sort=-%cpu 2>/dev/null | head -9 | awk '{printf "%s %s %s %s %s\n",$1,$2,$3,$4,$11}'
echo "--- 监听端口（重点:3000是否对外） ---"
ss -tlnp 2>/dev/null | grep -E ':(22|80|443|3000|5000|8080|8888|3306|6379|9090)\s' | head -20
echo "--- 最近登录 ---"; last -8 2>/dev/null | head -10 || echo n/a
echo "--- /tmp /dev/shm 可疑文件 ---"
ls -la /tmp 2>/dev/null | head -6
ls -la /dev/shm 2>/dev/null | head -6

echo "=================== 4. Web 应用鉴权与暴露面 ==================="
echo "--- API articles 无 token（应401） ---"
curl -s -o /dev/null -w "GET /api/articles (无参): %{http_code}\n" https://www.shuducw.com/api/articles
curl -s -o /dev/null -w "GET /api/articles?is_published=true: %{http_code}\n" "https://www.shuducw.com/api/articles?is_published=true"
curl -s -o /dev/null -w "GET /api/articles?is_published=false (应401): %{http_code}\n" "https://www.shuducw.com/api/articles?is_published=false"
echo "--- 管理端页面（应200公开页面，数据走鉴权） ---"
curl -s -o /dev/null -w "GET /admin: %{http_code}\n" https://www.shuducw.com/admin
echo "--- 敏感路径探测（应404/403） ---"
for p in /.env /.env.production /.git/config /data/articles.json /node_modules/.bin/next /public/../data/articles.json /server.js /.next/BUILD_ID /api/health; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://www.shuducw.com$p")
  echo "$p -> $code"
done
echo "--- 目录枚举尝试 ---"
for p in /api/ /news/ /admin/ /wp-admin /robots.txt /sitemap.xml /llms.txt /favicon.ico; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://www.shuducw.com$p")
  echo "$p -> $code"
done
echo "--- 安全响应头 ---"
curl -s -D - -o /dev/null https://www.shuducw.com/ | grep -iE '^(strict-transport|content-security|x-content-type|x-frame|referrer-policy|server:|x-powered)' || echo "(无相关头)"

echo "=================== 5. 敏感文件与权限 ==================="
echo "--- 应用目录权限 ---"
ls -ld /var/www/shuducw-run /var/www/shuducw-run/data /var/www/shuducw-run/.env.production 2>/dev/null
ls -la /var/www/shuducw-run/.env.production 2>/dev/null
stat -c '%a %U:%G %n' /var/www/shuducw-run/.env.production 2>/dev/null
echo "--- data 目录文件权限 ---"
stat -c '%a %U:%G %n' /var/www/shuducw-run/data/*.json 2>/dev/null | head -10
echo "--- 是否有 .env 备份/日志泄露密钥（仅匹配变量名模式，不匹配具体值） ---"
grep -rlE 'ADMIN_API_PASSWORD=.+|BAIJIAHAO_PASSWORD=.+' /var/www/shuducw-run --include='*.js' --include='*.json' --include='*.log' --include='*.txt' 2>/dev/null | grep -v node_modules | head -10 || echo "未发现明文密钥文件"

echo "=================== 6. 日志攻击面分析 ==================="
echo "--- nginx access log 最近 20000 行的异常分布 ---"
ACCESS_LOG=$(ls -t /var/log/nginx/access.log* 2>/dev/null | head -1)
echo "日志文件: $ACCESS_LOG"
if [ -n "$ACCESS_LOG" ]; then
  echo "--- 状态码 TOP ---"
  tail -20000 "$ACCESS_LOG" | awk '{print $9}' | sort | uniq -c | sort -rn | head -12
  echo "--- 4xx/5xx 最多的 URL ---"
  tail -20000 "$ACCESS_LOG" | awk '$9 ~ /^4[0-9][0-9]$|^5[0-9][0-9]$/ {print $7}' | sort | uniq -c | sort -rn | head -12
  echo "--- 攻击指纹（.env/.git/wp/php/asp/扫描器） ---"
  tail -50000 "$ACCESS_LOG" | grep -aiE '\.env|\.git|wp-|\.php|\.asp|\.ashx|\.jsp|/cgi-bin|/admin/login|/actuator|/api/v1|/swagger|password|sqlmap|nmap|nikto' | head -15 || echo "无"
  echo "--- 被 401 拒绝的客户端 IP TOP ---"
  tail -50000 "$ACCESS_LOG" | awk '$9==401 {print $1}' | sort | uniq -c | sort -rn | head -8
fi
echo "--- SSH 暴力破解统计（auth.log） ---"
AUTHLOG=$(ls /var/log/auth.log* 2>/dev/null | head -1)
if [ -n "$AUTHLOG" ]; then
  echo "失败次数 TOP IP:"
  grep -a "Failed password" "$AUTHLOG" 2>/dev/null | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head -8
  grep -a "Accepted password" "$AUTHLOG" 2>/dev/null | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head -5
else
  journalctl -u ssh -n 0 --no-pager 2>/dev/null | tail -1 || echo "auth.log 不可用"
fi
echo "--- PM2 状态 ---"
pm2 jlist 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); [print(x['name'], x['pm2_env']['status'], '重启', x['pm2_env']['restart_time'], '次') for x in d]" 2>/dev/null || pm2 status 2>/dev/null | head -8

echo "=================== 审查结束 ==================="
