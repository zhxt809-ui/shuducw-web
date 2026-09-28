#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 九个区县页报价覆盖（应全部 >=1） ====="
for d in gaoxin weiyang lianhu yanta changan xixian xincheng beilin baqiao; do
  n=$(curl -s "$B/services/district/$d" | grep -o "2000-4000" | wc -l)
  echo "  $d -> $n"
done
echo ""
echo "===== 2. 服务总览页费用参考 ====="
curl -s "$B/services" | grep -oE '服务费用参考|2000-4000 元/年|免费测算我的服务费用|不构成最终报价' | sort | uniq -c
echo ""
echo "===== 3. 高端服务页报价说明 ====="
echo "compliance: $(curl -s "$B/services/compliance" | grep -c '费用说明')"
echo "consulting: $(curl -s "$B/services/consulting" | grep -c '费用说明')"
echo "live-commerce: $(curl -s "$B/services/live-commerce" | grep -c '费用参考')"
echo ""
echo "===== 4. 首页 Schema priceRange ====="
curl -s "$B/" | grep -oE '"priceRange":"[^"]{0,70}' | head -1
echo ""
echo "===== 5. llms.txt 费用章节 ====="
curl -s "$B/llms.txt" | grep -A2 "服务费用参考" | head -6
echo ""
echo "===== 6. 页面状态 ====="
for p in / /services /faq /services/district/baqiao /services/district/beilin /services/live-commerce; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
