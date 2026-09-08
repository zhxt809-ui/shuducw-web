#!/bin/bash
echo "=== live article content check ==="
HTML=$(curl -s http://127.0.0.1:3000/api/articles/21 | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['content'])")
echo "已到期债权: $(echo "$HTML" | grep -c '已到期债权的债权人')"
echo "最迟应于2032: $(echo "$HTML" | grep -c '最迟应于')"
echo "注册资本不低于200: $(echo "$HTML" | grep -c '注册资本不低于 200')"
echo "公告之日起45日: $(echo "$HTML" | grep -c '公告之日起 45 日')"
echo "旧表述残留(实缴不低于200万): $(echo "$HTML" | grep -c '实缴不低于 200 万')"
echo "页面200: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/news/zhuce-zijin-renjiao-2026)"
