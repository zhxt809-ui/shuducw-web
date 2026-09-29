#!/bin/bash
B="https://www.shuducw.com"
echo "===== 线上各页 <title>（检查品牌重复） ====="
for p in / /about /services /services/basic /services/compliance /services/consulting /services/live-commerce /faq /contact /cases /news /self-check /privacy /services/district/gaoxin /services/district/baqiao; do
  t=$(curl -s "$B$p" | grep -oE '<title>[^<]*</title>' | head -1 | sed 's/<[^>]*>//g')
  n=$(echo "$t" | grep -o '西安数度财务咨询' | wc -l)
  echo "  [$n次] $p -> $t"
done
