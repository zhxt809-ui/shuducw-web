#!/bin/bash
# 近 4 日抓取趋势 + 今日新增页面抓取 + 推送状态（2026-10-12 收录排查用）
for d in 2026-10-09 2026-10-10 2026-10-11 2026-10-12; do
  echo "===== $d ====="
  /usr/bin/python3 /root/daily-search-data.py "$d" > /tmp/r_"$d".txt 2>&1
  grep -E '总请求|200:' /tmp/r_"$d".txt | head -18
  echo ""
done

T=/tmp/r_2026-10-12.txt
echo "===== 今日(2026-10-12) 新增页面抓取明细 ====="
sed -n '/【4】/,/【5】/p' "$T" | head -45
echo ""
echo "===== 今日推送状态 ====="
sed -n '/【9】/,/【10】/p' "$T" | head -30
echo ""
echo "===== 今日状态码分布 ====="
sed -n '/【6】/,/【7】/p' "$T" | head -14
