#!/bin/bash
echo "=== 区县页在线状态 ==="
for s in gaoxin weiyang lianhu yanta changan xixian xincheng beilin; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://www.shuducw.com/services/district/$s")
  title=$(curl -s "https://www.shuducw.com/services/district/$s" | grep -oE '<title>[^<]+' | head -1 | sed 's/<title>//')
  echo "$s -> $code | $title"
done
echo "=== 服务总览页区域网格入口 ==="
curl -s https://www.shuducw.com/services | grep -oE 'services/district/[a-z]+' | sort -u
