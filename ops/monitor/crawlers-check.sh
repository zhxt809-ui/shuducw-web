#!/bin/bash
collect() {
  for f in /var/log/nginx/access.log /var/log/nginx/access.log.[0-9] /var/log/nginx/access.log.[0-9].gz; do
    [ -f "$f" ] || continue
    if [[ "$f" == *.gz ]]; then zcat "$f" 2>/dev/null; else cat "$f" 2>/dev/null; fi
  done
}
echo "========== 360Spider =========="
collect | grep -i "360Spider" | wc -l | xargs echo "总请求数:"
collect | grep -i "360Spider" | tail -3 | awk '{print $4, $7, $9}'
echo "========== 搜狗 Sogou =========="
collect | grep -iE "sogou" | wc -l | xargs echo "总请求数:"
collect | grep -iE "sogou" | tail -3 | awk '{print $4, $7, $9}'
echo "========== 头条 Bytespider/ByteSpider =========="
collect | grep -iE "bytespider|bytespider" | wc -l | xargs echo "总请求数:"
collect | grep -iE "bytespider" | tail -3 | awk '{print $4, $7, $9}'
echo "========== 百度 Baiduspider =========="
collect | grep -iE "baiduspider" | wc -l | xargs echo "总请求数:"
collect | grep -iE "baiduspider" | tail -3 | awk '{print $4, $7, $9}'
echo "========== 各爬虫时间跨度 =========="
for ua in 360Spider Sogou Bytespider Baiduspider Bingbot Googlebot; do
  echo "--- $ua ---"
  collect | grep -i "$ua" | awk '{print $4}' | sort | sed -n '1p;$p' | tr '\n' ' '; echo ""
done
