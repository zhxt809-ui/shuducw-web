#!/bin/bash
collect() {
  for f in /var/log/nginx/access.log /var/log/nginx/access.log.[0-9] /var/log/nginx/access.log.[0-9].gz; do
    [ -f "$f" ] || continue
    if [[ "$f" == *.gz ]]; then zcat "$f" 2>/dev/null; else cat "$f" 2>/dev/null; fi
  done
}
echo "=== Bytespider 最近 8 条 ==="
collect | grep -iE "bytespider" | tail -8 | awk '{print $4, $7, $9}'
echo "=== Bytespider 今日(09-07)请求统计 ==="
collect | grep -iE "bytespider" | grep "07/Sep" | awk '{print $9}' | sort | uniq -c
echo "=== ByteDanceVerify.html 抓取记录 ==="
collect | grep -iE "ByteDanceVerify" | tail -3 | awk '{print $4, $7, $9}'
echo "=== 全部蜘蛛今日(09-07)活动汇总 ==="
for ua in "Baiduspider" "Sogou" "360Spider" "Bytespider" "Bingbot" "Googlebot"; do
  n=$(collect | grep "07/Sep" | grep -ic "$ua")
  echo "$ua: $n 次"
done
