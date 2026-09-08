#!/bin/bash
echo "=== 搜狗爬虫活动（全部日志）==="
for f in /var/log/nginx/access.log /var/log/nginx/access.log.[0-9] /var/log/nginx/access.log.[0-9].gz; do
  [ -f "$f" ] || continue
  if [[ "$f" == *.gz ]]; then zcat "$f" 2>/dev/null | grep -iE "sogou"; else grep -iE "sogou" "$f" 2>/dev/null; fi
done | tail -10
echo "=== 搜狗常见 UA 关键词命中数 ==="
for f in /var/log/nginx/access.log /var/log/nginx/access.log.[0-9] /var/log/nginx/access.log.[0-9].gz; do
  [ -f "$f" ] || continue
  if [[ "$f" == *.gz ]]; then zcat "$f" 2>/dev/null | grep -iE "sogou"; else grep -iE "sogou" "$f" 2>/dev/null; fi
done | wc -l
echo "=== 验证文件访问记录（谁在抓）==="
for f in /var/log/nginx/access.log /var/log/nginx/access.log.[0-9] /var/log/nginx/access.log.[0-9].gz; do
  [ -f "$f" ] || continue
  if [[ "$f" == *.gz ]]; then zcat "$f" 2>/dev/null | grep "sogousiteverification"; else grep "sogousiteverification" "$f" 2>/dev/null; fi
done | tail -5
echo "=== 最近 30 分钟新爬虫（非搜索蜘蛛外的其他 UA）==="
tail -200 /var/log/nginx/access.log | awk -F'"' '{print $6}' | sort | uniq -c | sort -rn | head -10
