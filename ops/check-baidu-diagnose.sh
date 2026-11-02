#!/bin/bash
# 最近 3 小时的真百度 IP 抓取明细（验证抓取诊断是否到达）（2026-11-02）
set -u
cd /var/log/nginx || exit 1
BAIDU='^180\.76\.|^220\.181\.|^123\.125\.71\.|^116\.179\.|^124\.238\.'
echo "=== 最近 40 条 Baiduspider 请求（不论 IP，含状态码与路径）==="
tail -n 4000 access.log | grep 'Baiduspider' | awk -v re="$BAIDU" '{
  tag = ($1 ~ re) ? "官方IP" : "非官方"
  print $4, $1, tag, $7, $9
}' | tail -40
echo
echo "=== 真百度 IP 今日(02/Nov)已抓路径汇总 ==="
grep 'Baiduspider' access.log | awk -v re="$BAIDU" '$1 ~ re && $4 ~ /02\/Nov\/2026/ {print $7, $9}' | sort | uniq -c | sort -rn | head -15
