#!/bin/bash
echo "=== 1. 线上 robots.txt ==="
curl -s http://127.0.0.1:3000/robots.txt
echo ""
echo "=== 2. Bingbot 最近访问日志 ==="
grep -i "bingbot" /var/www/shuducw-run/../nginx/access.log 2>/dev/null | tail -8 || grep -rhi "bingbot" /var/log/nginx/*.log 2>/dev/null | tail -8
echo "=== 3. 访问日志位置确认 ==="
ls /var/log/nginx/ 2>/dev/null
echo "=== 4. Bing 搜索结果（site: 查询，服务器发起）==="
curl -s --max-time 20 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36" "https://www.bing.com/search?q=site%3Ashuducw.com&setlang=zh-hans" 2>&1 | grep -oE "shuducw[^\"< ]*" | sort -u | head -10
echo "=== 5. IndexNow 上次提交记录 ==="
ls -la /root/*indexnow* 2>/dev/null
