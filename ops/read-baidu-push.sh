#!/bin/bash
echo "===== 1. 目录内容 ====="
ls -la /root/baidu-push/ 2>/dev/null | sed 's/^/    /'

echo ""
echo "===== 2. push-baidu.py 全文 ====="
cat /root/baidu-push/push-baidu.py 2>/dev/null | sed 's/^/    /'

echo ""
echo "===== 3. 推送日志最近 40 行（看它报什么）====="
tail -40 /var/log/baidu-push.log 2>/dev/null | sed 's/^/    /'

echo ""
echo "===== 4. 日志里的推送次数统计 ====="
echo -n "    总运行次数: "; grep -c '===' /var/log/baidu-push.log 2>/dev/null
echo "    最近 5 次运行时间:"
grep '===' /var/log/baidu-push.log 2>/dev/null | tail -5 | sed 's/^/      /'
