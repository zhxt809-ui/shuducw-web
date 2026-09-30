#!/bin/bash
echo "========== E. SSH 登录记录 =========="
echo "  --- 最近成功登录 ---"
last -n 8 -a | head -10
echo "  --- 最近失败登录（爆破尝试）统计 ---"
lastb -n 5 2>/dev/null | head -7 || echo "  (无 lastb 记录)"
echo "  失败登录总数: $(lastb 2>/dev/null | wc -l)"

echo ""
echo "========== F. authorized_keys 完整性 =========="
for f in /root/.ssh/authorized_keys /home/*/.ssh/authorized_keys; do
  if [ -f "$f" ]; then
    echo "  $f: $(wc -l < "$f") 个公钥"
    cat "$f" | awk '{print "    类型:"$1" 指纹尾部:"substr($2, length($2)-20)}'
  fi
done

echo ""
echo "========== G. 计划任务 =========="
echo "  root crontab:"
crontab -l 2>/dev/null | sed 's/^/    /' || echo "    (空)"
echo "  /etc/cron.d 内容:"
ls /etc/cron.d/ 2>/dev/null | sed 's/^/    /' || echo "    (空)"

echo ""
echo "========== H. 异常监听端口与进程 =========="
echo "  监听端口:"
ss -tlnp 2>/dev/null | awk 'NR>1 {print $4, $6}' | sed 's/^/    /'
echo "  CPU top 5 进程:"
ps aux --sort=-%cpu | head -6 | awk '{printf "    %s %s%% %s\n", $1, $3, $11}' 

echo ""
echo "========== I. 应用与数据完整性 =========="
echo "  PM2 进程:"
pm2 jlist 2>/dev/null | python3 -c "import json,sys; apps=json.load(sys.stdin); [print(f\"    {a['name']}: {a['pm2_env']['status']}, restarts={a['pm2_env']['restart_time']}\") for a in apps]" 2>/dev/null || pm2 list | head -5
echo "  网站目录最近 24h 变动的文件（应只有 data/ 和日志）:"
find /var/www/shuducw-run -maxdepth 2 -mmin -1440 -type f 2>/dev/null | grep -v "^/var/www/shuducw-run/data" | head -10
echo "    (以上为空 = 网站代码无异常变动)"
echo "  articles.json 最近修改: $(stat -c '%y' /var/www/shuducw-run/data/articles.json 2>/dev/null)"
echo "  最新一篇文章标题（确认是正常内容）:"
python3 -c "
import json
arts = json.load(open('/var/www/shuducw-run/data/articles.json'))
arts.sort(key=lambda a: a.get('updated_at') or a.get('created_at') or '', reverse=True)
for a in arts[:3]:
    print(f\"    [{a.get('category')}] {a.get('title')} (published={a.get('is_published')})\")
"
echo "  .env.production 权限: $(stat -c '%a' /var/www/shuducw-run/.env.production)"

echo ""
echo "========== J. SSH 配置安全 =========="
grep -E "^(PermitRootLogin|PasswordAuthentication|MaxAuthTries)" /etc/ssh/sshd_config 2>/dev/null | sed 's/^/  /'
echo "  fail2ban: $(systemctl is-active fail2ban 2>/dev/null || echo 未安装)"
echo "  ufw: $(ufw status 2>/dev/null | head -1)"
