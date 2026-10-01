#!/bin/bash
# 百度自动推送机制验证：crontab 唯一性、最小环境可执行性、日志、权限、状态
echo "===== 1. crontab 内容与唯一性（多行会重复消耗配额）====="
crontab -l 2>&1 | sed 's/^/  /'
echo "  push 相关行数（应为 1）: $(crontab -l 2>/dev/null | grep -c 'push-baidu.py')"

echo ""
echo "===== 2. 以 cron 的最小环境真实执行一次（验证语法与路径）====="
CMD=$(crontab -l 2>/dev/null | grep 'push-baidu.py' | sed 's/^[0-9*,/-]* [0-9*,/-]* [0-9*,/-]* [0-9*,/-]* [0-9*,/-]* //')
BEFORE=$(wc -l < /var/log/baidu-push.log 2>/dev/null || echo 0)
env -i /bin/sh -c "$CMD" >/dev/null 2>&1
echo "  执行退出码: $?"
AFTER=$(wc -l < /var/log/baidu-push.log 2>/dev/null || echo 0)
echo "  日志行数 $BEFORE -> $AFTER（应增加，说明日志重定向正常）"

echo ""
echo "===== 3. 最近一次自动推送日志 ====="
tail -8 /var/log/baidu-push.log | sed 's/^/  /'

echo ""
echo "===== 4. token 配置权限（应 600 且仅 root 可读）====="
ls -l /root/baidu-push/baidu-push.config.json
echo -n "  token 长度（应 16）: "
python3 -c "import json;print(len(json.load(open('/root/baidu-push/baidu-push.config.json'))['token']))"

echo ""
echo "===== 5. 推送状态与待推数量 ====="
cd /root/baidu-push && python3 push-baidu.py --dry-run 2>&1 | head -3 | sed 's/^/  /'

echo ""
echo "===== 6. token 是否意外出现在仓库可见文件中（应为空）====="
grep -rl "$(python3 -c "import json;print(json.load(open('/root/baidu-push/baidu-push.config.json'))['token'])")" \
  /var/www/shuducw-run/public /var/www/shuducw-run/.next 2>/dev/null | head -5
echo "  （无输出即为安全）"
