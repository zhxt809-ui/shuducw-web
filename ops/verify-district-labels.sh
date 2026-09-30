#!/bin/bash
B="https://www.shuducw.com"
echo "===== 表单来源标签全量复核（含 district.name 前缀）====="
for pair in "contact:联系页表单" "services/live-commerce:直播电商服务页表单" "services/district/gaoxin:区域服务页表单-西安高新区" "services/district/weiyang:区域服务页表单-西安未央区" "services/district/yanta:区域服务页表单-西安雁塔区"; do
  path="${pair%%:*}"
  label="${pair#*:}"
  n=$(curl -s "$B/$path" | grep -o "$label" | wc -l)
  echo "  /$path -> '$label': $n"
done
echo ""
echo "===== 结论：9 个区域页标签应随 district.name 逐一对应 ====="
for s in gaoxin weiyang lianhu yanta changan xixian xincheng beilin baqiao; do
  n=$(curl -s "$B/services/district/$s" | grep -o '区域服务页表单-西安' | wc -l)
  echo "  /services/district/$s 前缀命中: $n"
done
