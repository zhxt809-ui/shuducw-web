#!/bin/bash
echo "=== Bingbot 全部日志（含 gz）==="
for f in /var/log/nginx/access.log /var/log/nginx/access.log.[0-9] /var/log/nginx/access.log.[0-9].gz; do
  [ -f "$f" ] || continue
  if [[ "$f" == *.gz ]]; then
    zcat "$f" 2>/dev/null | grep -i "bingbot" | tail -5
  else
    grep -i "bingbot" "$f" 2>/dev/null | tail -5
  fi
done
echo "=== 最近 20 条 Bingbot 请求的 HTTP 状态统计 ==="
{ for f in /var/log/nginx/access.log /var/log/nginx/access.log.[0-9] /var/log/nginx/access.log.[0-9].gz; do
  [ -f "$f" ] || continue
  if [[ "$f" == *.gz ]]; then zcat "$f" 2>/dev/null | grep -i "bingbot"; else grep -i "bingbot" "$f" 2>/dev/null; fi
done; } | awk '{print $9}' | sort | uniq -c | sort -rn | head -8
echo "=== 首次/末次 Bingbot 时间 ==="
{ for f in /var/log/nginx/access.log /var/log/nginx/access.log.[0-9] /var/log/nginx/access.log.[0-9].gz; do
  [ -f "$f" ] || continue
  if [[ "$f" == *.gz ]]; then zcat "$f" 2>/dev/null | grep -i "bingbot"; else grep -i "bingbot" "$f" 2>/dev/null; fi
done; } | awk '{print $4, $7, $9}' | head -5
echo "..."
{ for f in /var/log/nginx/access.log /var/log/nginx/access.log.[0-9] /var/log/nginx/access.log.[0-9].gz; do
  [ -f "$f" ] || continue
  if [[ "$f" == *.gz ]]; then zcat "$f" 2>/dev/null | grep -i "bingbot"; else grep -i "bingbot" "$f" 2>/dev/null; fi
done; } | awk '{print $4, $7, $9}' | tail -5
