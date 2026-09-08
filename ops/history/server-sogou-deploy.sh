#!/bin/bash
echo "=== 1. 部署验证文件 ==="
cp /root/sogousiteverification.txt /var/www/shuducw-run/public/sogousiteverification.txt
ls -la /var/www/shuducw-run/public/sogousiteverification.txt
echo "=== 2. 重启（新 public 文件需重启才生效）==="
pm2 restart shuducw >/dev/null 2>&1
sleep 5
pm2 status shuducw 2>/dev/null | grep -E "online|errored"
echo "=== 3. 本机验证 ==="
curl -s -o /dev/null -w "http 本机: %{http_code}\n" http://127.0.0.1:3000/sogousiteverification.txt
echo "内容: $(curl -s http://127.0.0.1:3000/sogousiteverification.txt)"
echo "=== 4. 外部 https 验证 ==="
curl -s -o /dev/null -w "https 外部: %{http_code}\n" --max-time 15 https://www.shuducw.com/sogousiteverification.txt
curl -s --max-time 15 https://www.shuducw.com/sogousiteverification.txt
echo ""
echo "=== 5. nginx 缓存层确认（绕开 Next，直接 public 路径）==="
curl -s -o /dev/null -w "nginx /public/: %{http_code}\n" --max-time 15 -H "Host: www.shuducw.com" https://127.0.0.1/public/sogousiteverification.txt -k
