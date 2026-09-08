#!/bin/bash
echo "=== nginx 站点配置 ==="
ls /etc/nginx/sites-enabled/ 2>/dev/null
ls /etc/nginx/conf.d/ 2>/dev/null
echo "=== 默认 server (default_server 标记) ==="
grep -rn "default_server" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null
echo "=== 443 监听块 + server_name 概览 ==="
grep -rn -A2 "listen.*443" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null | head -40
echo "=== return/444 指令 ==="
grep -rn "return 444\|return 301" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null | head -20
