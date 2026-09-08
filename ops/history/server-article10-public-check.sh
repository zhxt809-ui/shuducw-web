#!/bin/bash
echo "=== 公开文章页当前返回 ==="
curl -s -o /dev/null -w "HTTP状态: %{http_code}\n" http://127.0.0.1:3000/news/zhuce-zijin-renjiao-2026
echo "=== 页面内容关键提示 ==="
curl -s http://127.0.0.1:3000/news/zhuce-zijin-renjiao-2026 | sed 's/<[^>]*>//g' | grep -oE "尚未发布|未发布|不存在|404[^<]{0,20}|文章[^<]{0,15}" | sort -u | head -5
echo "=== 资讯列表是否包含该文章 ==="
curl -s "http://127.0.0.1:3000/api/articles?is_published=true&limit=50" | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
print('已发布文章数:', len(d))
print('包含#10:', any(a['slug']=='zhuce-zijin-renjiao-2026' for a in d))
"
