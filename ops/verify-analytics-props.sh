#!/bin/bash
B="https://www.shuducw.com"
echo "===== 表单来源标签（server component 传入，需在 HTML/RSC 流中核对）====="
c=$(curl -s "$B/contact")
echo "  /contact '联系页表单': $(echo "$c" | grep -o '联系页表单' | wc -l)（应≥1）"
lc=$(curl -s "$B/services/live-commerce")
echo "  /services/live-commerce '直播电商服务页表单': $(echo "$lc" | grep -o '直播电商服务页表单' | wc -l)（应≥1）"
gx=$(curl -s "$B/services/district/gaoxin")
echo "  /services/district/gaoxin '区域服务页表单-高新区': $(echo "$gx" | grep -o '区域服务页表单-高新区' | wc -l)（应≥1）"
echo "  /services/district/gaoxin HTTP: $(curl -s -o /dev/null -w '%{http_code}' "$B/services/district/gaoxin")"
echo ""
echo "===== 区域页回归（9 个）====="
for s in gaoxin weiyang lianhu yanta changan xixian xincheng beilin baqiao; do
  echo "  /services/district/$s -> $(curl -s -o /dev/null -w '%{http_code}' $B/services/district/$s)"
done
echo ""
echo "===== 百度统计脚本已注入页面 ====="
echo "  首页 hm.js: $(echo "$(curl -s $B/)" | grep -c 'hm.baidu.com/hm.js')"
